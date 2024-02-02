import { EntityService, Persistable } from '../abstractions';

export class EntitySet<TEntity> implements Persistable<string, object[]> {
    private readonly _entities: TEntity[] = [];

    private readonly _collectionName: string;

    public constructor(
        data: Record<string, object[]>,
        public readonly entityService: EntityService<TEntity>,
    ) {
        this._collectionName = this.entityService.entityName;
        this._entities =
            (data[this._collectionName] as Record<string, unknown>[])?.map((i) =>
                this.entityService.factory.fromPersistence(i),
            ) || [];
    }

    public async add(newEntity: TEntity): Promise<void> {
        if (this._entities.some((entity) => this.entityService.comparator.areEqual(entity, newEntity))) {
            throw new Error('Entity already exists');
        }
        this._entities.push(newEntity);
    }

    public async update(currentEntity: TEntity, updatedEntity: TEntity): Promise<void> {
        this.delete(currentEntity);
        await this.add(updatedEntity);
    }

    public async get(entityToFind: TEntity): Promise<TEntity | undefined> {
        for (const entity of this._entities) {
            if (this.entityService.comparator.areEqual(entity, entityToFind)) {
                return entity;
            }
        }

        return Promise.resolve(undefined);
    }

    public delete(entityToFind: TEntity): void {
        for (let i = 0; i < this._entities.length; i++) {
            if (this.entityService.comparator.areEqual(this._entities[i], entityToFind)) {
                this._entities.splice(i, 1);
                return;
            }
        }
    }

    public toPersistence(): Record<string, object[]> {
        return {
            [this._collectionName]: this._entities.map((i) => this.entityService.factory.toPersistence(i)),
        };
    }
}
