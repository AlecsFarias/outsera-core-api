import { MovieInMemoryRepository } from '../database/in-memory/movies.in-memory.repository';
import { MovieDataBuilder } from '../../domain/testing/helpers/movie-data-builder';
import { MovieEntity } from '../../domain/entities/movie.entity';

describe('MovieInMemoryRepository (Integration)', () => {
  let repository: MovieInMemoryRepository;

  describe('Without initial data', () => {
    beforeEach(() => {
      repository = new MovieInMemoryRepository(false);
    });

    it('should be defined', () => {
      expect(repository).toBeDefined();
    });

    it('should start with empty collection', async () => {
      const result = await repository.findMany();
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should create and retrieve a movie', async () => {
      const movieData = MovieDataBuilder({});
      const movie = new MovieEntity(movieData);

      await repository.create(movie);

      const foundMovie = await repository.findById(movie.id);
      expect(foundMovie).toBeDefined();
      expect(foundMovie!.id).toBe(movie.id);
      expect(foundMovie!.title).toBe(movie.title);
    });

    it('should update a movie', async () => {
      const movieData = MovieDataBuilder({});
      const movie = new MovieEntity(movieData);

      await repository.create(movie);

      movie.title = 'Updated Title';
      await repository.update(movie);

      const updatedMovie = await repository.findById(movie.id);
      expect(updatedMovie).toBeDefined();
      expect(updatedMovie!.title).toBe('Updated Title');
    });

    it('should delete a movie', async () => {
      const movieData = MovieDataBuilder({});
      const movie = new MovieEntity(movieData);

      await repository.create(movie);

      const foundMovie = await repository.findById(movie.id);
      expect(foundMovie).toBeDefined();

      await repository.delete(movie.id);

      const deletedMovie = await repository.findById(movie.id);
      expect(deletedMovie).toBeUndefined();
    });

    it('should list movies with pagination', async () => {
      // Create multiple movies
      const movies = [];
      for (let i = 0; i < 5; i++) {
        const movieData = MovieDataBuilder({ title: `Movie ${i + 1}` });
        const movie = new MovieEntity(movieData);
        movies.push(movie);
        await repository.create(movie);
      }

      // Test pagination
      const page1 = await repository.findMany({ page: 1, perPage: 2 });
      expect(page1.items).toHaveLength(2);
      expect(page1.total).toBe(5);

      const page2 = await repository.findMany({ page: 2, perPage: 2 });
      expect(page2.items).toHaveLength(2);
      expect(page2.total).toBe(5);

      const page3 = await repository.findMany({ page: 3, perPage: 2 });
      expect(page3.items).toHaveLength(1);
      expect(page3.total).toBe(5);
    });

    it('should find winners using repository method', async () => {
      const winnerData = MovieDataBuilder({ winner: true });
      const nonWinnerData = MovieDataBuilder({ winner: false });

      const winner = new MovieEntity(winnerData);
      const nonWinner = new MovieEntity(nonWinnerData);

      await repository.create(winner);
      await repository.create(nonWinner);

      // Test the analytics method that works with winners
      const analytics =
        await repository.getProducersWithMaxAndMinAwardIntervals();
      expect(analytics).toBeDefined();
      expect(analytics.min).toBeDefined();
      expect(analytics.max).toBeDefined();
    });
  });

  describe('With initial data', () => {
    beforeEach(() => {
      repository = new MovieInMemoryRepository(true);
    });

    it('should load initial data from CSV', async () => {
      const result = await repository.findMany();
      expect(result.total).toBeGreaterThan(0);
      expect(result.items.length).toBeGreaterThan(0);
    });

    it('should have movies with all required properties', async () => {
      const result = await repository.findMany({ page: 1, perPage: 1 });
      expect(result.items).toHaveLength(1);

      const movie = result.items[0];
      expect(movie.id).toBeDefined();
      expect(movie.year).toBeDefined();
      expect(movie.title).toBeDefined();
      expect(movie.studios).toBeDefined();
      expect(movie.producers).toBeDefined();
      expect(typeof movie.winner).toBe('boolean');
    });

    it('should work with analytics endpoint from loaded data', async () => {
      const analytics =
        await repository.getProducersWithMaxAndMinAwardIntervals();
      expect(analytics).toBeDefined();
      expect(analytics.min).toBeDefined();
      expect(analytics.max).toBeDefined();
      expect(Array.isArray(analytics.min)).toBe(true);
      expect(Array.isArray(analytics.max)).toBe(true);
    });

    it('should preserve data integrity after operations', async () => {
      const initialCount = await repository.findMany();
      const initialTotal = initialCount.total;

      // Add a new movie
      const movieData = MovieDataBuilder({});
      const movie = new MovieEntity(movieData);
      await repository.create(movie);

      const afterCreate = await repository.findMany();
      expect(afterCreate.total).toBe(initialTotal + 1);

      // Delete the added movie
      await repository.delete(movie.id);

      const afterDelete = await repository.findMany();
      expect(afterDelete.total).toBe(initialTotal);
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      repository = new MovieInMemoryRepository(false);
    });

    it('should return null for non-existent movie', async () => {
      const nonExistentId = 'non-existent-id';
      const result = await repository.findById(nonExistentId);
      expect(result).toBeUndefined();
    });

    it('should not throw error when deleting non-existent movie', async () => {
      const nonExistentId = 'non-existent-id';
      await expect(repository.delete(nonExistentId)).resolves.not.toThrow();
    });
  });
});
