import { CommandHandler } from '../infrastructure/commands/abstractions';
import { CliCommand } from '../infrastructure/commands/decorators';

export type NavigateToBlackholeCommand = {
    name: string;
    password: string;
};

@CliCommand({
    command: 'go <name>',
    description: 'Navigate to a mapped blackhole.',
    map: (name, { password }) => ({ name, password }) as NavigateToBlackholeCommand,
    options: [{ flag: '-p, --password', description: 'Prompt for password if the blackhole is password protected.' }],
})
export class NavigateToBlackholeCommandHandler implements CommandHandler<NavigateToBlackholeCommand> {
    public handle(request: NavigateToBlackholeCommand): void {
        console.log({ request });
    }
}
