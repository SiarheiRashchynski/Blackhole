import { Aes256CbcCipherProvider } from '../aes-256-cbc-cipher-provider';

describe('CipherProvider', () => {
    let cipherProvider: Aes256CbcCipherProvider;

    beforeEach(() => {
        cipherProvider = new Aes256CbcCipherProvider();
    });

    it('should encrypt and return correct encrypted response', async () => {
        // Arrange
        const content = 'content';
        const encryptionKey = await cipherProvider.generateSecurityKey('password');

        // Act
        const encrypted = await cipherProvider.encrypt(content, encryptionKey);

        // Assert
        expect(encrypted.content).toBeDefined();
        expect(encrypted.iv).toBeDefined();
        expect(Buffer.from(encrypted.iv, 'hex')).toHaveLength(16);
        expect(encrypted.algorithm).toBeDefined();
    });

    it('should encrypt and decrypt a string', async () => {
        // Arrange
        const content = 'content';
        const encryptionKey = await cipherProvider.generateSecurityKey('password');
        const encrypted = await cipherProvider.encrypt(content, encryptionKey);

        // Act
        const decrypted = await cipherProvider.decrypt(encrypted, encryptionKey);

        // Assert
        expect(decrypted.toString()).toBe(content);
    });

    it('should generate the correct encryption key', async () => {
        // Arrange
        const password = 'password';

        // Act
        const encryptionKey = await cipherProvider.generateSecurityKey(password);

        // Assert
        expect(encryptionKey).toBeDefined();
        expect(encryptionKey.length).toBe(32);
    });
});
