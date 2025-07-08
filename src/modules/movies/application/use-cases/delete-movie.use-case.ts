import { UseCase } from 'src/modules/shared/application/use-case/use-case';
import { MoviesRepository } from '../../domain/repositories/movies.repository';
import { InternalError } from 'src/modules/shared/application/errors/internal-erro';
import { NotFoundError } from 'src/modules/shared/application/errors/no-found-error';

export type DeleteMovieUseCaseInput = {
  id: string;
};

export type DeleteMovieUseCaseOutput = void;

export class DeleteMovieUseCase
  implements UseCase<DeleteMovieUseCaseInput, DeleteMovieUseCaseOutput>
{
  constructor(private readonly movieRepository: MoviesRepository) {}

  async execute(
    input: DeleteMovieUseCaseInput,
  ): Promise<DeleteMovieUseCaseOutput> {
    const movie = await this.movieRepository.findById(input.id).catch((err) => {
      throw new InternalError(
        `DeleteMovieUseCase: Error retrieving movie by id: ${input.id}, error: ${err.message}`,
      );
    });

    if (!movie) {
      throw new NotFoundError(
        `DeleteMovieUseCase: Movie with id ${input.id} not found`,
      );
    }

    await this.movieRepository.delete(input.id).catch((err) => {
      throw new InternalError(
        `DeleteMovieUseCase: Error deleting movie: ${err.message}`,
      );
    });
  }
}
