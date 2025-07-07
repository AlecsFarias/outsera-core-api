import { v4 as uuid } from 'uuid';

export class Entity<T = any> {
  private _id: string;
  protected props: T;

  constructor(data: T, id?: string) {
    this._id = id ?? uuid();
    this.props = data;
  }

  get id(): string {
    return this._id;
  }

  toObject(): T & { id: string } {
    return {
      ...this.props,
      id: this._id,
    };
  }
}
