import { inject, injectable } from 'tsyringe';

import { CryptoProvider } from '../../domain/abstractions/crypto';
import { Blackhole } from '../../domain/models';
import { CommandHandler } from '../../infrastructure/commands/abstractions';
import { CliCommand } from '../../infrastructure/commands/decorators';
import { Storage } from '../../infrastructure/data/abstractions';
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
    public constructor(
        @inject('Storage') private readonly _storage: Storage,
        @inject('CryptoProvider') private readonly _cryptoProvider: CryptoProvider,
        @inject('PrivateDirectoryAccessor') private readonly _privateDirectoryAccessor: PrivateDirectoryAccessor,
        @inject('PathGenerator') private readonly _pathGenerator: PathGenerator,
    ) {}

    public async handle(request: CreateBlackholeCommand): Promise<void> {
        const { name, password } = request;
        const path = await this._pathGenerator.generatePath();
        const blackhole = await Blackhole.create(name, path, password, this._cryptoProvider);
        this._storage.blackholes.add(blackhole);
        await this._storage.save();
        await this._privateDirectoryAccessor.create(path);
    }
}
