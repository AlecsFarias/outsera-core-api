import { Test, TestingModule } from '@nestjs/testing';
import { MoviesModule } from '../movies.module';
import { MoviesController } from '../controllers/movies.controller';
import { MovieFacade } from '../facades/movie.facade';
import { MoviesRepository } from '../../domain/repositories/movies.repository';
import { MovieInMemoryRepository } from '../database/in-memory/movies.in-memory.repository';

describe('MoviesModule (Integration)', () => {
  let module: TestingModule;
  let controller: MoviesController;
  let facade: MovieFacade;
  let repository: MoviesRepository;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [MoviesModule],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    facade = module.get<MovieFacade>(MovieFacade);
    repository = module.get<MoviesRepository>(MoviesRepository);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('Module Configuration', () => {
    it('should be defined', () => {
      expect(module).toBeDefined();
    });

    it('should have MoviesController', () => {
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(MoviesController);
    });

    it('should have MovieFacade', () => {
      expect(facade).toBeDefined();
      expect(facade).toBeInstanceOf(MovieFacade);
    });

    it('should have MoviesRepository', () => {
      expect(repository).toBeDefined();
      expect(repository).toBeInstanceOf(MovieInMemoryRepository);
    });
  });

  describe('Dependency Injection', () => {
    it('should inject MovieFacade into MoviesController', () => {
      expect(controller).toBeDefined();
      expect(facade).toBeDefined();
      // The controller should have the facade injected
      expect(controller['movieFacade']).toBeDefined();
    });

    it('should inject MoviesRepository with in-memory implementation', () => {
      expect(repository).toBeDefined();
      expect(repository).toBeInstanceOf(MovieInMemoryRepository);
    });
  });

  describe('Use Cases Integration', () => {
    it('should have all use cases available in facade', () => {
      expect(facade.createMovie).toBeDefined();
      expect(facade.getMovieById).toBeDefined();
      expect(facade.listMovies).toBeDefined();
      expect(facade.updateMovie).toBeDefined();
      expect(facade.deleteMovie).toBeDefined();
      expect(facade.getProducersAwardIntervals).toBeDefined();
    });
  });

  describe('Repository Integration', () => {
    it('should use in-memory repository with initial data loaded', () => {
      expect(repository).toBeInstanceOf(MovieInMemoryRepository);
      // The in-memory repository should be initialized with data
      const memoryRepo = repository as MovieInMemoryRepository;
      expect(memoryRepo['items']).toBeDefined();
    });
  });
});
