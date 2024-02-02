import { EntityComparator } from './entity-comparator';
import { EntityFactory } from './entity-factory';

export interface EntityService<TModel> {
    entityName: string;
    factory: EntityFactory<TModel>;
    comparator: EntityComparator<TModel>;
}
