import { InternalError } from 'src/modules/shared/application/errors/internal-erro';
import { CreateMovieUseCase } from '../../application/use-cases/create-movie.use-case';
import { GetMovieByIdUseCase } from '../../application/use-cases/get-movie-by-id.use-case';
import { ListMoviesUseCase } from '../../application/use-cases/list-movies.use-case';
import { UpdateMovieUseCase } from '../../application/use-cases/update-movie.use-case';
import { DeleteMovieUseCase } from '../../application/use-cases/delete-movie.use-case';
import { MoviesRepository } from '../../domain/repositories/movies.repository';
import { Inject } from '@nestjs/common';

export class MovieFacade {
  createMovie: CreateMovieUseCase;
  getMovieById: GetMovieByIdUseCase;
  listMovies: ListMoviesUseCase;
  updateMovie: UpdateMovieUseCase;
  deleteMovie: DeleteMovieUseCase;

  constructor(
    @Inject(MoviesRepository)
    private readonly moviesRepository: MoviesRepository,
  ) {
    if (!moviesRepository) {
      throw new InternalError('MovieFacade: Movies repository is required');
    }

    this.createMovie = new CreateMovieUseCase(moviesRepository);
    this.getMovieById = new GetMovieByIdUseCase(moviesRepository);
    this.listMovies = new ListMoviesUseCase(moviesRepository);
    this.updateMovie = new UpdateMovieUseCase(moviesRepository);
    this.deleteMovie = new DeleteMovieUseCase(moviesRepository);
  }
}
