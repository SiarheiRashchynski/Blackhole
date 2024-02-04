import { HashProvider } from '../../../../infrastructure/shared/utils/crypto';
import { Encrypted, Hashed } from '../../../abstractions/crypto/types';
import { Blackhole } from '../blackhole';

describe('Blackhole', () => {
    let hashProvider: jest.Mocked<HashProvider>;

    beforeEach(() => {
        hashProvider = {
            check: jest.fn().mockResolvedValue(true),
        } as any;
    });

    it('should create a blackhole', async () => {
        // Arrange
        const name = 'blackhole1';
        const source = '/source-path/to/blackhole' as Encrypted;
        const destination = '/destination-path/to/blackhole' as Encrypted;
        const password = 'password123';

        // Act
        const blackhole = new Blackhole(name, source, destination, password as unknown as Hashed);

        // Assert
        expect(blackhole.name).toBe(name);
        expect(blackhole.password).toBe(password);
        expect(blackhole.source).toBe(source);
        expect(blackhole.destination).toBe(destination);
    });

    it('should set the name of a blackhole', async () => {
        // Arrange
        const name = 'blackhole1';
        const source = 'encryptedSource' as Encrypted;
        const destination = 'encryptedSource' as Encrypted;
        const password = 'hashedPassword' as unknown as Hashed;
        const blackhole = new Blackhole(name, source, destination, password);
        const newName = 'newBlackhole1';

        hashProvider.check = jest.fn().mockResolvedValue(true);

        // Act
        await blackhole.setName(newName, password, hashProvider);

        // Assert
        expect(blackhole.name).toBe(newName);
        expect(hashProvider.check).toHaveBeenCalledWith(password, password);
    });

    it('should throw an error when setting the name of a blackhole with an invalid password', async () => {
        // Arrange
        const name = 'blackhole1';
        const source = 'encryptedSource' as Encrypted;
        const destination = 'encryptedSource' as Encrypted;
        const password = 'hashedPassword' as unknown as Hashed;
        const blackhole = new Blackhole(name, source, destination, password);
        const newName = 'newBlackhole1';
        const invalidPassword = 'invalidPassword';

        hashProvider.check = jest.fn().mockResolvedValue(false);

        // Act & Assert
        await expect(blackhole.setName(newName, invalidPassword, hashProvider)).rejects.toThrow('Invalid password.');
        expect(blackhole.name).toBe(name);
        expect(hashProvider.check).toHaveBeenCalledWith(invalidPassword, password);
    });

    it('should set the path of a blackhole', async () => {
        // Arrange
        const name = 'blackhole1';
        const source = 'encryptedSource' as Encrypted;
        const destination = 'encryptedSource' as Encrypted;
        const password = 'hashedPassword' as unknown as Hashed;
        const blackhole = new Blackhole(name, source, destination, password);
        const newPath = 'newPath' as Encrypted;

        hashProvider.check = jest.fn().mockResolvedValue(true);

        // Act
        await blackhole.setSource(newPath, password, hashProvider);

        // Assert
        expect(blackhole.source).toBe(newPath);
        expect(blackhole.destination).toBe(destination);
    });

    it('should set the path of a blackhole', async () => {
        // Arrange
        const name = 'blackhole1';
        const source = 'encryptedSource' as Encrypted;
        const destination = 'encryptedSource' as Encrypted;
        const password = 'hashedPassword' as unknown as Hashed;
        const blackhole = new Blackhole(name, source, destination, password);
        const newPath = 'newPath' as Encrypted;

        hashProvider.check = jest.fn().mockResolvedValue(true);

        // Act
        await blackhole.setDestination(newPath, password, hashProvider);

        // Assert
        expect(blackhole.source).toBe(source);
        expect(blackhole.destination).toBe(newPath);
    });

    it('should throw an error when setting the path of a blackhole with an invalid password', async () => {
        // Arrange
        const name = 'blackhole1';
        const source = 'encryptedSource' as Encrypted;
        const destination = 'encryptedSource' as Encrypted;
        const password = 'hashedPassword' as unknown as Hashed;
        const blackhole = new Blackhole(name, source, destination, password);
        const newPath = 'newEncryptedPath' as Encrypted;
        const invalidPassword = 'invalidPassword';

        hashProvider.check.mockResolvedValue(false);

        // Act & Assert
        await expect(blackhole.setSource(newPath, invalidPassword, hashProvider)).rejects.toThrow('Invalid password.');
    });

    it('should set the password of a blackhole', async () => {
        // Arrange
        const name = 'blackhole1';
        const source = 'encryptedSource' as Encrypted;
        const destination = 'encryptedSource' as Encrypted;
        const password = 'hashedPassword' as unknown as Hashed;
        const blackhole = new Blackhole(name, source, destination, password);
        const newPassword = 'newPassword123';
        const hashedPassword = 'newHashedPassword';

        hashProvider.hash = jest.fn().mockResolvedValue(hashedPassword as Hashed);

        // Act
        await blackhole.setPassword(password, newPassword, hashProvider);

        // Assert
        expect(blackhole.password).toBe(hashedPassword);
        expect(hashProvider.hash).toHaveBeenCalledWith(newPassword);
    });

    it('should throw an error when setting the password of a blackhole with an invalid password', async () => {
        // Arrange
        const name = 'blackhole1';
        const source = 'encryptedSource' as Encrypted;
        const destination = 'encryptedSource' as Encrypted;
        const password = 'hashedPassword' as unknown as Hashed;
        const blackhole = new Blackhole(name, source, destination, password);
        const invalidPassword = 'invalidPassword';
        const newPassword = 'newPassword123';

        hashProvider.check.mockResolvedValue(false);

        // Act & Assert
        await expect(blackhole.setPassword(invalidPassword, newPassword, hashProvider)).rejects.toThrow(
            'Invalid password.',
        );
        expect(blackhole.password).toBe(password);
    });
});
