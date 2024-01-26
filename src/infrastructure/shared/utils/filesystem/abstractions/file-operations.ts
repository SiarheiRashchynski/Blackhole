export interface FileOperations {
    read(path: string): Promise<string>;
    write(path: string, data: Buffer): Promise<void>;
    delete(path: string): Promise<void>;
    createDirectory(path: string): Promise<void>;
    readDirectory(path: string): Promise<string[]>;
    deleteDirectory(path: string): Promise<void>;
}
