import { Entity } from '../../entities/entity';
import { InMemoryRepository } from '../in-memory.repository';

type StubEntityProps = {
  name: string;
  price: number;
};

class StubEntity extends Entity<StubEntityProps> {
  get name(): string {
    return this.props.name;
  }

  set name(value: string) {
    this.props.name = value;
  }

  get price(): number {
    return this.props.price;
  }

  set price(value: number) {
    this.props.price = value;
  }

  constructor(data: StubEntityProps, id?: string) {
    super(data, id);
  }
}

class StubInMemoryRepository extends InMemoryRepository<StubEntity> {}

describe('InMemoryRepository unit tests', () => {
  let sut: StubInMemoryRepository;

  beforeEach(() => {
    sut = new StubInMemoryRepository();
  });

  describe('create method', () => {
    it('should create an entity', async () => {
      const entity = new StubEntity({ name: 'Test', price: 100 });

      await sut.create(entity);

      expect(sut['items']).toHaveLength(1);
      expect(sut['items'][0]).toBe(entity);
    });

    it('should create multiple entities', async () => {
      const entity1 = new StubEntity({ name: 'Test 1', price: 100 });
      const entity2 = new StubEntity({ name: 'Test 2', price: 200 });

      await sut.create(entity1);
      await sut.create(entity2);

      expect(sut['items']).toHaveLength(2);
      expect(sut['items']).toContain(entity1);
      expect(sut['items']).toContain(entity2);
    });
  });

  describe('findById method', () => {
    it('should find an entity by id', async () => {
      const entity = new StubEntity({ name: 'Test', price: 100 });
      await sut.create(entity);

      const result = await sut.findById(entity.id);

      expect(result).toBe(entity);
    });

    it('should return undefined when entity is not found', async () => {
      const result = await sut.findById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('findMany method', () => {
    beforeEach(async () => {
      const entities = [
        new StubEntity({ name: 'Product A', price: 100 }),
        new StubEntity({ name: 'Product B', price: 200 }),
        new StubEntity({ name: 'Service A', price: 300 }),
        new StubEntity({ name: 'Service B', price: 400 }),
        new StubEntity({ name: 'Item C', price: 500 }),
      ];

      for (const entity of entities) {
        await sut.create(entity);
      }
    });

    it('should return all entities when no filter is provided', async () => {
      const result = await sut.findMany();

      expect(result.total).toBe(5);
      expect(result.items).toHaveLength(5);
    });

    it('should apply search filter', async () => {
      const result = await sut.findMany({ search: 'Product' });

      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
      expect(result.items.every((item) => item.name.includes('Product'))).toBe(
        true,
      );
    });

    it('should apply pagination', async () => {
      const result = await sut.findMany({ page: 2, perPage: 2 });

      expect(result.total).toBe(5);
      expect(result.items).toHaveLength(2);
    });

    it('should apply search and pagination together', async () => {
      const result = await sut.findMany({
        search: 'Service',
        page: 1,
        perPage: 1,
      });

      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(1);
    });

    it('should return empty result when search finds no matches', async () => {
      const result = await sut.findMany({ search: 'NonExistent' });

      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });

    it('should use default pagination when not provided', async () => {
      const result = await sut.findMany({});

      expect(result.items).toHaveLength(5); // All items since total is less than default perPage (10)
      expect(result.total).toBe(5);
    });
  });

  describe('update method', () => {
    it('should update an existing entity', async () => {
      const entity = new StubEntity({ name: 'Original', price: 100 });
      await sut.create(entity);

      const updatedEntity = new StubEntity(
        { name: 'Updated', price: 200 },
        entity.id,
      );
      await sut.update(updatedEntity);

      const found = await sut.findById(entity.id);
      expect(found).toBe(updatedEntity);
      expect(found?.name).toBe('Updated');
      expect(found?.price).toBe(200);
    });

    it('should not update when entity does not exist', async () => {
      const entity = new StubEntity(
        { name: 'Test', price: 100 },
        'non-existent-id',
      );

      await sut.update(entity);

      expect(sut['items']).toHaveLength(0);
    });

    it('should maintain other entities when updating one', async () => {
      const entity1 = new StubEntity({ name: 'Entity 1', price: 100 });
      const entity2 = new StubEntity({ name: 'Entity 2', price: 200 });
      await sut.create(entity1);
      await sut.create(entity2);

      const updatedEntity1 = new StubEntity(
        { name: 'Updated Entity 1', price: 150 },
        entity1.id,
      );
      await sut.update(updatedEntity1);

      expect(sut['items']).toHaveLength(2);
      const found1 = await sut.findById(entity1.id);
      const found2 = await sut.findById(entity2.id);
      expect(found1?.name).toBe('Updated Entity 1');
      expect(found2?.name).toBe('Entity 2');
    });
  });

  describe('delete method', () => {
    it('should delete an existing entity', async () => {
      const entity = new StubEntity({ name: 'Test', price: 100 });
      await sut.create(entity);

      await sut.delete(entity.id);

      expect(sut['items']).toHaveLength(0);
      const found = await sut.findById(entity.id);
      expect(found).toBeUndefined();
    });

    it('should not affect repository when deleting non-existent entity', async () => {
      const entity = new StubEntity({ name: 'Test', price: 100 });
      await sut.create(entity);

      await sut.delete('non-existent-id');

      expect(sut['items']).toHaveLength(1);
      const found = await sut.findById(entity.id);
      expect(found).toBe(entity);
    });

    it('should delete only the specified entity', async () => {
      const entity1 = new StubEntity({ name: 'Entity 1', price: 100 });
      const entity2 = new StubEntity({ name: 'Entity 2', price: 200 });
      await sut.create(entity1);
      await sut.create(entity2);

      await sut.delete(entity1.id);

      expect(sut['items']).toHaveLength(1);
      const found1 = await sut.findById(entity1.id);
      const found2 = await sut.findById(entity2.id);
      expect(found1).toBeUndefined();
      expect(found2).toBe(entity2);
    });
  });
});
