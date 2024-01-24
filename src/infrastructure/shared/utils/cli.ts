import { Command } from 'commander';

const program = new Command();

program.version('0.0.1', '-v, --version').name('blackhole');

export interface CliCommandOption {
    flag: string;
    description: string;
}

export function addCliCommand(
    command: string,
    description: string,
    options: CliCommandOption[],
    action: (...args: never[]) => void,
): void {
    const c = program
        .command(command)
        .description(description)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .action(action as any);
    options?.forEach((option) => c.option(option.flag, option.description));
}

export function runCli(): void {
    program.parse(process.argv);
}
