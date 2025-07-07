import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidApiKey extends HttpException {
  constructor() {
    super('Ivalid api-key provided', HttpStatus.UNAUTHORIZED);
    this.name = 'InvalidApiKey';
  }
}
