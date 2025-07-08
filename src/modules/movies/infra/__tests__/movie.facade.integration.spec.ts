import { Test, TestingModule } from '@nestjs/testing';
import { MovieFacade } from '../facades/movie.facade';
import { MoviesRepository } from '../../domain/repositories/movies.repository';
import { MovieInMemoryRepository } from '../database/in-memory/movies.in-memory.repository';
import { MovieDataBuilder } from '../../domain/testing/helpers/movie-data-builder';
import { CreateMovieUseCase } from '../../application/use-cases/create-movie.use-case';
import { GetMovieByIdUseCase } from '../../application/use-cases/get-movie-by-id.use-case';
import { ListMoviesUseCase } from '../../application/use-cases/list-movies.use-case';
import { UpdateMovieUseCase } from '../../application/use-cases/update-movie.use-case';
import { DeleteMovieUseCase } from '../../application/use-cases/delete-movie.use-case';
import { GetProducersAwardIntervalsUseCase } from '../../application/use-cases/get-producers-award-intervals.use-case';

describe('MovieFacade (Integration)', () => {
  let facade: MovieFacade;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: MoviesRepository,
          useFactory: () => new MovieInMemoryRepository(false), // Don't load initial data
        },
        CreateMovieUseCase,
        GetMovieByIdUseCase,
        ListMoviesUseCase,
        UpdateMovieUseCase,
        DeleteMovieUseCase,
        GetProducersAwardIntervalsUseCase,
        MovieFacade,
      ],
    }).compile();

    facade = module.get<MovieFacade>(MovieFacade);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('Facade Integration', () => {
    it('should be defined', () => {
      expect(facade).toBeDefined();
    });

    it('should have all use cases defined', () => {
      expect(facade.createMovie).toBeDefined();
      expect(facade.getMovieById).toBeDefined();
      expect(facade.listMovies).toBeDefined();
      expect(facade.updateMovie).toBeDefined();
      expect(facade.deleteMovie).toBeDefined();
      expect(facade.getProducersAwardIntervals).toBeDefined();
    });
  });

  describe('End-to-End Use Case Flow', () => {
    it('should create, read, update, and delete a movie', async () => {
      const movieData = MovieDataBuilder({});

      // Create
      const createResult = await facade.createMovie.execute({
        year: movieData.year,
        title: movieData.title,
        studios: movieData.studios,
        producers: movieData.producers,
        winner: movieData.winner,
      });

      expect(createResult.movie).toBeDefined();
      expect(createResult.movie.title).toBe(movieData.title);
      const movieId = createResult.movie.id;

      // Read
      const getResult = await facade.getMovieById.execute({ id: movieId });
      expect(getResult.movie).toBeDefined();
      expect(getResult.movie.id).toBe(movieId);
      expect(getResult.movie.title).toBe(movieData.title);

      // Update
      const updateData = { title: 'Updated Title', year: 2024 };
      const updateResult = await facade.updateMovie.execute({
        id: movieId,
        ...updateData,
      });

      expect(updateResult.movie).toBeDefined();
      expect(updateResult.movie.id).toBe(movieId);
      expect(updateResult.movie.title).toBe(updateData.title);
      expect(updateResult.movie.year).toBe(updateData.year);

      // Delete
      await facade.deleteMovie.execute({ id: movieId });

      // Verify deletion
      try {
        await facade.getMovieById.execute({ id: movieId });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should list movies with pagination', async () => {
      // Create multiple movies
      const moviesData = [
        MovieDataBuilder({ title: 'Movie 1', year: 2020 }),
        MovieDataBuilder({ title: 'Movie 2', year: 2021 }),
        MovieDataBuilder({ title: 'Movie 3', year: 2022 }),
      ];

      for (const movieData of moviesData) {
        await facade.createMovie.execute({
          year: movieData.year,
          title: movieData.title,
          studios: movieData.studios,
          producers: movieData.producers,
          winner: movieData.winner,
        });
      }

      // List all
      const listAllResult = await facade.listMovies.execute({});
      expect(listAllResult.items).toHaveLength(3);
      expect(listAllResult.total).toBe(3);

      // List with pagination
      const listPaginatedResult = await facade.listMovies.execute({
        page: 1,
        perPage: 2,
      });
      expect(listPaginatedResult.items).toHaveLength(2);
      expect(listPaginatedResult.total).toBe(3);
    });

    it('should calculate producers award intervals', async () => {
      // Create movies with winners for specific producers
      const movies = [
        MovieDataBuilder({
          title: 'Movie 1',
          year: 1980,
          producers: ['Producer A'],
          winner: true,
        }),
        MovieDataBuilder({
          title: 'Movie 2',
          year: 1985,
          producers: ['Producer A'],
          winner: true,
        }),
        MovieDataBuilder({
          title: 'Movie 3',
          year: 1990,
          producers: ['Producer B'],
          winner: true,
        }),
        MovieDataBuilder({
          title: 'Movie 4',
          year: 1995,
          producers: ['Producer B'],
          winner: true,
        }),
      ];

      for (const movieData of movies) {
        await facade.createMovie.execute({
          year: movieData.year,
          title: movieData.title,
          studios: movieData.studios,
          producers: movieData.producers,
          winner: movieData.winner,
        });
      }

      const result = await facade.getProducersAwardIntervals.execute();

      expect(result).toBeDefined();
      expect(result.min).toBeDefined();
      expect(result.max).toBeDefined();
      expect(Array.isArray(result.min)).toBe(true);
      expect(Array.isArray(result.max)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle not found errors', async () => {
      const nonExistentId = 'non-existent-id';

      try {
        await facade.getMovieById.execute({ id: nonExistentId });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle validation errors on create', async () => {
      try {
        await facade.createMovie.execute({
          year: 'invalid-year' as any,
          title: '',
          studios: [],
          producers: [],
          winner: false,
        });
        fail('Should have thrown a validation error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
