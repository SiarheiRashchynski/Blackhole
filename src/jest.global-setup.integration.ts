import { mkdir } from 'fs/promises';

module.exports = async () => {
    try {
        await mkdir('__integration_tests__');
    } catch (_) {
        // Ignore
    }
};