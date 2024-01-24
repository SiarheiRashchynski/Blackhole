import execa from 'execa';
import { readFile, unlink } from 'fs/promises';

describe('NavigateToBlackholeCommandHandler', () => {
    const databasePath = '__tests__/data.json';
    
    beforeEach(async () => {
        await unlink(databasePath);
    });

    it('should open a blackhole', async () => {
        // Araange
        
        // Act
        await execa('yarn', ['start', 'remove', 'blackhole1', 'password123']);

        // Assert
        const data = await readFile(databasePath, 'utf-8');
        const db = JSON.parse(data);

        expect(db.blackholes).not.toContainEqual({ Blackhole: [{ name: 'blackhole1', password: 'password123' }] });
    }, 20000);
});