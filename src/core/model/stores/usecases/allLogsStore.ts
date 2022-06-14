import { Log } from '../../log';

export type AllLogsStore = {
  getLogs: () => Log[];
  getLogRef: () => Log;
  setShowNames: (enabled: boolean) => void;
  getShowNames: () => boolean;
};
