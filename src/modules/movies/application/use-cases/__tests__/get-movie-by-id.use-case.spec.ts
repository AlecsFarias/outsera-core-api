import {
  GetMovieByIdUseCase,
  GetMovieByIdUseCaseInput,
} from '../get-movie-by-id.use-case';
import { MovieInMemoryRepository } from '../../../infra/database/in-memory/movies.in-memory.repository';
import { MovieDataBuilder } from '../../../domain/testing/helpers/movie-data-builder';
import { MovieEntity } from '../../../domain/entities/movie.entity';
import { NotFoundError } from 'src/modules/shared/application/errors/no-found-error';
import { InternalError } from 'src/modules/shared/application/errors/internal-erro';

describe('GetMovieByIdUseCase unit tests', () => {
  let useCase: GetMovieByIdUseCase;
  let repository: MovieInMemoryRepository;
  let input: GetMovieByIdUseCaseInput;
  let movieEntity: MovieEntity;

  beforeEach(async () => {
    repository = new MovieInMemoryRepository();
    useCase = new GetMovieByIdUseCase(repository);

    const movieProps = MovieDataBuilder({
      title: 'Test Movie',
      year: 2023,
      studios: ['Test Studio'],
      producers: ['Test Producer'],
      winner: false,
    });

    movieEntity = new MovieEntity(movieProps);
    await repository.create(movieEntity);

    input = {
      id: movieEntity.id,
    };
  });

  describe('execute method', () => {
    it('should find and return a movie by id successfully', async () => {
      const repositoryFindByIdSpy = jest.spyOn(repository, 'findById');

      const result = await useCase.execute(input);

      expect(repositoryFindByIdSpy).toHaveBeenCalledTimes(1);
      expect(repositoryFindByIdSpy).toHaveBeenCalledWith(input.id);

      expect(result).toEqual({
        movie: {
          id: movieEntity.id,
          title: movieEntity.title,
          year: movieEntity.year,
          studios: movieEntity.studios,
          producers: movieEntity.producers,
          winner: movieEntity.winner,
        },
      });
    });

    it('should return correct movie data', async () => {
      const result = await useCase.execute(input);

      expect(result.movie.id).toBe(movieEntity.id);
      expect(result.movie.title).toBe('Test Movie');
      expect(result.movie.year).toBe(2023);
      expect(result.movie.studios).toEqual(['Test Studio']);
      expect(result.movie.producers).toEqual(['Test Producer']);
      expect(result.movie.winner).toBe(false);
    });

    it('should find a movie with winner true', async () => {
      const winnerMovieProps = MovieDataBuilder({
        title: 'Winner Movie',
        year: 2022,
        studios: ['Winner Studio'],
        producers: ['Winner Producer'],
        winner: true,
      });

      const winnerMovie = new MovieEntity(winnerMovieProps);
      await repository.create(winnerMovie);

      const result = await useCase.execute({ id: winnerMovie.id });

      expect(result.movie.winner).toBe(true);
      expect(result.movie.title).toBe('Winner Movie');
    });

    it('should find a movie with multiple studios and producers', async () => {
      const complexMovieProps = MovieDataBuilder({
        title: 'Complex Movie',
        year: 2021,
        studios: ['Studio 1', 'Studio 2', 'Studio 3'],
        producers: ['Producer 1', 'Producer 2', 'Producer 3'],
        winner: false,
      });

      const complexMovie = new MovieEntity(complexMovieProps);
      await repository.create(complexMovie);

      const result = await useCase.execute({ id: complexMovie.id });

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
  });

  describe('error handling', () => {
    it('should throw NotFoundError when movie does not exist', async () => {
      const nonExistentId = 'non-existent-id';

      await expect(useCase.execute({ id: nonExistentId })).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw NotFoundError with correct message', async () => {
      const invalidId = 'invalid-uuid-123';

      try {
        await useCase.execute({ id: invalidId });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });

    it('should handle repository errors gracefully', async () => {
      const repositoryError = new Error('Repository connection error');
      jest.spyOn(repository, 'findById').mockRejectedValueOnce(repositoryError);

      await expect(useCase.execute(input)).rejects.toThrow(InternalError);
    });
  });

  describe('repository integration', () => {
    it('should call repository findById with correct id', async () => {
      const repositoryFindByIdSpy = jest.spyOn(repository, 'findById');

      await useCase.execute(input);

      expect(repositoryFindByIdSpy).toHaveBeenCalledTimes(1);
      expect(repositoryFindByIdSpy).toHaveBeenCalledWith(input.id);
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
            producers: ['Drama Producer'],
            winner: false,
          }),
        ),
      ];

      for (const movie of movies) {
        await repository.create(movie);
      }

      // Test finding each movie
      for (const movie of movies) {
        const result = await useCase.execute({ id: movie.id });
        expect(result.movie.id).toBe(movie.id);
        expect(result.movie.title).toBe(movie.title);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty string id', async () => {
      await expect(useCase.execute({ id: '' })).rejects.toThrow(NotFoundError);
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
  });

  describe('performance considerations', () => {
    it('should only call repository once per execution', async () => {
      const repositoryFindByIdSpy = jest.spyOn(repository, 'findById');

      await useCase.execute(input);

      expect(repositoryFindByIdSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple sequential calls independently', async () => {
      const repositoryFindByIdSpy = jest.spyOn(repository, 'findById');

      // Execute multiple times
      await useCase.execute(input);
      await useCase.execute(input);
      await useCase.execute(input);

      expect(repositoryFindByIdSpy).toHaveBeenCalledTimes(3);
      expect(repositoryFindByIdSpy).toHaveBeenNthCalledWith(1, input.id);
      expect(repositoryFindByIdSpy).toHaveBeenNthCalledWith(2, input.id);
      expect(repositoryFindByIdSpy).toHaveBeenNthCalledWith(3, input.id);
    });
  });
});
