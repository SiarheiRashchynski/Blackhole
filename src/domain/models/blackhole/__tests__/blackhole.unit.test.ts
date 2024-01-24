import { CryptoProvider } from '../../../abstractions/crypto';
import { Encrypted, Hashed } from '../../../abstractions/crypto/types';
import { Blackhole } from '../blackhole';

describe('Blackhole', () => {
    let cryptoProvider: jest.Mocked<CryptoProvider>;

    beforeEach(() => {
        cryptoProvider = {
            check: jest.fn().mockResolvedValue(true),
        } as any;
    });

    it('should create a blackhole', async () => {
        // Arrange
        const name = 'blackhole1';
        const path = '/path/to/blackhole';
        const password = 'password123';
        const hashedPassword = 'hashedPassword';
        const securityKey = 'securityKey';
        const encryptedPath = 'encryptedPath';
        const salt = 'salt';

        cryptoProvider.hash = jest.fn().mockResolvedValue(hashedPassword);
        cryptoProvider.generateSecurityKey = jest.fn().mockResolvedValue(securityKey);
        cryptoProvider.encrypt = jest.fn().mockResolvedValue(encryptedPath);
        cryptoProvider.generateSalt = jest.fn().mockReturnValue(salt);

        // Act
        const blackhole = await Blackhole.create(name, path, password, cryptoProvider);

        // Assert
        expect(blackhole.name).toBe(name);
        expect(blackhole.password).toBe(hashedPassword);
        expect(blackhole.salt).toBe(salt);
        expect(cryptoProvider.hash).toHaveBeenCalledWith(password);
        expect(cryptoProvider.generateSecurityKey).toHaveBeenCalledWith(password, hashedPassword);
        expect(cryptoProvider.encrypt).toHaveBeenCalledWith(Buffer.from(path), securityKey);
        expect(cryptoProvider.generateSalt).toHaveBeenCalled();
    });

    it('should throw an error when creating a blackhole with invalid data', () => {
        // Arrange
        const invalidData = {
            name: 'blackhole1',
            path: '/path/to/blackhole',
            password: 'password123',
            salt: null,
        };

        // Act & Assert
        expect(() => Blackhole.fromPersistence(invalidData)).toThrow('Invalid data.');
    });

    it('should create a blackhole from persistence data', () => {
        // Arrange
        const name = 'blackhole1';
        const path = 'encryptedPath';
        const password = 'hashedPassword';
        const salt = 'salt';
        const persistenceData = {
            name,
            path,
            password,
            salt,
        };

        // Act
        const blackhole = Blackhole.fromPersistence(persistenceData);

        // Assert
        expect(blackhole.name).toBe(name);
        expect(blackhole.password).toBe(password);
        expect(blackhole.salt).toBe(salt);
    });

    it('should convert a blackhole to persistence data', () => {
        // Arrange
        const name = 'blackhole1';
        const path = 'encryptedPath';
        const password = 'hashedPassword';
        const salt = 'salt';

        const blackhole = Blackhole.fromPersistence({
            name,
            path,
            password,
            salt,
        });

        // Act
        const persistenceData = blackhole.toPersistence();

        // Assert
        expect(persistenceData.name).toBe(name);
        expect(Buffer.from(persistenceData.path as string).toString()).toBe(path);
        expect(persistenceData.password).toBe(password);
        expect(persistenceData.salt).toBe(salt);
    });

    it('should check if two blackholes are equal by primary key', () => {
        // Arrange
        const name = 'blackhole1';
        const path = 'encryptedPath';
        const password = 'hashedPassword';
        const salt = 'salt';
        const blackhole1 = Blackhole.fromPersistence({ name, path, password, salt });
        const blackhole2 = Blackhole.fromPersistence({ name, path, password, salt });
        const blackhole3 = Blackhole.fromPersistence({ name: 'blackhole2', path, password, salt });

        // Act & Assert
        expect(blackhole1.isEqualByPrimaryKey(blackhole2)).toBe(true);
        expect(blackhole1.isEqualByPrimaryKey(blackhole3)).toBe(false);
    });

    it('should set the name of a blackhole', async () => {
        // Arrange
        const name = 'blackhole1';
        const path = 'encryptedPath';
        const password = 'hashedPassword';
        const salt = 'salt';
        const blackhole = Blackhole.fromPersistence({ name, path, password, salt });
        const newName = 'newBlackhole1';

        cryptoProvider.check = jest.fn().mockResolvedValue(true);

        // Act
        await blackhole.setName(newName, password, cryptoProvider);

        // Assert
        expect(blackhole.name).toBe(newName);
        expect(cryptoProvider.check).toHaveBeenCalledWith(password, password);
    });

    it('should throw an error when setting the name of a blackhole with an invalid password', async () => {
        // Arrange
        const name = 'blackhole1';
        const path = 'encryptedPath';
        const password = 'hashedPassword';
        const salt = 'salt';
        const blackhole = Blackhole.fromPersistence({ name, path, password, salt });
        const newName = 'newBlackhole1';
        const invalidPassword = 'invalidPassword';

        cryptoProvider.check = jest.fn().mockResolvedValue(false);

        // Act & Assert
        await expect(blackhole.setName(newName, invalidPassword, cryptoProvider)).rejects.toThrow('Invalid password.');
        expect(blackhole.name).toBe(name);
        expect(cryptoProvider.check).toHaveBeenCalledWith(invalidPassword, password);
    });

    it('should set the path of a blackhole', async () => {
        // Arrange
        const name = 'blackhole1';
        const path = 'encryptedPath';
        const password = 'hashedPassword';
        const salt = 'salt';
        const blackhole = Blackhole.fromPersistence({ name, path, password, salt });
        const newPath = Buffer.from('newEncryptedPath') as Encrypted;
        const securityKey = 'securityKey';
        const encryptedPath = 'encryptedPath';

        cryptoProvider.generateSecurityKey = jest.fn().mockResolvedValue(securityKey);
        cryptoProvider.encrypt = jest.fn().mockResolvedValue(encryptedPath);
        cryptoProvider.check = jest.fn().mockResolvedValue(true);

        // Act
        await blackhole.setPath(newPath, password, cryptoProvider);

        // Assert
        expect(cryptoProvider.generateSecurityKey).toHaveBeenCalledWith(password, password);
        expect(cryptoProvider.encrypt).toHaveBeenCalledWith(newPath, securityKey);
    });

    it('should throw an error when setting the path of a blackhole with an invalid password', async () => {
        // Arrange
        const name = 'blackhole1';
        const path = 'encryptedPath';
        const password = 'hashedPassword';
        const salt = 'salt';
        const blackhole = Blackhole.fromPersistence({ name, path, password, salt });
        const newPath = Buffer.from('newEncryptedPath') as Encrypted;
        const invalidPassword = 'invalidPassword';

        cryptoProvider.check.mockResolvedValue(false);

        // Act & Assert
        await expect(blackhole.setPath(newPath, invalidPassword, cryptoProvider)).rejects.toThrow('Invalid password.');
    });

    it('should get the path of a blackhole', async () => {
        // Arrange
        const name = 'blackhole1';
        const path = 'encryptedPath';
        const password = 'hashedPassword';
        const salt = 'salt';
        const blackhole = Blackhole.fromPersistence({ name, path, password, salt });
        const decryptedPath = '/path/to/blackhole';
        const securityKey = 'securityKey';

        cryptoProvider.generateSecurityKey = jest.fn().mockResolvedValue(securityKey);
        cryptoProvider.decrypt = jest.fn().mockResolvedValue(Buffer.from(decryptedPath));

        // Act
        const result = await blackhole.getPath(password, cryptoProvider);

        // Assert
        expect(result).toBe(decryptedPath);
        expect(cryptoProvider.generateSecurityKey).toHaveBeenCalledWith(password, password);
        expect(cryptoProvider.decrypt).toHaveBeenCalledWith(Buffer.from(path), securityKey);
    });

    it('should throw an error when getting the path of a blackhole with an invalid password', async () => {
        // Arrange
        const name = 'blackhole1';
        const path = 'encryptedPath';
        const password = 'hashedPassword';
        const salt = 'salt';
        const blackhole = Blackhole.fromPersistence({ name, path, password, salt });
        const invalidPassword = 'invalidPassword';

        cryptoProvider.check.mockResolvedValue(false);

        // Act & Assert
        await expect(blackhole.getPath(invalidPassword, cryptoProvider)).rejects.toThrow('Invalid password.');
    });

    it('should set the password of a blackhole', async () => {
        // Arrange
        const name = 'blackhole1';
        const path = 'encryptedPath';
        const password = 'hashedPassword';
        const salt = 'salt';
        const blackhole = Blackhole.fromPersistence({ name, path, password, salt });
        const newPassword = 'newPassword123';
        const hashedPassword = 'newHashedPassword';

        cryptoProvider.hash = jest.fn().mockResolvedValue(hashedPassword as Hashed);

        // Act
        await blackhole.setPassword(password, newPassword, cryptoProvider);

        // Assert
        expect(blackhole.password).toBe(hashedPassword);
        expect(cryptoProvider.hash).toHaveBeenCalledWith(newPassword);
    });

    it('should throw an error when setting the password of a blackhole with an invalid password', async () => {
        // Arrange
        const name = 'blackhole1';
        const path = 'encryptedPath';
        const password = 'hashedPassword';
        const salt = 'salt';
        const blackhole = Blackhole.fromPersistence({ name, path, password, salt });
        const invalidPassword = 'invalidPassword';
        const newPassword = 'newPassword123';

        cryptoProvider.check.mockResolvedValue(false);

        // Act & Assert
        await expect(blackhole.setPassword(invalidPassword, newPassword, cryptoProvider)).rejects.toThrow(
            'Invalid password.',
        );
        expect(blackhole.password).toBe(password);
    });
});
