import { HttpException, HttpStatus } from '@nestjs/common';

export class InternalError extends HttpException {
  constructor(public error: any) {
    super(
      typeof error === 'string' ? error : JSON.stringify(error),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    this.name = 'InternalError';

    if (process.env.NODE_ENV == 'production') {
      console.error('InternalError:', error);
    }
  }
}
