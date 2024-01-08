import { NavigateToBlackholeCommand, NavigateToBlackholeCommandHandler } from '../navigate-to-blackhole.command';

describe('NavigateToBlackholeCommandHandler', () => {
    let commandHandler: NavigateToBlackholeCommandHandler;

    beforeEach(() => {
        commandHandler = new NavigateToBlackholeCommandHandler();
    });

    it('should handle the command', () => {
        // Arrange
        const request: NavigateToBlackholeCommand = {
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
