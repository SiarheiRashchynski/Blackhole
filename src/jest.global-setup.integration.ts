import { mkdir } from 'fs/promises';

import { path } from './test-constants';

module.exports = async () => {
    try {
        await mkdir(path);
    } catch (err) {
        // Ignore
    }
};

// if (process.env.LOG_LEVEL !== 'verbose') {
//     console.log = jest.fn(); // Mock console.log
// }
