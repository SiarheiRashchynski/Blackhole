export interface Comparable<T> {
    isEqualByPrimaryKey(entity: T): boolean;
}
