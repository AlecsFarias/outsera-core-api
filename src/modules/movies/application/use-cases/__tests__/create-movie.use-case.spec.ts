import {
  CreateMovieUseCase,
  CreateMovieUseCaseInput,
} from '../create-movie.use-case';
import { MovieInMemoryRepository } from '../../../infra/database/in-memory/movies.in-memory.repository';
import { MovieDataBuilder } from '../../../domain/testing/helpers/movie-data-builder';
import { MovieEntity } from '../../../domain/entities/movie.entity';
import { EntityValidationError } from 'src/modules/shared/application/errors/entity-validation-error';

describe('CreateMovieUseCase unit tests', () => {
  let useCase: CreateMovieUseCase;
  let repository: MovieInMemoryRepository;
  let input: CreateMovieUseCaseInput;

  beforeEach(() => {
    repository = new MovieInMemoryRepository();
    useCase = new CreateMovieUseCase(repository);
    input = MovieDataBuilder({
      title: 'Test Movie',
      year: 2023,
      studios: ['Test Studio'],
      producers: ['Test Producer'],
      winner: false,
    });
  });

  describe('execute method', () => {
    it('should create a movie successfully', async () => {
      const repositoryCreateSpy = jest.spyOn(repository, 'create');

      const result = await useCase.execute(input);

      expect(repositoryCreateSpy).toHaveBeenCalledTimes(1);
      expect(repositoryCreateSpy).toHaveBeenCalledWith(expect.any(MovieEntity));

      expect(result).toEqual({
        movie: {
          id: expect.any(String),
          title: input.title,
          year: input.year,
          studios: input.studios,
          producers: input.producers,
          winner: input.winner,
        },
      });
    });

    it('should create a movie with winner defaulting to false when not provided', async () => {
      const inputWithoutWinner = {
        title: 'Test Movie',
        year: 2023,
        studios: ['Test Studio'],
        producers: ['Test Producer'],
      };

      const result = await useCase.execute(inputWithoutWinner);

      expect(result.movie.winner).toBe(false);
    });

    it('should create a movie with winner set to true', async () => {
      const inputWithWinner = {
        ...input,
        winner: true,
      };

      const result = await useCase.execute(inputWithWinner);

      expect(result.movie.winner).toBe(true);
    });

    it('should create a movie with multiple studios and producers', async () => {
      const inputWithMultiple = {
        ...input,
        studios: ['Studio 1', 'Studio 2', 'Studio 3'],
        producers: ['Producer 1', 'Producer 2', 'Producer 3'],
      };

      const result = await useCase.execute(inputWithMultiple);

      expect(result.movie.studios).toEqual([
        'Studio 1',
        'Studio 2',
        'Studio 3',
      ]);
      expect(result.movie.producers).toEqual([
        'Producer 1',
        'Producer 2',
        'Producer 3',
      ]);
    });

    it('should persist the movie in the repository', async () => {
      await useCase.execute(input);

      const movies = await repository.findMany();
      expect(movies.total).toBe(1);
      expect(movies.items[0].title).toBe(input.title);
      expect(movies.items[0].year).toBe(input.year);
      expect(movies.items[0].studios).toEqual(input.studios);
      expect(movies.items[0].producers).toEqual(input.producers);
      expect(movies.items[0].winner).toBe(input.winner);
    });
  });

  describe('validation', () => {
    it('should throw EntityValidationError when title is missing', async () => {
      const invalidInput = { ...input };
      delete (invalidInput as any).title;

      await expect(useCase.execute(invalidInput as any)).rejects.toThrow(
        EntityValidationError,
      );
    });

    it('should throw EntityValidationError when title is not a string', async () => {
      const invalidInput = {
        ...input,
        title: 123 as any,
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        EntityValidationError,
      );
    });

    it('should throw EntityValidationError when year is missing', async () => {
      const invalidInput = { ...input };
      delete (invalidInput as any).year;

      await expect(useCase.execute(invalidInput as any)).rejects.toThrow(
        EntityValidationError,
      );
    });

    it('should throw EntityValidationError when year is not a number', async () => {
      const invalidInput = {
        ...input,
        year: 'invalid-year' as any,
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        EntityValidationError,
      );
    });

    it('should throw EntityValidationError when studios is missing', async () => {
      const invalidInput = { ...input };
      delete (invalidInput as any).studios;

      await expect(useCase.execute(invalidInput as any)).rejects.toThrow(
        EntityValidationError,
      );
    });

    it('should throw EntityValidationError when studios is not an array of strings', async () => {
      const invalidInput = {
        ...input,
        studios: [123, 'Valid Studio'] as any,
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        EntityValidationError,
      );
    });

    it('should throw EntityValidationError when producers is missing', async () => {
      const invalidInput = { ...input };
      delete (invalidInput as any).producers;

      await expect(useCase.execute(invalidInput as any)).rejects.toThrow(
        EntityValidationError,
      );
    });

    it('should throw EntityValidationError when producers is not an array of strings', async () => {
      const invalidInput = {
        ...input,
        producers: [123, 'Valid Producer'] as any,
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        EntityValidationError,
      );
    });

    it('should throw EntityValidationError when winner is not a boolean', async () => {
      const invalidInput = {
        ...input,
        winner: 'invalid-boolean' as any,
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        EntityValidationError,
      );
    });
  });

  describe('repository integration', () => {
    it('should call repository create method with correct movie entity', async () => {
      const repositoryCreateSpy = jest.spyOn(repository, 'create');

      await useCase.execute(input);

      expect(repositoryCreateSpy).toHaveBeenCalledTimes(1);

      const calledWith = repositoryCreateSpy.mock.calls[0][0];
      expect(calledWith).toBeInstanceOf(MovieEntity);
      expect(calledWith.title).toBe(input.title);
      expect(calledWith.year).toBe(input.year);
      expect(calledWith.studios).toEqual(input.studios);
      expect(calledWith.producers).toEqual(input.producers);
      expect(calledWith.winner).toBe(input.winner);
    });

    it('should return mapped output from MovieOutputMapper', async () => {
      const result = await useCase.execute(input);

      expect(result).toHaveProperty('movie');
      expect(result.movie).toHaveProperty('id');
      expect(result.movie).toHaveProperty('title', input.title);
      expect(result.movie).toHaveProperty('year', input.year);
      expect(result.movie).toHaveProperty('studios', input.studios);
      expect(result.movie).toHaveProperty('producers', input.producers);
      expect(result.movie).toHaveProperty('winner', input.winner);
    });

    it('should handle repository errors gracefully', async () => {
      const repositoryError = new Error('Repository error');
      jest.spyOn(repository, 'create').mockRejectedValueOnce(repositoryError);

      await expect(useCase.execute(input)).rejects.toThrow('Repository error');
    });
  });

  describe('edge cases', () => {
    it('should handle very long title', async () => {
      const inputWithLongTitle = {
        ...input,
        title: 'A'.repeat(1000),
      };

      const result = await useCase.execute(inputWithLongTitle);
      expect(result.movie.title).toBe('A'.repeat(1000));
    });

    it('should handle very old year', async () => {
      const inputWithOldYear = {
        ...input,
        year: 1900,
      };

      const result = await useCase.execute(inputWithOldYear);
      expect(result.movie.year).toBe(1900);
    });

    it('should handle future year', async () => {
      const inputWithFutureYear = {
        ...input,
        year: 2050,
      };

      const result = await useCase.execute(inputWithFutureYear);
      expect(result.movie.year).toBe(2050);
    });
  });
});
