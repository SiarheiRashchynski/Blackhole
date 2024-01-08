import { CommandHandler } from '../../abstractions';
import { CliCommand, CliCommandMetadata } from '../cli-command.decorator';

import * as cli from '../../../shared/utils/cli';
jest.mock('../../../shared/utils/cli');

type TestType = { name: string };

describe('CliCommandDecorator', () => {
    class TestCommandHandler implements CommandHandler<TestType> {
        public handle({}) {}
    }

    const metadata: CliCommandMetadata = {
        command: 'test <name> <path>',
        description: 'Test command',
        map: (name, path, { option }) => ({name, path, option}),
        options: [
            { flag: '-f, --flag', description: 'Test flag' },
            { flag: '-o, --option', description: 'Test option' },
        ],
    };

    beforeEach(async () => {
        // program = mockedCommander.program;
    });

    it('should register the command', () => {
        @CliCommand(metadata)
        class TestCommand extends TestCommandHandler {}

        expect(cli.addCliCommand).toHaveBeenCalledWith(
            metadata.command,
            metadata.description,
            metadata.options,
            expect.any(Function));
    });

    it('should call the handle method of the command handler with the mapped arguments', () => {
        // Arrange
        const mapSpy = jest.spyOn(metadata, 'map');
        const handleSpy = jest.spyOn(TestCommandHandler.prototype, 'handle');

        const args = ['arg1', 'arg2', { option: 'option1' }] as any[];

        (cli.addCliCommand as jest.Mock).mockImplementation(({}, {}, {}, action) => {
            action(...args);
        });

        // Act
        @CliCommand(metadata)
        class TestCommand extends TestCommandHandler {}

        // Assert
        expect(mapSpy).toHaveBeenCalledWith(...args);
        expect(handleSpy).toHaveBeenCalledWith({ name: args[0], path: args[1], option: args[2].option});
    });
});
