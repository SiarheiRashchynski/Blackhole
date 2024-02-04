import { inject, injectable } from 'tsyringe';

import { HashProvider } from '../../domain/abstractions/crypto';
import { Blackhole } from '../../domain/models';
import { CommandHandler } from '../../infrastructure/commands/abstractions';
import { CliCommand } from '../../infrastructure/commands/decorators';
import { Storage } from '../../infrastructure/data/abstractions';
import { BlackholeAccessor } from '../../infrastructure/shared/utils/filesystem/abstractions';

export type RemoveBlackholeCommand = {
    name: string;
    password: string;
};

@injectable()
@CliCommand({
    command: 'remove <name> <password>',
    description: 'Remove a blackhole mapping.',
    mapRequest: (name, password) => ({ name, password }) as RemoveBlackholeCommand,
    options: [{ flag: '-p, --password', description: 'Prompt for password if the blackhole is password protected.' }],
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class RemoveBlackholeCommandHandler implements CommandHandler<RemoveBlackholeCommand> {
    public constructor(
        @inject('Storage') private readonly _storage: Storage,
        @inject('HashProvider') private readonly hashProvider: HashProvider,
        @inject('BlackholeAccessor') private readonly _blackholeAccessor: BlackholeAccessor,
    ) {}

    public async handle({ name, password }: RemoveBlackholeCommand): Promise<void> {
        const blackhole = await this._storage.blackholes.get((entity) => entity.name === name);
        if (!blackhole) {
            throw new Error('Blackhole not found.');
        }

        if (!(await this.hashProvider.check(password, blackhole.password))) {
            throw new Error('Invalid password.');
        }
        this._storage.blackholes.delete((entity) => entity.name === name);
        await this._blackholeAccessor.delete(blackhole, password);
        await this._storage.save();
    }
}
