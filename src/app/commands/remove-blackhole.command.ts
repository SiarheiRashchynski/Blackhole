import { inject, injectable } from 'tsyringe';

import { CryptoProvider } from '../../domain/abstractions/crypto';
import { Blackhole } from '../../domain/models';
import { CommandHandler } from '../../infrastructure/commands/abstractions';
import { CliCommand } from '../../infrastructure/commands/decorators';
import { Storage } from '../../infrastructure/data/abstractions';
import { PrivateDirectoryAccessor } from '../../infrastructure/shared/utils/filesystem/abstractions';

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
        @inject('CryptoProvider') private readonly cryptoProvider: CryptoProvider,
        @inject('PrivateDirectoryAccessor') private readonly _privateDirectoryAccessor: PrivateDirectoryAccessor,
    ) {}

    public async handle({ name, password }: RemoveBlackholeCommand): Promise<void> {
        const blackhole = await this._storage.blackholes.get({ name } as Blackhole);
        if (!blackhole) {
            throw new Error('Blackhole not found.');
        }

        if (!(await this.cryptoProvider.check(password, blackhole.password))) {
            throw new Error('Invalid password.');
        }
        this._storage.blackholes.delete({ name, password } as Blackhole);
        await this._storage.save();
        await this._privateDirectoryAccessor.delete(await blackhole.getPath(password, this.cryptoProvider));
    }
}
