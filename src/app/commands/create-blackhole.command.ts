import { inject, injectable } from 'tsyringe';

import { Blackhole } from '../../domain/models';
import { CommandHandler } from '../../infrastructure/commands/abstractions';
import { CliCommand } from '../../infrastructure/commands/decorators';
import { EntityFactory, Storage } from '../../infrastructure/data/abstractions';
import { BlackholeEntityFactory } from '../../infrastructure/data/entities/factories';
import { PathGenerator, PrivateDirectoryAccessor } from '../../infrastructure/shared/utils/filesystem/abstractions';

export type CreateBlackholeCommand = {
    name: string;
    password: string;
};

@injectable()
@CliCommand({
    command: 'map <name> <password>',
    description: 'Create a new blackhole mapping.',
    mapRequest: (name, password) => ({ name, password }) as CreateBlackholeCommand,
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class CreateBlackholeCommandHandler implements CommandHandler<CreateBlackholeCommand> {
    private readonly _blackholeEntityFactory: BlackholeEntityFactory;

    public constructor(
        @inject('Storage') private readonly _storage: Storage,
        @inject('PrivateDirectoryAccessor') private readonly _privateDirectoryAccessor: PrivateDirectoryAccessor,
        @inject('PathGenerator') private readonly _pathGenerator: PathGenerator,
        @inject('BlackholeEntityFactory') entityFactory: EntityFactory<Blackhole>,
    ) {
        this._blackholeEntityFactory = entityFactory as BlackholeEntityFactory;
    }

    public async handle(request: CreateBlackholeCommand): Promise<void> {
        const { name, password } = request;
        const path = await this._pathGenerator.generatePath();
        const blackhole = await this._blackholeEntityFactory.create(name, password, path);
        await this._storage.blackholes.add(blackhole);
        await this._storage.save();
        await this._privateDirectoryAccessor.create(path);
    }
}
