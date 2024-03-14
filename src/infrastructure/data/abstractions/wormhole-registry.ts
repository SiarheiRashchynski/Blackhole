import { Wormhole } from '../../../domain/models';

export interface WormholeRegistry {
    load(name: string, password: string): Promise<Wormhole | undefined>;
    save(wormhole: Wormhole, password: string): Promise<void>;
}
