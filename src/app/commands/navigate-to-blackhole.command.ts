import { inject, injectable } from 'tsyringe';
import { CryptoProvider } from '../../domain/abstractions/crypto';
import { Blackhole } from '../../domain/models';
import { CommandHandler } from '../../infrastructure/commands/abstractions';
import { CliCommand } from '../../infrastructure/commands/decorators';
import { Storage } from '../../infrastructure/data/abstractions';
import { PrivateDirectoryAccessor } from '../../infrastructure/shared/utils/filesystem/abstractions';

export type NavigateToBlackholeCommand = {
    name: string;
    password: string;
};

@injectable()
@CliCommand({
    command: 'go <name> <password>',
    description: 'Navigate to a mapped blackhole.',
    mapRequest: (name, password) => ({ name, password }) as NavigateToBlackholeCommand,
})
export class NavigateToBlackholeCommandHandler implements CommandHandler<NavigateToBlackholeCommand> {
    public constructor(
        @inject('Storage') private readonly _storage: Storage,
        @inject('PrivateDirectoryAccessor') private readonly _privateDirectoryAccessor: PrivateDirectoryAccessor,
        @inject('CryptoProvider') private readonly _cryptoProvider: CryptoProvider,
    ) {}

    public async handle(request: NavigateToBlackholeCommand): Promise<void> {
        const blackhole = await this._storage.blackholes.get({ name: request.name } as Blackhole);
        if (!blackhole) {
            throw new Error(`Blackhole '${request.name}' not found.`);
        }
        const path = await blackhole.getPath(request.password, this._cryptoProvider);
        await this._privateDirectoryAccessor.open(blackhole.name, path, request.password, blackhole.salt);
    }
}
