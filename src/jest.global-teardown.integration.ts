import { rm } from 'fs/promises';

import { path } from './jest.setup.integration';

module.exports = async () => {
    try {
        await rm(path, { recursive: true });
    } catch (err) {
        // Ignore
    }
};
