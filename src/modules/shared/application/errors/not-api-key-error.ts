import { HttpException, HttpStatus } from '@nestjs/common';

export class NoApiKeyError extends HttpException {
  constructor() {
    super('No api-key provided', HttpStatus.UNAUTHORIZED);
    this.name = 'NoApiKeyError';
  }
}
