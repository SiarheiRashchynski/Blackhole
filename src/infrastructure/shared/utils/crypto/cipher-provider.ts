import { injectable } from 'tsyringe';

import { CipherProvider as CipherProviderInterface } from '../../../../domain/abstractions/crypto';
import { Encrypted } from '../../../../domain/abstractions/crypto/types';

@injectable()
export class CipherProvider implements CipherProviderInterface {
    public generateSalt(): string {
        return 'salt';
    }

    public generateSecurityKey(password: string, salt: string): Promise<string> {
        return Promise.resolve(`${password}${salt}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public encrypt(data: Buffer, securityKey: string): Promise<Encrypted> {
        return Promise.resolve(data as Encrypted);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public decrypt(data: Encrypted, securityKey: string): Promise<Buffer> {
        return Promise.resolve(data);
    }
}
