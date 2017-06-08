import { ConfigOverride } from '../SWFConfig';
import { ClaimCheck } from './ClaimCheck';
export declare const DefaultFields: string[];
/**
 * we want to be able to pass around JSON objects but SWF
 * only really supports strings for most of its data fields
 * this class takes care of wrapping fields as well as claimChecking
 * fields that are above the max length
 */
export declare class FieldSerializer {
    fields: string[];
    claimChecker: ClaimCheck;
    maxLength: number;
    constructor(claimChecker: ClaimCheck, fields?: string[], opts?: ConfigOverride);
    serializeAll<T>(input: any, cb: {
        (Error?, T?);
    }): void;
    serialize(input: any, cb: {
        (err: Error | null, output: string);
    }): void;
    deserializeAll<T>(input: Object, cb: {
        (Error?, T?);
    }): void;
    deserializeSome<T>(fields: string[], input: Object, cb: {
        (Error?, T?);
    }): void;
    deserialize<T>(input: string | null, cb: {
        (Error?, T?);
    }): any;
    private tooLong(field);
}
