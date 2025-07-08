import { Module } from '@nestjs/common';
import { MoviesRepository } from '../domain/repositories/movies.repository';
import { MovieInMemoryRepository } from './database/in-memory/movies.in-memory.repository';
import { MovieFacade } from './facades/movie.facade';
import { MoviesController } from './controllers/movies.controller';

@Module({
  controllers: [MoviesController],
  providers: [
    {
      provide: MoviesRepository,
      useFactory: () => new MovieInMemoryRepository(true),
    },
    MovieFacade,
  ],
  exports: [],
})
export class MoviesModule {}
