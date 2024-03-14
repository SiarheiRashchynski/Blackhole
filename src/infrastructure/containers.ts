import 'reflect-metadata';

import { container } from 'tsyringe';

import { HashProvider, Aes256CbcCipherProvider, CryptoProvider } from '../infrastructure/shared/utils/security';
import {
    HashProvider as HashProviderInterface,
    CipherProvider as CipherProviderInterface,
    CryptoProvider as CryptoProviderInterface,
} from '../infrastructure/shared/utils/security/abstractions';

import { WormholeRegistry as WormholeRegistryInteface } from './data/abstractions';
import { Storage as StorageInterface } from './data/abstractions';
import { Storage } from './data/storage';
import { WormholeRegistry } from './data/wormhole-registry';

export async function registerDependencies(): Promise<void> {
    container.register<HashProviderInterface>('HashProvider', { useClass: HashProvider });
    container.register<CipherProviderInterface>('CipherProvider', { useClass: Aes256CbcCipherProvider });
    container.register<CryptoProviderInterface>('CryptoProvider', { useClass: CryptoProvider });
    container.register<WormholeRegistryInteface>('WormholeRegistry', { useClass: WormholeRegistry });
    container.register<StorageInterface>('Storage', { useFactory: () => new Storage('wormhole.json') });
}
