import 'reflect-metadata';

import { container } from 'tsyringe';

import {
    HashProvider as HashProviderInterface,
    CipherProvider as CipherProviderInterface,
    CryptoProvider as CryptoProviderInterface,
} from '../domain/abstractions/crypto';
import { Storage } from '../infrastructure/data/abstractions';
import { HashProvider, CipherProvider, CryptoProvider } from '../infrastructure/shared/utils/crypto';

import { JsonStorage } from './data/json.storage';
import { FileOperations, PrivateDirectoryAccessor } from './shared/utils/filesystem';
import { FileOperations as FileOperationsInterface, PathGenerator } from './shared/utils/filesystem/abstractions';
import { SimplePathGenerator } from './shared/utils/filesystem/simple-path-generator';

export async function registerDependencies(): Promise<void> {
    container.register<HashProviderInterface>('HashProvider', { useClass: HashProvider });
    container.register<CipherProviderInterface>('CipherProvider', { useClass: CipherProvider });
    container.register<CryptoProviderInterface>('CryptoProvider', { useClass: CryptoProvider });
    container.register<FileOperationsInterface>('FileOperations', { useClass: FileOperations });
    container.register<PrivateDirectoryAccessor>('PrivateDirectoryAccessor', { useClass: PrivateDirectoryAccessor });
    container.register<PathGenerator>('PathGenerator', { useClass: SimplePathGenerator });

    const fileOperations = container.resolve<FileOperationsInterface>('FileOperations');
    const jsonStorage = await JsonStorage.create(fileOperations);
    container.registerInstance<Storage>('Storage', jsonStorage);
}
