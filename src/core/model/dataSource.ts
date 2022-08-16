export interface DataSourceRecord {
  id: string;
  url: string;
  name: string;
  version: string;
  autoConnect: boolean;
  status: ConnectionStatus;
}

export interface StoredDataSource {
  id: string;
  url: string;
  name: string;
  version: string;
  autoConnect: boolean;
}

export type DataSourceLink = {
  url: string;
};

export type ConnectionStatus =
  | 'disconnected'
  | 'available'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'warn';
