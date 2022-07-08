import { DataSourceConnection } from '../services/DataSourceConnection';
import { Config } from './config';
import { DataSourceRecord } from './dataSource';
import { LogHistory } from './Log';
import { LogStreamRecord } from './logStream';

export type ReactiveState = {
  dataSources: Record<string, DataSourceRecord>;
  logStreams: Record<string, Record<string, LogStreamRecord>>;
  logs: Record<string, LogHistory>;
  config: Config;
};

export type StaticState = {
  connections: Record<string, DataSourceConnection>;
};
