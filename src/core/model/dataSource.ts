import { UnwrapRef } from 'vue';
import { DataSourceConnection } from '../services/DataSourceConnection';

export type DataSource = {
  id: string;
  url: string;
  name: string;
  version: string;
  status: ConnectionStatus;
};

export type StoredDataSource = Omit<DataSource, 'status'>;

export type DataSourceRecord = Omit<DataSource, 'status'> & {
  connection: UnwrapRef<DataSourceConnection>;
};

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'warn';
