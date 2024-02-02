import { injectAll } from 'tsyringe';

import { EntityServices, EntityServicesToken } from '../containers';
import { FileOperations } from '../shared/utils/filesystem/abstractions';

import { Storage } from './abstractions';

export class JsonStorage extends Storage {
    private constructor(
        data: Record<string, object[]> = {},
        @injectAll(EntityServicesToken) entityServices: EntityServices,
        fileOperations: FileOperations,
        path: string,
    ) {
        super(data, entityServices, fileOperations, path);
    }

    public static async create(
        fileOperations: FileOperations,
        @injectAll(EntityServicesToken) entityServices: EntityServices,
        path: string = './data.json',
    ): Promise<JsonStorage> {
        const data = await this.loadAll(path, fileOperations);
        return new JsonStorage(data, entityServices, fileOperations, path);
    }

    private static async loadAll(path: string, fs: FileOperations): Promise<Record<string, object[]>> {
        try {
            const data = await fs.read(path);
            return JSON.parse(data);
        } catch (error: unknown) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return {};
            } else {
                throw error;
            }
        }
    }

    public async save(): Promise<void> {
        await this.fs.write(
            this.path,
            Buffer.from(
                JSON.stringify({
                    ...this._blackholes.toPersistence(),
                }),
            ),
        );
    }
}
