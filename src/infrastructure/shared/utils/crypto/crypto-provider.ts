import { inject, injectable } from 'tsyringe';

import {
    CryptoProvider as CryptoProviderInterface,
    HashProvider,
    CipherProvider,
} from '../../../../domain/abstractions/crypto';
import { Hashed, Encrypted } from '../../../../domain/abstractions/crypto/types';

@injectable()
export class CryptoProvider implements CryptoProviderInterface {
    public constructor(
        @inject('HashProvider') private readonly _hashProvider: HashProvider,
        @inject('CipherProvider') private readonly _cipherProvider: CipherProvider,
    ) {}

    public generateSalt(): string {
        return this._cipherProvider.generateSalt();
    }

    public generateSecurityKey(password: string, salt: string): Promise<string> {
        return this._cipherProvider.generateSecurityKey(password, salt);
    }

    public hash(password: string): Promise<Hashed> {
        return this._hashProvider.hash(password);
    }

    public check(password: string, hashedPassword: string): Promise<boolean> {
        return this._hashProvider.check(password, hashedPassword);
    }

    public encrypt(text: Buffer, securityKey: string): Promise<Encrypted> {
        return this._cipherProvider.encrypt(text, securityKey);
    }

    public decrypt(text: Encrypted, securityKey: string): Promise<Buffer> {
        return this._cipherProvider.decrypt(text, securityKey);
    }
}
