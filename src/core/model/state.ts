import { DataSourceConnection } from '../services/DataSourceConnection';
import { Config } from './config';
import { DataSourceInterface } from './dataSource';
import { LogRecord } from './Log';
import { LogStreamRecord } from './logStream';

export type ReactiveState = {
  dataSources: Record<string, DataSourceInterface>;
  logStreams: Record<string, Record<string, LogStreamRecord>>;
  logs: Record<string, LogRecord>;
  config: Config;
};

export type StaticState = {
  connections: Record<string, DataSourceConnection>;
};
