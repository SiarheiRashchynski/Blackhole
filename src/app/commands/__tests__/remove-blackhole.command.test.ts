import { RemoveBlackholeCommandHandler, RemoveBlackholeCommand } from '../remove-blackhole.command';

describe('RemoveBlackholeCommandHandler', () => {
    let commandHandler: RemoveBlackholeCommandHandler;

    beforeEach(() => {
        commandHandler = new RemoveBlackholeCommandHandler();
    });

    it('should handle the command', () => {
        // Arrange
        const request: RemoveBlackholeCommand = {
            name: 'blackhole1',
            password: 'password123',
        };

        const log = jest.spyOn(console, 'log');

        // Act
        commandHandler.handle(request);

        // Assert
        expect(log).toHaveBeenCalledWith({ request });
    });
});
