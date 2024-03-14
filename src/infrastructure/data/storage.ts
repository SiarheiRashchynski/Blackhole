import { readFile, writeFile, unlink } from 'fs/promises';

import { injectable } from 'tsyringe';

import { Storage as StorageInterface } from './abstractions/storage';

@injectable()
export class Storage implements StorageInterface {
    public constructor(
        private readonly _path: string,
        private readonly _encoding: BufferEncoding = 'utf-8',
    ) {}

    public async read(): Promise<string> {
        try {
            return (await readFile(this._path)).toString(this._encoding);
        } catch (error) {
            const nodeError = error as NodeJS.ErrnoException;
            if (nodeError.code === 'ENOENT') {
                return '';
            }
            throw error;
        }
    }

    public async write(data: string): Promise<void> {
        return writeFile(this._path, data, { encoding: this._encoding });
    }

    public async delete(): Promise<void> {
        return unlink(this._path);
    }
}
