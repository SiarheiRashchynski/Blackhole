export interface EntityComparator<TModel> {
    areEqual(entity1: TModel, entity2: TModel): boolean;
}
