import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { MovieFacade } from '../facades/movie.facade';
import { InternalError } from 'src/modules/shared/application/errors/internal-erro';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import {
  MoviePresenter,
  MoviesList,
  MovieWrapper,
  ProducersAwardIntervalsPresenter,
} from '../dtos/presenter/movie.presenter';
import { CreateMovieInput } from '../dtos/input/create-movie.input';
import { UpdateMovieInput } from '../dtos/input/update-movie.input';
import { ListInput } from 'src/modules/shared/infra/dtos/inputs/list.input';

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

  @Get('analytics/producers-award-intervals')
  @ApiOkResponse({
    description:
      'Get producers with maximum and minimum intervals between consecutive awards',
    type: ProducersAwardIntervalsPresenter,
  })
  async getProducersAwardIntervals(): Promise<ProducersAwardIntervalsPresenter> {
    const result = await this.movieFacade.getProducersAwardIntervals.execute();
    return ProducersAwardIntervalsPresenter.fromOutput(result);
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

  @Get()
  @ApiCreatedResponse({
    description: 'List all movies and return them',
    type: MoviesList,
  })
  async listMovies(@Query() filters: ListInput): Promise<MoviesList> {
    const { items, total } = await this.movieFacade.listMovies.execute(filters);

    return {
      items: items.map((movie) => MoviePresenter.fromOutput(movie)),
      total,
    };
  }

  @Put(':id')
  @ApiCreatedResponse({
    description: 'Update a movie by ID and return it',
    type: MovieWrapper,
  })
  async updateMovie(
    @Param('id') id: string,
    @Body() body: UpdateMovieInput,
  ): Promise<MovieWrapper> {
    const { movie } = await this.movieFacade.updateMovie.execute({
      id,
      ...body,
    });

    return {
      movie: MoviePresenter.fromOutput(movie),
    };
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Delete a movie by ID',
  })
  async deleteMovie(@Param('id') id: string): Promise<void> {
    await this.movieFacade.deleteMovie.execute({ id });
  }
}
