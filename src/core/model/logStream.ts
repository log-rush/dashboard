import { ConnectionStatus } from './dataSource';

export interface LogStreamRecord {
  id: string;
  alias: string;
  dataSource: string;
  status: ConnectionStatus;
  isSubscribed: boolean;
}

export interface StoredLogStream {
  id: string;
  alias: string;
  dataSource: string;
}
