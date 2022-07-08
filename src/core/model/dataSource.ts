export interface DataSourceRecord {
  id: string;
  url: string;
  name: string;
  version: string;
  status: ConnectionStatus;
}

export interface StoredDataSource {
  id: string;
  url: string;
  name: string;
  version: string;
}

export type ConnectionStatus =
  | 'disconnected'
  | 'available'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'warn';
