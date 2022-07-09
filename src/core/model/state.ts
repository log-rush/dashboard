import { UnwrapNestedRefs } from 'vue';
import { DataSource } from '../domain/DataSource';
import { Config } from './config';
import { LogHistory } from './Log';
import { LogStreamRecord } from './logStream';

export type ReactiveState = {
  dataSources: Record<string, UnwrapNestedRefs<DataSource>>;
  logStreams: Record<string, Record<string, LogStreamRecord>>;
  logs: Record<string, LogHistory>;
  config: Config;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type StaticState = {};
