import { injectAll } from 'tsyringe';

import { Blackhole } from '../../../domain/models';
import { EntityServices, EntityServicesToken } from '../../containers';
import { FileOperations } from '../../shared/utils/filesystem/abstractions';
import { BlackholeEntityService } from '../entities';
import { EntitySet } from '../types';

import { EntityService } from './entity-service';

export abstract class Storage {
    protected readonly _blackholes: EntitySet<Blackhole>;

    protected constructor(
        data: Record<string, object[]> = {},
        @injectAll(EntityServicesToken) entityServices: EntityServices,
        private readonly _fileOperations: FileOperations,
        private readonly _path: string,
    ) {
        this._blackholes = new EntitySet<Blackhole>(
            data,
            entityServices[BlackholeEntityService.name] as EntityService<Blackhole>,
        );
    }

    public get fs(): FileOperations {
        return this._fileOperations;
    }

    public get path(): string {
        return this._path;
    }

    public get blackholes(): EntitySet<Blackhole> {
        return this._blackholes;
    }

    public abstract save(): Promise<void>;
}
