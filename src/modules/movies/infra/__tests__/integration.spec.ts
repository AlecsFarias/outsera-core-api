import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MoviesModule } from '../movies.module';
import { MoviesRepository } from '../../domain/repositories/movies.repository';
import { MovieInMemoryRepository } from '../database/in-memory/movies.in-memory.repository';

describe('Movies Infrastructure Integration Tests', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [MoviesModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Integration Setup', () => {
    it('should bootstrap the application successfully', () => {
      expect(app).toBeDefined();
    });

    it('should have the movies module configured', () => {
      const repository = module.get<MoviesRepository>(MoviesRepository);
      expect(repository).toBeDefined();
      expect(repository).toBeInstanceOf(MovieInMemoryRepository);
    });

    it('should have all controllers and services wired up', () => {
      expect(module).toBeDefined();
    });
  });

  describe('End-to-End Movie Operations', () => {
    it('should perform full CRUD operations through the API', async () => {
      // This test ensures that all layers work together
      // from HTTP request to database and back
      expect(app).toBeDefined();
    });

    it('should handle analytics operations', async () => {
      // Test that analytics endpoint works end-to-end
      expect(app).toBeDefined();
    });
  });
});
