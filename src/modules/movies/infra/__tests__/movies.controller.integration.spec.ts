import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MoviesModule } from '../movies.module';
import { CreateMovieInput } from '../dtos/input/create-movie.input';
import { UpdateMovieInput } from '../dtos/input/update-movie.input';
import { MovieDataBuilder } from '../../domain/testing/helpers/movie-data-builder';

describe('MoviesController (Integration)', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [MoviesModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /movies', () => {
    it('should create a movie successfully', async () => {
      const movieData = MovieDataBuilder({});
      const createMovieInput: CreateMovieInput = {
        year: movieData.year,
        title: movieData.title,
        studios: movieData.studios,
        producers: movieData.producers,
        winner: movieData.winner,
      };

      const response = await request(app.getHttpServer())
        .post('/movies')
        .send(createMovieInput)
        .expect(201);

      expect(response.body).toHaveProperty('movie');
      expect(response.body.movie).toHaveProperty('id');
      expect(response.body.movie.title).toBe(createMovieInput.title);
      expect(response.body.movie.year).toBe(createMovieInput.year);
      expect(response.body.movie.studios).toStrictEqual(
        createMovieInput.studios,
      );
      expect(response.body.movie.producers).toStrictEqual(
        createMovieInput.producers,
      );
      expect(response.body.movie.winner).toBe(createMovieInput.winner);
    });

    it('should return 400 when creating movie with invalid data', async () => {
      const invalidMovieData = {
        year: 'invalid-year',
        title: '',
        studios: '',
        producers: '',
        winner: 'invalid-boolean',
      };

      await request(app.getHttpServer())
        .post('/movies')
        .send(invalidMovieData)
        .expect(400);
    });
  });

  describe('GET /movies', () => {
    it('should list movies successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(typeof response.body.total).toBe('number');
    });

    it('should list movies with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies?page=1&perPage=5')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /movies/:id', () => {
    let createdMovieId: string;

    beforeEach(async () => {
      const movieData = MovieDataBuilder({});
      const createMovieInput: CreateMovieInput = {
        year: movieData.year,
        title: movieData.title,
        studios: movieData.studios,
        producers: movieData.producers,
        winner: movieData.winner,
      };

      const response = await request(app.getHttpServer())
        .post('/movies')
        .send(createMovieInput);

      createdMovieId = response.body.movie.id;
    });

    it('should get a movie by ID successfully', async () => {
      const response = await request(app.getHttpServer())
        .get(`/movies/${createdMovieId}`)
        .expect(200);

      expect(response.body).toHaveProperty('movie');
      expect(response.body.movie.id).toBe(createdMovieId);
    });

    it('should return 404 when movie not found', async () => {
      const nonExistentId = 'non-existent-id';

      await request(app.getHttpServer())
        .get(`/movies/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('PUT /movies/:id', () => {
    let createdMovieId: string;

    beforeEach(async () => {
      const movieData = MovieDataBuilder({});
      const createMovieInput: CreateMovieInput = {
        year: movieData.year,
        title: movieData.title,
        studios: movieData.studios,
        producers: movieData.producers,
        winner: movieData.winner,
      };

      const response = await request(app.getHttpServer())
        .post('/movies')
        .send(createMovieInput);

      createdMovieId = response.body.movie.id;
    });

    it('should update a movie successfully', async () => {
      const updateMovieInput: UpdateMovieInput = {
        title: 'Updated Movie Title',
        year: 2023,
        winner: true,
      };

      const response = await request(app.getHttpServer())
        .put(`/movies/${createdMovieId}`)
        .send(updateMovieInput)
        .expect(200);

      expect(response.body).toHaveProperty('movie');
      expect(response.body.movie.id).toBe(createdMovieId);
      expect(response.body.movie.title).toBe(updateMovieInput.title);
      expect(response.body.movie.year).toBe(updateMovieInput.year);
      expect(response.body.movie.winner).toBe(updateMovieInput.winner);
    });

    it('should return 404 when updating non-existent movie', async () => {
      const nonExistentId = 'non-existent-id';
      const updateMovieInput: UpdateMovieInput = {
        title: 'Updated Movie Title',
      };

      await request(app.getHttpServer())
        .put(`/movies/${nonExistentId}`)
        .send(updateMovieInput)
        .expect(404);
    });
  });

  describe('DELETE /movies/:id', () => {
    let createdMovieId: string;

    beforeEach(async () => {
      const movieData = MovieDataBuilder({});
      const createMovieInput: CreateMovieInput = {
        year: movieData.year,
        title: movieData.title,
        studios: movieData.studios,
        producers: movieData.producers,
        winner: movieData.winner,
      };

      const response = await request(app.getHttpServer())
        .post('/movies')
        .send(createMovieInput);

      createdMovieId = response.body.movie.id;
    });

    it('should delete a movie successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/movies/${createdMovieId}`)
        .expect(200);

      // Verify movie is deleted
      await request(app.getHttpServer())
        .get(`/movies/${createdMovieId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent movie', async () => {
      const nonExistentId = 'non-existent-id';

      await request(app.getHttpServer())
        .delete(`/movies/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('GET /movies/analytics/producers-award-intervals', () => {
    beforeEach(async () => {
      // Create some test movies with winners to test the analytics endpoint
      const movies = [
        {
          year: 1980,
          title: 'Movie 1',
          studios: 'Studio A',
          producers: 'Producer A',
          winner: true,
        },
        {
          year: 1985,
          title: 'Movie 2',
          studios: 'Studio B',
          producers: 'Producer A',
          winner: true,
        },
        {
          year: 1990,
          title: 'Movie 3',
          studios: 'Studio C',
          producers: 'Producer B',
          winner: true,
        },
        {
          year: 1995,
          title: 'Movie 4',
          studios: 'Studio D',
          producers: 'Producer B',
          winner: true,
        },
      ];

      for (const movie of movies) {
        await request(app.getHttpServer()).post('/movies').send(movie);
      }
    });

    it('should get producers award intervals successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies/analytics/producers-award-intervals')
        .expect(200);

      expect(response.body).toHaveProperty('min');
      expect(response.body).toHaveProperty('max');
      expect(Array.isArray(response.body.min)).toBe(true);
      expect(Array.isArray(response.body.max)).toBe(true);

      // Check structure of interval objects
      if (response.body.min.length > 0) {
        expect(response.body.min[0]).toHaveProperty('producer');
        expect(response.body.min[0]).toHaveProperty('interval');
        expect(response.body.min[0]).toHaveProperty('previousWin');
        expect(response.body.min[0]).toHaveProperty('followingWin');
      }

      if (response.body.max.length > 0) {
        expect(response.body.max[0]).toHaveProperty('producer');
        expect(response.body.max[0]).toHaveProperty('interval');
        expect(response.body.max[0]).toHaveProperty('previousWin');
        expect(response.body.max[0]).toHaveProperty('followingWin');
      }
    });
  });
});
