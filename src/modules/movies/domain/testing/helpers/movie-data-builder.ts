import { faker } from '@faker-js/faker';
import { MovieProps } from '../../entities/movie.entity';

export function MovieDataBuilder(data: Partial<MovieProps>): MovieProps {
  return {
    title: data.title ?? faker.lorem.sentence(3),
    year: data.year ?? faker.date.past().getFullYear(),
    studios: data.studios ?? [faker.company.name()],
    producers: data.producers ?? [faker.person.fullName()],
    winner: data.winner ?? faker.datatype.boolean(),
  };
}
