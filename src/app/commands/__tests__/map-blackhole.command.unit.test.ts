import { Blackhole } from '../../../domain/models';
import { EntityFactory } from '../../../infrastructure/data/abstractions';
import { Storage } from '../../../infrastructure/data/abstractions';
import { PathGenerator, BlackholeAccessor } from '../../../infrastructure/shared/utils/filesystem/abstractions';
import { MapBlackholeCommandHandler, MapBlackholeCommand } from '../map-blackhole.command';

jest.mock('../../../infrastructure/containers');

describe('MapBlackholeCommandHanlder', () => {
    let commandHandler: MapBlackholeCommandHandler;
    let storage: jest.Mocked<Storage>;
    let blackholeAccessor: jest.Mocked<BlackholeAccessor>;
    let pathGenerator: jest.Mocked<PathGenerator>;
    let blackholeEntityFactory: jest.Mocked<EntityFactory<Blackhole>>;

    beforeEach(() => {
        blackholeAccessor = {
            map: jest.fn(),
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
        commandHandler = new MapBlackholeCommandHandler(
            storage,
            blackholeAccessor,
            pathGenerator,
            blackholeEntityFactory,
        );
    });

    it('should create blackhole', async () => {
        // Arrange
        const request: MapBlackholeCommand = {
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
        expect(blackholeAccessor.map).toHaveBeenCalledWith({ ...request, path: 'path' }, request.password);
    });
});
