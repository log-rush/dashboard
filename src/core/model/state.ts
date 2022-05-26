import { DataSourceConnection } from '../services/DataSourceConnection';
import { DataSource } from './dataSource';
import { Log } from './Log';
import { LogStreamRecord } from './logStream';

export type ReactiveState = {
  dataSources: Record<string, DataSource>;
  logStreams: Record<string, Record<string, LogStreamRecord>>;
  logs: Record<string, Log[]>;
};

export type StaticState = {
  connections: Record<string, DataSourceConnection>;
};
