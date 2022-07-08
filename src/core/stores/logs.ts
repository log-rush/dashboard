import { LogRecord } from '../model/log';
import { CreateStoreFunc, StorageKeys } from './util/type';

const createStore: CreateStoreFunc<'logs', StorageKeys.NonPersistent> = ({
  reactiveState,
}) => {
  const { logs } = reactiveState;

  const getLogs = (stream: string): LogRecord[] => {
    return logs[stream].logs;
  };

  const getLastLog = (stream: string) => {
    return logs[stream].lastLog;
  };

  const clearLogs = (streamId: string) => {
    logs[streamId] = {
      lastLog: {
        message: '',
        timestamp: 0,
      },
      logs: [],
    };
  };

  const Store = {
    getLogs,
    getLastLog,
    clearLogs,
  };

  return {
    key: 'logs',
    store: Store,
    setup: () => {
      return;
    },
  };
};

export default createStore;
