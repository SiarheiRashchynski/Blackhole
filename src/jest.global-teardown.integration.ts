import { rmdir } from 'fs/promises';

import { path } from './jest.global-setup.integration';

module.exports = async () => {
    await rmdir(path, { recursive: true });
};
