import { inject, injectable } from 'tsyringe';

import { Blackhole } from '../../domain/models';
import { CommandHandler } from '../../infrastructure/commands/abstractions';
import { CliCommand } from '../../infrastructure/commands/decorators';
import { EntityFactory, Storage } from '../../infrastructure/data/abstractions';
import { BlackholeEntityFactory } from '../../infrastructure/data/entities/factories';
import { PathGenerator, BlackholeAccessor } from '../../infrastructure/shared/utils/filesystem/abstractions';

export type MapBlackholeCommand = {
    name: string;
    password: string;
    sourceDestination: string;
};

@injectable()
@CliCommand({
    command: 'map <name> <source[:<dest>]> <password>',
    description: 'Create a new blackhole mapping.',
    mapRequest: (name, sourceDestination, password) => ({ name, password, sourceDestination }) as MapBlackholeCommand,
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class MapBlackholeCommandHandler implements CommandHandler<MapBlackholeCommand> {
    private readonly _blackholeEntityFactory: BlackholeEntityFactory;

    public constructor(
        @inject('Storage') private readonly _storage: Storage,
        @inject('BlackholeAccessor') private readonly _blackholeAccessor: BlackholeAccessor,
        @inject('PathGenerator') private readonly _pathGenerator: PathGenerator,
        @inject('BlackholeEntityFactory') entityFactory: EntityFactory<Blackhole>,
    ) {
        this._blackholeEntityFactory = entityFactory as BlackholeEntityFactory;
    }

    public async handle(request: MapBlackholeCommand): Promise<void> {
        const { name, password } = request;
        const [source, dest] = request.sourceDestination.split(':');
        const blackhole = await this._blackholeEntityFactory.create(
            name,
            source,
            dest ?? (await this._pathGenerator.generatePath()),
            password,
        );
        await this._storage.blackholes.add(blackhole);
        await this._blackholeAccessor.map(blackhole, password);
        await this._storage.save();
    }
}
