import 'reflect-metadata';
import './infrastructure/shared/extensions';

if (process.env.LOG_LEVEL !== 'verbose') {
    console.log = jest.fn(); // Mock console.log
}
