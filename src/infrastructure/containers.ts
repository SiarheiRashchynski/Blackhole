import 'reflect-metadata';

import { InjectionToken, container } from 'tsyringe';

import {
    HashProvider as HashProviderInterface,
    CipherProvider as CipherProviderInterface,
    CryptoProvider as CryptoProviderInterface,
} from '../domain/abstractions/crypto';
import { EntityComparator, EntityFactory, Storage } from '../infrastructure/data/abstractions';
import { EntityService } from '../infrastructure/data/abstractions';
import * as EntityServiceImports from '../infrastructure/data/entities';
import * as EntityComparators from '../infrastructure/data/entities/comparators';
import * as EntityFactories from '../infrastructure/data/entities/factories';
import { HashProvider, CipherProvider, CryptoProvider } from '../infrastructure/shared/utils/crypto';

import { JsonStorage } from './data/json.storage';
import { FileOperations, BlackholeAccessor as BlackholeAccessor } from './shared/utils/filesystem';
import { FileOperations as FileOperationsInterface, PathGenerator } from './shared/utils/filesystem/abstractions';
import { SimplePathGenerator } from './shared/utils/filesystem/simple-path-generator';

export type EntityServices = Record<string, EntityService<unknown>>;
export const EntityServicesToken: InjectionToken<EntityServices> = Symbol('Services');

console.log('test');

export async function registerDependencies(): Promise<void> {
    container.register<HashProviderInterface>('HashProvider', { useClass: HashProvider });
    container.register<CipherProviderInterface>('CipherProvider', { useClass: CipherProvider });
    container.register<CryptoProviderInterface>('CryptoProvider', { useClass: CryptoProvider });
    container.register<FileOperationsInterface>('FileOperations', { useClass: FileOperations });
    container.register<BlackholeAccessor>('BlackholeAccessor', { useClass: BlackholeAccessor });
    container.register<PathGenerator>('PathGenerator', { useClass: SimplePathGenerator });

    for (const entityFactory of Object.values(EntityFactories)) {
        container.registerSingleton<EntityFactory<unknown>>(entityFactory.name, entityFactory);
    }

    for (const entityComparator of Object.values(EntityComparators)) {
        container.registerSingleton<EntityComparator<unknown>>(entityComparator.name, entityComparator);
    }

    const services: Record<string, EntityService<unknown>> = {};
    for (const entityService of Object.values(EntityServiceImports)) {
        container.registerSingleton<EntityService<unknown>>(entityService.name, entityService);
        console.log(container);
        services[entityService.name] = container.resolve(entityService.name);
    }

    container.registerInstance(EntityServicesToken, services);
    const fileOperations = container.resolve<FileOperationsInterface>('FileOperations');
    const jsonStorage = await JsonStorage.create(fileOperations, container.resolve(EntityServicesToken));
    container.registerInstance<Storage>('Storage', jsonStorage);
}
