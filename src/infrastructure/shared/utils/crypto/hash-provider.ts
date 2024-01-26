import { injectable } from 'tsyringe';

import { HashProvider as HashInterface } from '../../../../domain/abstractions/crypto';
import { Hashed } from '../../../../domain/abstractions/crypto/types';

@injectable()
export class HashProvider implements HashInterface {
    public hash(password: string): Promise<Hashed> {
        return Promise.resolve(password as Hashed);
    }

    public check(password: string, hashedPassword: string): Promise<boolean> {
        return Promise.resolve(password === hashedPassword);
    }
}
