/// <reference types="node" />
/// <reference types="chai" />
import { SWF } from 'aws-sdk';
import { Domain } from './Domain';
export declare class ActivityTypeInfo {
    name: string;
    version: string;
    domainScope: {
        [domainName: string]: {
            status?: SWF.RegistrationStatus;
            description?: string;
            creationDate?: Date;
            deprecationDate?: Date;
        };
    };
    constructor(name: string, version: string);
    describeActivityType(domain: Domain, cb: {
        (err?: Error | null, data?: any);
    }): void;
    deprecateActivityType(domain: Domain, cb: {
        (err?: Error);
    }): void;
    toJSON(): Object;
}
