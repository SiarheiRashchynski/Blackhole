import { readFile, writeFile, unlink, readdir, mkdir, rm } from 'fs/promises';

import { FileOperations as FileOperationsInterface } from './abstractions';

export class FileOperations implements FileOperationsInterface {
    public async createDirectory(path: string): Promise<void> {
        await mkdir(path, { recursive: true });
    }

    public async deleteDirectory(path: string): Promise<void> {
        await rm(path, { recursive: true });
    }

    public async readDirectory(path: string): Promise<string[]> {
        return await readdir(path);
    }

    public async read(path: string): Promise<Buffer> {
        return await readFile(path);
    }

    public async write(path: string, data: string): Promise<void> {
        return writeFile(path, data);
    }

    public async delete(path: string): Promise<void> {
        return unlink(path);
    }
}
