import * as containers from './infrastructure/containers.tests';

beforeEach(async () => {
    await containers.registerDependencies();
});
