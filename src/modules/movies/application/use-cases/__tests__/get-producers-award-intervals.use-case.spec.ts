import { GetProducersAwardIntervalsUseCase } from '../get-producers-award-intervals.use-case';
import { MovieInMemoryRepository } from '../../../infra/database/in-memory/movies.in-memory.repository';
import { MovieDataBuilder } from '../../../domain/testing/helpers/movie-data-builder';
import { MovieEntity } from '../../../domain/entities/movie.entity';
import { InternalError } from 'src/modules/shared/application/errors/internal-erro';

describe('GetProducersAwardIntervalsUseCase unit tests', () => {
  let useCase: GetProducersAwardIntervalsUseCase;
  let repository: MovieInMemoryRepository;

  beforeEach(async () => {
    repository = new MovieInMemoryRepository();
    // Clear any seeded data for controlled testing
    repository['items'] = [];
    useCase = new GetProducersAwardIntervalsUseCase(repository);
  });

  describe('execute method', () => {
    it('should return empty arrays when no winning movies exist', async () => {
      const result = await useCase.execute();

      expect(result).toEqual({
        min: [],
        max: [],
      });
    });

    it('should return empty arrays when no producer has multiple wins', async () => {
      // Create winning movies with different producers
      const movies = [
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 1',
            year: 2020,
            studios: ['Studio 1'],
            producers: ['Producer A'],
            winner: true,
          }),
        ),
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 2',
            year: 2021,
            studios: ['Studio 2'],
            producers: ['Producer B'],
            winner: true,
          }),
        ),
      ];

      for (const movie of movies) {
        await repository.create(movie);
      }

      const result = await useCase.execute();

      expect(result).toEqual({
        min: [],
        max: [],
      });
    });

    it('should calculate intervals correctly for producer with multiple wins', async () => {
      const movies = [
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 1',
            year: 2008,
            studios: ['Studio 1'],
            producers: ['Producer A'],
            winner: true,
          }),
        ),
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 2',
            year: 2009,
            studios: ['Studio 2'],
            producers: ['Producer A'],
            winner: true,
          }),
        ),
      ];

      for (const movie of movies) {
        await repository.create(movie);
      }

      const result = await useCase.execute();

      expect(result.min).toHaveLength(1);
      expect(result.max).toHaveLength(1);
      expect(result.min[0]).toEqual({
        producer: 'Producer A',
        interval: 1,
        previousWin: 2008,
        followingWin: 2009,
      });
      expect(result.max[0]).toEqual({
        producer: 'Producer A',
        interval: 1,
        previousWin: 2008,
        followingWin: 2009,
      });
    });

    it('should handle multiple producers with different intervals', async () => {
      const movies = [
        // Producer A: wins in 2008, 2009 (interval: 1)
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 1',
            year: 2008,
            studios: ['Studio 1'],
            producers: ['Producer A'],
            winner: true,
          }),
        ),
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 2',
            year: 2009,
            studios: ['Studio 2'],
            producers: ['Producer A'],
            winner: true,
          }),
        ),
        // Producer B: wins in 2000, 2010 (interval: 10)
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 3',
            year: 2000,
            studios: ['Studio 3'],
            producers: ['Producer B'],
            winner: true,
          }),
        ),
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 4',
            year: 2010,
            studios: ['Studio 4'],
            producers: ['Producer B'],
            winner: true,
          }),
        ),
      ];

      for (const movie of movies) {
        await repository.create(movie);
      }

      const result = await useCase.execute();

      expect(result.min).toHaveLength(1);
      expect(result.max).toHaveLength(1);

      expect(result.min[0]).toEqual({
        producer: 'Producer A',
        interval: 1,
        previousWin: 2008,
        followingWin: 2009,
      });

      expect(result.max[0]).toEqual({
        producer: 'Producer B',
        interval: 10,
        previousWin: 2000,
        followingWin: 2010,
      });
    });

    it('should handle multiple producers with same min interval', async () => {
      const movies = [
        // Producer A: 2008, 2009 (interval: 1)
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 1',
            year: 2008,
            studios: ['Studio 1'],
            producers: ['Producer A'],
            winner: true,
          }),
        ),
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 2',
            year: 2009,
            studios: ['Studio 2'],
            producers: ['Producer A'],
            winner: true,
          }),
        ),
        // Producer B: 2018, 2019 (interval: 1)
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 3',
            year: 2018,
            studios: ['Studio 3'],
            producers: ['Producer B'],
            winner: true,
          }),
        ),
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 4',
            year: 2019,
            studios: ['Studio 4'],
            producers: ['Producer B'],
            winner: true,
          }),
        ),
      ];

      for (const movie of movies) {
        await repository.create(movie);
      }

      const result = await useCase.execute();

      expect(result.min).toHaveLength(2);
      expect(result.max).toHaveLength(2);

      expect(result.min).toContainEqual({
        producer: 'Producer A',
        interval: 1,
        previousWin: 2008,
        followingWin: 2009,
      });

      expect(result.min).toContainEqual({
        producer: 'Producer B',
        interval: 1,
        previousWin: 2018,
        followingWin: 2019,
      });
    });

    it('should handle producer with multiple consecutive wins', async () => {
      const movies = [
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 1',
            year: 2000,
            studios: ['Studio 1'],
            producers: ['Producer A'],
            winner: true,
          }),
        ),
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 2',
            year: 2005,
            studios: ['Studio 2'],
            producers: ['Producer A'],
            winner: true,
          }),
        ),
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 3',
            year: 2006,
            studios: ['Studio 3'],
            producers: ['Producer A'],
            winner: true,
          }),
        ),
      ];

      for (const movie of movies) {
        await repository.create(movie);
      }

      const result = await useCase.execute();

      expect(result.min).toHaveLength(1);
      expect(result.max).toHaveLength(1);

      // Should find the minimum interval (1 year between 2005-2006)
      expect(result.min[0]).toEqual({
        producer: 'Producer A',
        interval: 1,
        previousWin: 2005,
        followingWin: 2006,
      });

      // Should find the maximum interval (5 years between 2000-2005)
      expect(result.max[0]).toEqual({
        producer: 'Producer A',
        interval: 5,
        previousWin: 2000,
        followingWin: 2005,
      });
    });

    it('should handle movies with multiple producers', async () => {
      const movies = [
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 1',
            year: 2008,
            studios: ['Studio 1'],
            producers: ['Producer A', 'Producer B'],
            winner: true,
          }),
        ),
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 2',
            year: 2009,
            studios: ['Studio 2'],
            producers: ['Producer A'],
            winner: true,
          }),
        ),
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 3',
            year: 2010,
            studios: ['Studio 3'],
            producers: ['Producer B'],
            winner: true,
          }),
        ),
      ];

      for (const movie of movies) {
        await repository.create(movie);
      }

      const result = await useCase.execute();

      expect(result.min).toHaveLength(1);
      expect(result.max).toHaveLength(1);

      expect(result.min).toContainEqual({
        producer: 'Producer A',
        interval: 1,
        previousWin: 2008,
        followingWin: 2009,
      });

      expect(result.max).toContainEqual({
        producer: 'Producer B',
        interval: 2,
        previousWin: 2008,
        followingWin: 2010,
      });
    });

    it('should ignore non-winning movies', async () => {
      const movies = [
        new MovieEntity(
          MovieDataBuilder({
            title: 'Non-Winner',
            year: 2007,
            studios: ['Studio 1'],
            producers: ['Producer A'],
            winner: false,
          }),
        ),
        new MovieEntity(
          MovieDataBuilder({
            title: 'Winner 1',
            year: 2008,
            studios: ['Studio 2'],
            producers: ['Producer A'],
            winner: true,
          }),
        ),
        new MovieEntity(
          MovieDataBuilder({
            title: 'Winner 2',
            year: 2009,
            studios: ['Studio 3'],
            producers: ['Producer A'],
            winner: true,
          }),
        ),
      ];

      for (const movie of movies) {
        await repository.create(movie);
      }

      const result = await useCase.execute();

      expect(result.min).toHaveLength(1);
      expect(result.max).toHaveLength(1);

      // Should only consider the winning movies (2008, 2009)
      expect(result.min[0]).toEqual({
        producer: 'Producer A',
        interval: 1,
        previousWin: 2008,
        followingWin: 2009,
      });
    });

    it('should handle unsorted years correctly', async () => {
      const movies = [
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 1',
            year: 2010,
            studios: ['Studio 1'],
            producers: ['Producer A'],
            winner: true,
          }),
        ),
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 2',
            year: 2005,
            studios: ['Studio 2'],
            producers: ['Producer A'],
            winner: true,
          }),
        ),
        new MovieEntity(
          MovieDataBuilder({
            title: 'Movie 3',
            year: 2015,
            studios: ['Studio 3'],
            producers: ['Producer A'],
            winner: true,
          }),
        ),
      ];

      for (const movie of movies) {
        await repository.create(movie);
      }

      const result = await useCase.execute();

      expect(result.min).toHaveLength(2);
      expect(result.max).toHaveLength(2);

      // Should find minimum interval (5 years: 2005-2010 or 2010-2015)
      expect(result.min[0].interval).toBe(5);
      expect(result.max[0].interval).toBe(5);
    });
  });

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      const repositoryError = new Error('Repository connection error');
      jest
        .spyOn(repository, 'getProducersWithMaxAndMinAwardIntervals')
        .mockRejectedValueOnce(repositoryError);

      await expect(useCase.execute()).rejects.toThrow(InternalError);
    });

    it('should throw InternalError with correct message', async () => {
      const repositoryError = new Error('Database connection failed');
      jest
        .spyOn(repository, 'getProducersWithMaxAndMinAwardIntervals')
        .mockRejectedValueOnce(repositoryError);

      try {
        await useCase.execute();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalError);
        expect(error.message).toContain(
          'GetProducersAwardIntervalsUseCase: Error retrieving producers award intervals',
        );
        expect(error.message).toContain('Database connection failed');
      }
    });
  });

  describe('repository integration', () => {
    it('should call repository method correctly', async () => {
      const repositorySpy = jest.spyOn(
        repository,
        'getProducersWithMaxAndMinAwardIntervals',
      );

      await useCase.execute();

      expect(repositorySpy).toHaveBeenCalledTimes(1);
    });

    it('should return data in correct format', async () => {
      const result = await useCase.execute();

      expect(result).toHaveProperty('min');
      expect(result).toHaveProperty('max');
      expect(Array.isArray(result.min)).toBe(true);
      expect(Array.isArray(result.max)).toBe(true);
    });
  });
});
