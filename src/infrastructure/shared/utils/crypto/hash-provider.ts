import * as bcrypt from 'bcrypt';
import { injectable } from 'tsyringe';

import { HashProvider as HashInterface } from '../../../../domain/abstractions/crypto';
import { Hashed } from '../../../../domain/abstractions/crypto/types';

@injectable()
export class HashProvider implements HashInterface {
    public async hash(password: string): Promise<Hashed> {
        return (await bcrypt.hash(password, 10)) as Hashed;
    }

    public check(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}
