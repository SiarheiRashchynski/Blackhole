import { inject, injectable } from 'tsyringe';

import { CryptoProvider } from '../../../../domain/abstractions/crypto';
import { Encrypted } from '../../../../domain/abstractions/crypto/types';
import { Blackhole } from '../../../../domain/models';

import { BlackholeAccessor as BlackholeAccessorInterface } from './abstractions/blackhole-accessor';
import { FileOperations } from './abstractions/file-operations';

@injectable()
export class BlackholeAccessor implements BlackholeAccessorInterface {
    public constructor(
        @inject('FileOperations') private readonly _fileOperations: FileOperations,
        @inject('CryptoProvider') private readonly _cryptoProvider: CryptoProvider,
    ) {}

    public async open(blackhole: Blackhole, password: string): Promise<void> {
        const path = (await this._cryptoProvider.decrypt(blackhole.path, password)).toString();

        const files = await this._fileOperations.readDirectory(path);
        const decryptedFiles = await Promise.all(
            files.map(async (file) => {
                const content = (await this._fileOperations.read(`${path}/${file}`)).toString() as Encrypted;
                return this._cryptoProvider.decrypt(content, password);
            }),
        );

        console.log({ name: blackhole.name, fileCount: decryptedFiles.length });
    }

    public async map(blackhole: Blackhole, password: string): Promise<void> {
        const path = (await this._cryptoProvider.decrypt(blackhole.path, password)).toString();
        await this._fileOperations.createDirectory(path);
    }

    public async delete(blackhole: Blackhole, password: string): Promise<void> {
        const path = (await this._cryptoProvider.decrypt(blackhole.path, password)).toString();
        await this._fileOperations.deleteDirectory(path);
    }
}
