import { CryptoProvider, HashProvider } from '../../abstractions/crypto';
import { Encrypted, Hashed } from '../../abstractions/crypto/types';

export class Blackhole {
    private _name: string;

    private _path: Encrypted;

    private _password: Hashed;

    private _salt: string;

    public constructor(name: string, path: Encrypted, password: Hashed, salt: string) {
        this._name = name;
        this._path = path;
        this._password = password;
        this._salt = salt;
    }

    public get name(): string {
        return this._name;
    }

    public get password(): Hashed {
        return this._password;
    }

    public get salt(): string {
        return this._salt;
    }

    public get path(): Encrypted {
        return this._path;
    }

    public async setName(name: string, password: string, hashProvider: HashProvider): Promise<void> {
        await this.passwordsMatchGuard(password, hashProvider);
        this._name = name;
    }

    public async setPath(path: Encrypted, password: string, cryptoProvider: CryptoProvider): Promise<void> {
        await this.passwordsMatchGuard(password, cryptoProvider);
        const securityKey = await cryptoProvider.generateSecurityKey(password, this._password);
        this._path = await cryptoProvider.encrypt(path, securityKey);
    }

    public async getPath(password: string, cryptoProvider: CryptoProvider): Promise<string> {
        await this.passwordsMatchGuard(password, cryptoProvider);
        const securityKey = await cryptoProvider.generateSecurityKey(password, this._password);
        return (await cryptoProvider.decrypt(this._path, securityKey)).toString();
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
