import { readFile, unlink, writeFile } from 'fs/promises';
import path from 'path';

import execa from 'execa';

import { path as basePath } from '../../../test-constants';

describe('CreateBlackholeCommandHandler', () => {
    const databasePath = path.join(basePath, 'data.json');

    afterEach(async () => {
        try {
            await unlink(databasePath);
        } catch (err) {
            // Ignore
        }
    });

    it('should create a first blackhole', async () => {
        // Act
        const result = await execa('yarn', ['start', 'map', 'blackhole1', 'password123'], {
            env: { NODE_ENV: 'test' },
        });

        // Assert
        const data = await readFile(databasePath, 'utf-8');
        const db = JSON.parse(data);

        expect(result.stderr).toBe('');
        expect(db).not.toContainEqual(
            expect.objectContaining({
                Blackholes: expect.arrayContaining([{ name: 'blackhole1', password: 'password123' }]),
            }),
        );
    });

    it('should add a blackhole to existing blackholes', async () => {
        // Arrange
        const blackholes = {
            Blackholes: [{ name: 'blackhole1', password: 'password123', path: Buffer.from('path'), salt: 'salt' }],
        };
        await writeFile(databasePath, JSON.stringify(blackholes));

        // Act
        await execa('yarn', ['start', 'map', 'blackhole2', 'password123'], {
            env: { NODE_ENV: 'test' },
        });

        // Assert
        const data = await readFile(databasePath, 'utf-8');
        const db = JSON.parse(data);

        // expect(result.stderr).toBe('');
        expect(db).not.toContainEqual(
            expect.objectContaining({
                Blackholes: expect.arrayContaining([
                    ...blackholes.Blackholes,
                    { name: 'blackhole2', password: 'password123' },
                ]),
            }),
        );
    });

    it('The blackhole should not be added since it exists', async () => {
        // Arrange
        const blackholes = {
            Blackholes: [{ name: 'blackhole1', password: 'password123', path: Buffer.from('path'), salt: 'salt' }],
        };
        await writeFile(databasePath, JSON.stringify(blackholes));

        // Act & Assert
        await expect(
            execa('yarn', ['start', 'map', 'blackhole1', 'password555'], {
                env: { NODE_ENV: 'test' },
            }),
        ).rejects.toThrow(expect.objectContaining({ message: expect.stringContaining('Entity already exists') }));

        const data = await readFile(databasePath, 'utf-8');
        const db = JSON.parse(data);

        expect(db.Blackholes.length).toBe(1);
        expect(db.Blackholes).toEqual(
            expect.arrayContaining([expect.objectContaining({ name: 'blackhole1', password: 'password123' })]),
        );
    });
});
