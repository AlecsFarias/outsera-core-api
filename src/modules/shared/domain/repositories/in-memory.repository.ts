import { Entity } from '../entities/entity';
import {
  FindManyFilter,
  RepositoryInterface,
  ReturnMany,
} from './repository-contract';

export abstract class InMemoryRepository<E extends Entity>
  implements RepositoryInterface<E>
{
  protected items: E[] = [];

  async create(entity: E): Promise<void> {
    this.items.push(entity);
  }

  async findById(id: string): Promise<E | undefined> {
    return this.items.find((item) => item.id === id);
  }

  async findMany(filter?: FindManyFilter): Promise<ReturnMany<E>> {
    const { search, page = 1, perPage = 10 } = filter || {};
    let filteredItems = this.items;

    if (search) {
      filteredItems = filteredItems.filter((item) =>
        JSON.stringify(item.toJson).includes(search),
      );
    }

    const total = filteredItems.length;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    return {
      items: filteredItems.slice(startIndex, endIndex),
      total,
    };
  }

  async update(entity: E): Promise<void> {
    const index = this.items.findIndex((item) => item.id === entity.id);

    if (index !== -1) {
      this.items[index] = entity;
    }

    return;
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index !== -1) {
      this.items.splice(index, 1);
    }

    return;
  }
}
