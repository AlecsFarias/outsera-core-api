import { UseCase } from 'src/modules/shared/application/use-case/use-case';
import { MovieOutput, MovieOutputMapper } from '../outputs/movie.output';
import { MoviesRepository } from '../../domain/repositories/movies.repository';
import { NotFoundError } from 'src/modules/shared/application/errors/no-found-error';
import { InternalError } from 'src/modules/shared/application/errors/internal-erro';

export type GetMovieByIdUseCaseInput = {
  id: string;
};

export type GetMovieByIdUseCaseOutput = {
  movie: MovieOutput;
};

export class GetMovieByIdUseCase
  implements UseCase<GetMovieByIdUseCaseInput, GetMovieByIdUseCaseOutput>
{
  constructor(private readonly movieRepository: MoviesRepository) {}

  async execute(
    input: GetMovieByIdUseCaseInput,
  ): Promise<GetMovieByIdUseCaseOutput> {
    const movie = await this.movieRepository.findById(input.id).catch((err) => {
      throw new InternalError(
        `GetMovieByIdUseCaseInput: Error retrieving movie by id: ${input.id}, error: ${err.message}`,
      );
    });

    if (!movie) {
      throw new NotFoundError(
        `GetMovieByIdUseCase: Movie with id ${input.id} not found`,
      );
    }

    return { movie: MovieOutputMapper.toOutput(movie) };
  }
}
