import { MovieEntity } from 'src/modules/movies/domain/entities/movie.entity';
import {
  MaxAndMinResponse,
  MoviesRepository,
} from 'src/modules/movies/domain/repositories/movies.repository';
import { InMemoryRepository } from 'src/modules/shared/domain/repositories/in-memory.repository';
import {
  FindManyFilter,
  ReturnMany,
} from 'src/modules/shared/domain/repositories/repository-contract';
import * as fs from 'fs';
import * as path from 'path';

export class MovieInMemoryRepository
  extends InMemoryRepository<MovieEntity>
  implements MoviesRepository
{
  constructor(shouldSeed = false) {
    super();

    if (shouldSeed) {
      this._seedMovies();
    }
  }

  async findMany(filter?: FindManyFilter): Promise<ReturnMany<MovieEntity>> {
    const { search, page = 1, perPage = 10 } = filter || {};
    let filteredItems = this.items;

    if (search) {
      filteredItems = filteredItems.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    const total = filteredItems.length;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    return {
      items: filteredItems.slice(startIndex, endIndex),
      total,
    };
  }

  async getProducersWithMaxAndMinAwardIntervals(): Promise<MaxAndMinResponse> {
    // Get only winning movies
    const winningMovies = this.items.filter((movie) => movie.winner);

    // Create a map to track all wins for each producer
    const producerWins = new Map<string, number[]>();

    // Collect all wins for each producer
    for (const movie of winningMovies) {
      for (const producer of movie.producers) {
        const cleanProducer = producer.trim();
        if (!producerWins.has(cleanProducer)) {
          producerWins.set(cleanProducer, []);
        }
        producerWins.get(cleanProducer)!.push(movie.year);
      }
    }

    // Calculate intervals for producers with multiple wins
    const producerIntervals: Array<{
      producer: string;
      interval: number;
      previousWin: number;
      followingWin: number;
    }> = [];

    for (const [producer, years] of producerWins.entries()) {
      if (years.length >= 2) {
        // Sort years to ensure correct order
        const sortedYears = years.sort((a, b) => a - b);

        // Calculate all consecutive intervals
        for (let i = 0; i < sortedYears.length - 1; i++) {
          const previousWin = sortedYears[i];
          const followingWin = sortedYears[i + 1];
          const interval = followingWin - previousWin;

          producerIntervals.push({
            producer,
            interval,
            previousWin,
            followingWin,
          });
        }
      }
    }

    // If no intervals found, return empty arrays
    if (producerIntervals.length === 0) {
      return {
        min: [],
        max: [],
      };
    }

    // Find min and max intervals
    const minInterval = Math.min(...producerIntervals.map((p) => p.interval));
    const maxInterval = Math.max(...producerIntervals.map((p) => p.interval));

    // Get all producers with min interval
    const minProducers = producerIntervals.filter(
      (p) => p.interval === minInterval,
    );

    // Get all producers with max interval
    const maxProducers = producerIntervals.filter(
      (p) => p.interval === maxInterval,
    );

    return {
      min: minProducers,
      max: maxProducers,
    };
  }

  _seedMovies() {
    try {
      // Get the path to the CSV file
      const csvPath = path.resolve(
        process.cwd(),
        'src',
        'resources',
        'movielist.csv',
      );

      // Read the CSV file
      const csvContent = fs.readFileSync(csvPath, 'utf-8');

      // Split into lines and remove the header
      const lines = csvContent.trim().split('\n');
      const dataLines = lines.slice(1); // Skip header

      // Process each line
      for (const line of dataLines) {
        const [year, title, studios, producers, winner] = line.split(';');

        // Skip invalid lines
        if (!year || !title || !studios || !producers) {
          continue;
        }

        // Parse data
        const movieData = {
          year: parseInt(year.trim(), 10),
          title: title.trim(),
          studios: studios
            .trim()
            .split(',')
            .map((s) => s.trim()),
          producers: producers
            .trim()
            .split(',')
            .map((p) => p.trim()),
          winner: winner ? winner.trim().toLowerCase() === 'yes' : false,
        };

        // Create and add movie entity
        const movie = new MovieEntity(movieData);
        this.items.push(movie);
      }
    } catch (error) {
      console.error('Error seeding movies from CSV:', error);
      // Don't throw error to prevent application from crashing
      // The application should still work with an empty dataset
    }
  }
}
