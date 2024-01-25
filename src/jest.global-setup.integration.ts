import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';

export const path = '__integration_tests__';

module.exports = async () => {
    if (existsSync(path)) {
        await mkdir(path);
    }
};
