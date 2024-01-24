import { inject, injectable } from 'tsyringe';

import { CryptoProvider } from '../../../../domain/abstractions/crypto';
import { Encrypted } from '../../../../domain/abstractions/crypto/types';

import { PrivateDirectoryAccessor as PrivateDirectoryAccessorInterface } from './abstractions/private-directory-accessor';
import { FileOperations } from './file-operations';

@injectable()
export class PrivateDirectoryAccessor implements PrivateDirectoryAccessorInterface {
    public constructor(
        @inject('FileOperations') private readonly _fileOperations: FileOperations,
        @inject('CryptoProvider') private readonly _cryptoProvider: CryptoProvider,
    ) {}

    public async open(name: string, path: string, password: string, salt: string): Promise<void> {
        const securityKey = await this._cryptoProvider.generateSecurityKey(password, salt);

        const files = await this._fileOperations.readDirectory(path);
        const decryptedFiles = await Promise.all(
            files.map(async (file) => {
                const data = Buffer.from(await this._fileOperations.read(`${path}/${file}`)) as Encrypted;
                return this._cryptoProvider.decrypt(data, securityKey);
            }),
        );

        console.log({ name, fileCount: decryptedFiles.length });
    }

    public async create(path: string): Promise<void> {
        await this._fileOperations.createDirectory(path);
    }

    public async delete(path: string): Promise<void> {
        await this._fileOperations.deleteDirectory(path);
    }
}
