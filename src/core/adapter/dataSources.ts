import { defineStore } from 'pinia';
import { DataSource } from '@/core/domain/DataSource';
import { StorageKeys } from '../stores/util/type';
import { useLogStreams } from './logStreams';
import { useLogs } from './logs';

export const useDataSources = defineStore('log-rush-dataSources', {
  state: () => ({
    _dataSources: {} as Record<string, DataSource>,
  }),
  getters: {
    allDataSources: (state) =>
      Object.values(state._dataSources).map((ds) => ds.toRecord()),
    getDataSource: (state) => (dsId: string) =>
      state._dataSources[dsId]?.toRecord(),
    getRawDataSource: (state) => (dsId: string) => state._dataSources[dsId],
  },
  actions: {
    _saveState() {
      localStorage.setItem(
        StorageKeys.DataSources,
        JSON.stringify(
          Object.values(this._dataSources).map((ds) => ds.toStorageRecord()),
        ),
      );
    },
    async createDataSource(url: string) {
      const dataSource = await DataSource.create(url);
      if (dataSource) {
        this._dataSources[dataSource.id] = dataSource;
        useLogStreams()._prepareDataSource(dataSource.id);
        this._saveState();
        return true;
      }
      return false;
    },
    deleteDataSource(id: string) {
      const ds = this._dataSources[id];

      if (ds) {
        ds.disconnect();
        delete this._dataSources[ds.id];
        this._saveState();
      }
    },
    reconnect(id: string) {
      this.getRawDataSource(id)?.reconnect();
    },
    connect(id: string) {
      this.getRawDataSource(id)?.connect({
        onLog: useLogs()._createLogHandler(),
      });
    },
    disconnect(id: string) {
      this.getRawDataSource(id)?.disconnect();
    },
    setAutoConnect(id: string, enabled: boolean) {
      // TODO: make this general update method using partial object
      this.getRawDataSource(id)?.setAutoConnect(enabled);
      this._saveState();
    },
  },
});
