import { MovieEntity } from 'src/modules/movies/domain/entities/movie.entity';
import {
  MaxAndMinResponse,
  MoviesRepository,
} from 'src/modules/movies/domain/repositories/movies.repository';
import { InMemoryRepository } from 'src/modules/shared/domain/repositories/in-memory.repository';
import {
  FindManyFilter,
  ReturnMany,
} from 'src/modules/shared/domain/repositories/repository-contract';

export class MovieInMemoryRepository
  extends InMemoryRepository<MovieEntity>
  implements MoviesRepository
{
  async findMany(filter?: FindManyFilter): Promise<ReturnMany<MovieEntity>> {
    const { search, page = 1, perPage = 10 } = filter || {};
    let filteredItems = this.items;

    if (search) {
      filteredItems = filteredItems.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase()),
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

  getProducersWithMaxAndMinAwardIntervals(): Promise<MaxAndMinResponse> {
    throw new Error('Method not implemented.');
  }
}
