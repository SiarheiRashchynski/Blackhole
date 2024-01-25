import { readFile, unlink, writeFile } from 'fs/promises';
import path from 'path';

import execa from 'execa';

import { path as basePath } from '../../../jest.setup.integration';

describe('CreateBlackholeCommandHandler', () => {
    const databasePath = path.join(basePath, 'data.json');

    beforeEach(async () => {
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
                Blackhole: expect.arrayContaining([{ name: 'blackhole1', password: 'password123' }]),
            }),
        );
    });

    it('should add a blackhole to existing blackholes', async () => {
        // Arrange
        const blackholes = {
            Blackhole: [{ name: 'blackhole1', password: 'password123', path: Buffer.from('path'), salt: 'salt' }],
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
                Blackhole: expect.arrayContaining([
                    ...blackholes.Blackhole,
                    { name: 'blackhole2', password: 'password123' },
                ]),
            }),
        );
    });
});
