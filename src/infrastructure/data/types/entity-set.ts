import { Persistable, Comparable } from '../../../domain/abstractions';

export class EntitySet<TEntity extends Persistable & Comparable<TEntity>> implements Persistable {
    private readonly _entities: Record<string, unknown>[];

    private readonly _collectionName: string;

    public constructor(
        entityName: string,
        data: Record<string, object[]>,
        private readonly fromPersistence: (data: Record<string, unknown>) => TEntity = (data) => data as TEntity,
    ) {
        this._collectionName = entityName; // todo: pluralize
        this._entities = (data[this._collectionName] as Record<string, unknown>[]) || [];
    }

    public add(newEntity: TEntity): void {
        if (this._entities.some((entity) => newEntity.isEqualByPrimaryKey(this.fromPersistence(entity)))) {
            throw new Error('Entity already exists');
        }
        this._entities.push(newEntity.toPersistence());
    }

    public update(currentEntity: TEntity, updatedEntity: TEntity): void {
        this.delete(currentEntity);
        this.add(updatedEntity);
    }

    public get(entityToFind: TEntity): Promise<TEntity | undefined> {
        for (const entity of this._entities) {
            const entityInstance = this.fromPersistence(entity);
            if (entityInstance.isEqualByPrimaryKey(entityToFind)) {
                return Promise.resolve(entityInstance);
            }
        }

        return Promise.resolve(undefined);
    }

    public delete(entityToFind: TEntity): void {
        for (let i = 0; i < this._entities.length; i++) {
            const entityInstance = this.fromPersistence(this._entities[i]);
            if (entityInstance.isEqualByPrimaryKey(entityToFind)) {
                this._entities.splice(i, 1);
                return;
            }
        }
    }

    public toPersistence(): Record<string, object[]> {
        return {
            [this._collectionName]: this._entities,
        };
    }
}
