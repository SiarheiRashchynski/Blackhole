import { R_OK } from 'constants';
import { access, mkdir, readFile, rm, unlink, writeFile } from 'fs/promises';
import path from 'path';

import execa from 'execa';

import { path as basePath } from '../../../jest.setup.integration';

describe('RemoveBlackholeCommandHandler', () => {
    const databasePath = path.join(basePath, 'data.json');
    let blackholeDirectories: string[] = [];

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
        const blackholes = {
            Blackhole: [
                {
                    name: 'blackhole1',
                    password: 'password123',
                    path: Buffer.from(blackholeDirectories[0]),
                    salt: 'salt',
                },
                {
                    name: 'blackhole2',
                    password: 'password123',
                    path: Buffer.from(blackholeDirectories[1]),
                    salt: 'salt',
                },
            ],
        };
        await mkdir(blackholeDirectories[0]);
        await mkdir(blackholeDirectories[1]);
        await writeFile(databasePath, JSON.stringify(blackholes));

        //Act
        await execa('yarn', ['start', 'remove', 'blackhole1', 'password123']);

        // Assert
        const data = await readFile(databasePath, 'utf-8');
        const db = JSON.parse(data);
        expect(db.Blackhole).not.toEqual(expect.arrayContaining([blackholes.Blackhole[0]]));
        expect(db.Blackhole).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: blackholes.Blackhole[1].name,
                    password: blackholes.Blackhole[1].password,
                }),
            ]),
        );

        await expect(access(blackholeDirectories[0], R_OK)).rejects.toThrow();
    });

    it('should not remove any blackhole since the password is incorret', async () => {
        // Arrange
        blackholeDirectories.push(path.join(basePath, 'blackhole1Path'));
        blackholeDirectories.push(path.join(basePath, 'blackhole2Path'));
        const blackholes = {
            Blackhole: [
                {
                    name: 'blackhole1',
                    password: 'password123',
                    path: Buffer.from(blackholeDirectories[0]),
                    salt: 'salt',
                },
                {
                    name: 'blackhole2',
                    password: 'password123',
                    path: Buffer.from(blackholeDirectories[1]),
                    salt: 'salt',
                },
            ],
        };
        await mkdir(blackholeDirectories[0]);
        await mkdir(blackholeDirectories[1]);
        await writeFile(databasePath, JSON.stringify(blackholes));

        // Act && Assert
        const data = await readFile(databasePath, 'utf-8');
        const db = JSON.parse(data);

        await expect(
            execa('yarn', ['start', 'remove', 'blackhole1', 'password123777'], {
                env: { NODE_ENV: 'test' },
            }),
        ).rejects.toThrow(expect.objectContaining({ message: expect.stringContaining('Invalid password.') }));

        expect(db.Blackhole.length).toBe(2);
        expect(db.Blackhole).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: blackholes.Blackhole[0].name,
                    password: blackholes.Blackhole[0].password,
                }),
                expect.objectContaining({
                    name: blackholes.Blackhole[1].name,
                    password: blackholes.Blackhole[1].password,
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
        const blackholes = {
            Blackhole: [
                {
                    name: 'blackhole1',
                    password: 'password123',
                    path: Buffer.from(blackholeDirectories[0]),
                    salt: 'salt',
                },
                {
                    name: 'blackhole2',
                    password: 'password123',
                    path: Buffer.from(blackholeDirectories[1]),
                    salt: 'salt',
                },
            ],
        };
        await mkdir(blackholeDirectories[0]);
        await mkdir(blackholeDirectories[1]);
        await writeFile(databasePath, JSON.stringify(blackholes));

        // Act && Assert
        const data = await readFile(databasePath, 'utf-8');
        const db = JSON.parse(data);

        await expect(
            execa('yarn', ['start', 'remove', 'blackhole123', 'password123'], {
                env: { NODE_ENV: 'test' },
            }),
        ).rejects.toThrow(expect.objectContaining({ message: expect.stringContaining('Blackhole not found') }));

        expect(db.Blackhole.length).toBe(2);
        expect(db.Blackhole).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: blackholes.Blackhole[0].name,
                    password: blackholes.Blackhole[0].password,
                }),
                expect.objectContaining({
                    name: blackholes.Blackhole[1].name,
                    password: blackholes.Blackhole[1].password,
                }),
            ]),
        );

        await expect(access(blackholeDirectories[0], R_OK)).resolves.toBeUndefined();
        await expect(access(blackholeDirectories[1], R_OK)).resolves.toBeUndefined();
    });
});
