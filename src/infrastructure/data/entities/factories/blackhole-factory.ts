import { inject, injectable } from 'tsyringe';

import { CryptoProvider } from '../../../../domain/abstractions/crypto';
import { Encrypted, Hashed } from '../../../../domain/abstractions/crypto/types';
import { Blackhole } from '../../../../domain/models';
import { EntityFactory } from '../../abstractions';

@injectable()
export class BlackholeEntityFactory implements EntityFactory<Blackhole> {
    public constructor(@inject('CryptoProvider') private readonly _cryptoProvider: CryptoProvider) {}

    public async create(name: string, source: string, destination: string, password: string): Promise<Blackhole> {
        const encryptedSource = await this._cryptoProvider.encrypt(Buffer.from(source), password);
        const encryptedDestination = await this._cryptoProvider.encrypt(Buffer.from(destination), password);
        const hashedPassword = await this._cryptoProvider.hash(password);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new Blackhole(name, encryptedSource, encryptedDestination, hashedPassword);
    }

    public fromPersistence(data: Record<string, unknown>): Blackhole {
        return new Blackhole(
            data.name as string,
            data.source as Encrypted,
            data.destination as Encrypted,
            data.password as Hashed,
        );
    }

    public toPersistence(entity: Blackhole): Record<string, unknown> {
        return {
            name: entity.name,
            source: entity.source,
            destination: entity.destination,
            password: entity.password,
        };
    }
}
