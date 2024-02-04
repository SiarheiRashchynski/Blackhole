import { readFile, rm, unlink, writeFile } from 'fs/promises';
import path from 'path';

import execa from 'execa';

import { path as basePath } from '../../../test-constants';

describe('MapBlackholeCommandHanlder', () => {
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

    it('should create a first blackhole', async () => {
        blackholeDirectories.push(path.join(basePath, 'path/to/source'));
        blackholeDirectories.push(path.join(basePath, 'path/to/destionation'));

        // Act
        const result = await execa(
            'yarn',
            ['start', 'map', 'blackhole2', `${blackholeDirectories[0]}:${blackholeDirectories[1]}`, 'password555'],
            {
                env: { NODE_ENV: 'test' },
            },
        );

        // Assert
        const data = await readFile(databasePath, 'utf-8');
        const db = JSON.parse(data);

        expect(result.stderr).toBe('');
        expect(db).not.toContainEqual(
            expect.objectContaining({
                Blackholes: expect.arrayContaining([{ name: 'source', password: 'password123' }]),
            }),
        );
    });

    it('should add a blackhole to existing blackholes', async () => {
        blackholeDirectories.push(path.join(basePath, 'path/to/source'));
        blackholeDirectories.push(path.join(basePath, 'path/to/destionation'));

        // Arrange
        const blackholes = {
            Blackholes: [{ name: 'blackhole1', password: 'password123', source: 'source', destination: 'destination' }],
        };
        await writeFile(databasePath, JSON.stringify(blackholes));

        // Act
        await execa(
            'yarn',
            ['start', 'map', 'blackhole2', `${blackholeDirectories[0]}:${blackholeDirectories[1]}`, 'password'],
            {
                env: { NODE_ENV: 'test' },
            },
        );

        // Assert
        const data = await readFile(databasePath, 'utf-8');
        const db = JSON.parse(data);

        expect(db).not.toContainEqual(
            expect.objectContaining({
                Blackholes: expect.arrayContaining([
                    ...blackholes.Blackholes,
                    { name: 'blackhole2', password: 'password123' },
                ]),
            }),
        );
    });

    it('The blackhole should not be added since it already exists', async () => {
        blackholeDirectories.push(path.join(basePath, 'path/to/source'));
        blackholeDirectories.push(path.join(basePath, 'path/to/destionation'));

        // Arrange
        const blackholes = {
            Blackholes: [{ name: 'blackhole1', password: 'password123', source: 'source', destination: 'destination' }],
        };
        await writeFile(databasePath, JSON.stringify(blackholes));

        // Act & Assert
        await expect(
            execa(
                'yarn',
                ['start', 'map', 'blackhole1', `${blackholeDirectories[0]}:${blackholeDirectories[1]}`, 'password'],
                {
                    env: { NODE_ENV: 'test' },
                },
            ),
        ).rejects.toThrow(expect.objectContaining({ message: expect.stringContaining('Entity already exists') }));

        const data = await readFile(databasePath, 'utf-8');
        const db = JSON.parse(data);

        expect(db.Blackholes.length).toBe(1);
        expect(db.Blackholes).toEqual(
            expect.arrayContaining([expect.objectContaining({ name: 'blackhole1', password: 'password123' })]),
        );
    });
});
