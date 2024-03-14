import * as crypto from 'crypto';

import { injectable } from 'tsyringe';

import { CipherProvider } from './abstractions';
import { Encrypted } from './types';

@injectable()
export class Aes256CbcCipherProvider implements CipherProvider {
    private readonly _algorithm = 'aes-256-cbc';

    private readonly _encoding: BufferEncoding = 'hex';

    private readonly _ivLength = 16;

    private readonly _keyLength = 32;

    public async encrypt(content: Buffer | string, encryptionKey: string | Buffer): Promise<Encrypted> {
        const iv = this.generateIv();
        const cipher = crypto.createCipheriv(this._algorithm, encryptionKey, iv);
        const cipherText = Buffer.concat([cipher.update(content), cipher.final()]);

        return new Encrypted(cipherText.toString(this._encoding), this._algorithm, iv.toString(this._encoding));
    }

    public async decrypt(
        encrypted: Encrypted,
        encryptionKey: string | Buffer,
        encoding: BufferEncoding = 'utf-8',
    ): Promise<string> {
        const decipher = crypto.createDecipheriv(
            encrypted.algorithm,
            encryptionKey,
            Buffer.from(encrypted.iv, this._encoding),
        );

        const buffer = Buffer.concat([
            decipher.update(Buffer.from(encrypted.content, this._encoding)),
            decipher.final(),
        ]);

        return buffer.toString(encoding);
    }

    public generateSecurityKey(password: string, salt?: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            crypto.scrypt(password, salt || this.generateSalt(), this._keyLength, (err, derivedKey) => {
                if (err) reject(err);
                else resolve(derivedKey);
            });
        });
    }

    public generateSalt(): string {
        return crypto.randomBytes(this._keyLength / 2).toString(this._encoding);
    }

    private generateIv(): Buffer {
        return crypto.randomBytes(this._ivLength);
    }
}
