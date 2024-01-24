import execa from 'execa';
import { readFile, unlink } from 'fs/promises';

describe('CreateBlackholeCommandHandler', () => {
    const databasePath = '__integration_tests__/data.json';

    beforeEach(async () => {
        try {
            await unlink(databasePath);
        } catch (_) {
            // Ignore
        }
    });

    it('should create a first blackhole', async () => {
        // Act
        const result = await execa(
            'yarn',
            ['start', 'map', 'blackhole1', 'password123'],
            {
                env: { NODE_ENV: 'test' }
            });

        // Assert
        const data = await readFile(databasePath, 'utf-8');
        const db = JSON.parse(data);

        expect(db).not.toContainEqual(expect.objectContaining({
            Blackhole: expect.arrayContaining([{ name: 'blackhole1', password: 'password123' }])
        }));
    }, 20000);
});