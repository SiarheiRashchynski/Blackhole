import { inject, injectable } from 'tsyringe';

import { CryptoProvider } from '../../../../domain/abstractions/crypto';
import { Encrypted, Hashed } from '../../../../domain/abstractions/crypto/types';
import { Blackhole } from '../../../../domain/models';
import { EntityFactory } from '../../abstractions';

@injectable()
export class BlackholeEntityFactory implements EntityFactory<Blackhole> {
    public constructor(@inject('CryptoProvider') private readonly _cryptoProvider: CryptoProvider) {}

    public async create(name: string, password: string, path: string): Promise<Blackhole> {
        const encryptedPath = await this._cryptoProvider.encrypt(Buffer.from(path), password);
        const hashedPassword = await this._cryptoProvider.hash(password);
        const salt = this._cryptoProvider.generateSalt();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new Blackhole(name, encryptedPath, hashedPassword, salt);
    }

    public fromPersistence(data: Record<string, unknown>): Blackhole {
        return new Blackhole(
            data.name as string,
            Buffer.from(data.path as string) as Encrypted,
            data.password as Hashed,
            data.salt as string,
        );
    }

    public toPersistence(entity: Blackhole): Record<string, unknown> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { name: entity.name, path: (entity as any)['_path'], password: entity.password, salt: entity.salt };
    }
}
