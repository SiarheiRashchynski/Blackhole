import { randomUUID } from 'crypto';

import { container } from 'tsyringe';

import * as containers from './containers';
import { EntityServicesToken } from './containers';
import { Storage } from './data/abstractions';
import { JsonStorage } from './data/json.storage';
import { FileOperations, PathGenerator } from './shared/utils/filesystem/abstractions';

export async function registerDependencies(): Promise<void> {
    await containers.registerDependencies();
    const fileOperations = container.resolve<FileOperations>('FileOperations');
    const jsonStorage = await JsonStorage.create(
        fileOperations,
        container.resolve(EntityServicesToken),
        '__integration_tests__/data.json',
    );
    container.registerInstance<Storage>('Storage', jsonStorage);
    container.registerInstance<PathGenerator>('PathGenerator', {
        generatePath(): Promise<string> {
            return Promise.resolve('__integration_tests__/' + randomUUID());
        },
    });
}
