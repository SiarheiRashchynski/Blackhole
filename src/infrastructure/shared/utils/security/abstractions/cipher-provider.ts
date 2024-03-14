import { Encrypted } from '../types';

export interface CipherProvider {
    encrypt(content: Buffer | string, encryptionKey: string | Buffer): Promise<Encrypted>;
    decrypt(encrypted: Encrypted, encryptionKey: string | Buffer, encoding?: BufferEncoding): Promise<string>;
    generateSecurityKey(password: string, salt?: string): Promise<[Buffer, string]>;
    generateSalt(): string;
}
