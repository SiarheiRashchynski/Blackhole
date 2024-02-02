import { rm } from 'fs/promises';

import { path } from './test-constants';

module.exports = async () => {
    try {
        await rm(path, { recursive: true });
    } catch (err) {
        // Ignore
    }
};
