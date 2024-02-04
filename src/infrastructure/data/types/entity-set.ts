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

    public async update(predicate: (entity: TEntity) => boolean, updatedEntity: TEntity): Promise<void> {
        this.delete(predicate);
        await this.add(updatedEntity);
    }

    public get(predicate: (entity: TEntity) => boolean): TEntity | undefined {
        return this._entities.find(predicate);
    }

    public delete(predicate: (entity: TEntity) => boolean): void {
        for (let i = 0; i < this._entities.length; i++) {
            if (predicate(this._entities[i])) {
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
