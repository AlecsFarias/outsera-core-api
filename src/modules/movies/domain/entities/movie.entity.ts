import { Entity } from 'src/modules/shared/domain/entities/entity';
import { Optional } from 'src/modules/shared/domain/types/optional.type';
import { MovieValidatorFactory } from '../validators/movie.validator';
import { EntityValidationError } from 'src/modules/shared/application/errors/entity-validation-error';
import { FieldsErrors } from 'src/modules/shared/domain/validators/validator-fields.interface';

export type MovieProps = {
  year: number;
  title: string;
  studios: string[];
  producers: string[];
  winner: boolean;
};

export class Movie extends Entity<MovieProps> {
  get year(): number {
    return this.props.year;
  }

  set year(value: number) {
    this.props.year = value;
  }

  get title(): string {
    return this.props.title;
  }

  set title(value: string) {
    this.props.title = value;
  }

  get studios(): string[] {
    return this.props.studios;
  }

  set studios(value: string[]) {
    this.props.studios = value;
  }

  get producers(): string[] {
    return this.props.producers;
  }

  set producers(value: string[]) {
    this.props.producers = value;
  }

  get winner(): boolean {
    return this.props.winner;
  }

  constructor(data: Optional<MovieProps, 'winner'>, id?: string) {
    Movie._validate(data);

    super(
      {
        ...data,
        winner: data.winner ?? false,
      },
      id,
    );
  }

  static _validate(props: ConstructorParameters<typeof Movie>[0]): void {
    const validator = MovieValidatorFactory.create();
    const isValid = validator.validate(props);

    if (!isValid) {
      throw new EntityValidationError(validator.errors as FieldsErrors);
    }
  }
}
