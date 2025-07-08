import { MovieEntity } from '../../domain/entities/movie.entity';

export type MovieOutput = {
  id: string;
  title: string;
  year: number;
  studios: string[];
  producers: string[];
  winner?: boolean;
};

export class MovieOutputMapper {
  static toOutput(entity: MovieEntity): MovieOutput {
    return entity.toObject();
  }

  static toManyOutput(entities: MovieEntity[]): MovieOutput[] {
    return entities.map((e) => MovieOutputMapper.toOutput(e));
  }
}
