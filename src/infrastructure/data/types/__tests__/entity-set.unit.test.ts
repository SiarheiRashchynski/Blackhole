import { Comparable, Persistable } from '../../../../domain/abstractions';
import { EntitySet } from '../entity-set';

class TestEntity implements Persistable, Comparable<TestEntity> {
    public constructor(
        public id: number,
        public name: string,
    ) {}

    isEqualByPrimaryKey(entity: TestEntity): boolean {
        return this.id === entity.id;
    }

    public toPersistence(): Record<string, unknown> {
        return {
            id: this.id,
            name: this.name,
        };
    }
}

describe('EntitySet', () => {
    const entityName = 'entity';
    const data: Record<string, object[]> = {};
    const fromPersistenceMock = jest.fn((data) => new TestEntity(data.id as number, data.name as string));
    let entitySet: EntitySet<TestEntity>;

    beforeEach(() => {
        entitySet = new EntitySet(entityName, data, fromPersistenceMock);
    });

    it('should add a new entity', () => {
        // Arrange
        const newEntity = new TestEntity(1, 'Entity 1');

        // Act
        entitySet.add(newEntity);

        // Assert
        expect(entitySet.toPersistence().entity.length).toBe(1);
        expect(entitySet.toPersistence()).toEqual(
            expect.objectContaining({
                entity: expect.arrayContaining([
                    expect.objectContaining({
                        id: 1,
                        name: 'Entity 1',
                    }),
                ]),
            }),
        );
    });

    it('should throw an error when adding an existing entity', () => {
        // Arrange
        const existingEntity = new TestEntity(1, 'Entity 1');
        entitySet.add(existingEntity);

        // Act & Assert
        expect(() => entitySet.add(existingEntity)).toThrow('Entity already exists');
    });

    it('should update an existing entity', () => {
        // Arrange
        const currentEntity = new TestEntity(1, 'Entity 1');
        const updatedEntity = new TestEntity(1, 'Updated Entity 1');
        entitySet.add(currentEntity);

        // Act
        entitySet.update(currentEntity, updatedEntity);

        // Assert
        expect(entitySet.toPersistence()).toEqual(
            expect.objectContaining({ entity: expect.arrayContaining([updatedEntity]) }),
        );
        expect(entitySet.toPersistence()).not.toEqual(
            expect.objectContaining({ entity: expect.arrayContaining([currentEntity]) }),
        );
    });

    it('should get an existing entity', async () => {
        // Arrange
        const entityToFind = new TestEntity(1, 'Entity 1');
        entitySet.add(entityToFind);

        // Act
        const result = await entitySet.get(entityToFind);

        // Assert
        expect(result).toEqual(entityToFind);
    });

    it('should return undefined when getting a non-existing entity', async () => {
        // Arrange
        const entityToFind = new TestEntity(1, 'Entity 1');

        // Act
        const result = await entitySet.get(entityToFind);

        // Assert
        expect(result).toBeUndefined();
    });

    it('should delete an existing entity', () => {
        // Arrange
        const entityToDelete = new TestEntity(1, 'Entity 1');
        entitySet.add(entityToDelete);

        // Act
        entitySet.delete(entityToDelete);

        // Assert
        expect(entitySet.toPersistence()).not.toContainEqual(entityToDelete);
    });
});
