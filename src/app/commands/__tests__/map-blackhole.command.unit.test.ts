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
            create: jest.fn((name, source, destination, password) => ({ name, password, source, destination })),
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
            sourceDestination: 'source',
        };
        const source = 'source';
        const dest = 'generated-dest';
        pathGenerator.generatePath.mockResolvedValue(dest);

        // Act
        await commandHandler.handle(request);

        // Assert
        const expectedBlackhole = { name: request.name, password: request.password, source: source, destination: dest };
        expect(pathGenerator.generatePath).toHaveBeenCalled();
        expect(blackholeEntityFactory.create).toHaveBeenCalledWith(request.name, source, dest, request.password);
        expect(storage.blackholes.add).toHaveBeenCalledWith(expectedBlackhole);
        expect(storage.save).toHaveBeenCalled();
        expect(blackholeAccessor.map).toHaveBeenCalledWith(expectedBlackhole, request.password);
    });

    it('should create blackhole with the specified destination', async () => {
        // Arrange
        const request: MapBlackholeCommand = {
            name: 'blackhole1',
            password: 'password123',
            sourceDestination: 'source:dest',
        };
        const source = 'source';
        const dest = 'dest';

        // Act
        await commandHandler.handle(request);

        // Assert
        const expectedBlackhole = { name: request.name, password: request.password, source: source, destination: dest };
        expect(pathGenerator.generatePath).toHaveBeenCalledTimes(0);
        expect(blackholeEntityFactory.create).toHaveBeenCalledWith(request.name, source, dest, request.password);
        expect(storage.blackholes.add).toHaveBeenCalledWith(expectedBlackhole);
        expect(storage.save).toHaveBeenCalled();
        expect(blackholeAccessor.map).toHaveBeenCalledWith(expectedBlackhole, request.password);
    });
});
