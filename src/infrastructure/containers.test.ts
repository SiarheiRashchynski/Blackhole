import * as containers from './containers';
import { container } from 'tsyringe';
import { FileOperations, PathGenerator } from './shared/utils/filesystem/abstractions';
import { JsonStorage } from './data/json.storage';
import { Storage } from './data/abstractions';
import { randomUUID } from 'crypto';


export async function registerDependencies(): Promise<void> {
    await containers.registerDependencies();
    const fileOperations = container.resolve<FileOperations>('FileOperations');
    const jsonStorage = await JsonStorage.create(fileOperations, '__integration_tests__/data.json');
    container.registerInstance<Storage>('Storage', jsonStorage);
    container.registerInstance<PathGenerator>(
    'PathGenerator', { 
        generatePath(): Promise<string> { 
            return Promise.resolve('__integration_tests__/' + randomUUID()) 
        } 
    })
};