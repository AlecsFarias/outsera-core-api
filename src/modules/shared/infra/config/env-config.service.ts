import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InternalError } from '../../application/errors/internal-erro';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EnvConfigService {
  constructor(private readonly configService: ConfigService) {
    this._validate();
  }

  get port(): number {
    return this.configService.get<number>('PORT', { infer: true });
  }

  private movieListFileExists(): boolean {
    try {
      // Get the path to the movielist.csv file
      const filePath = path.resolve(
        process.cwd(),
        'src',
        'resources',
        'movielist.csv',
      );

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return false;
      }

      // Check if it's a CSV file by extension
      const fileExtension = path.extname(filePath).toLowerCase();
      if (fileExtension !== '.csv') {
        return false;
      }

      // Check if file is readable
      fs.accessSync(filePath, fs.constants.R_OK);

      return true;
    } catch {
      return false;
    }
  }

  private _validate(): void {
    const errors = [];

    if (!this.port) {
      errors.push('PORT is not defined');
    }

    if (!this.movieListFileExists()) {
      errors.push(
        'Movie list CSV file (src/resources/movielist.csv) not found or not accessible',
      );
    }

    if (errors.length > 0) {
      throw new InternalError(
        `Environment validation failed: ${errors.join(', ')}`,
      );
    }
  }
}
