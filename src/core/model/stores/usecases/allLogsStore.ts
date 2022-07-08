import { LogRecord } from '../../log';

export type AllLogsStore = {
  getLogs: () => LogRecord[];
  getLogRef: () => LogRecord;
  setShowNames: (enabled: boolean) => void;
  getShowNames: () => boolean;
};
