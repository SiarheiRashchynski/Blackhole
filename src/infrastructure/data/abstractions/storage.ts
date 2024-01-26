import { Blackhole } from '../../../domain/models';
import { FileOperations } from '../../shared/utils/filesystem/abstractions';
import { EntitySet } from '../types';

export abstract class Storage {
    protected readonly _blackholes: EntitySet<Blackhole>;

    protected constructor(
        data: Record<string, object[]> = {},
        private readonly _fileOperations: FileOperations,
        private readonly _path: string,
    ) {
        this._blackholes = new EntitySet<Blackhole>(Blackhole.name, data, Blackhole.fromPersistence);
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
