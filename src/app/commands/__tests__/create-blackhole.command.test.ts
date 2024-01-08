import { CreateBlackholeCommandHandler, CreateBlackholeCommand } from '../create-blackhole.command';

describe('CreateBlackholeCommandHandler', () => {
    let commandHandler: CreateBlackholeCommandHandler;

    beforeEach(() => {
        commandHandler = new CreateBlackholeCommandHandler();
    });

    it('should handle the command', () => {
        // Arrange
        const request: CreateBlackholeCommand = {
            name: 'blackhole1',
            path: '/path/to/blackhole',
            password: 'password123',
        };

        const log = jest.spyOn(console, 'log');

        // Act
        commandHandler.handle(request);

        // Assert
        expect(log).toHaveBeenCalledWith({ request });
    });
});
