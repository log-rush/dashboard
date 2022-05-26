import { ConnectionStatus } from './dataSource';

export type LogStream = {
  id: string;
  alias: string;
  dataSource: string;
  status: ConnectionStatus;
};

export type LogStreamRecord = LogStream & {
  isSubscribed: boolean;
  fromCache: boolean;
};

export type StoredLogStream = Omit<LogStream, 'status'>;
