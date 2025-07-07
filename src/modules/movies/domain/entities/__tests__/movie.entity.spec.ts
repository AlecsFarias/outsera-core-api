import { Movie, MovieProps } from '../movie.entity';
import { MovieDataBuilder } from '../../testing/helpers/movie-data-builder';
import { EntityValidationError } from 'src/modules/shared/application/errors/entity-validation-error';
import { faker } from '@faker-js/faker';

describe('Movie Entity unit tests', () => {
  let props: MovieProps;

  beforeEach(() => {
    props = MovieDataBuilder({
      title: 'Test Movie',
      year: 2023,
      studios: ['Test Studio'],
      producers: ['Test Producer'],
      winner: false,
    });
  });

  describe('constructor', () => {
    it('should create a movie with valid data', () => {
      const movie = new Movie(props);

      expect(movie.id).toBeDefined();
      expect(movie.title).toBe(props.title);
      expect(movie.year).toBe(props.year);
      expect(movie.studios).toEqual(props.studios);
      expect(movie.producers).toEqual(props.producers);
      expect(movie.winner).toBe(props.winner);
    });

    it('should create a movie with winner defaulting to false when not provided', () => {
      const movie = new Movie({ ...props, winner: undefined });

      expect(movie.winner).toBe(false);
    });

    it('should create a movie with custom id', () => {
      const customId = 'custom-id-123';

      const movie = new Movie(props, customId);

      expect(movie.id).toBe(customId);
    });

    it('should create a movie with multiple studios and producers', () => {
      const producers = [
        faker.commerce.productName(),
        faker.commerce.productName(),
        faker.commerce.productName(),
      ];
      const studios = [faker.company.name(), faker.company.name()];

      const movieData = MovieDataBuilder({
        producers,
        studios,
      });

      const movie = new Movie(movieData);

      expect(movie.studios).toHaveLength(movieData.studios.length);
      expect(movie.producers).toHaveLength(movieData.producers.length);
      expect(movie.studios).toEqual(movieData.studios);
      expect(movie.producers).toEqual(movieData.producers);
    });
  });

  describe('validation', () => {
    it('should throw EntityValidationError when title is missing', () => {
      const invalidData = { ...props };
      delete (invalidData as any).title;

      expect(() => new Movie(invalidData as any)).toThrow(
        EntityValidationError,
      );
    });

    it('should throw EntityValidationError when title is not a string', () => {
      const invalidData = {
        ...props,
        title: 123 as any,
      };

      expect(() => new Movie(invalidData)).toThrow(EntityValidationError);
    });

    it('should throw EntityValidationError when year is missing', () => {
      const invalidData = { ...props };
      delete (invalidData as any).year;

      expect(() => new Movie(invalidData as any)).toThrow(
        EntityValidationError,
      );
    });

    it('should throw EntityValidationError when year is not a number', () => {
      const invalidData = {
        ...props,
        year: 'invalid-year' as any,
      };

      expect(() => new Movie(invalidData)).toThrow(EntityValidationError);
    });

    it('should throw EntityValidationError when studios is missing', () => {
      const invalidData = { ...props };
      delete (invalidData as any).studios;

      expect(() => new Movie(invalidData as any)).toThrow(
        EntityValidationError,
      );
    });

    it('should throw EntityValidationError when studios is not an array of strings', () => {
      const invalidData = {
        ...props,
        studios: [123, 'Valid Studio'] as any,
      };

      expect(() => new Movie(invalidData)).toThrow(EntityValidationError);
    });

    it('should throw EntityValidationError when producers is missing', () => {
      const invalidData = { ...props };
      delete (invalidData as any).producers;

      expect(() => new Movie(invalidData as any)).toThrow(
        EntityValidationError,
      );
    });

    it('should throw EntityValidationError when producers is not an array of strings', () => {
      const invalidData = {
        ...props,
        producers: [123, 'Valid Producer'] as any,
      };

      expect(() => new Movie(invalidData)).toThrow(EntityValidationError);
    });

    it('should throw EntityValidationError when winner is not a boolean', () => {
      const invalidData = {
        ...props,
        winner: 'invalid-boolean' as any,
      };

      expect(() => new Movie(invalidData)).toThrow(EntityValidationError);
    });

    it('should accept valid winner values', () => {
      const movieDataTrue = { ...props, winner: true };
      const movieDataFalse = { ...props, winner: false };

      expect(() => new Movie(movieDataTrue)).not.toThrow();
      expect(() => new Movie(movieDataFalse)).not.toThrow();

      const movieTrue = new Movie(movieDataTrue);
      const movieFalse = new Movie(movieDataFalse);

      expect(movieTrue.winner).toBe(true);
      expect(movieFalse.winner).toBe(false);
    });
  });

  describe('toObj method', () => {
    it('should return correct OBJ representation', () => {
      const movieData = MovieDataBuilder({});

      const movie = new Movie(movieData);
      const obj = movie.toObject();

      expect(obj).toEqual({
        id: movie.id,
        title: movieData.title,
        year: movieData.year,
        studios: movieData.studios,
        producers: movieData.producers,
        winner: movieData.winner,
      });
    });

    it('should include all properties in OBJ', () => {
      const movieData = MovieDataBuilder({});

      const movie = new Movie(movieData);
      const obj = movie.toObject();

      expect(Object.keys(obj)).toEqual([
        'title',
        'year',
        'studios',
        'producers',
        'winner',
        'id',
      ]);
    });
  });

  describe('MovieDataBuilder integration', () => {
    it('should work with generated data from MovieDataBuilder', () => {
      const movieData = MovieDataBuilder({});

      expect(() => new Movie(movieData)).not.toThrow();

      const movie = new Movie(movieData);
      expect(movie.id).toBeDefined();
      expect(typeof movie.title).toBe('string');
      expect(typeof movie.year).toBe('number');
      expect(Array.isArray(movie.studios)).toBe(true);
      expect(Array.isArray(movie.producers)).toBe(true);
      expect(typeof movie.winner).toBe('boolean');
    });

    it('should work with partial data override using props as base', () => {
      const movieData = {
        ...props,
        title: 'Specific Title',
        winner: true,
      };

      const movie = new Movie(movieData);

      expect(movie.title).toBe('Specific Title');
      expect(movie.winner).toBe(true);
      expect(movie.year).toBe(props.year);
      expect(movie.studios).toEqual(props.studios);
      expect(movie.producers).toEqual(props.producers);
    });
  });
});
