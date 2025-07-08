import {
  DeleteMovieUseCase,
  DeleteMovieUseCaseInput,
} from '../delete-movie.use-case';
import { MovieInMemoryRepository } from '../../../infra/database/in-memory/movies.in-memory.repository';
import { MovieDataBuilder } from '../../../domain/testing/helpers/movie-data-builder';
import { MovieEntity } from '../../../domain/entities/movie.entity';
import { NotFoundError } from 'src/modules/shared/application/errors/no-found-error';
import { InternalError } from 'src/modules/shared/application/errors/internal-erro';

describe('DeleteMovieUseCase unit tests', () => {
  let useCase: DeleteMovieUseCase;
  let repository: MovieInMemoryRepository;
  let movieEntity: MovieEntity;
  let input: DeleteMovieUseCaseInput;

  beforeEach(async () => {
    repository = new MovieInMemoryRepository();
    useCase = new DeleteMovieUseCase(repository);

    const movieProps = MovieDataBuilder({
      title: 'Movie to Delete',
      year: 2023,
      studios: ['Delete Studio'],
      producers: ['Delete Producer'],
      winner: false,
    });

    movieEntity = new MovieEntity(movieProps);
    await repository.create(movieEntity);

    input = {
      id: movieEntity.id,
    };
  });

  describe('execute method', () => {
    it('should delete a movie successfully', async () => {
      const repositoryFindByIdSpy = jest.spyOn(repository, 'findById');
      const repositoryDeleteSpy = jest.spyOn(repository, 'delete');

      await useCase.execute(input);

      expect(repositoryFindByIdSpy).toHaveBeenCalledTimes(1);
      expect(repositoryFindByIdSpy).toHaveBeenCalledWith(input.id);
      expect(repositoryDeleteSpy).toHaveBeenCalledTimes(1);
      expect(repositoryDeleteSpy).toHaveBeenCalledWith(input.id);
    });

    it('should return void when deletion is successful', async () => {
      const result = await useCase.execute(input);

      expect(result).toBeUndefined();
    });

    it('should remove movie from repository', async () => {
      const initialMovies = await repository.findMany();
      expect(initialMovies.total).toBe(1);

      await useCase.execute(input);

      const finalMovies = await repository.findMany();
      expect(finalMovies.total).toBe(0);
      expect(finalMovies.items).toHaveLength(0);
    });

    it('should not find deleted movie by id', async () => {
      await useCase.execute(input);

      const deletedMovie = await repository.findById(input.id);
      expect(deletedMovie).toBeUndefined();
    });

    it('should delete correct movie when multiple exist', async () => {
      // Create additional movies
      const movie2 = new MovieEntity(
        MovieDataBuilder({
          title: 'Movie 2',
          year: 2022,
          studios: ['Studio 2'],
          producers: ['Producer 2'],
          winner: true,
        }),
      );
      const movie3 = new MovieEntity(
        MovieDataBuilder({
          title: 'Movie 3',
          year: 2021,
          studios: ['Studio 3'],
          producers: ['Producer 3'],
          winner: false,
        }),
      );

      await repository.create(movie2);
      await repository.create(movie3);

      const initialMovies = await repository.findMany();
      expect(initialMovies.total).toBe(3);

      // Delete the original movie
      await useCase.execute(input);

      const finalMovies = await repository.findMany();
      expect(finalMovies.total).toBe(2);

      // Verify the correct movie was deleted
      const deletedMovie = await repository.findById(input.id);
      expect(deletedMovie).toBeUndefined();

      // Verify other movies still exist
      const movie2Still = await repository.findById(movie2.id);
      const movie3Still = await repository.findById(movie3.id);
      expect(movie2Still).toBeDefined();
      expect(movie3Still).toBeDefined();
    });

    it('should handle deletion of winner movie', async () => {
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

      await useCase.execute({ id: winnerMovie.id });

      const deletedMovie = await repository.findById(winnerMovie.id);
      expect(deletedMovie).toBeUndefined();
    });

    it('should handle deletion of movie with multiple studios and producers', async () => {
      const complexMovie = new MovieEntity(
        MovieDataBuilder({
          title: 'Complex Movie',
          year: 2021,
          studios: ['Studio 1', 'Studio 2', 'Studio 3'],
          producers: ['Producer 1', 'Producer 2', 'Producer 3'],
          winner: false,
        }),
      );
      await repository.create(complexMovie);

      await useCase.execute({ id: complexMovie.id });

      const deletedMovie = await repository.findById(complexMovie.id);
      expect(deletedMovie).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should throw NotFoundError when movie does not exist', async () => {
      const nonExistentInput = {
        id: 'non-existent-id',
      };

      await expect(useCase.execute(nonExistentInput)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw NotFoundError with correct message', async () => {
      const invalidId = 'invalid-uuid-123';
      const invalidInput = {
        id: invalidId,
      };

      try {
        await useCase.execute(invalidInput);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.message).toContain(
          `DeleteMovieUseCase: Movie with id ${invalidId} not found`,
        );
      }
    });

    it('should handle repository findById errors gracefully', async () => {
      const repositoryError = new Error('Repository connection error');
      jest.spyOn(repository, 'findById').mockRejectedValueOnce(repositoryError);

      await expect(useCase.execute(input)).rejects.toThrow(InternalError);
    });

    it('should handle repository delete errors gracefully', async () => {
      const repositoryError = new Error('Delete operation failed');
      jest.spyOn(repository, 'delete').mockRejectedValueOnce(repositoryError);

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
          'DeleteMovieUseCase: Error retrieving movie by id',
        );
        expect(error.message).toContain('Database connection failed');
      }
    });

    it('should throw InternalError with correct message for delete errors', async () => {
      const repositoryError = new Error('Delete failed');
      jest.spyOn(repository, 'delete').mockRejectedValueOnce(repositoryError);

      try {
        await useCase.execute(input);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalError);
        expect(error.message).toContain(
          'DeleteMovieUseCase: Error deleting movie',
        );
        expect(error.message).toContain('Delete failed');
      }
    });

    it('should not delete if movie was deleted between findById and delete calls', async () => {
      // Mock scenario where movie exists during findById but is deleted before delete call
      jest.spyOn(repository, 'delete').mockImplementationOnce(async () => {
        // Simulate movie not found during delete
        throw new Error('Movie not found for deletion');
      });

      await expect(useCase.execute(input)).rejects.toThrow(InternalError);
    });
  });

  describe('repository integration', () => {
    it('should call repository methods in correct order', async () => {
      const repositoryFindByIdSpy = jest.spyOn(repository, 'findById');
      const repositoryDeleteSpy = jest.spyOn(repository, 'delete');

      await useCase.execute(input);

      expect(repositoryFindByIdSpy).toHaveBeenCalledTimes(1);
      expect(repositoryDeleteSpy).toHaveBeenCalledTimes(1);
      expect(repositoryFindByIdSpy).toHaveBeenCalledWith(input.id);
      expect(repositoryDeleteSpy).toHaveBeenCalledWith(input.id);
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

      const initialCount = await repository.findMany();
      expect(initialCount.total).toBe(3); // Original + 2 new

      // Test deleting each movie
      for (const movie of movies) {
        await useCase.execute({ id: movie.id });

        const deletedMovie = await repository.findById(movie.id);
        expect(deletedMovie).toBeUndefined();
      }

      const finalCount = await repository.findMany();
      expect(finalCount.total).toBe(1); // Only original remains
    });

    it('should maintain repository consistency after deletion', async () => {
      const initialMovies = await repository.findMany();
      const initialCount = initialMovies.total;

      await useCase.execute(input);

      const finalMovies = await repository.findMany();
      expect(finalMovies.total).toBe(initialCount - 1);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string id', async () => {
      const emptyIdInput = { id: '' };

      await expect(useCase.execute(emptyIdInput)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should handle null-like id values', async () => {
      const nullIds = ['null', 'undefined', '0'];

      for (const nullId of nullIds) {
        await expect(useCase.execute({ id: nullId })).rejects.toThrow(
          NotFoundError,
        );
      }
    });

    it('should handle very long id', async () => {
      const veryLongId = 'a'.repeat(1000);

      await expect(useCase.execute({ id: veryLongId })).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should handle UUID-like but invalid id', async () => {
      const fakeUuid = '12345678-1234-1234-1234-123456789abc';

      await expect(useCase.execute({ id: fakeUuid })).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should handle special characters in id', async () => {
      const specialId = 'id-with-special-chars-!@#$%^&*()';

      await expect(useCase.execute({ id: specialId })).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('performance considerations', () => {
    it('should only call repository methods once per execution', async () => {
      const repositoryFindByIdSpy = jest.spyOn(repository, 'findById');
      const repositoryDeleteSpy = jest.spyOn(repository, 'delete');

      await useCase.execute(input);

      expect(repositoryFindByIdSpy).toHaveBeenCalledTimes(1);
      expect(repositoryDeleteSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple sequential deletions independently', async () => {
      // Create additional movies for deletion
      const movie2 = new MovieEntity(
        MovieDataBuilder({
          title: 'Movie 2',
          year: 2022,
          studios: ['Studio 2'],
          producers: ['Producer 2'],
          winner: false,
        }),
      );
      const movie3 = new MovieEntity(
        MovieDataBuilder({
          title: 'Movie 3',
          year: 2021,
          studios: ['Studio 3'],
          producers: ['Producer 3'],
          winner: true,
        }),
      );

      await repository.create(movie2);
      await repository.create(movie3);

      const repositoryFindByIdSpy = jest.spyOn(repository, 'findById');
      const repositoryDeleteSpy = jest.spyOn(repository, 'delete');

      // Execute multiple deletions
      await useCase.execute(input);
      await useCase.execute({ id: movie2.id });
      await useCase.execute({ id: movie3.id });

      expect(repositoryFindByIdSpy).toHaveBeenCalledTimes(3);
      expect(repositoryDeleteSpy).toHaveBeenCalledTimes(3);
    });

    it('should not interfere with other operations', async () => {
      // Create another movie
      const anotherMovie = new MovieEntity(
        MovieDataBuilder({
          title: 'Another Movie',
          year: 2022,
          studios: ['Another Studio'],
          producers: ['Another Producer'],
          winner: true,
        }),
      );
      await repository.create(anotherMovie);

      // Delete original movie
      await useCase.execute(input);

      // Verify other movie is unaffected
      const untouchedMovie = await repository.findById(anotherMovie.id);
      expect(untouchedMovie).toBeDefined();
      expect(untouchedMovie?.title).toBe('Another Movie');
    });
  });

  describe('data consistency', () => {
    it('should maintain data consistency after deletion', async () => {
      const beforeDeletion = await repository.findMany();
      const initialCount = beforeDeletion.total;

      await useCase.execute(input);

      const afterDeletion = await repository.findMany();
      expect(afterDeletion.total).toBe(initialCount - 1);

      // Verify deleted movie is not in the list
      const movieExists = afterDeletion.items.some(
        (movie) => movie.id === input.id,
      );
      expect(movieExists).toBe(false);
    });

    it('should handle concurrent deletion attempts gracefully', async () => {
      // This test simulates what would happen if two delete operations
      // tried to delete the same movie simultaneously
      const deletePromise1 = useCase.execute(input);

      // Second delete should fail because movie won't be found
      await expect(deletePromise1).resolves.toBeUndefined();

      // Try to delete the same movie again
      await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);
    });

    it('should reflect deletion in subsequent operations', async () => {
      await useCase.execute(input);

      // Verify movie is gone from listing
      const movies = await repository.findMany();
      expect(movies.items.find((m) => m.id === input.id)).toBeUndefined();

      // Verify movie cannot be found by id
      const movie = await repository.findById(input.id);
      expect(movie).toBeUndefined();
    });
  });
});
