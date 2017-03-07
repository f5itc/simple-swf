import * as entities from './entities';
import * as tasks from './tasks';
import * as workers from './workers';
import * as util from './util';
import * as config from './SWFConfig';
import * as common from './interfaces';
declare const all: {
    entities: typeof entities;
    tasks: typeof tasks;
    workers: typeof workers;
    util: typeof util;
    config: typeof config;
    common: typeof common;
};
export default all;
