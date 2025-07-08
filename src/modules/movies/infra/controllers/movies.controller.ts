import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { MovieFacade } from '../facades/movie.facade';
import { InternalError } from 'src/modules/shared/application/errors/internal-erro';
import { ApiCreatedResponse } from '@nestjs/swagger';
import {
  MoviePresenter,
  MovieWrapper,
} from '../dtos/presenter/movie.presenter';
import { CreateMovieInput } from '../dtos/input/create-movie.input';

@Controller('movies')
export class MoviesController {
  constructor(
    @Inject(MovieFacade)
    private readonly movieFacade: MovieFacade,
  ) {
    if (!movieFacade) {
      throw new InternalError('MoviesController: Movie facade is required');
    }
  }

  @Post()
  @ApiCreatedResponse({
    description: 'Create a movie and return it',
    type: MovieWrapper,
  })
  async createMovie(@Body() body: CreateMovieInput): Promise<MovieWrapper> {
    const { movie } = await this.movieFacade.createMovie.execute(body);

    return {
      movie: MoviePresenter.fromOutput(movie),
    };
  }

  @Get(':id')
  @ApiCreatedResponse({
    description: 'Get a movie by ID and return it',
    type: MovieWrapper,
  })
  async getMovieById(@Param('id') id: string): Promise<MovieWrapper> {
    const { movie } = await this.movieFacade.getMovieById.execute({ id });

    return {
      movie: MoviePresenter.fromOutput(movie),
    };
  }
}
