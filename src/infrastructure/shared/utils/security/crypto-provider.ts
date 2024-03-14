import { inject, injectable } from 'tsyringe';

import { CryptoProvider as CryptoProviderInterface, HashProvider, CipherProvider } from './abstractions';
import { Hashed, Encrypted } from './types';

@injectable()
export class CryptoProvider implements CryptoProviderInterface {
    public constructor(
        @inject('HashProvider') private readonly _hashProvider: HashProvider,
        @inject('CipherProvider') private readonly _cipherProvider: CipherProvider,
    ) {}

    public hash(password: string): Promise<Hashed> {
        return this._hashProvider.hash(password);
    }

    public check(password: string, hashedPassword: string): Promise<boolean> {
        return this._hashProvider.check(password, hashedPassword);
    }

    public encrypt(content: Buffer | string, encryptionKey: string | Buffer): Promise<Encrypted> {
        return this._cipherProvider.encrypt(content, encryptionKey);
    }

    public decrypt(
        content: Encrypted,
        encryptionKey: string | Buffer,
        encoding: BufferEncoding = 'utf-8',
    ): Promise<string> {
        return this._cipherProvider.decrypt(content, encryptionKey, encoding);
    }

    public generateSecurityKey(password: string, salt?: string): Promise<[Buffer, string]> {
        return this._cipherProvider.generateSecurityKey(password, salt);
    }

    public generateSalt(): string {
        return this._cipherProvider.generateSalt();
    }
}
