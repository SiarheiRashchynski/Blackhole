import { CipherProvider } from '../cipher-provider';

describe('CipherProvider', () => {
    let cipherProvider: CipherProvider;

    beforeEach(() => {
        cipherProvider = new CipherProvider();
    });

    it('should encrypt and decrypt a string', async () => {
        // Arrange
        const password = 'password';
        const content = 'content';

        const encrypted = await cipherProvider.encrypt(content, password);

        // Act
        const decrypted = await cipherProvider.decrypt(encrypted, password);

        // Assert
        expect(decrypted.toString()).toBe(content);
    });
});
