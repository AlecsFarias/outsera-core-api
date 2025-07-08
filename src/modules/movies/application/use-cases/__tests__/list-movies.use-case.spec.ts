import {
  ListMoviesUseCase,
  ListMoviesUseCaseInput,
} from '../list-movies.use-case';
import { MovieInMemoryRepository } from '../../../infra/database/in-memory/movies.in-memory.repository';
import { MovieDataBuilder } from '../../../domain/testing/helpers/movie-data-builder';
import { MovieEntity } from '../../../domain/entities/movie.entity';
import { InternalError } from 'src/modules/shared/application/errors/internal-erro';

describe('ListMoviesUseCase unit tests', () => {
  let useCase: ListMoviesUseCase;
  let repository: MovieInMemoryRepository;
  let input: ListMoviesUseCaseInput;

  beforeEach(async () => {
    repository = new MovieInMemoryRepository();
    useCase = new ListMoviesUseCase(repository);
    input = {};

    // Create some test movies
    const movies = [
      new MovieEntity(
        MovieDataBuilder({
          title: 'Movie 1',
          year: 2023,
          studios: ['Studio 1'],
          producers: ['Producer 1'],
          winner: false,
        }),
      ),
      new MovieEntity(
        MovieDataBuilder({
          title: 'Movie 2',
          year: 2022,
          studios: ['Studio 2'],
          producers: ['Producer 2'],
          winner: true,
        }),
      ),
      new MovieEntity(
        MovieDataBuilder({
          title: 'Movie 3',
          year: 2021,
          studios: ['Studio 3'],
          producers: ['Producer 3'],
          winner: false,
        }),
      ),
    ];

    for (const movie of movies) {
      await repository.create(movie);
    }
  });

  describe('execute method', () => {
    it('should list all movies successfully', async () => {
      const repositoryFindManySpy = jest.spyOn(repository, 'findMany');

      const result = await useCase.execute(input);

      expect(repositoryFindManySpy).toHaveBeenCalledTimes(1);
      expect(repositoryFindManySpy).toHaveBeenCalledWith(input);

      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(3);

      expect(result.items[0]).toEqual({
        id: expect.any(String),
        title: 'Movie 1',
        year: 2023,
        studios: ['Studio 1'],
        producers: ['Producer 1'],
        winner: false,
      });
    });

    it('should return correct movie data structure', async () => {
      const result = await useCase.execute(input);

      result.items.forEach((movie) => {
        expect(movie).toHaveProperty('id');
        expect(movie).toHaveProperty('title');
        expect(movie).toHaveProperty('year');
        expect(movie).toHaveProperty('studios');
        expect(movie).toHaveProperty('producers');
        expect(movie).toHaveProperty('winner');
        expect(typeof movie.id).toBe('string');
        expect(typeof movie.title).toBe('string');
        expect(typeof movie.year).toBe('number');
        expect(Array.isArray(movie.studios)).toBe(true);
        expect(Array.isArray(movie.producers)).toBe(true);
        expect(typeof movie.winner).toBe('boolean');
      });
    });

    it('should list movies with pagination filter', async () => {
      const paginationInput = {
        page: 1,
        perPage: 2,
      };

      const result = await useCase.execute(paginationInput);

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(3);
    });

    it('should list movies with search filter', async () => {
      const searchInput = {
        search: 'Movie 1',
      };

      const result = await useCase.execute(searchInput);

      expect(
        result.items.some((movie) => movie.title.includes('Movie 1')),
      ).toBe(true);
    });

    it('should handle empty input and use default values', async () => {
      const result = await useCase.execute();

      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should return empty list when no movies exist', async () => {
      const emptyRepository = new MovieInMemoryRepository();
      const emptyUseCase = new ListMoviesUseCase(emptyRepository);

      const result = await emptyUseCase.execute();

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      const repositoryError = new Error('Repository connection error');
      jest.spyOn(repository, 'findMany').mockRejectedValueOnce(repositoryError);

      await expect(useCase.execute(input)).rejects.toThrow(InternalError);
    });

    it('should throw InternalError with correct message', async () => {
      const repositoryError = new Error('Database connection failed');
      jest.spyOn(repository, 'findMany').mockRejectedValueOnce(repositoryError);

      try {
        await useCase.execute(input);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalError);
        expect(error.message).toContain(
          'ListMoviesUseCase: Error retrieving movies',
        );
        expect(error.message).toContain('Database connection failed');
      }
    });
  });

  describe('repository integration', () => {
    it('should call repository findMany with correct filter', async () => {
      const repositoryFindManySpy = jest.spyOn(repository, 'findMany');
      const filterInput = {
        search: 'test',
        page: 1,
        perPage: 10,
      };

      await useCase.execute(filterInput);

      expect(repositoryFindManySpy).toHaveBeenCalledTimes(1);
      expect(repositoryFindManySpy).toHaveBeenCalledWith(filterInput);
    });

    it('should return mapped output from MovieOutputMapper', async () => {
      const result = await useCase.execute();

      result.items.forEach((movie) => {
        expect(movie).toHaveProperty('id');
        expect(movie).toHaveProperty('title');
        expect(movie).toHaveProperty('year');
        expect(movie).toHaveProperty('studios');
        expect(movie).toHaveProperty('producers');
        expect(movie).toHaveProperty('winner');
      });
    });

    it('should work with different movie configurations', async () => {
      const complexRepository = new MovieInMemoryRepository();
      const complexUseCase = new ListMoviesUseCase(complexRepository);

      // Create movies with different configurations
      const movies = [
        new MovieEntity(
          MovieDataBuilder({
            title: 'Action Movie',
            year: 2020,
            studios: ['Action Studio'],
            producers: ['Action Producer'],
            winner: true,
          }),
        ),
        new MovieEntity(
          MovieDataBuilder({
            title: 'Drama Movie',
            year: 2019,
            studios: ['Drama Studio A', 'Drama Studio B'],
            producers: ['Drama Producer 1', 'Drama Producer 2'],
            winner: false,
          }),
        ),
      ];

      for (const movie of movies) {
        await complexRepository.create(movie);
      }

      const result = await complexUseCase.execute();

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);

      const actionMovie = result.items.find((m) => m.title === 'Action Movie');
      const dramaMovie = result.items.find((m) => m.title === 'Drama Movie');

      expect(actionMovie?.winner).toBe(true);
      expect(dramaMovie?.studios).toEqual(['Drama Studio A', 'Drama Studio B']);
      expect(dramaMovie?.producers).toEqual([
        'Drama Producer 1',
        'Drama Producer 2',
      ]);
    });
  });

  describe('edge cases', () => {
    it('should handle null filter input', async () => {
      const result = await useCase.execute(null as any);

      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should handle undefined filter input', async () => {
      const result = await useCase.execute(undefined);

      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should handle filter with only some properties', async () => {
      const partialFilter = { page: 1 };

      const result = await useCase.execute(partialFilter);

      expect(result.items).toBeDefined();
      expect(result.total).toBe(3);
    });

    it('should handle zero page and perPage values', async () => {
      const zeroFilter = {
        page: 0,
        perPage: 0,
      };

      const result = await useCase.execute(zeroFilter);

      expect(result.items).toBeDefined();
      expect(result.total).toBe(3);
    });

    it('should handle negative page and perPage values', async () => {
      const negativeFilter = {
        page: -1,
        perPage: -5,
      };

      const result = await useCase.execute(negativeFilter);

      expect(result.items).toBeDefined();
      expect(result.total).toBe(3);
    });

    it('should handle very large page number', async () => {
      const largePageFilter = {
        page: 1000,
        perPage: 10,
      };

      const result = await useCase.execute(largePageFilter);

      expect(result.items).toBeDefined();
      expect(result.total).toBe(3);
    });

    it('should handle empty search string', async () => {
      const emptySearchFilter = {
        search: '',
      };

      const result = await useCase.execute(emptySearchFilter);

      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should handle very long search string', async () => {
      const longSearchFilter = {
        search: 'a'.repeat(1000),
      };

      const result = await useCase.execute(longSearchFilter);

      expect(result.items).toBeDefined();
      expect(result.total).toBe(0);
    });
  });

  describe('performance considerations', () => {
    it('should only call repository once per execution', async () => {
      const repositoryFindManySpy = jest.spyOn(repository, 'findMany');

      await useCase.execute(input);

      expect(repositoryFindManySpy).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple sequential calls independently', async () => {
      const repositoryFindManySpy = jest.spyOn(repository, 'findMany');

      // Execute multiple times
      await useCase.execute(input);
      await useCase.execute(input);
      await useCase.execute(input);

      expect(repositoryFindManySpy).toHaveBeenCalledTimes(3);
      expect(repositoryFindManySpy).toHaveBeenNthCalledWith(1, input);
      expect(repositoryFindManySpy).toHaveBeenNthCalledWith(2, input);
      expect(repositoryFindManySpy).toHaveBeenNthCalledWith(3, input);
    });

    it('should handle concurrent executions', async () => {
      const repositoryFindManySpy = jest.spyOn(repository, 'findMany');

      // Execute concurrently
      const promises = [
        useCase.execute(input),
        useCase.execute(input),
        useCase.execute(input),
      ];

      const results = await Promise.all(promises);

      expect(repositoryFindManySpy).toHaveBeenCalledTimes(3);
      results.forEach((result) => {
        expect(result.items).toHaveLength(3);
        expect(result.total).toBe(3);
      });
    });
  });

  describe('data consistency', () => {
    it('should return consistent results across multiple calls', async () => {
      const result1 = await useCase.execute();
      const result2 = await useCase.execute();

      expect(result1.total).toBe(result2.total);
      expect(result1.items).toHaveLength(result2.items.length);
    });

    it('should reflect repository changes', async () => {
      const initialResult = await useCase.execute();
      expect(initialResult.total).toBe(3);

      // Add a new movie
      const newMovie = new MovieEntity(
        MovieDataBuilder({
          title: 'New Movie',
          year: 2024,
          studios: ['New Studio'],
          producers: ['New Producer'],
          winner: false,
        }),
      );
      await repository.create(newMovie);

      const updatedResult = await useCase.execute();
      expect(updatedResult.total).toBe(4);
      expect(updatedResult.items).toHaveLength(4);
    });
  });
});
