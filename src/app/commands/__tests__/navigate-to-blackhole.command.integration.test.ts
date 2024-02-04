import { rm, unlink } from 'fs/promises';
import path from 'path';

import execa from 'execa';

import { Storage } from '../../../infrastructure/data/abstractions';
import { BlackholeEntityService } from '../../../infrastructure/data/entities';
import { BlackholeEntityComparator } from '../../../infrastructure/data/entities/comparators';
import { BlackholeEntityFactory } from '../../../infrastructure/data/entities/factories';
import { JsonStorage } from '../../../infrastructure/data/json.storage';
import { CipherProvider, CryptoProvider, HashProvider } from '../../../infrastructure/shared/utils/crypto';
import { BlackholeAccessor, FileOperations } from '../../../infrastructure/shared/utils/filesystem';
import { path as basePath } from '../../../test-constants';

describe('NavigateToBlackholeCommandHandler', () => {
    const databasePath = path.join(basePath, 'data.json');
    const cryptoProvider = new CryptoProvider(new HashProvider(), new CipherProvider());
    const entityFactory = new BlackholeEntityFactory(cryptoProvider);
    const fileOperations = new FileOperations();
    const blackholeAccessor = new BlackholeAccessor(fileOperations, cryptoProvider);

    let blackholeDirectories: string[] = [];
    let storage: Storage;

    beforeEach(async () => {
        storage = await JsonStorage.create(
            fileOperations,
            {
                [BlackholeEntityService.name]: new BlackholeEntityService(
                    new BlackholeEntityComparator(),
                    entityFactory,
                ),
            },
            databasePath,
        );
    });

    afterEach(async () => {
        try {
            await unlink(databasePath);
        } catch (err) {
            // Ignore
        }

        for (const dir of blackholeDirectories) {
            try {
                await rm(dir, { recursive: true });
            } catch (err) {
                // Ignore
            }
        }

        blackholeDirectories = [];
    });

    it('should open a blackhole', async () => {
        // Arrange
        blackholeDirectories.push(path.join(basePath, 'blackhole1Source'));
        blackholeDirectories.push(path.join(basePath, 'blackhole1Destination'));

        const password = 'password123';
        const blackhole = await entityFactory.create(
            'blackhole1',
            blackholeDirectories[0],
            blackholeDirectories[1],
            password,
        );
        await storage.blackholes.add(blackhole);
        await blackholeAccessor.map(blackhole, password);
        await storage.save();

        // Act
        const result = await execa('yarn', ['start', 'go', 'blackhole1', 'password123']);

        expect(result.stderr).toBe('');
    });

    it('should not open the blackhole because of invalid password', async () => {
        // Arrange
        blackholeDirectories.push(path.join(basePath, 'blackhole1Source'));
        blackholeDirectories.push(path.join(basePath, 'blackhole1Destination'));

        const password = 'password123';
        const blackhole = await entityFactory.create(
            'blackhole1',
            blackholeDirectories[0],
            blackholeDirectories[1],
            'password123',
        );
        await storage.blackholes.add(blackhole);
        await blackholeAccessor.map(blackhole, password);
        await storage.save();

        // Act && Assert
        await expect(execa('yarn', ['start', 'go', 'blackhole1', 'password123777'])).rejects.toThrow(
            expect.objectContaining({ message: expect.stringContaining('Invalid password.') }),
        );
    });

    it('should not open the blackhole because it was not found', async () => {
        // Arrange
        blackholeDirectories.push(path.join(basePath, 'blackhole1Source'));
        blackholeDirectories.push(path.join(basePath, 'blackhole1Destination'));

        const password = 'password123';
        const blackhole = await entityFactory.create(
            'blackhole1',
            blackholeDirectories[0],
            blackholeDirectories[1],
            'password123',
        );
        await storage.blackholes.add(blackhole);
        await blackholeAccessor.map(blackhole, password);
        await storage.save();

        // Act
        await expect(execa('yarn', ['start', 'go', 'blackhole2', 'password123777'])).rejects.toThrow(
            expect.objectContaining({ message: expect.stringContaining(' not found.') }),
        );
    });
});
