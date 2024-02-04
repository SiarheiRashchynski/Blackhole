import { CryptoProvider } from '../../../../../domain/abstractions/crypto';
import { Encrypted, Hashed } from '../../../../../domain/abstractions/crypto/types';
import { Blackhole } from '../../../../../domain/models';
import { BlackholeAccessor } from '../blackhole-accessor';
import { FileOperations } from '../file-operations';

describe('BlackholeAccessor', () => {
    let blackholeAccessor: BlackholeAccessor;
    let fileOperations: jest.Mocked<FileOperations>;
    let cryptoProvider: jest.Mocked<CryptoProvider>;

    beforeEach(() => {
        fileOperations = {
            read: jest.fn(),
            write: jest.fn(),
            readDirectory: jest.fn(),
            createDirectory: jest.fn(),
            deleteDirectory: jest.fn(),
        } as any;
        cryptoProvider = {
            decrypt: jest.fn(),
            encrypt: jest.fn(),
            check: jest.fn().mockResolvedValue(true),
        } as any;
        blackholeAccessor = new BlackholeAccessor(fileOperations, cryptoProvider);
    });

    describe('open', () => {
        it('should decrypt files in the blackhole', async () => {
            // Arrange
            const password = 'password';
            const files = ['file1', 'file2'];
            const blackhole = new Blackhole('name', 'source' as Encrypted, 'dest' as Encrypted, 'password' as Hashed);

            fileOperations.read.mockResolvedValue(Buffer.from('fileData'));
            cryptoProvider.decrypt.mockImplementation((data) => Promise.resolve(Buffer.from(`${data}-decrypted`)));
            fileOperations.readDirectory.mockResolvedValue(files);

            // Act
            await blackholeAccessor.open(blackhole, password);

            // Assert
            expect(fileOperations.readDirectory).toHaveBeenCalledWith('dest-decrypted');

            files.forEach((file, {}) => {
                expect(fileOperations.read).toHaveBeenCalledWith(`dest-decrypted/${file}`);
                expect(cryptoProvider.decrypt).toHaveBeenCalledWith('fileData' as Encrypted, password);
            });
        });
    });

    describe('create', () => {
        it('should create a directory', async () => {
            // Arrange
            const password = 'password';
            const blackhole = new Blackhole('name', 'source' as Encrypted, 'dest' as Encrypted, 'password' as Hashed);

            cryptoProvider.decrypt.mockImplementation((data) => Promise.resolve(Buffer.from(`${data}-decrypted`)));

            // Act
            await blackholeAccessor.map(blackhole, password);

            // Assert
            expect(fileOperations.createDirectory).toHaveBeenCalledWith('source-decrypted');
            expect(fileOperations.createDirectory).toHaveBeenCalledWith('dest-decrypted');
        });
    });

    describe('delete', () => {
        it('should delete a directory', async () => {
            // Arrange
            const password = 'password';
            const blackhole = new Blackhole('name', 'source' as Encrypted, 'dest' as Encrypted, 'password' as Hashed);

            cryptoProvider.decrypt.mockImplementation((data) => Promise.resolve(Buffer.from(`${data}-decrypted`)));

            // Act
            await blackholeAccessor.delete(blackhole, password);

            // Assert
            expect(fileOperations.deleteDirectory).toHaveBeenCalledWith('source-decrypted');
            expect(fileOperations.deleteDirectory).toHaveBeenCalledWith('dest-decrypted');
        });
    });
});
