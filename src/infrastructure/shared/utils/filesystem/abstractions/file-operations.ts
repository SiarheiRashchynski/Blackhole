export interface FileOperations {
    read(path: string): Promise<Buffer>;
    write(path: string, data: string): Promise<void>;
    delete(path: string): Promise<void>;
    createDirectory(path: string): Promise<void>;
    readDirectory(path: string): Promise<string[]>;
    deleteDirectory(path: string): Promise<void>;
}
