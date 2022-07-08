import { LogRecord } from '../log';

export type LogsStore = {
  getLogs: (stream: string) => LogRecord[];
  getLastLog: (stream: string) => LogRecord | undefined;
  clearLogs: (streamId: string) => void;
};
