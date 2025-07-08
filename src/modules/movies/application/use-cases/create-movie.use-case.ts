import { UseCase } from 'src/modules/shared/application/use-case/use-case';
import { MovieOutput, MovieOutputMapper } from '../outputs/movie.output';
import { MoviesRepository } from '../../domain/repositories/movies.repository';
import { MovieEntity } from '../../domain/entities/movie.entity';

export type CreateMovieUseCaseInput = {
  title: string;
  year: number;
  studios: string[];
  producers: string[];
  winner?: boolean;
};

export type CreateMovieUseCaseOutput = {
  movie: MovieOutput;
};

export class CreateMovieUseCase
  implements UseCase<CreateMovieUseCaseInput, CreateMovieUseCaseOutput>
{
  constructor(private readonly movieRepository: MoviesRepository) {}

  async execute(
    input: CreateMovieUseCaseInput,
  ): Promise<CreateMovieUseCaseOutput> {
    const movie = new MovieEntity(input);

    await this.movieRepository.create(movie);

    return { movie: MovieOutputMapper.toOutput(movie) };
  }
}
