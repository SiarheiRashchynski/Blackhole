import { inject, injectable } from 'tsyringe';

import { Wormhole } from '../../domain/models';
import { CryptoProvider } from '../shared/utils/security/abstractions';
import { Encrypted } from '../shared/utils/security/types';

import { Storage } from './abstractions/storage';
import { WormholeRegistry as WormholeRegistryInterface } from './abstractions/wormhole-registry';

type Persistable = {
    key: string;
    content: string;
    salt: string;
};

@injectable()
export class WormholeRegistry implements WormholeRegistryInterface {
    private readonly _delimiter = ':';

    public constructor(
        @inject('CryptoProvider') private readonly _cryptoProvider: CryptoProvider,
        @inject('Storage') private readonly _storage: Storage,
    ) {}

    public async load(name: string, password: string): Promise<Wormhole | undefined> {
        const key = this.getRawKey(name, password);
        const wormholes = await this.read();

        const persistable = await wormholes.findAsync(async (w) => await this._cryptoProvider.check(key, w.key));
        if (!persistable) return;

        const [decryptionKey] = await this._cryptoProvider.generateSecurityKey(password, persistable.salt);
        const decrypted = await this._cryptoProvider.decrypt(new Encrypted(persistable.content), decryptionKey);
        const { stellarCode, eventHorizon, singularity } = JSON.parse(decrypted);
        return new Wormhole({ stellarCode, eventHorizon, singularity });
    }

    public async save(wormhole: Wormhole, password: string): Promise<void> {
        const key = this.getRawKey(wormhole.stellarCode, password);
        const wormholes = await this.read();

        if (await wormholes.someAsync(async (w) => await this._cryptoProvider.check(key, w.key))) {
            throw new Error('Wormhole with the same key already exists');
        }

        const hashedKey = await this._cryptoProvider.hash(key);
        const [encryptionKey, salt] = await this._cryptoProvider.generateSecurityKey(password);
        const encryptedContent = await this._cryptoProvider.encrypt(
            JSON.stringify({
                stellarCode: wormhole.stellarCode,
                eventHorizon: wormhole.eventHorizon,
                singularity: wormhole.singularity,
            }),
            encryptionKey,
        );

        const persistable: Persistable = {
            key: hashedKey.value,
            content: encryptedContent.toString(),
            salt: salt,
        };
        wormholes.push(persistable);
        return this._storage.write(JSON.stringify(wormholes));
    }

    private async read(): Promise<Persistable[]> {
        const data = await this._storage.read();
        return data ? JSON.parse(data) : [];
    }

    private getRawKey(name: string, password: string): string {
        return [name, password].join(this._delimiter);
    }
}
