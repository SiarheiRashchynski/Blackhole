import * as bcrypt from 'bcrypt';
import { injectable } from 'tsyringe';

import { HashProvider as HashInterface } from './abstractions';
import { Hashed } from './types';

@injectable()
export class HashProvider implements HashInterface {
    public async hash(password: string): Promise<Hashed> {
        return { value: await bcrypt.hash(password, 10), __isHashed: true };
    }

    public check(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}
