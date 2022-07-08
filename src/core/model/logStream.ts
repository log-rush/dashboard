import { ConnectionStatus } from './dataSource';

export interface LogStreamRecord {
  id: string;
  alias: string;
  dataSource: string;
  status: ConnectionStatus;
  isSubscribed: boolean;
  isCached: boolean;
}

export interface StoredLogStream {
  id: string;
  alias: string;
  dataSource: string;
}
