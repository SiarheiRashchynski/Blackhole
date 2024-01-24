import { Blackhole } from '../../../domain/models';
import { FileOperations } from '../../shared/utils/filesystem';
import { JsonStorage } from '../json.storage';

describe('Storage', () => {
    const path = './data.json';
    let fileOperations: jest.Mocked<FileOperations>;
    let storage: JsonStorage;

    beforeEach(async () => {
        fileOperations = {
            read: jest.fn(),
            write: jest.fn(),
        } as any;
    });

    it('should write the first blackhole to the file', async () => {
        // Arrange
        const blackhole = Blackhole.fromPersistence({
            name: 'blackhole1',
            path:  Buffer.from('/path/to/blackhole'),
            password: 'password123',
            salt: 'salt',
        });

        fileOperations.read.mockResolvedValue(JSON.stringify([]));
        storage = await JsonStorage.create(fileOperations);

        // Act
        storage.blackholes.add(blackhole);
        await storage.save();

        // Assert
        expect(fileOperations.read).toHaveBeenCalledWith(path);
        expect(fileOperations.write).toHaveBeenCalledWith(
            path,
            Buffer.from(
                JSON.stringify({
                    Blackhole: [blackhole.toPersistence()],
                }),
            ),
        );
    });

    it('should add the blackhole to the file', async () => {
        // Arrange
        const blackhole = Blackhole.fromPersistence({
            name: 'blackhole2',
            path: '/path/to/blackhole2',
            password: '123password',
            salt: 'salt',
        });
        const existingBlackhole = Blackhole.fromPersistence({
            name: 'blackhole1',
            path: '/path/to/blackhole1',
            password: 'password123',
            salt: 'salt',
        });
        fileOperations.read.mockResolvedValue(JSON.stringify({ Blackhole: [existingBlackhole.toPersistence()] }));
        storage = await JsonStorage.create(fileOperations);

        // Act
        storage.blackholes.add(blackhole);
        await storage.save();

        // Assert
        expect(fileOperations.read).toHaveBeenCalledWith(path);
        expect(fileOperations.write).toHaveBeenCalledWith(
            path,
            Buffer.from(JSON.stringify({ Blackhole: [existingBlackhole.toPersistence(), blackhole.toPersistence()] })),
        );
    });

    it('should get the blackhole', async () => {
        // Arrange
        const existingBlackhole = Blackhole.fromPersistence({
            name: 'blackhole1',
            path: '/path/to/blackhole1',
            password: 'password123',
            salt: 'salt',
        });

        fileOperations.read.mockResolvedValue(JSON.stringify({ Blackhole: [existingBlackhole.toPersistence()] }));
        storage = await JsonStorage.create(fileOperations);

        // Act
        const data = await storage.blackholes.get({ name: existingBlackhole.name } as Blackhole);

        // Assert
        expect(data!.toPersistence()).toEqual(existingBlackhole.toPersistence());
        expect(fileOperations.read).toHaveBeenCalledWith(path);
    });

    it('should update blackhole', async () => {
        // Arrange
        const existingBlackhole = Blackhole.fromPersistence({
            name: 'blackhole1',
            path: '/path/to/blackhole1',
            password: 'password123',
            salt: 'salt',
        });

        const newBlackhole = Blackhole.fromPersistence({
            name: existingBlackhole.name,
            path: '/new/path',
            password: existingBlackhole.password,
            salt: existingBlackhole.salt,
        });

        fileOperations.read.mockResolvedValue(JSON.stringify({ Blackhole: [existingBlackhole.toPersistence()] }));
        storage = await JsonStorage.create(fileOperations);

        // Act
        storage.blackholes.update({ name: existingBlackhole.name } as Blackhole, newBlackhole);
        await storage.save();

        // Assert
        expect(fileOperations.read).toHaveBeenCalledWith(path);
        expect(fileOperations.write).toHaveBeenCalledWith(
            path,
            Buffer.from(
                JSON.stringify({
                    Blackhole: [newBlackhole.toPersistence()],
                }),
            ),
        );
    });

    it('should delete data', async () => {
        // Arrange
        const existingBlackholes = [
            Blackhole.fromPersistence({
                name: 'blackhole1',
                path: '/path/to/blackhole1',
                password: 'password123',
                salt: 'salt',
            }),
            Blackhole.fromPersistence({
                name: 'blackhole2',
                path: '/path/to/blackhole2',
                password: '123password',
                salt: 'salt',
            }),
        ];

        fileOperations.read.mockResolvedValue(
            JSON.stringify({
                Blackhole: [...existingBlackholes.map((b) => b.toPersistence())],
            }),
        );
        storage = await JsonStorage.create(fileOperations);

        // Act
        storage.blackholes.delete({ name: existingBlackholes[0].name } as Blackhole);
        await storage.save();

        // Assert
        expect(fileOperations.read).toHaveBeenCalledWith(path);
        expect(fileOperations.write).toHaveBeenCalledWith(
            path,
            Buffer.from(
                JSON.stringify({
                    Blackhole: [existingBlackholes[1].toPersistence()],
                }),
            ),
        );
    });
});
