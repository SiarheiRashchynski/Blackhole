import { CryptoProvider } from '../../../domain/abstractions/crypto';
import { Storage } from '../../../infrastructure/data/abstractions';
import { BlackholeAccessor } from '../../../infrastructure/shared/utils/filesystem/abstractions';
import { RemoveBlackholeCommandHandler, RemoveBlackholeCommand } from '../remove-blackhole.command';

jest.mock('../../../infrastructure/containers');

describe('RemoveBlackholeCommandHandler', () => {
    let commandHandler: RemoveBlackholeCommandHandler;
    let storage: jest.Mocked<Storage>;
    let cryptoProvider: jest.Mocked<CryptoProvider>;
    let blackholeAccessor: jest.Mocked<BlackholeAccessor>;
    const blackhole = {
        name: 'blackhole1',
        password: 'password123',
        path: 'path',
    };

    beforeEach(() => {
        blackholeAccessor = {
            delete: jest.fn(),
        } as any;
        cryptoProvider = {
            check: jest.fn(),
        } as any;
        storage = {
            save: jest.fn(),
            blackholes: {
                delete: jest.fn(),
                get: jest.fn().mockResolvedValue(blackhole),
                save: jest.fn(),
            },
        } as any;

        commandHandler = new RemoveBlackholeCommandHandler(storage, cryptoProvider, blackholeAccessor);
    });

    it('should remove the blackhole', async () => {
        // Arrange
        const request: RemoveBlackholeCommand = {
            name: 'blackhole1',
            password: 'password123',
        };
        cryptoProvider.check.mockResolvedValue(true);

        // Act
        await commandHandler.handle(request);

        // Assert
        expect(storage.blackholes.get).toHaveBeenCalledWith({ name: request.name });
        expect(cryptoProvider.check).toHaveBeenCalledWith(request.password, 'password123');
        expect(storage.blackholes.delete).toHaveBeenCalledWith(expect.objectContaining({ name: request.name }));
        expect(storage.save).toHaveBeenCalled();
        expect(blackholeAccessor.delete).toHaveBeenCalledWith(blackhole, request.password);
    });

    it('the blackhole should not be removed because the password is invalid', async () => {
        // Arrange
        const request: RemoveBlackholeCommand = {
            name: 'blackhole1',
            password: 'password123',
        };
        cryptoProvider.check.mockResolvedValue(false);

        // Act && Assert
        await expect(commandHandler.handle(request)).rejects.toThrow('Invalid password.');
        expect(storage.blackholes.get).toHaveBeenCalledWith({ name: request.name });
        expect(cryptoProvider.check).toHaveBeenCalledWith(request.password, 'password123');
        expect(storage.blackholes.delete).toHaveBeenCalledTimes(0);
        expect(storage.save).toHaveBeenCalledTimes(0);
    });

    it('the blackhole should not be removed because it is not found', async () => {
        // Arrange
        const request: RemoveBlackholeCommand = {
            name: 'blackhole1',
            password: 'password123',
        };

        (storage.blackholes.get as jest.Mock).mockRejectedValue(new Error('Not found.'));

        // Act && Assert
        await expect(commandHandler.handle(request)).rejects.toThrow('Not found.');
        expect(storage.blackholes.get).toHaveBeenCalledWith({ name: request.name });
        expect(cryptoProvider.check).toHaveBeenCalledTimes(0);
        expect(storage.blackholes.delete).toHaveBeenCalledTimes(0);
        expect(storage.save).toHaveBeenCalledTimes(0);
    });
});
