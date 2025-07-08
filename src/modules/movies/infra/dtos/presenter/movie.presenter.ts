import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { MovieOutput } from 'src/modules/movies/application/outputs/movie.output';
import {
  MaxAndMinResponse,
  ProducerData,
} from 'src/modules/movies/domain/repositories/movies.repository';

export class MoviePresenter {
  @ApiProperty({
    description: 'Unique identifier of the movie record',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @IsNumber()
  @ApiProperty({ type: Number, description: 'Year of the movie' })
  year: number;

  @IsString()
  @ApiProperty({ type: String, description: 'Title of the movie' })
  title: string;

  @IsString({ each: true })
  @ApiProperty({
    type: [String],
    description: 'Studios that produced the movie',
  })
  studios: string[];

  @IsString({ each: true })
  @ApiProperty({ type: [String], description: 'Producers of the movie' })
  producers: string[];

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    type: Boolean,
    description: 'Indicates if the movie won an award',
    required: false,
  })
  winner?: boolean;

  static fromOutput(data: MovieOutput): MoviePresenter {
    return {
      id: data.id,
      year: data.year,
      title: data.title,
      studios: data.studios,
      producers: data.producers,
      winner: data.winner,
    };
  }
}

export class MovieWrapper {
  @ApiProperty({
    description: 'Detailed information about the movie',
    type: MoviePresenter,
  })
  movie: MoviePresenter;
}

export class MoviesList {
  @ApiProperty({
    description: 'List of movies with Detailed information',
    type: [MoviePresenter],
  })
  items: MoviePresenter[];

  @ApiProperty({
    description: 'Total number of movies',
    type: Number,
  })
  total: number;
}

export class ProducerIntervalPresenter {
  @ApiProperty({
    description: 'Name of the producer',
    example: 'Joel Silver',
  })
  producer: string;

  @ApiProperty({
    description: 'Interval between consecutive awards',
    example: 1,
  })
  interval: number;

  @ApiProperty({
    description: 'Year of the previous win',
    example: 1990,
  })
  previousWin: number;

  @ApiProperty({
    description: 'Year of the following win',
    example: 1991,
  })
  followingWin: number;

  static fromData(data: ProducerData): ProducerIntervalPresenter {
    return {
      producer: data.producer,
      interval: data.interval,
      previousWin: data.previousWin,
      followingWin: data.followingWin,
    };
  }
}

export class ProducersAwardIntervalsPresenter {
  @ApiProperty({
    description: 'Producers with minimum intervals between consecutive awards',
    type: [ProducerIntervalPresenter],
  })
  min: ProducerIntervalPresenter[];

  @ApiProperty({
    description: 'Producers with maximum intervals between consecutive awards',
    type: [ProducerIntervalPresenter],
  })
  max: ProducerIntervalPresenter[];

  static fromOutput(data: MaxAndMinResponse): ProducersAwardIntervalsPresenter {
    return {
      min: data.min.map((item) => ProducerIntervalPresenter.fromData(item)),
      max: data.max.map((item) => ProducerIntervalPresenter.fromData(item)),
    };
  }
}
