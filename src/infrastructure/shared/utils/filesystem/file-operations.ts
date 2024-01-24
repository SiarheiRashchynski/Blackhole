import { readFile, writeFile, unlink, readdir, mkdir, rmdir } from 'fs/promises';

import { FileOperations as FileOperationsInterface } from './abstractions';

export class FileOperations implements FileOperationsInterface {
    public async createDirectory(path: string): Promise<void> {
        await mkdir(path);
    }

    public async deleteDirectory(path: string): Promise<void> {
        await rmdir(path, { recursive: true });
    }

    public async readDirectory(path: string): Promise<string[]> {
        return await readdir(path);
    }

    public async read(path: string): Promise<string> {
        return await readFile(path, 'utf8');
    }

    public async write(path: string, data: Buffer): Promise<void> {
        return writeFile(path, data, 'utf8');
    }

    public async delete(path: string): Promise<void> {
        return unlink(path);
    }
}
