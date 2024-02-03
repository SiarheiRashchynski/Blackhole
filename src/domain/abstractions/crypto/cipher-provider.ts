import { Encrypted } from './types';

export interface CipherProvider {
    encrypt(content: Buffer | string, password: string): Promise<Encrypted>;
    decrypt(encrypted: Encrypted, password: string): Promise<Buffer>;
}
