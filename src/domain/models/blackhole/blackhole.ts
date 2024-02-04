import { HashProvider } from '../../abstractions/crypto';
import { Encrypted, Hashed } from '../../abstractions/crypto/types';

export class Blackhole {
    private _name: string;

    private _source: Encrypted;

    private _destination: Encrypted;

    private _password: Hashed;

    public constructor(name: string, source: Encrypted, destination: Encrypted, password: Hashed) {
        if (!name || !source || !destination || !password) throw new Error('Invalid blackhole.');

        this._name = name;
        this._source = source;
        this._destination = destination;
        this._password = password;
    }

    public get name(): string {
        return this._name;
    }

    public get password(): Hashed {
        return this._password;
    }

    public get source(): Encrypted {
        return this._source;
    }

    public get destination(): Encrypted {
        return this._destination;
    }

    public async setName(name: string, password: string, hashProvider: HashProvider): Promise<void> {
        if (!name) throw new Error('Invalid name.');
        await this.passwordsMatchGuard(password, hashProvider);
        this._name = name;
    }

    public async setSource(path: Encrypted, password: string, hashProvider: HashProvider): Promise<void> {
        if (!path) throw new Error('Invalid path.');
        await this.passwordsMatchGuard(password, hashProvider);
        this._source = path;
    }

    public async setDestination(path: Encrypted, password: string, hashProvider: HashProvider): Promise<void> {
        if (!path) throw new Error('Invalid path.');
        await this.passwordsMatchGuard(password, hashProvider);
        this._destination = path;
    }

    public async setPassword(password: string, newPassword: string, hashProvider: HashProvider): Promise<void> {
        await this.passwordsMatchGuard(password, hashProvider);
        this._password = await hashProvider.hash(newPassword);
    }

    private async passwordsMatchGuard(password: string, hashProvider: HashProvider): Promise<void> {
        if (this._password && !(await hashProvider.check(password, this._password))) {
            throw new Error('Invalid password.');
        }
    }
}
