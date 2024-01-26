import { Encrypted } from './types';

export interface CipherProvider {
    generateSalt(): string;
    generateSecurityKey(password: string, salt: string): Promise<string>;
    encrypt(buffer: Buffer, securityKey: string): Promise<Encrypted>;
    decrypt(buffer: Encrypted, securityKey: string): Promise<Buffer>;
}
