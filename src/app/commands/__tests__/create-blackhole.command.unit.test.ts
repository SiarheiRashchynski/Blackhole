import { CryptoProvider } from '../../../domain/abstractions/crypto';
import { Blackhole } from '../../../domain/models';
import { Storage } from '../../../infrastructure/data/abstractions';
import { PathGenerator, PrivateDirectoryAccessor } from '../../../infrastructure/shared/utils/filesystem/abstractions';
import { CreateBlackholeCommandHandler, CreateBlackholeCommand } from '../create-blackhole.command';

describe('CreateBlackholeCommandHandler', () => {
    let commandHandler: CreateBlackholeCommandHandler;
    let storage: jest.Mocked<Storage>;
    let cryptoProvider: jest.Mocked<CryptoProvider>;
    let privateDirectoryAccessor: jest.Mocked<PrivateDirectoryAccessor>;
    let pathGenerator: jest.Mocked<PathGenerator>;

    beforeEach(() => {
        cryptoProvider = {} as any;
        privateDirectoryAccessor = {
            create: jest.fn(),
        } as any;
        pathGenerator = {
            generatePath: jest.fn(),
        } as any;
        storage = {
            blackholes: {
                add: jest.fn(),
            },
            save: jest.fn(),
        } as any;
        commandHandler = new CreateBlackholeCommandHandler(storage, cryptoProvider, privateDirectoryAccessor, pathGenerator);
    });

    it('should create blackhole', async () => {
        // Arrange
        const request: CreateBlackholeCommand = {
            name: 'blackhole1',
            password: 'password123',
        };

        const blackhole = { name: 'blackhole' } as unknown as Blackhole;
        const blackholeCreate = jest.spyOn(Blackhole, 'create').mockImplementation(() => Promise.resolve(blackhole));

        pathGenerator.generatePath.mockResolvedValue('path');

        // Act
        await commandHandler.handle(request);

        // Assert
        expect(pathGenerator.generatePath).toHaveBeenCalled();
        expect(blackholeCreate).toHaveBeenCalledWith(request.name, 'path', request.password, cryptoProvider);
        expect(storage.blackholes.add).toHaveBeenCalledWith(blackhole);
        expect(storage.save).toHaveBeenCalled();
        expect(privateDirectoryAccessor.create).toHaveBeenCalledWith('path');
    });
});
