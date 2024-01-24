import * as cli from '../../../shared/utils/cli';
import { CommandHandler } from '../../abstractions';
import { CliCommand, CliCommandMetadata } from '../cli-command.decorator';

jest.mock('../../../shared/utils/cli');

type TestType = { name: string };

describe('CliCommandDecorator', () => {
    class TestCommandHandler implements CommandHandler<TestType> {
        public handle({}): Promise<void> {
            return Promise.resolve();
        }
    }

    const metadata: CliCommandMetadata<any> = {
        command: 'test <name> <path>',
        description: 'Test command',
        mapRequest: (name, path, { option }) => ({ name, path, option }),
        options: [
            { flag: '-f, --flag', description: 'Test flag' },
            { flag: '-o, --option', description: 'Test option' },
        ],
    };

    it('should register the command', () => {
        @CliCommand(metadata)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class TestCommand extends TestCommandHandler {}

        expect(cli.addCliCommand).toHaveBeenCalledWith(
            metadata.command,
            metadata.description,
            metadata.options,
            expect.any(Function),
        );
    });

    it('should call the handle method of the command handler with the mapped arguments', () => {
        // Arrange
        const mapSpy = jest.spyOn(metadata, 'mapRequest');
        const handleSpy = jest.spyOn(TestCommandHandler.prototype, 'handle');

        const args = ['arg1', 'arg2', { option: 'option1' }] as any[];

        (cli.addCliCommand as jest.Mock).mockImplementation(({}, {}, {}, action) => {
            action(...args);
        });

        // Act
        @CliCommand(metadata)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class TestCommand extends TestCommandHandler {}

        // Assert
        expect(mapSpy).toHaveBeenCalledWith(...args);
        expect(handleSpy).toHaveBeenCalledWith({ name: args[0], path: args[1], option: args[2].option });
    });
});
