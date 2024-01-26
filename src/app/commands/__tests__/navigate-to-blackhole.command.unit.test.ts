import { CryptoProvider } from '../../../domain/abstractions/crypto';
import { Blackhole } from '../../../domain/models';
import { Storage } from '../../../infrastructure/data/abstractions';
import { PrivateDirectoryAccessor } from '../../../infrastructure/shared/utils/filesystem';
import { NavigateToBlackholeCommand, NavigateToBlackholeCommandHandler } from '../navigate-to-blackhole.command';

describe('NavigateToBlackholeCommandHandler', () => {
    let commandHandler: NavigateToBlackholeCommandHandler;
    let storage: jest.Mocked<Storage>;
    let privateDirectoryAccessor: jest.Mocked<PrivateDirectoryAccessor>;
    let cryptoProvider: jest.Mocked<CryptoProvider>;

    beforeEach(() => {
        storage = {
            blackholes: {
                get: jest.fn(),
            },
        } as any;
        cryptoProvider = {} as any;
        privateDirectoryAccessor = {
            open: jest.fn(),
        } as any;
        commandHandler = new NavigateToBlackholeCommandHandler(storage, privateDirectoryAccessor, cryptoProvider);
    });

    it('should open the Blackhole', async () => {
        // Arrange
        const request: NavigateToBlackholeCommand = {
            name: 'blackhole1',
            password: 'password123',
        };

        const blackhole = { name: 'blackhole1', getPath: () => 'path', salt: 'salt' } as unknown as Blackhole;
        (storage.blackholes.get as jest.Mock).mockResolvedValue(blackhole);
        const getPath = jest.spyOn(blackhole, 'getPath');

        // Act
        await commandHandler.handle(request);

        // Assert
        expect(storage.blackholes.get).toHaveBeenCalledWith({ name: request.name });
        expect(getPath).toHaveBeenCalledWith(request.password, cryptoProvider);
        expect(privateDirectoryAccessor.open).toHaveBeenCalledWith(
            blackhole.name,
            'path',
            request.password,
            blackhole.salt,
        );
    });

    it('The blackhole should not be opened because the password is invalid', async () => {
        // Arrange
        const request: NavigateToBlackholeCommand = {
            name: 'blackhole1',
            password: 'password123',
        };

        const blackhole = { name: 'blackhole1', getPath: jest.fn(), salt: 'salt' } as unknown as Blackhole;
        (storage.blackholes.get as jest.Mock).mockResolvedValue(blackhole);
        (blackhole.getPath as jest.Mock).mockRejectedValue(new Error('Invalid password.'));

        // Act && Assert
        await expect(commandHandler.handle(request)).rejects.toThrow('Invalid password.');
        expect(storage.blackholes.get).toHaveBeenCalledWith({ name: request.name });
        expect(blackhole.getPath).toHaveBeenCalledWith(request.password, cryptoProvider);
        expect(privateDirectoryAccessor.open).toHaveBeenCalledTimes(0);
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
        expect(privateDirectoryAccessor.open).toHaveBeenCalledTimes(0);
    });
});
