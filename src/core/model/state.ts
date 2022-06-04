import { DataSourceConnection } from '../services/DataSourceConnection';
import { Config } from './config';
import { DataSource } from './dataSource';
import { LogRecord } from './Log';
import { LogStreamRecord } from './logStream';

export type ReactiveState = {
  dataSources: Record<string, DataSource>;
  logStreams: Record<string, Record<string, LogStreamRecord>>;
  logs: Record<string, LogRecord>;
  config: Config;
};

export type StaticState = {
  connections: Record<string, DataSourceConnection>;
};
