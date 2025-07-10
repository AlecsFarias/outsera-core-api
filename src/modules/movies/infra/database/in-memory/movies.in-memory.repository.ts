import { MovieEntity } from 'src/modules/movies/domain/entities/movie.entity';
import {
  MaxAndMinResponse,
  MoviesRepository,
  ProducerData,
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

    if (winningMovies.length === 0) {
      return {
        min: [],
        max: [],
      };
    }

    const buildProducerData = winningMovies.reduce((map, currMovie) => {
      currMovie.producers.forEach((producer) => {
        const cleanProducer = producer.trim();
        let existingProducer = map.get(cleanProducer);

        if (!existingProducer) {
          existingProducer = new Set<number>();

          map.set(cleanProducer, existingProducer);
        }

        map.set(cleanProducer, existingProducer.add(currMovie.year));
      });

      return map;
    }, new Map<string, Set<number>>());

    let min: ProducerData[] = [];
    let max: ProducerData[] = [];

    buildProducerData.forEach((years, producer) => {
      const sortedYears = Array.from(years).sort((a, b) => a - b);

      if (sortedYears.length < 2) {
        return;
      }

      sortedYears.forEach((_, index, yearsArray) => {
        if (index === 0) {
          //skip first year
          return;
        }

        const dif = yearsArray[index] - yearsArray[index - 1];

        const data = {
          producer,
          interval: dif,
          previousWin: yearsArray[index - 1],
          followingWin: yearsArray[index],
        };

        //min check
        if (min.length === 0 || dif < min[0].interval) {
          min = [data];
        } else if (dif === min[0].interval) {
          min.push(data);
        }

        //max check
        if (max.length === 0 || dif > max[0].interval) {
          max = [data];
        } else if (dif === max[0].interval) {
          max.push(data);
        }
      });
    });

    return {
      min,
      max,
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

        const producersList = producers
          .trim()
          .split(',')
          .map((p) => p.split(' and '))
          .flat()
          .filter(Boolean)
          .map((p) => p.trim());

        // Parse data
        const movieData = {
          year: parseInt(year.trim(), 10),
          title: title.trim(),
          studios: studios
            .trim()
            .split(',')
            .map((s) => s.trim()),
          producers: producersList,
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
