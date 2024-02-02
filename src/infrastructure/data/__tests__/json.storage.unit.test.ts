import { Blackhole } from '../../../domain/models';
import { FileOperations } from '../../shared/utils/filesystem';
import { EntityService } from '../abstractions';
import { EntityFactory } from '../abstractions/entity-factory';
import { JsonStorage } from '../json.storage';

class BlackholeEntityService {
    public entityName: string = 'Blackholes';

    public factory: EntityFactory<Blackhole> = {
        create: jest.fn((i) => i),
        fromPersistence: jest.fn((i) => i),
        toPersistence: jest.fn((i) => i),
    } as any;

    public comparator = {
        areEqual: jest.fn((a, b) => a.name === b.name),
    } as any;
}

describe('Storage', () => {
    const path = './data.json';
    let fileOperations: jest.Mocked<FileOperations>;
    let storage: JsonStorage;
    let EntityServices: jest.Mocked<Record<string, EntityService<unknown>>>;

    beforeEach(async () => {
        EntityServices = { BlackholeEntityService: new BlackholeEntityService() };
        fileOperations = {
            read: jest.fn(),
            write: jest.fn(),
        } as any;
    });

    it('should write the first blackhole to the file', async () => {
        // Arrange
        const blackhole = EntityServices.BlackholeEntityService.factory.fromPersistence({
            name: 'blackhole1',
            path: '/path/to/blackhole',
            password: 'password123',
            salt: 'salt',
        }) as Blackhole;

        fileOperations.read.mockResolvedValue(JSON.stringify([]));
        storage = await JsonStorage.create(fileOperations, EntityServices, path);

        // Act
        await storage.blackholes.add(blackhole);
        await storage.save();

        // Assert
        expect(fileOperations.read).toHaveBeenCalledWith(path);
        expect(fileOperations.write).toHaveBeenCalledWith(
            path,
            Buffer.from(
                JSON.stringify({
                    Blackholes: [EntityServices.BlackholeEntityService.factory.toPersistence(blackhole)],
                }),
            ),
        );
    });

    it('should add the blackhole to the file', async () => {
        // Arrange
        const blackhole = EntityServices.BlackholeEntityService.factory.fromPersistence({
            name: 'blackhole2',
            path: '/path/to/blackhole2',
            password: '123password',
            salt: 'salt',
        }) as Blackhole;
        const existingBlackhole = EntityServices.BlackholeEntityService.factory.fromPersistence({
            name: 'blackhole1',
            path: '/path/to/blackhole1',
            password: 'password123',
            salt: 'salt',
        }) as Blackhole;
        fileOperations.read.mockResolvedValue(
            JSON.stringify({
                Blackholes: [EntityServices.BlackholeEntityService.factory.toPersistence(existingBlackhole)],
            }),
        );
        storage = await JsonStorage.create(fileOperations, EntityServices);

        // Act
        await storage.blackholes.add(blackhole);
        await storage.save();

        // Assert
        expect(fileOperations.read).toHaveBeenCalledWith(path);
        expect(fileOperations.write).toHaveBeenCalledWith(
            path,
            Buffer.from(
                JSON.stringify({
                    Blackholes: [
                        EntityServices.BlackholeEntityService.factory.toPersistence(existingBlackhole),
                        EntityServices.BlackholeEntityService.factory.toPersistence(blackhole),
                    ],
                }),
            ),
        );
    });

    it('should get the blackhole', async () => {
        // Arrange
        const existingBlackhole = EntityServices.BlackholeEntityService.factory.fromPersistence({
            name: 'blackhole1',
            path: '/path/to/blackhole1',
            password: 'password123',
            salt: 'salt',
        }) as Blackhole;

        fileOperations.read.mockResolvedValue(
            JSON.stringify({
                Blackholes: [EntityServices.BlackholeEntityService.factory.toPersistence(existingBlackhole)],
            }),
        );
        storage = await JsonStorage.create(fileOperations, EntityServices);

        // Act
        const data = await storage.blackholes.get({ name: existingBlackhole.name } as Blackhole);

        // Assert
        expect(EntityServices.BlackholeEntityService.factory.toPersistence(data!)).toEqual(
            EntityServices.BlackholeEntityService.factory.toPersistence(existingBlackhole),
        );
        expect(fileOperations.read).toHaveBeenCalledWith(path);
    });

    it('should update blackhole', async () => {
        // Arrange
        const existingBlackhole = EntityServices.BlackholeEntityService.factory.fromPersistence({
            name: 'blackhole1',
            path: '/path/to/blackhole1',
            password: 'password123',
            salt: 'salt',
        }) as Blackhole;

        const newBlackhole = EntityServices.BlackholeEntityService.factory.fromPersistence({
            name: existingBlackhole.name,
            path: '/new/path',
            password: existingBlackhole.password,
            salt: existingBlackhole.salt,
        }) as Blackhole;

        fileOperations.read.mockResolvedValue(
            JSON.stringify({
                Blackholes: [EntityServices.BlackholeEntityService.factory.toPersistence(existingBlackhole)],
            }),
        );
        storage = await JsonStorage.create(fileOperations, EntityServices);

        // Act
        await storage.blackholes.update({ name: existingBlackhole.name } as Blackhole, newBlackhole);
        await storage.save();

        // Assert
        expect(fileOperations.read).toHaveBeenCalledWith(path);
        expect(fileOperations.write).toHaveBeenCalledWith(
            path,
            Buffer.from(
                JSON.stringify({
                    Blackholes: [EntityServices.BlackholeEntityService.factory.toPersistence(newBlackhole)],
                }),
            ),
        );
    });

    it('should delete data', async () => {
        // Arrange
        const existingBlackholes = [
            EntityServices.BlackholeEntityService.factory.fromPersistence({
                name: 'blackhole1',
                path: '/path/to/blackhole1',
                password: 'password123',
                salt: 'salt',
            }),
            EntityServices.BlackholeEntityService.factory.fromPersistence({
                name: 'blackhole2',
                path: '/path/to/blackhole2',
                password: '123password',
                salt: 'salt',
            }),
        ] as Blackhole[];

        fileOperations.read.mockResolvedValue(
            JSON.stringify({
                Blackholes: [
                    ...existingBlackholes.map((b) => EntityServices.BlackholeEntityService.factory.toPersistence(b)),
                ],
            }),
        );
        storage = await JsonStorage.create(fileOperations, EntityServices);

        // Act
        storage.blackholes.delete({ name: existingBlackholes[0].name } as Blackhole);
        await storage.save();

        // Assert
        expect(fileOperations.read).toHaveBeenCalledWith(path);
        expect(fileOperations.write).toHaveBeenCalledWith(
            path,
            Buffer.from(
                JSON.stringify({
                    Blackholes: [EntityServices.BlackholeEntityService.factory.toPersistence(existingBlackholes[1])],
                }),
            ),
        );
    });
});
