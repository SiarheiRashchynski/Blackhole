import { Blackhole } from '../../../domain/models';
import { EntityFactory } from '../../../infrastructure/data/abstractions';
import { Storage } from '../../../infrastructure/data/abstractions';
import { PathGenerator, PrivateDirectoryAccessor } from '../../../infrastructure/shared/utils/filesystem/abstractions';
import { CreateBlackholeCommandHandler, CreateBlackholeCommand } from '../create-blackhole.command';

jest.mock('../../../infrastructure/containers');

describe('CreateBlackholeCommandHandler', () => {
    let commandHandler: CreateBlackholeCommandHandler;
    let storage: jest.Mocked<Storage>;
    let privateDirectoryAccessor: jest.Mocked<PrivateDirectoryAccessor>;
    let pathGenerator: jest.Mocked<PathGenerator>;
    let blackholeEntityFactory: jest.Mocked<EntityFactory<Blackhole>>;

    beforeEach(() => {
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
        blackholeEntityFactory = {
            create: jest.fn((name, password, path) => ({ name, password, path })),
        } as any;
        commandHandler = new CreateBlackholeCommandHandler(
            storage,
            privateDirectoryAccessor,
            pathGenerator,
            blackholeEntityFactory,
        );
    });

    it('should create blackhole', async () => {
        // Arrange
        const request: CreateBlackholeCommand = {
            name: 'blackhole1',
            password: 'password123',
        };

        pathGenerator.generatePath.mockResolvedValue('path');

        // Act
        await commandHandler.handle(request);

        // Assert
        expect(pathGenerator.generatePath).toHaveBeenCalled();
        expect(blackholeEntityFactory.create).toHaveBeenCalledWith(request.name, request.password, 'path');
        expect(storage.blackholes.add).toHaveBeenCalledWith({ ...request, path: 'path' });
        expect(storage.save).toHaveBeenCalled();
        expect(privateDirectoryAccessor.create).toHaveBeenCalledWith('path');
    });
});
