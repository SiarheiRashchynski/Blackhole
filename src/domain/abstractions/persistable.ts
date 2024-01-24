export interface Persistable {
    toPersistence(): Record<string, unknown>;
}
