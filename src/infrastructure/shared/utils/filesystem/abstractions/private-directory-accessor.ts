export interface PrivateDirectoryAccessor {
    open(name: string, path: string, password: string, salt: string): Promise<void>;
    create(path: string): Promise<void>;
    delete(path: string): Promise<void>;
}
