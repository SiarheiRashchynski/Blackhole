// unit tests
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    testRegex: '/__tests__/.*\\.unit.test\\.ts$',
    setupFiles: ['./src/jest.setup.unit.ts'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};

