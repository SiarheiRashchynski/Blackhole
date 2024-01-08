import { CommandHandler } from '../infrastructure/commands/abstractions';
import { CliCommand } from '../infrastructure/commands/decorators';

export type RemoveBlackholeCommand = {
    name: string;
    password?: string;
};

@CliCommand({
    command: 'remove <name>',
    description: 'Remove a blackhole mapping.',
    map: (name, { password }) => ({ name, password }) as RemoveBlackholeCommand,
    options: [{ flag: '-p, --password', description: 'Prompt for password if the blackhole is password protected.' }],
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class RemoveBlackholeCommandHandler implements CommandHandler<RemoveBlackholeCommand> {
    public handle(request: RemoveBlackholeCommand): void {
        console.log({ request });
    }
}
