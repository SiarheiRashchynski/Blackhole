import { container } from 'tsyringe';

import { CliCommandOption, addCliCommand } from '../../shared/utils';
import { CommandHandler } from '../abstractions';

export interface CliCommandMetadata<TCommand> {
    command: string;
    description: string;
    mapRequest: (...args: any[]) => TCommand;
    options?: CliCommandOption[];
}

type CommandConstructor<TCommand> = new (...args: any[]) => CommandHandler<TCommand>;

function cliCommandDecorator<TCommand>(
    metadata: CliCommandMetadata<TCommand>,
): (constructor: CommandConstructor<TCommand>) => void {
    return function (constructor: CommandConstructor<TCommand>): void {
        registerCommand(metadata, constructor);
    };
}

function registerCommand<TCommand>(metadata: CliCommandMetadata<TCommand>, constructor: CommandConstructor<TCommand>) {
    addCliCommand(metadata.command, metadata.description, metadata.options || [], (...args: any[]) => {
        const instance = container.resolve(constructor) as CommandHandler<TCommand>;
        return instance.handle(metadata.mapRequest(...args));
    });
}

export const CliCommand = cliCommandDecorator;
