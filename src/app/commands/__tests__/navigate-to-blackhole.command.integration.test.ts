import { mkdir, rm, unlink, writeFile } from 'fs/promises';
import path from 'path';

import execa from 'execa';

import { path as basePath } from '../../../jest.setup.integration';

describe('NavigateToBlackholeCommandHandler', () => {
    const databasePath = path.join(basePath, 'data.json');
    const blackholeDirectories: string[] = [];

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
    });

    it('should open a blackhole', async () => {
        // Arrange
        blackholeDirectories.push(path.join(basePath, 'blackhole1Path'));
        const blackholes = {
            Blackhole: [
                {
                    name: 'blackhole1',
                    password: 'password123',
                    path: Buffer.from(blackholeDirectories[0]),
                    salt: 'salt',
                },
            ],
        };
        await mkdir(blackholeDirectories[0]);
        await writeFile(databasePath, JSON.stringify(blackholes));

        // Act
        const result = await execa('yarn', ['start', 'go', 'blackhole1', 'password123']);

        expect(result.stderr).toBe('');
    });

    it('should not open the blackhole because of invalid password', async () => {
        // Arrange
        blackholeDirectories.push(path.join(basePath, 'blackhole1Path'));
        const blackholes = {
            Blackhole: [
                {
                    name: 'blackhole1',
                    password: 'password123',
                    path: Buffer.from(blackholeDirectories[0]),
                    salt: 'salt',
                },
            ],
        };
        await mkdir(blackholeDirectories[0]);
        await writeFile(databasePath, JSON.stringify(blackholes));

        // Act && Assert
        await expect(execa('yarn', ['start', 'go', 'blackhole1', 'password123777'])).rejects.toThrow(
            expect.objectContaining({ message: expect.stringContaining('Invalid password.') }),
        );
    });

    it('should not open the blackhole because it was not found', async () => {
        // Arrange
        blackholeDirectories.push(path.join(basePath, 'blackhole1Path'));
        const blackholes = {
            Blackhole: [
                {
                    name: 'blackhole1',
                    password: 'password123',
                    path: Buffer.from(blackholeDirectories[0]),
                    salt: 'salt',
                },
            ],
        };
        await mkdir(blackholeDirectories[0]);
        await writeFile(databasePath, JSON.stringify(blackholes));

        // Act
        await expect(execa('yarn', ['start', 'go', 'blackhole2', 'password123777'])).rejects.toThrow(
            expect.objectContaining({ message: expect.stringContaining(' not found.') }),
        );
    });
});
