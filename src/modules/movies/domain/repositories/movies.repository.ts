import { RepositoryInterface } from 'src/modules/shared/domain/repositories/repository-contract';
import { MovieEntity } from '../entities/movie.entity';

export interface MaxAndMinResponse {
  min: ProducerData[];
  max: ProducerData[];
}

export interface ProducerData {
  producer: string;
  interval: number;
  previousWin: number;
  followingWin: number;
}

export interface MoviesRepository extends RepositoryInterface<MovieEntity> {
  getProducersWithMaxAndMinAwardIntervals(): Promise<MaxAndMinResponse>;
}

export const MoviesRepository = Symbol('MoviesRepository');
