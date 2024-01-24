import { rmdir } from "fs/promises";

module.exports = async () => {
    await rmdir('__integration_tests__', { recursive: true });
};