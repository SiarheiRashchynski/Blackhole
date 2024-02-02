import 'reflect-metadata';

if (process.env.LOG_LEVEL !== 'verbose') {
    console.log = jest.fn(); // Mock console.log
}
