import { InternalError } from 'src/modules/shared/application/errors/internal-erro';
import { CreateMovieUseCase } from '../../application/use-cases/create-movie.use-case';
import { GetMovieByIdUseCase } from '../../application/use-cases/get-movie-by-id.use-case';
import { MoviesRepository } from '../../domain/repositories/movies.repository';
import { Inject } from '@nestjs/common';

export class MovieFacade {
  createMovie: CreateMovieUseCase;
  getMovieById: GetMovieByIdUseCase;

  constructor(
    @Inject(MoviesRepository)
    private readonly moviesRepository: MoviesRepository,
  ) {
    if (!moviesRepository) {
      throw new InternalError('MovieFacade: Movies repository is required');
    }

    this.createMovie = new CreateMovieUseCase(moviesRepository);
    this.getMovieById = new GetMovieByIdUseCase(moviesRepository);
  }
}
