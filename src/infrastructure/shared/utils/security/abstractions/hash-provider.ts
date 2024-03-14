import { Hashed } from '../types';

export interface HashProvider {
    hash(password: string): Promise<Hashed>;
    check(password: string, hashedPassword: string): Promise<boolean>;
}
