import { HttpException, HttpStatus } from '@nestjs/common';

export class NotFoundError extends HttpException {
  constructor(public error: string) {
    super(error, HttpStatus.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}
