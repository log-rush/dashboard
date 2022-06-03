import { Log } from '../model/log';
import { useRootState } from './root';

const _rootState = useRootState();
const { logs } = _rootState.reactiveState;

const getLogs = (stream: string): Log[] => {
  return logs[stream];
};

const Store = {
  getLogs,
};

export const useLogs = (): typeof Store => Store;
