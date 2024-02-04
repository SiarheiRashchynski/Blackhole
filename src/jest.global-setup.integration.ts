import { mkdir } from 'fs/promises';

import { path } from './test-constants';

module.exports = async () => {
    try {
        await mkdir(path);
    } catch (err) {
        // Ignore
    }
};
