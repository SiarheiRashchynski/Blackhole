import { inject, injectable } from 'tsyringe';

import { Wormhole } from '../../domain/models';
import { CryptoProvider } from '../shared/utils/security/abstractions';
import { Encrypted, Hashed } from '../shared/utils/security/types';

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
        const key = await this.generateStelarCode(name, password);

        const wormholes = await this.read();
        const persistable = wormholes.find((w) => w.key === key.value);
        if (!persistable) return;

        const encryptionKey = await this._cryptoProvider.generateSecurityKey(password, persistable.salt);
        const decrypted = await this._cryptoProvider.decrypt(new Encrypted(persistable.content), encryptionKey);
        const { stellarCode, eventHorizon, singularity } = JSON.parse(decrypted);
        return new Wormhole({ stellarCode, eventHorizon, singularity });
    }

    public async save(wormhole: Wormhole, password: string): Promise<void> {
        const key = await this.generateStelarCode(wormhole.stellarCode, password);

        const wormholes = await this.read();
        if (wormholes.find((w) => w.key === key.value)) {
            throw new Error('Wormhole with the same key already exists');
        }

        const securityKey = await this._cryptoProvider.generateSecurityKey(password);
        const encryptedContent = await this._cryptoProvider.encrypt(
            JSON.stringify({
                stellarCode: wormhole.stellarCode,
                eventHorizon: wormhole.eventHorizon,
                singularity: wormhole.singularity,
            }),
            securityKey,
        );

        const persistable: Persistable = {
            key: key.value,
            content: encryptedContent.toString(),
            salt: this._cryptoProvider.generateSalt(),
        };
        wormholes.push(persistable);
        return this._storage.write(JSON.stringify(wormholes));
    }

    private async read(): Promise<Persistable[]> {
        const data = await this._storage.read();
        return data ? JSON.parse(data) : [];
    }

    private async generateStelarCode(name: string, password: string): Promise<Hashed> {
        return this._cryptoProvider.hash([name, password].join(this._delimiter));
    }
}
