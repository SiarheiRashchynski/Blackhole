import { mkdir } from 'fs/promises';

import { path } from './jest.setup.integration';

module.exports = async () => {
    try {
        await mkdir(path);
    } catch (err) {
        // Ignore
    }
};
