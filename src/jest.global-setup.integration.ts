import { mkdir } from 'fs/promises';

import { path } from './jest.setup.integration';

jest.setTimeout(30000);

module.exports = async () => {
    try {
        await mkdir(path);
    } catch (err) {
        // Ignore
    }
};
