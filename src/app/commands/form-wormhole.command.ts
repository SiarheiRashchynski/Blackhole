import { injectable } from 'tsyringe';

import { Wormhole } from '../../domain/models';
import { Properties } from '../../domain/types';
import { CommandHandler } from '../../infrastructure/commands/abstractions';
import { CliCommand } from '../../infrastructure/commands/decorators';
import { WormholeRegistry } from '../../infrastructure/data/wormhole-registry';

export type FormWormholeCommand = {
    stellarCode: string;
    secret: string;
    eventHorizon: string;
    singularity: string;
};

@injectable()
@CliCommand({
    command: 'form <stellarCode> <eventHorizon[:<singularity>]> <secret>',
    description: 'Form a new wormhole.',
    mapRequest: (stellarCode, eventHorizonSingularity, secret) => {
        const [eventHorizon, singularity] = eventHorizonSingularity.split(':');
        return { stellarCode, secret, eventHorizon, singularity } as FormWormholeCommand;
    },
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class FormWorhmholeCommandHandler implements CommandHandler<FormWormholeCommand> {
    public constructor(private readonly _wormholeRegistry: WormholeRegistry) {}

    public async handle(request: FormWormholeCommand): Promise<void> {
        const { secret, ...wormholeProperties } = request;
        const wormhole = new Wormhole(wormholeProperties as Properties<Wormhole>);
        await this._wormholeRegistry.save(wormhole, secret);
    }
}
