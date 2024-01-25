import execa from 'execa';

describe('RemoveBlackholeCommandHandler', () => {
    it('should remove a blackhole', async () => {
        // Arrange
        await execa('yarn', ['start', 'remove', 'blackhole1', 'password123']);

        // // Act
        // const data = await fs.readFile('path-to-your-database.json', 'utf-8');
        // const db = JSON.parse(data);

        // Assert
        // expect(db.blackholes).not.toContainEqual({ name: 'blackhole1', password: 'password123' });
    }, 20000);
});
