import { defineStore } from 'pinia';
import { LogStream } from '../domain/LogStream';
import { useDataSources } from './dataSources';
import { LogStreamRecord } from '../model/logStream';
import { useLogs } from './logs';

export const useLogStreams = defineStore('log-rush-logStreams', {
  state: () => ({
    _logStreams: {} as Record<string, Record<string, LogStream>>,
  }),
  getters: {
    getAllStreams: (state) =>
      Object.keys(state._logStreams).flatMap((dsId) =>
        Object.values(state._logStreams[dsId] ?? {}).map((ls) => ls.toRecord()),
      ),
    getSubscribedStreams(): LogStreamRecord[] {
      return this.getAllStreams.filter((stream) => stream.isSubscribed);
    },
    getRawStream: (state) => (dsId: string, id: string) =>
      (state._logStreams[dsId] ?? {})[id],
  },
  actions: {
    _prepareDataSource(id: string) {
      if (!this._logStreams[id]) {
        // don't override if existing
        this._logStreams[id] = {};
      }
    },
    async getStreamsForDataSource(dsId: string) {
      const ds = useDataSources().getRawDataSource(dsId);
      if (!ds) {
        return [];
      }

      const allStreams: LogStreamRecord[] = [];
      const streams = await ds.listStreams();
      for (const stream of streams) {
        if (stream.id in this._logStreams[dsId]) {
          allStreams.push(this._logStreams[dsId][stream.id]);
          continue;
        } else {
          // new stream
          const newStream = await LogStream.create(ds, stream.id);
          if (newStream) {
            allStreams.push(newStream);
            this._logStreams[dsId][stream.id] = newStream;
            useLogs()._prepareLogs(stream.id);
          }
        }
      }
      return allStreams;
    },
    subscribe(dsId: string, id: string) {
      this.getRawStream(dsId, id)?.subscribe();
    },
    subscribeTemporary(dsId: string, id: string) {
      const close = this.getRawStream(dsId, id)?.subscribeTemporary();
      return () => {
        if (close()) {
          useLogs().clearLogs(id);
        }
      };
    },
    unsubscribe(dsId: string, id: string) {
      this.getRawStream(dsId, id)?.unsubscribe();
    },
  },
});
