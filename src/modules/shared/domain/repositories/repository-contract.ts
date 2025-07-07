import { Entity } from '../entities/entity';

export type FindManyFilter = {
  search?: string;
  page?: number;
  perPage?: number;
};

export type ReturnMany<E> = {
  items: E[];
  total: number;
};

export interface RepositoryInterface<
  E extends Entity,
  ManyFilter = FindManyFilter,
> {
  create(entity: E): Promise<void>;

  findById(id: string): Promise<E | undefined>;

  findMany(filter?: ManyFilter): Promise<ReturnMany<E>>;

  update(entity: E): Promise<void>;

  delete(id: string): Promise<void>;
}
