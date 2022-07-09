import { UnwrapNestedRefs } from 'vue';
import { DataSource } from '../domain/DataSource';
import { LogStream } from '../domain/LogStream';
import { Config } from './config';
import { LogHistory } from './Log';

export type ReactiveState = {
  dataSources: Record<string, UnwrapNestedRefs<DataSource>>;
  logStreams: Record<string, Record<string, UnwrapNestedRefs<LogStream>>>;
  logs: Record<string, LogHistory>;
  config: Config;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type StaticState = {};
