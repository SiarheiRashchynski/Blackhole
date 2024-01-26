import './infrastructure/containers';

import './app/commands';
import { runCli } from './infrastructure/shared/utils';

const containers =
    process.env.NODE_ENV === 'test'
        ? require('./infrastructure/containers.tests')
        : require('./infrastructure/containers');

containers.registerDependencies().then(() => {
    runCli();
});
