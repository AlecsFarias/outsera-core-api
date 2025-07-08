import { UseCase } from 'src/modules/shared/application/use-case/use-case';
import { MovieOutput, MovieOutputMapper } from '../outputs/movie.output';
import { MoviesRepository } from '../../domain/repositories/movies.repository';
import { InternalError } from 'src/modules/shared/application/errors/internal-erro';
import {
  FindManyFilter,
  ReturnMany,
} from 'src/modules/shared/domain/repositories/repository-contract';

export type ListMoviesUseCaseInput = FindManyFilter;

export type ListMoviesUseCaseOutput = ReturnMany<MovieOutput>;

export class ListMoviesUseCase
  implements UseCase<ListMoviesUseCaseInput, ListMoviesUseCaseOutput>
{
  constructor(private readonly movieRepository: MoviesRepository) {}

  async execute(
    input: ListMoviesUseCaseInput = {},
  ): Promise<ListMoviesUseCaseOutput> {
    const result = await this.movieRepository.findMany(input).catch((err) => {
      throw new InternalError(
        `ListMoviesUseCase: Error retrieving movies, error: ${err.message}`,
      );
    });

    return {
      items: result.items.map((movie) => MovieOutputMapper.toOutput(movie)),
      total: result.total,
    };
  }
}
