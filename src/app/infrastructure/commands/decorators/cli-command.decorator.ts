import { CliCommandOption, addCliCommand } from '../../shared/utils';
import { CommandHandler } from '../abstractions';

export interface CliCommandMetadata {
    command: string;
    description: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map: (...args: any) => unknown;
    options?: CliCommandOption[];
}

export type CommandConstructor = new (...args: unknown[]) => CommandHandler<unknown>;

function CliCommandDecorator(metadata: CliCommandMetadata) {
    return function (constructor: CommandConstructor) {
        registerCommand(metadata, constructor);
        return constructor;
    };
}

function registerCommand(metadata: CliCommandMetadata, constructor: CommandConstructor) {
    addCliCommand(metadata.command, metadata.description, metadata.options || [], (...args: unknown[]) => {
        const instance = new constructor();
        instance.handle(metadata.map(...args));
    });
}

export const CliCommand = CliCommandDecorator;
