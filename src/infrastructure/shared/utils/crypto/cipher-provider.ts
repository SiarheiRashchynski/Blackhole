import * as crypto from 'crypto';

import { injectable } from 'tsyringe';

import { CipherProvider as CipherProviderInterface } from '../../../../domain/abstractions/crypto';
import { Encrypted } from '../../../../domain/abstractions/crypto/types';

@injectable()
export class CipherProvider implements CipherProviderInterface {
    public async encrypt(content: Buffer | string, password: string): Promise<Encrypted> {
        const iv = crypto.randomBytes(16);
        const salt = crypto.randomBytes(16).toString('hex');
        const securityKey = (await this.generateSecurityKey(password, salt)).toString();
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(securityKey!, 'hex'), iv);
        const cipherText = Buffer.concat([cipher.update(content), cipher.final()]);
        return Buffer.from(`${salt}$${iv.toString('hex')}$${cipherText.toString('hex')}`).toString(
            'base64',
        ) as Encrypted;
    }

    public async decrypt(encrypted: Encrypted, password: string): Promise<Buffer> {
        const [salt, iv, content] = this.parseEncrypted(encrypted);
        const securityKey = (await this.generateSecurityKey(password, salt)).toString();
        const decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            Buffer.from(securityKey, 'hex'),
            Buffer.from(iv, 'hex'),
        );
        const plainText = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]);
        return plainText;
    }

    private generateSecurityKey(password: string, salt: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            crypto.scrypt(password, salt, 32, (err, derivedKey) => {
                if (err) reject(err);
                else resolve(derivedKey.toString('hex'));
            });
        });
    }

    private parseEncrypted(encrypted: Encrypted): [salt: string, iv: string, content: string] {
        const [salt, iv, content] = Buffer.from(encrypted, 'base64').toString().split('$').filter(Boolean);
        if (!salt || !iv || !content) throw new Error('Invalid encrypted data');
        return [salt, iv, content];
    }
}
