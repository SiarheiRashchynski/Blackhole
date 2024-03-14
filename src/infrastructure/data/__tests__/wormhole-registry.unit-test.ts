import { Wormhole } from '../../../domain/models/wormhole';
import { CryptoProvider } from '../../shared/utils/security/abstractions';
import { Encrypted, Hashed } from '../../shared/utils/security/types';
import { Storage } from '../storage';
import { WormholeRegistry } from '../wormhole-registry';

describe('WormholeRegistry', () => {
    let wormholeRegistry: WormholeRegistry;
    let cryptoProvider: jest.Mocked<CryptoProvider>;
    let storage: jest.Mocked<Storage>;

    beforeEach(() => {
        cryptoProvider = {
            generateSalt: jest.fn(),
            generateSecurityKey: jest.fn().mockReturnValue([Buffer.from('key'), 'salt']),
            encrypt: jest.fn(),
            decrypt: jest.fn(),
            hash: jest.fn(),
            check: jest.fn(),
        } as any;
        storage = {
            read: jest.fn(),
            write: jest.fn(),
        } as any;
        wormholeRegistry = new WormholeRegistry(cryptoProvider, storage);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('save', () => {
        it('should not save the wormhole if another with the same key exists', async () => {
            // Arrange
            const password = 'password';
            const wormhole = new Wormhole({
                stellarCode: 'wormhole1',
                eventHorizon: 'eventHorizon',
                singularity: 'singularity',
            });

            cryptoProvider.hash.mockResolvedValue({ value: 'wormhole1' } as Hashed);
            cryptoProvider.check.mockResolvedValue(true);
            storage.read.mockResolvedValue(JSON.stringify([{ key: 'wormhole1' }] as any));

            // Act & Assert
            await expect(wormholeRegistry.save(wormhole, password)).rejects.toThrow(
                'Wormhole with the same key already exists',
            );
        });

        it('should save the wormhole', async () => {
            // Arrange
            const password = 'password';
            const wormhole = new Wormhole({
                stellarCode: 'wormhole1',
                eventHorizon: 'eventHorizon',
                singularity: 'singularity',
            });

            storage.read.mockResolvedValue(JSON.stringify([]));
            cryptoProvider.generateSalt.mockReturnValue('salt');
            cryptoProvider.hash.mockResolvedValue({ value: 'wormhole1' } as Hashed);
            cryptoProvider.encrypt.mockResolvedValue(new Encrypted('encrypted', 'algorithm', 'iv'));

            // Act
            await wormholeRegistry.save(wormhole, password);

            // Assert
            expect(cryptoProvider.generateSecurityKey).toHaveBeenCalledWith(password);
            expect(cryptoProvider.encrypt).toHaveBeenCalledWith(
                JSON.stringify({ stellarCode: 'wormhole1', eventHorizon: 'eventHorizon', singularity: 'singularity' }),
                Buffer.from('key'),
            );
            expect(storage.write).toHaveBeenCalledWith(
                JSON.stringify([
                    {
                        key: 'wormhole1',
                        content: new Encrypted('encrypted', 'algorithm', 'iv').toString(),
                        salt: 'salt',
                    },
                ]),
            );
        });
    });

    describe('load', () => {
        it('should load the wormhole with the specified name', async () => {
            // Arrange
            const name = 'wormhole1';
            const password = 'password';

            cryptoProvider.check.mockResolvedValue(true);
            cryptoProvider.hash.mockResolvedValue({ value: 'wormhole1' } as Hashed);

            const content = {
                stellarCode: 'wormhole1',
                eventHorizon: 'eventHorizon',
                singularity: 'singularity',
            };

            storage.read.mockResolvedValue(
                JSON.stringify([
                    {
                        key: 'wormhole1',
                        content: ['algorithm', 'iv', JSON.stringify(content), 'hex'].join('$'),
                        salt: 'salt',
                    },
                ]),
            );
            cryptoProvider.decrypt.mockImplementation((encrypted) => Promise.resolve(encrypted.content));

            // Act
            const wormhole = (await wormholeRegistry.load(name, password)) as Wormhole;

            // Assert
            expect(wormhole).toBeDefined();
            expect(wormhole.stellarCode).toBe('wormhole1');
            expect(wormhole.eventHorizon).toBe('eventHorizon');
            expect(wormhole.singularity).toBe('singularity');
        });

        it('should not load the wormhole if it does not exist', async () => {
            // Arrange
            const name = 'nonexistentWormhole';
            const password = 'password';

            storage.read.mockResolvedValue(JSON.stringify([]));

            // Act
            const wormhole = await wormholeRegistry.load(name, password);

            // Assert
            expect(wormhole).not.toBeDefined();
        });
    });

    describe('load and save', () => {
        it('should load and save a wormhole', async () => {
            // Arrange
            const password = 'password';
            const wormhole = new Wormhole({
                stellarCode: 'wormhole1',
                eventHorizon: 'eventHorizon',
                singularity: 'singularity',
            });

            let diskMock = '';

            storage.read.mockImplementation(() => Promise.resolve(diskMock));
            storage.write.mockImplementation((content) => {
                diskMock = content;
                return Promise.resolve();
            });
            cryptoProvider.check.mockResolvedValue(true);
            cryptoProvider.generateSalt.mockReturnValue('salt');
            cryptoProvider.hash.mockResolvedValue({ value: 'wormhole1' } as Hashed);
            cryptoProvider.encrypt.mockImplementation((content) =>
                Promise.resolve(new Encrypted(content as string, 'algorithm', 'iv')),
            );
            cryptoProvider.decrypt.mockImplementation((encrypted) => Promise.resolve(encrypted.content));

            // Act
            await wormholeRegistry.save(wormhole, password);
            const loadedWormhole = (await wormholeRegistry.load('wormhole1', password)) as Wormhole;

            // Assert
            expect(loadedWormhole).toBeDefined();
            expect(loadedWormhole.stellarCode).toBe('wormhole1');
            expect(loadedWormhole.eventHorizon).toBe('eventHorizon');
            expect(loadedWormhole.singularity).toBe('singularity');
        });
    });
});
