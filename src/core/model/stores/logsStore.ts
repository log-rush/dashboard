import { Log } from '../log';

export type LogsStore = {
  getLogs: (stream: string) => Log[];
  getLastLog: (stream: string) => Log | undefined;
  clearLogs: (streamId: string) => void;
};
