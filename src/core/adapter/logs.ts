import { defineStore } from 'pinia';
import { LogHistory, LogRecord } from '../model/log';

const createKey = (dsId: string, streamId: string) => `${dsId}$${streamId}`;

export const useLogs = defineStore('log-rush-logs', {
  state: () => ({
    _logs: {} as Record<string, LogHistory>,
  }),
  getters: {
    getLogs: (state) => (dsId: string, stream: string) =>
      state._logs[createKey(dsId, stream)]?.logs ?? [],
    getLastLog: (state) => (dsId: string, stream: string) =>
      state._logs[createKey(dsId, stream)]?.lastLog,
  },
  actions: {
    _prepareLogs(dsId: string, streamId: string) {
      this._logs[createKey(dsId, streamId)] = {
        lastLog: {
          message: '',
          timestamp: 0,
        },
        logs: [],
      };
    },
    _createLogHandler(dsId: string) {
      return (streamId: string, log: LogRecord) => {
        if (this._logs[createKey(dsId, streamId)]) {
          const lastLog = this._logs[createKey(dsId, streamId)].lastLog;
          if (lastLog) {
            this._logs[createKey(dsId, streamId)].logs.push(lastLog);
          }
          this._logs[createKey(dsId, streamId)].lastLog = log;
        }
      };
    },
    clearLogs(dsId: string, streamId: string) {
      this._logs[createKey(dsId, streamId)] = {
        lastLog: {
          message: '',
          timestamp: 0,
        },
        logs: [],
      };
    },
  },
});
