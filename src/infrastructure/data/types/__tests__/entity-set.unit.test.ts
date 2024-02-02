import { EntityComparator, EntityFactory, EntityService } from '../../abstractions';
import { EntitySet } from '../entity-set';

class TestEntity {
    public constructor(
        public id: number,
        public name: string,
    ) {}
}

class EntityComparatorMock implements EntityComparator<TestEntity> {
    public areEqual(entity1: TestEntity, entity2: TestEntity): boolean {
        return entity1.id === entity2.id;
    }
}

class EntityFactoryMock implements EntityFactory<TestEntity> {
    public create(entity: TestEntity): Promise<TestEntity> {
        return Promise.resolve(entity);
    }

    public fromPersistence(data: Record<string, unknown>): TestEntity {
        return new TestEntity(data.id as number, data.name as string);
    }

    public toPersistence(entity: TestEntity): Record<string, unknown> {
        return { id: entity.id, name: entity.name };
    }
}

class EntityServiceMock implements EntityService<TestEntity> {
    entityName: string = 'entity';

    factory: EntityFactory<TestEntity> = new EntityFactoryMock();

    comparator: EntityComparator<TestEntity> = new EntityComparatorMock();
}

describe('EntitySet', () => {
    let data: Record<string, object[]> = {};
    let entitySet: EntitySet<TestEntity>;
    let entityServiceMock: jest.Mocked<EntityService<TestEntity>>;

    beforeEach(() => {
        data = {};
        entityServiceMock = new EntityServiceMock();
        entitySet = new EntitySet(data, entityServiceMock);
    });

    it('should add a new entity', async () => {
        // Arrange
        const newEntity = new TestEntity(1, 'Entity 1');

        // Act
        await entitySet.add(newEntity);

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

    it('should throw an error when adding an existing entity', async () => {
        // Arrange
        const existingEntity = new TestEntity(1, 'Entity 1');
        await entitySet.add(existingEntity);

        // Act & Assert
        await expect(() => entitySet.add(existingEntity)).rejects.toThrow('Entity already exists');
    });

    it('should update an existing entity', async () => {
        // Arrange
        const currentEntity = new TestEntity(1, 'Entity 1');
        const updatedEntity = new TestEntity(1, 'Updated Entity 1');
        await entitySet.add(currentEntity);

        // Act
        await entitySet.update(currentEntity, updatedEntity);

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
        await entitySet.add(entityToFind);

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

    it('should delete an existing entity', async () => {
        // Arrange
        const entityToDelete = new TestEntity(1, 'Entity 1');
        await entitySet.add(entityToDelete);

        // Act
        entitySet.delete(entityToDelete);

        // Assert
        expect(entitySet.toPersistence()).not.toContainEqual(entityToDelete);
    });
});
