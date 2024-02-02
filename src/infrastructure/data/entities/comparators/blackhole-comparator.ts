import { injectable } from 'tsyringe';

import { Blackhole } from '../../../../domain/models';
import { EntityComparator } from '../../abstractions';

@injectable()
export class BlackholeEntityComparator implements EntityComparator<Blackhole> {
    public areEqual(entity1: Blackhole, entity2: Blackhole): boolean {
        return entity1.name === entity2.name;
    }
}
