import { HashProvider } from '../../abstractions/crypto';
import { Encrypted, Hashed } from '../../abstractions/crypto/types';

export class Blackhole {
    private _name: string;

    private _encryptedPath: Encrypted;

    private _password: Hashed;

    public constructor(name: string, path: Encrypted, password: Hashed) {
        this._name = name;
        this._encryptedPath = path;
        this._password = password;
    }

    public get name(): string {
        return this._name;
    }

    public get password(): Hashed {
        return this._password;
    }

    public get path(): Encrypted {
        return this._encryptedPath;
    }

    public async setName(name: string, password: string, hashProvider: HashProvider): Promise<void> {
        await this.passwordsMatchGuard(password, hashProvider);
        this._name = name;
    }

    public async setPath(path: Encrypted, password: string, hashProvider: HashProvider): Promise<void> {
        await this.passwordsMatchGuard(password, hashProvider);
        this._encryptedPath = path;
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
