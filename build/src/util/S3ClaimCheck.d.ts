/// <reference types="node" />
import { S3 } from 'aws-sdk';
import { ClaimCheck, CheckFormat } from './ClaimCheck';
export interface S3CheckFormat extends CheckFormat {
    url: string;
}
export declare class S3ClaimCheck extends ClaimCheck {
    bucketName: string;
    prefix: string;
    s3Client: S3;
    constructor(bucketName: string, prefix: string, s3Client?: S3);
    buildCheck(input: string, cb: {
        (err: Error | null, check: string);
    }): void;
    retriveCheck(input: CheckFormat, cb: {
        (err: Error | null, contents: string);
    }): void;
}
