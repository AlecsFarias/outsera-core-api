import { FieldsErrors } from '../../domain/validator/validator-fields.interface';

export class EntityValidationError extends Error {
  constructor(public errors: FieldsErrors) {
    super(JSON.stringify(errors));
    this.name = 'EntityValidationError';
  }
}
