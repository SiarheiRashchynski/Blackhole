export interface EntityFactory<TModel> {
    create(...args: unknown[]): Promise<TModel>;
    fromPersistence(data: Record<string, unknown>): TModel;
    toPersistence(entity: TModel): Record<string, unknown>;
}
