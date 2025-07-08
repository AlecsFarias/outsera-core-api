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
  //Retrieve the producer with the longest and shortest intervals between two consecutive awards.
  getProducersWithMaxAndMinAwardIntervals(): Promise<MaxAndMinResponse>;
}

export const MoviesRepository = Symbol('MoviesRepository');

// getProducersWithMaxAndMinAwardIntervals example

/* 
  {
  "min": [
    {
      "producer": "Producer 1",
      "interval": 1,
      "previousWin": 2008,
      "followingWin": 2009
    },
    {
      "producer": "Producer 2",
      "interval": 1,
      "previousWin": 2018,
      "followingWin": 2019
    }
  ],
  "max": [
    {
      "producer": "Producer 1",
      "interval": 99,
      "previousWin": 1900,
      "followingWin": 1999
    },
    {
      "producer": "Producer 2",
      "interval": 99,
      "previousWin": 2000,
      "followingWin": 2099
    }
  ]
}
*/
