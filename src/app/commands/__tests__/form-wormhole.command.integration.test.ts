import { readFile, rm, unlink, writeFile } from 'fs/promises';
import path from 'path';

import execa from 'execa';

import { path as basePath } from '../../../test-constants';

describe('FormWormholeCommand', () => {
    const databasePath = path.join(basePath, 'wormhole.json');
    let wormholeDirectories: string[] = [];

    afterEach(async () => {
        try {
            await unlink(databasePath);
        } catch (err) {
            // Ignore
        }

        for (const dir of wormholeDirectories) {
            try {
                await rm(dir, { recursive: true });
            } catch (err) {
                // Ignore
            }
        }

        wormholeDirectories = [];
    });

    it('should create a first wormhole', async () => {
        wormholeDirectories.push(path.join(basePath, 'path/to/source'));
        wormholeDirectories.push(path.join(basePath, 'path/to/destionation'));

        // Act
        const result = await execa(
            'yarn',
            ['start', 'form', 'wormhole1', `${wormholeDirectories[0]}:${wormholeDirectories[1]}`, 'password555'],
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

    it('should add a wormhole to existing wormholes', async () => {
        wormholeDirectories.push(path.join(basePath, 'path/to/source'));
        wormholeDirectories.push(path.join(basePath, 'path/to/destionation'));

        // Arrange
        const wormholes = {
            Blackholes: [{ name: 'wormhole1', password: 'password123', source: 'source', destination: 'destination' }],
        };
        await writeFile(databasePath, JSON.stringify(wormholes));

        // Act
        await execa(
            'yarn',
            ['start', 'form', 'wormhole2', `${wormholeDirectories[0]}:${wormholeDirectories[1]}`, 'password'],
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
                    ...wormholes.Blackholes,
                    { name: 'wormhole2', password: 'password123' },
                ]),
            }),
        );
    });

    it('The wormhole should not be added since it already exists', async () => {
        wormholeDirectories.push(path.join(basePath, 'path/to/source'));
        wormholeDirectories.push(path.join(basePath, 'path/to/destionation'));

        // Arrange
        const wormholes = {
            Blackholes: [{ name: 'wormhole1', password: 'password123', source: 'source', destination: 'destination' }],
        };
        await writeFile(databasePath, JSON.stringify(wormholes));

        // Act & Assert
        await expect(
            execa(
                'yarn',
                ['start', 'form', 'wormhole1', `${wormholeDirectories[0]}:${wormholeDirectories[1]}`, 'password'],
                {
                    env: { NODE_ENV: 'test' },
                },
            ),
        ).rejects.toThrow(expect.objectContaining({ message: expect.stringContaining('Entity already exists') }));

        const data = await readFile(databasePath, 'utf-8');
        const db = JSON.parse(data);

        expect(db.Blackholes.length).toBe(1);
        expect(db.Blackholes).toEqual(
            expect.arrayContaining([expect.objectContaining({ name: 'wormhole1', password: 'password123' })]),
        );
    });
});
