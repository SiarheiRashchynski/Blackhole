import { HashProvider } from '../hash-provider';

describe('HashProvider', () => {
    let hashProvider: HashProvider;

    beforeEach(() => {
        hashProvider = new HashProvider();
    });

    it('should hash a password', async () => {
        // Arrange
        const password = 'password';

        // Act
        const hashedPassword = await hashProvider.hash(password);

        // Assert
        expect(hashedPassword).toBeDefined();
        expect(typeof hashedPassword).toBe('string');
    });

    it('should check if a password matches a hashed password', async () => {
        // Arrange
        const password = 'password';
        const hashedPassword = await hashProvider.hash(password);

        // Act
        const isMatch = await hashProvider.check(password, hashedPassword);

        // Assert
        expect(isMatch).toBe(true);
    });

    it('should check if a password does not match a hashed password', async () => {
        // Arrange
        const password = 'password';
        const wrongPassword = 'wrongPassword';
        const hashedPassword = await hashProvider.hash(password);

        // Act
        const isMatch = await hashProvider.check(wrongPassword, hashedPassword);

        // Assert
        expect(isMatch).toBe(false);
    });
});
