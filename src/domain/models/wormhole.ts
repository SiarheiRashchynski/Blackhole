import { Properties } from '../types';

export class Wormhole {
    private _stellarCode: string;

    private _eventHorizon: string;

    private _singularity: string;

    public constructor({ stellarCode, eventHorizon, singularity }: Properties<Wormhole>) {
        if (!stellarCode || !eventHorizon || !singularity) throw new Error('Invalid wormhole');

        this._stellarCode = stellarCode;
        this._eventHorizon = eventHorizon;
        this._singularity = singularity;
    }

    public get stellarCode(): string {
        return this._stellarCode;
    }

    public get eventHorizon(): string {
        return this._eventHorizon;
    }

    public get singularity(): string {
        return this._singularity;
    }
}
