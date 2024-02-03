import { R_OK } from 'constants';
import { access, readFile, rm, unlink } from 'fs/promises';
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

describe('RemoveBlackholeCommandHandler', () => {
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

    it('should remove a blackhole', async () => {
        // Arrange
        blackholeDirectories.push(path.join(basePath, 'blackhole1Path'));
        blackholeDirectories.push(path.join(basePath, 'blackhole2Path'));

        const password = 'password123';
        const blackhole1 = await entityFactory.create('blackhole1', password, blackholeDirectories[0]);
        const blackhole2 = await entityFactory.create('blackhole2', password, blackholeDirectories[1]);
        await storage.blackholes.add(blackhole1);
        await storage.blackholes.add(blackhole2);
        await blackholeAccessor.map(blackhole1, password);
        await blackholeAccessor.map(blackhole2, password);
        await storage.save();

        //Act
        await execa('yarn', ['start', 'remove', 'blackhole1', 'password123']);

        // Assert
        const data = await readFile(databasePath, 'utf-8');
        const db = JSON.parse(data);
        expect(db.Blackholes).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: blackhole1.name,
                    password: blackhole1.password,
                }),
            ]),
        );
        expect(db.Blackholes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: blackhole2.name,
                    password: blackhole2.password,
                }),
            ]),
        );

        await expect(access(blackholeDirectories[0], R_OK)).rejects.toThrow();
    });

    it('should not remove any blackhole since the password is incorret', async () => {
        // Arrange
        blackholeDirectories.push(path.join(basePath, 'blackhole1Path'));
        blackholeDirectories.push(path.join(basePath, 'blackhole2Path'));

        const password = 'password123';
        const blackhole1 = await entityFactory.create('blackhole1', password, blackholeDirectories[0]);
        const blackhole2 = await entityFactory.create('blackhole2', password, blackholeDirectories[1]);
        await storage.blackholes.add(blackhole1);
        await storage.blackholes.add(blackhole2);
        await blackholeAccessor.map(blackhole1, password);
        await blackholeAccessor.map(blackhole2, password);
        await storage.save();

        // Act && Assert
        const data = await readFile(databasePath, 'utf-8');
        const db = JSON.parse(data);

        await expect(
            execa('yarn', ['start', 'remove', 'blackhole1', 'password123777'], {
                env: { NODE_ENV: 'test' },
            }),
        ).rejects.toThrow(expect.objectContaining({ message: expect.stringContaining('Invalid password.') }));

        expect(db.Blackholes.length).toBe(2);
        expect(db.Blackholes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: blackhole1.name,
                    password: blackhole1.password,
                }),
                expect.objectContaining({
                    name: blackhole2.name,
                    password: blackhole2.password,
                }),
            ]),
        );

        await expect(access(blackholeDirectories[0], R_OK)).resolves.toBeUndefined();
        await expect(access(blackholeDirectories[1], R_OK)).resolves.toBeUndefined();
    });

    it('should not remove any blackhole since the entity was not found', async () => {
        // Arrange
        blackholeDirectories.push(path.join(basePath, 'blackhole1Path'));
        blackholeDirectories.push(path.join(basePath, 'blackhole2Path'));

        const password = 'password123';
        const blackhole1 = await entityFactory.create('blackhole1', password, blackholeDirectories[0]);
        const blackhole2 = await entityFactory.create('blackhole2', password, blackholeDirectories[1]);
        await storage.blackholes.add(blackhole1);
        await storage.blackholes.add(blackhole2);
        await blackholeAccessor.map(blackhole1, password);
        await blackholeAccessor.map(blackhole2, password);
        await storage.save();

        // Act && Assert
        const data = await readFile(databasePath, 'utf-8');
        const db = JSON.parse(data);

        await expect(
            execa('yarn', ['start', 'remove', 'blackhole123', 'password123'], {
                env: { NODE_ENV: 'test' },
            }),
        ).rejects.toThrow(expect.objectContaining({ message: expect.stringContaining('Blackhole not found') }));

        expect(db.Blackholes.length).toBe(2);
        expect(db.Blackholes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: blackhole1.name,
                    password: blackhole1.password,
                }),
                expect.objectContaining({
                    name: blackhole2.name,
                    password: blackhole2.password,
                }),
            ]),
        );

        await expect(access(blackholeDirectories[0], R_OK)).resolves.toBeUndefined();
        await expect(access(blackholeDirectories[1], R_OK)).resolves.toBeUndefined();
    });
});
