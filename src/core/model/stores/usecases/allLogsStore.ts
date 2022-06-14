import { Log } from '../../log';

export type AllLogsStore = {
  getLogRef: () => Log;
  setShowNames: (enabled: boolean) => void;
  getShowNames: () => boolean;
};
