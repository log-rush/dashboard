import { defineStore } from 'pinia';
import { LogHistory, LogRecord } from '../model/log';

export const useLogs = defineStore('log-rush-logs', {
  state: () => ({
    _logs: {} as Record<string, LogHistory>,
  }),
  getters: {
    getLogs: (state) => (stream: string) => state._logs[stream].logs,
    getLastLog: (state) => (stream: string) => state._logs[stream].lastLog,
  },
  actions: {
    _createKey(dsId: string, streamId: string) {
      return `${dsId}$${streamId}`;
    },
    _prepareLogs(dsId: string, streamId: string) {
      this._logs[this._createKey(dsId, streamId)] = {
        lastLog: {
          message: '',
          timestamp: 0,
        },
        logs: [],
      };
    },
    _createLogHandler(dsId: string) {
      return (streamId: string, log: LogRecord) => {
        if (this._logs[this._createKey(dsId, streamId)]) {
          const lastLog = this._logs[this._createKey(dsId, streamId)].lastLog;
          if (lastLog) {
            this._logs[this._createKey(dsId, streamId)].logs.push(lastLog);
          }
          this._logs[this._createKey(dsId, streamId)].lastLog = log;
        }
      };
    },
    clearLogs(dsId: string, streamId: string) {
      this._logs[this._createKey(dsId, streamId)] = {
        lastLog: {
          message: '',
          timestamp: 0,
        },
        logs: [],
      };
    },
  },
});
