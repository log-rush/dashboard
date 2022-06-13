import { Ref } from 'vue';
import { Log } from '../../log';

export type AllLogsStore = {
  getLogRef: () => Ref<Log>;
};
