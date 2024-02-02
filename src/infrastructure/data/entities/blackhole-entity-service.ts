import pluralize from 'pluralize';
import { inject, injectable } from 'tsyringe';

import { Blackhole } from '../../../domain/models';
import { EntityComparator, EntityFactory, EntityService } from '../abstractions';

import { BlackholeEntityComparator } from './comparators';
import { BlackholeEntityFactory } from './factories';

@injectable()
export class BlackholeEntityService implements EntityService<Blackhole> {
    public entityName: string = pluralize(Blackhole.name);

    public constructor(
        @inject(BlackholeEntityComparator.name) private readonly _comparator: EntityComparator<Blackhole>,
        @inject(BlackholeEntityFactory.name) private readonly _factory: EntityFactory<Blackhole>,
    ) {}

    public get factory(): EntityFactory<Blackhole> {
        return this._factory;
    }

    public get comparator(): EntityComparator<Blackhole> {
        return this._comparator;
    }
}
