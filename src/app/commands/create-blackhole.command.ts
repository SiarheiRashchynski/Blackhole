import { CommandHandler } from '../infrastructure/commands/abstractions';
import { CliCommand } from '../infrastructure/commands/decorators';

export type CreateBlackholeCommand = {
    name: string;
    path: string;
    password?: string;
};

@CliCommand({
    command: 'map <name> <path>',
    description: 'Create a new blackhole mapping.',
    map: (name, path, { password }) => ({ name, path, password }) as CreateBlackholeCommand,
    options: [{ flag: '-p, --password <password>', description: 'Optional password for the blackhole.' }],
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class CreateBlackholeCommandHandler implements CommandHandler<CreateBlackholeCommand> {
    public handle(request: CreateBlackholeCommand): void {
        console.log({ request });
    }
}
