import {
  UpdateMovieUseCase,
  UpdateMovieUseCaseInput,
} from '../update-movie.use-case';
import { MovieInMemoryRepository } from '../../../infra/database/in-memory/movies.in-memory.repository';
import { MovieDataBuilder } from '../../../domain/testing/helpers/movie-data-builder';
import { MovieEntity } from '../../../domain/entities/movie.entity';
import { NotFoundError } from 'src/modules/shared/application/errors/no-found-error';
import { InternalError } from 'src/modules/shared/application/errors/internal-erro';

describe('UpdateMovieUseCase unit tests', () => {
  let useCase: UpdateMovieUseCase;
  let repository: MovieInMemoryRepository;
  let movieEntity: MovieEntity;
  let input: UpdateMovieUseCaseInput;

  beforeEach(async () => {
    repository = new MovieInMemoryRepository();
    useCase = new UpdateMovieUseCase(repository);

    const movieProps = MovieDataBuilder({
      title: 'Original Movie',
      year: 2023,
      studios: ['Original Studio'],
      producers: ['Original Producer'],
      winner: false,
    });

    movieEntity = new MovieEntity(movieProps);
    await repository.create(movieEntity);

    input = {
      id: movieEntity.id,
      title: 'Updated Movie',
    };
  });

  describe('execute method', () => {
    it('should update a movie successfully', async () => {
      const repositoryFindByIdSpy = jest.spyOn(repository, 'findById');
      const repositoryUpdateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(input);

      expect(repositoryFindByIdSpy).toHaveBeenCalledTimes(1);
      expect(repositoryFindByIdSpy).toHaveBeenCalledWith(input.id);
      expect(repositoryUpdateSpy).toHaveBeenCalledTimes(1);
      expect(repositoryUpdateSpy).toHaveBeenCalledWith(expect.any(MovieEntity));

      expect(result).toEqual({
        movie: {
          id: movieEntity.id,
          title: 'Updated Movie',
          year: 2023,
          studios: ['Original Studio'],
          producers: ['Original Producer'],
          winner: false,
        },
      });
    });

    it('should update only the title field', async () => {
      const updateInput = {
        id: movieEntity.id,
        title: 'New Title',
      };

      const result = await useCase.execute(updateInput);

      expect(result.movie.title).toBe('New Title');
      expect(result.movie.year).toBe(2023);
      expect(result.movie.studios).toEqual(['Original Studio']);
      expect(result.movie.producers).toEqual(['Original Producer']);
      expect(result.movie.winner).toBe(false);
    });

    it('should update only the year field', async () => {
      const updateInput = {
        id: movieEntity.id,
        year: 2024,
      };

      const result = await useCase.execute(updateInput);

      expect(result.movie.title).toBe('Original Movie');
      expect(result.movie.year).toBe(2024);
      expect(result.movie.studios).toEqual(['Original Studio']);
      expect(result.movie.producers).toEqual(['Original Producer']);
      expect(result.movie.winner).toBe(false);
    });

    it('should update only the studios field', async () => {
      const updateInput = {
        id: movieEntity.id,
        studios: ['New Studio 1', 'New Studio 2'],
      };

      const result = await useCase.execute(updateInput);

      expect(result.movie.title).toBe('Original Movie');
      expect(result.movie.year).toBe(2023);
      expect(result.movie.studios).toEqual(['New Studio 1', 'New Studio 2']);
      expect(result.movie.producers).toEqual(['Original Producer']);
      expect(result.movie.winner).toBe(false);
    });

    it('should update only the producers field', async () => {
      const updateInput = {
        id: movieEntity.id,
        producers: ['New Producer 1', 'New Producer 2'],
      };

      const result = await useCase.execute(updateInput);

      expect(result.movie.title).toBe('Original Movie');
      expect(result.movie.year).toBe(2023);
      expect(result.movie.studios).toEqual(['Original Studio']);
      expect(result.movie.producers).toEqual([
        'New Producer 1',
        'New Producer 2',
      ]);
      expect(result.movie.winner).toBe(false);
    });

    it('should update only the winner field', async () => {
      const updateInput = {
        id: movieEntity.id,
        winner: true,
      };

      const result = await useCase.execute(updateInput);

      expect(result.movie.title).toBe('Original Movie');
      expect(result.movie.year).toBe(2023);
      expect(result.movie.studios).toEqual(['Original Studio']);
      expect(result.movie.producers).toEqual(['Original Producer']);
      expect(result.movie.winner).toBe(true);
    });

    it('should update multiple fields at once', async () => {
      const updateInput = {
        id: movieEntity.id,
        title: 'Completely Updated Movie',
        year: 2025,
        studios: ['Updated Studio 1', 'Updated Studio 2'],
        producers: ['Updated Producer 1', 'Updated Producer 2'],
        winner: true,
      };

      const result = await useCase.execute(updateInput);

      expect(result.movie.title).toBe('Completely Updated Movie');
      expect(result.movie.year).toBe(2025);
      expect(result.movie.studios).toEqual([
        'Updated Studio 1',
        'Updated Studio 2',
      ]);
      expect(result.movie.producers).toEqual([
        'Updated Producer 1',
        'Updated Producer 2',
      ]);
      expect(result.movie.winner).toBe(true);
    });

    it('should not update fields when undefined is passed', async () => {
      const updateInput = {
        id: movieEntity.id,
        title: undefined,
        year: undefined,
        studios: undefined,
        producers: undefined,
        winner: undefined,
      };

      const result = await useCase.execute(updateInput);

      expect(result.movie.title).toBe('Original Movie');
      expect(result.movie.year).toBe(2023);
      expect(result.movie.studios).toEqual(['Original Studio']);
      expect(result.movie.producers).toEqual(['Original Producer']);
      expect(result.movie.winner).toBe(false);
    });

    it('should update winner to false when explicitly set', async () => {
      // First, set winner to true
      const winnerMovie = new MovieEntity(
        MovieDataBuilder({
          title: 'Winner Movie',
          year: 2022,
          studios: ['Winner Studio'],
          producers: ['Winner Producer'],
          winner: true,
        }),
      );
      await repository.create(winnerMovie);

      const updateInput = {
        id: winnerMovie.id,
        winner: false,
      };

      const result = await useCase.execute(updateInput);

      expect(result.movie.winner).toBe(false);
    });

    it('should persist changes in repository', async () => {
      const updateInput = {
        id: movieEntity.id,
        title: 'Persisted Update',
        winner: true,
      };

      await useCase.execute(updateInput);

      const updatedMovie = await repository.findById(movieEntity.id);
      expect(updatedMovie?.title).toBe('Persisted Update');
      expect(updatedMovie?.winner).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw NotFoundError when movie does not exist', async () => {
      const nonExistentInput = {
        id: 'non-existent-id',
        title: 'Updated Title',
      };

      await expect(useCase.execute(nonExistentInput)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw NotFoundError with correct message', async () => {
      const invalidId = 'invalid-uuid-123';
      const invalidInput = {
        id: invalidId,
        title: 'Updated Title',
      };

      try {
        await useCase.execute(invalidInput);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.message).toContain(
          `UpdateMovieUseCase: Movie with id ${invalidId} not found`,
        );
      }
    });

    it('should handle repository findById errors gracefully', async () => {
      const repositoryError = new Error('Repository connection error');
      jest.spyOn(repository, 'findById').mockRejectedValueOnce(repositoryError);

      await expect(useCase.execute(input)).rejects.toThrow(InternalError);
    });

    it('should handle repository update errors gracefully', async () => {
      const repositoryError = new Error('Update operation failed');
      jest.spyOn(repository, 'update').mockRejectedValueOnce(repositoryError);

      await expect(useCase.execute(input)).rejects.toThrow(InternalError);
    });

    it('should throw InternalError with correct message for findById errors', async () => {
      const repositoryError = new Error('Database connection failed');
      jest.spyOn(repository, 'findById').mockRejectedValueOnce(repositoryError);

      try {
        await useCase.execute(input);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalError);
        expect(error.message).toContain(
          'UpdateMovieUseCase: Error retrieving movie by id',
        );
        expect(error.message).toContain('Database connection failed');
      }
    });

    it('should throw InternalError with correct message for update errors', async () => {
      const repositoryError = new Error('Update failed');
      jest.spyOn(repository, 'update').mockRejectedValueOnce(repositoryError);

      try {
        await useCase.execute(input);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalError);
        expect(error.message).toContain(
          'UpdateMovieUseCase: Error updating movie',
        );
        expect(error.message).toContain('Update failed');
      }
    });
  });

  describe('repository integration', () => {
    it('should call repository methods in correct order', async () => {
      const repositoryFindByIdSpy = jest.spyOn(repository, 'findById');
      const repositoryUpdateSpy = jest.spyOn(repository, 'update');

      await useCase.execute(input);

      expect(repositoryFindByIdSpy).toHaveBeenCalledTimes(1);
      expect(repositoryUpdateSpy).toHaveBeenCalledTimes(1);
      expect(repositoryFindByIdSpy).toHaveBeenCalledWith(input.id);
      expect(repositoryUpdateSpy).toHaveBeenCalledWith(expect.any(MovieEntity));
    });

    it('should return mapped output from MovieOutputMapper', async () => {
      const result = await useCase.execute(input);

      expect(result).toHaveProperty('movie');
      expect(result.movie).toHaveProperty('id');
      expect(result.movie).toHaveProperty('title');
      expect(result.movie).toHaveProperty('year');
      expect(result.movie).toHaveProperty('studios');
      expect(result.movie).toHaveProperty('producers');
      expect(result.movie).toHaveProperty('winner');
    });

    it('should work with different movie configurations', async () => {
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
        await repository.create(movie);
      }

      // Test updating each movie
      for (const movie of movies) {
        const updateInput = {
          id: movie.id,
          title: `Updated ${movie.title}`,
        };

        const result = await useCase.execute(updateInput);
        expect(result.movie.title).toBe(updateInput.title);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty string values', async () => {
      const updateInput = {
        id: movieEntity.id,
        title: '',
        studios: [''],
        producers: [''],
      };

      const result = await useCase.execute(updateInput);

      expect(result.movie.title).toBe('');
      expect(result.movie.studios).toEqual(['']);
      expect(result.movie.producers).toEqual(['']);
    });

    it('should handle empty arrays', async () => {
      const updateInput = {
        id: movieEntity.id,
        studios: [],
        producers: [],
      };

      const result = await useCase.execute(updateInput);

      expect(result.movie.studios).toEqual([]);
      expect(result.movie.producers).toEqual([]);
    });

    it('should handle very long strings', async () => {
      const longTitle = 'a'.repeat(1000);
      const updateInput = {
        id: movieEntity.id,
        title: longTitle,
      };

      const result = await useCase.execute(updateInput);

      expect(result.movie.title).toBe(longTitle);
    });

    it('should handle large arrays', async () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => `Item ${i}`);
      const updateInput = {
        id: movieEntity.id,
        studios: largeArray,
        producers: largeArray,
      };

      const result = await useCase.execute(updateInput);

      expect(result.movie.studios).toEqual(largeArray);
      expect(result.movie.producers).toEqual(largeArray);
    });

    it('should handle special characters in strings', async () => {
      const specialTitle = 'Movie with special chars: !@#$%^&*()[]{}|;:,.<>?';
      const updateInput = {
        id: movieEntity.id,
        title: specialTitle,
      };

      const result = await useCase.execute(updateInput);

      expect(result.movie.title).toBe(specialTitle);
    });

    it('should handle year edge values', async () => {
      const edgeYears = [0, 1, 9999, 2024];

      for (const year of edgeYears) {
        const updateInput = {
          id: movieEntity.id,
          year,
        };

        const result = await useCase.execute(updateInput);
        expect(result.movie.year).toBe(year);
      }
    });
  });

  describe('performance considerations', () => {
    it('should only call repository methods once per execution', async () => {
      const repositoryFindByIdSpy = jest.spyOn(repository, 'findById');
      const repositoryUpdateSpy = jest.spyOn(repository, 'update');

      await useCase.execute(input);

      expect(repositoryFindByIdSpy).toHaveBeenCalledTimes(1);
      expect(repositoryUpdateSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple sequential calls independently', async () => {
      const repositoryFindByIdSpy = jest.spyOn(repository, 'findById');
      const repositoryUpdateSpy = jest.spyOn(repository, 'update');

      // Execute multiple times
      await useCase.execute(input);
      await useCase.execute({ id: movieEntity.id, year: 2024 });
      await useCase.execute({ id: movieEntity.id, winner: true });

      expect(repositoryFindByIdSpy).toHaveBeenCalledTimes(3);
      expect(repositoryUpdateSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('data consistency', () => {
    it('should maintain data consistency after updates', async () => {
      const originalMovie = await repository.findById(movieEntity.id);
      expect(originalMovie?.title).toBe('Original Movie');

      await useCase.execute({
        id: movieEntity.id,
        title: 'Consistent Update',
      });

      const updatedMovie = await repository.findById(movieEntity.id);
      expect(updatedMovie?.title).toBe('Consistent Update');
      expect(updatedMovie?.id).toBe(originalMovie?.id);
    });

    it('should reflect all changes when multiple fields are updated', async () => {
      const complexUpdate = {
        id: movieEntity.id,
        title: 'Complex Update',
        year: 2030,
        studios: ['Complex Studio 1', 'Complex Studio 2'],
        producers: ['Complex Producer 1'],
        winner: true,
      };

      await useCase.execute(complexUpdate);

      const updatedMovie = await repository.findById(movieEntity.id);
      expect(updatedMovie?.title).toBe('Complex Update');
      expect(updatedMovie?.year).toBe(2030);
      expect(updatedMovie?.studios).toEqual([
        'Complex Studio 1',
        'Complex Studio 2',
      ]);
      expect(updatedMovie?.producers).toEqual(['Complex Producer 1']);
      expect(updatedMovie?.winner).toBe(true);
    });
  });
});
