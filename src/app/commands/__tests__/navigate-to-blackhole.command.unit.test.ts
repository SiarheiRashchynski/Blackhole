import { HashProvider } from '../../../domain/abstractions/crypto';
import { Blackhole } from '../../../domain/models';
import { Storage } from '../../../infrastructure/data/abstractions';
import { BlackholeAccessor } from '../../../infrastructure/shared/utils/filesystem';
import { NavigateToBlackholeCommand, NavigateToBlackholeCommandHandler } from '../navigate-to-blackhole.command';

jest.mock('../../../infrastructure/containers');

describe('NavigateToBlackholeCommandHandler', () => {
    let commandHandler: NavigateToBlackholeCommandHandler;
    let storage: jest.Mocked<Storage>;
    let blackholeAccessor: jest.Mocked<BlackholeAccessor>;
    let hashProvider: jest.Mocked<HashProvider>;

    beforeEach(() => {
        storage = {
            blackholes: {
                get: jest.fn(),
            },
        } as any;
        blackholeAccessor = {
            open: jest.fn(),
        } as any;
        hashProvider = {
            check: jest.fn().mockResolvedValue(true),
        } as any;
        commandHandler = new NavigateToBlackholeCommandHandler(storage, hashProvider, blackholeAccessor);
    });

    it('should open the Blackhole', async () => {
        // Arrange
        const request: NavigateToBlackholeCommand = {
            name: 'blackhole1',
            password: 'password123',
        };

        const blackhole = {
            name: 'blackhole1',
            getPath: jest.fn().mockResolvedValue({ content: 'path', salt: 'salt', iv: 'iv' }),
        } as unknown as Blackhole;
        (storage.blackholes.get as jest.Mock).mockResolvedValue(blackhole);

        // Act
        await commandHandler.handle(request);

        // Assert
        expect(storage.blackholes.get).toHaveBeenCalledWith({ name: request.name });
        expect(blackholeAccessor.open).toHaveBeenCalledWith(blackhole, request.password);
    });

    it('The blackhole should not be opened because it is not found', async () => {
        // Arrange
        const request: NavigateToBlackholeCommand = {
            name: 'blackhole1',
            password: 'password123',
        };

        (storage.blackholes.get as jest.Mock).mockResolvedValue(undefined);

        // Act && Assert
        await expect(commandHandler.handle(request)).rejects.toThrow('Blackhole \'blackhole1\' not found.');
        expect(storage.blackholes.get).toHaveBeenCalledWith({ name: request.name });
        expect(blackholeAccessor.open).toHaveBeenCalledTimes(0);
    });

    it('The blackhole should not be opened because the password is invalid', async () => {
        // Arrange
        const request: NavigateToBlackholeCommand = {
            name: 'blackhole1',
            password: 'password123',
        };

        const blackhole = {
            name: 'blackhole1',
            getPath: jest.fn().mockResolvedValue({ content: 'path', salt: 'salt', iv: 'iv' }),
        } as unknown as Blackhole;
        (storage.blackholes.get as jest.Mock).mockResolvedValue(blackhole);
        hashProvider.check.mockResolvedValue(false);

        // Act && Assert
        await expect(commandHandler.handle(request)).rejects.toThrow('Invalid password.');
        expect(storage.blackholes.get).toHaveBeenCalledWith({ name: request.name });
        expect(blackholeAccessor.open).toHaveBeenCalledTimes(0);
    });
});
