import { Module } from '@nestjs/common';
import { MoviesModule } from './modules/movies/infra/movies.module';

@Module({
  imports: [MoviesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
