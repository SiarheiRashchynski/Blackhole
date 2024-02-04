import { Blackhole } from '../../../../../domain/models';

export interface BlackholeAccessor {
    open(blackhole: Blackhole, password: string): Promise<void>;
    map(blackhole: Blackhole, password: string): Promise<void>;
    delete(blackhole: Blackhole, password: string): Promise<void>;
}
