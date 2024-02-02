export interface Persistable<TKey extends string | number | symbol, TValue> {
    toPersistence(): Record<TKey, TValue>;
}
