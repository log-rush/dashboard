import { computed } from 'vue';
import { Log } from '../model/log';
import { useRootState } from './root';

const _rootState = useRootState();
const { logs } = _rootState.reactiveState;

const getLogs = (stream: string): Log[] => {
  return logs[stream].logs;
};

const getLogRef = (stream: string) => {
  return computed(() => logs[stream].lastLog);
};

const Store = {
  getLogs,
  getLogRef,
};

export const useLogs = (): typeof Store => Store;
