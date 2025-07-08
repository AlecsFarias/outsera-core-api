import { UseCase } from 'src/modules/shared/application/use-case/use-case';
import { MovieOutput, MovieOutputMapper } from '../outputs/movie.output';
import { MoviesRepository } from '../../domain/repositories/movies.repository';
import { InternalError } from 'src/modules/shared/application/errors/internal-erro';
import { NotFoundError } from 'src/modules/shared/application/errors/no-found-error';

export type UpdateMovieUseCaseInput = {
  id: string;
  title?: string;
  year?: number;
  studios?: string[];
  producers?: string[];
  winner?: boolean;
};

export type UpdateMovieUseCaseOutput = {
  movie: MovieOutput;
};

export class UpdateMovieUseCase
  implements UseCase<UpdateMovieUseCaseInput, UpdateMovieUseCaseOutput>
{
  constructor(private readonly movieRepository: MoviesRepository) {}

  async execute(
    input: UpdateMovieUseCaseInput,
  ): Promise<UpdateMovieUseCaseOutput> {
    const movie = await this.movieRepository.findById(input.id).catch((err) => {
      throw new InternalError(
        `UpdateMovieUseCase: Error retrieving movie by id: ${input.id}, error: ${err.message}`,
      );
    });

    if (!movie) {
      throw new NotFoundError(
        `UpdateMovieUseCase: Movie with id ${input.id} not found`,
      );
    }

    // Update only the provided fields
    if (input.title !== undefined) {
      movie.title = input.title;
    }
    if (input.year !== undefined) {
      movie.year = input.year;
    }
    if (input.studios !== undefined) {
      movie.studios = input.studios;
    }
    if (input.producers !== undefined) {
      movie.producers = input.producers;
    }
    if (input.winner !== undefined) {
      movie.winner = input.winner;
    }

    await this.movieRepository.update(movie).catch((err) => {
      throw new InternalError(
        `UpdateMovieUseCase: Error updating movie: ${err.message}`,
      );
    });

    return { movie: MovieOutputMapper.toOutput(movie) };
  }
}
