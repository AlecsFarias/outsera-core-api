import { Module } from '@nestjs/common';
import { MoviesModule } from './modules/movies/infra/movies.module';
import { EnvConfigModule } from './modules/shared/infra/config/env-config.module';

@Module({
  imports: [EnvConfigModule, MoviesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
