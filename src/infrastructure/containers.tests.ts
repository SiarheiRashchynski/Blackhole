import * as path from 'path';

import { container } from 'tsyringe';

import { path as basePath } from '../test-constants';

import * as containers from './containers';
import { Storage as StorageInterface } from './data/abstractions/storage';
import { Storage } from './data/storage';

export async function registerDependencies(): Promise<void> {
    await containers.registerDependencies();
    container.register<StorageInterface>('Storage', {
        useFactory: () => new Storage(path.join(basePath, 'wormhole.json')),
    });
}
