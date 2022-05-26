export type DataSource = {
  id: string;
  url: string;
  name: string;
  version: string;
  status: ConnectionStatus;
};

export type StoredDataSource = {
  id: string;
  url: string;
  name: string;
  version: string;
};

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'warn';
