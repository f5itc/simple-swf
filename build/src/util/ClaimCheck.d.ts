/// <reference types="node" />
export interface CheckFormat {
    _claimCheck: boolean;
    key: string;
}
export declare abstract class ClaimCheck {
    abstract buildCheck(input: string, cb: {
        (err: Error, check: string);
    }): any;
    abstract retriveCheck(input: CheckFormat, cb: {
        (err: Error, original: string);
    }): any;
    isClaimCheck(input: any): input is CheckFormat;
}
