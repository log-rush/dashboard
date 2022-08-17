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
    _prepareLogs(streamId: string) {
      this._logs[streamId] = {
        lastLog: {
          message: '',
          timestamp: 0,
        },
        logs: [],
      };
    },
    _createLogHandler() {
      return (stream: string, log: LogRecord) => {
        if (this._logs[stream]) {
          const lastLog = this._logs[stream].lastLog;
          if (lastLog) {
            this._logs[stream].logs.push(lastLog);
          }
          this._logs[stream].lastLog = log;
        }
      };
    },
    clearLogs(streamId: string) {
      this._logs[streamId] = {
        lastLog: {
          message: '',
          timestamp: 0,
        },
        logs: [],
      };
    },
  },
});
