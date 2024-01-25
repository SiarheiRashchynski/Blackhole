import { CryptoProvider } from '../../../../../domain/abstractions/crypto';
import { FileOperations } from '../file-operations';
import { PrivateDirectoryAccessor } from '../private-directory-accessor';

describe('PrivateDirectoryAccessor', () => {
    let privateDirectoryAccessor: PrivateDirectoryAccessor;
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
            generateSecurityKey: jest.fn(),
        } as any;
        privateDirectoryAccessor = new PrivateDirectoryAccessor(fileOperations, cryptoProvider);
    });

    describe('open', () => {
        it('should decrypt files in the blackhole', async () => {
            // Arrange
            const securityKey = 'securityKey';
            const files = ['file1', 'file2'];

            cryptoProvider.generateSecurityKey.mockResolvedValue(securityKey);
            fileOperations.read.mockResolvedValue('fileData');
            cryptoProvider.decrypt.mockResolvedValue(Buffer.from('decryptedFileData'));
            fileOperations.readDirectory.mockResolvedValue(files);

            // Act
            await privateDirectoryAccessor.open('name', 'path', 'password', 'salt');

            // Assert
            expect(cryptoProvider.generateSecurityKey).toHaveBeenCalledWith('password', 'salt');
            expect(fileOperations.readDirectory).toHaveBeenCalledWith('path');

            files.forEach((file, {}) => {
                expect(fileOperations.read).toHaveBeenCalledWith(`path/${file}`);
                expect(cryptoProvider.decrypt).toHaveBeenCalledWith(Buffer.from('fileData'), securityKey);
            });
        });
    });

    describe('create', () => {
        it('should create a directory', async () => {
            // Arrange
            const path = 'directory/path';

            // Act
            await privateDirectoryAccessor.create(path);

            // Assert
            expect(fileOperations.createDirectory).toHaveBeenCalledWith(path);
        });
    });

    describe('delete', () => {
        it('should delete a directory', async () => {
            // Arrange
            const path = 'directory/path';

            // Act
            await privateDirectoryAccessor.delete(path);

            // Assert
            expect(fileOperations.deleteDirectory).toHaveBeenCalledWith(path);
        });
    });
});
