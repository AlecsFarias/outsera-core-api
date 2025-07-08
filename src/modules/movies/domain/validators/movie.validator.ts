import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ClassValidatorFields } from 'src/modules/shared/domain/validators/class-validator-fields';
import { MovieProps } from '../entities/movie.entity';

export class MovieRules {
  @IsNumber()
  year: number;

  @IsString()
  title: string;

  @IsString({ each: true })
  studios: string[];

  @IsString({ each: true })
  producers: string[];

  @IsOptional()
  @IsBoolean()
  winner?: boolean;

  constructor(props: MovieProps) {
    Object.assign(this, props);
  }
}

export class MovieValidator extends ClassValidatorFields<MovieRules> {
  validate(data: any): boolean {
    return super.validate(new MovieRules(data ?? ({} as MovieProps)));
  }
}

export class MovieValidatorFactory {
  static create(): MovieValidator {
    return new MovieValidator();
  }
}
