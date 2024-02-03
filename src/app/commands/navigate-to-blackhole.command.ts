import { inject, injectable } from 'tsyringe';

import { CryptoProvider, HashProvider } from '../../domain/abstractions/crypto';
import { Blackhole } from '../../domain/models';
import { CommandHandler } from '../../infrastructure/commands/abstractions';
import { CliCommand } from '../../infrastructure/commands/decorators';
import { Storage } from '../../infrastructure/data/abstractions';
import { BlackholeAccessor as BlackholeAccessor } from '../../infrastructure/shared/utils/filesystem/abstractions';

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
        @inject('HashProvider') private readonly hashProvider: HashProvider,
        @inject('BlackholeAccessor') private readonly _blackholeAccessor: BlackholeAccessor,
    ) {}

    public async handle(request: NavigateToBlackholeCommand): Promise<void> {
        const blackhole = await this._storage.blackholes.get({ name: request.name } as Blackhole);
        if (!blackhole) {
            throw new Error(`Blackhole '${request.name}' not found.`);
        }
        if (!(await this.hashProvider.check(request.password, blackhole.password))) {
            throw new Error('Invalid password.');
        }
        await this._blackholeAccessor.open(blackhole, request.password);
    }
}
