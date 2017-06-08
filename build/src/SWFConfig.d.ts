import { EntityTypes } from './interfaces';
export declare enum ConfigDefaultUnit {
    Second = 0,
    Day = 1,
    Enum = 2,
    String = 3,
    Number = 4,
    Array = 5,
}
export interface MappingValue {
    api: string;
    attribute?: string;
    name: string;
}
export interface MappingUse {
    entities: EntityTypes[];
    api: string;
    attribute?: string;
}
export interface ConfigValue {
    description: string | null;
    mappings: MappingValue[];
    value: number | string | null;
    unit: ConfigDefaultUnit;
    possible?: {
        [index: number]: string;
    };
    format?(input: any): any;
}
export interface ConfigOverride {
    [configKeyName: string]: number | string;
}
export interface ConfigGroup {
    [configKeyName: string]: ConfigValue;
}
export interface ConfigGroups {
    [entity: string]: ConfigGroup;
}
export interface ConfigOverrides {
    domain?: ConfigOverride;
    activity?: ConfigOverride;
    decision?: ConfigOverride;
    workflow?: ConfigOverride;
}
export declare class SWFConfig {
    defaults: ConfigGroups;
    constructor(overrideConfig?: ConfigOverrides);
    getValueUnit(unit: string | number): ConfigDefaultUnit;
    applyOverrideConfig(defaultConfig: ConfigGroup, overrides?: ConfigOverride): ConfigGroup;
    getParamsForApi(forApi: MappingUse): ConfigGroup;
    getValueForParam(entity: EntityTypes, paramName: string): number | string | null;
    isCorrectMapping(forApi: MappingUse, mapping: MappingValue): boolean;
    getMappingName(paramName: string, forApi: MappingUse): string | null;
    populateDefaults(forApi: MappingUse, opts?: ConfigOverride): {
        [keyName: string]: any;
    };
}
