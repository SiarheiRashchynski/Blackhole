import { readFile, rm, unlink } from 'fs/promises';
import path from 'path';

import execa from 'execa';
import { container } from 'tsyringe';

import { Wormhole } from '../../../domain/models';
import { WormholeRegistry } from '../../../infrastructure/data/wormhole-registry';
import { path as basePath } from '../../../test-constants';

describe('FormWormholeCommand', () => {
    const databasePath = path.join(basePath, 'wormhole.json');
    let wormholeRegistry: WormholeRegistry;
    let wormholeDirectories: string[] = [];

    beforeEach(() => {
        wormholeRegistry = container.resolve(WormholeRegistry);
    });

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
        const existingWormhole = new Wormhole({
            stellarCode: 'stellarCode1',
            eventHorizon: 'eventHorizon1',
            singularity: 'singularity1',
        });
        await wormholeRegistry.save(existingWormhole, 'password123');

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
        const wormhole = (await wormholeRegistry.load('wormhole2', 'password'))!;

        expect(db).toHaveLength(2);
        expect(wormhole).toBeDefined();
        expect(wormhole.stellarCode).toBe('wormhole2');
        expect(wormhole.eventHorizon).toBe(wormholeDirectories[0]);
        expect(wormhole.singularity).toBe(wormholeDirectories[1]);
    });

    it('The wormhole should not be added since it already exists', async () => {
        wormholeDirectories.push(path.join(basePath, 'path/to/source'));
        wormholeDirectories.push(path.join(basePath, 'path/to/destionation'));

        // Arrange
        const existingWormhole = new Wormhole({
            stellarCode: 'stellarCode1',
            eventHorizon: 'eventHorizon1',
            singularity: 'singularity1',
        });
        await wormholeRegistry.save(existingWormhole, 'password');

        // Act & Assert
        await expect(
            execa(
                'yarn',
                ['start', 'form', 'stellarCode1', `${wormholeDirectories[0]}:${wormholeDirectories[1]}`, 'password'],
                {
                    env: { NODE_ENV: 'test' },
                },
            ),
        ).rejects.toThrow(
            expect.objectContaining({ message: expect.stringContaining('Wormhole with the same key already exists') }),
        );

        const data = await readFile(databasePath, 'utf-8');
        const db = JSON.parse(data);
        expect(db.length).toBe(1);
    });
});
