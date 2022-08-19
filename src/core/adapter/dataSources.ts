import { defineStore } from 'pinia';
import { DataSource } from '@/core/domain/DataSource';
import { useLogStreams } from './logStreams';
import { useLogs } from './logs';
import { StorageKeys } from './util/storage';
import {
  ConnectionStatus,
  DataSourceRecord,
  StoredDataSource,
} from '../model/dataSource';

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
    getDataSourceByUrl(): (url: string) => DataSourceRecord | undefined {
      return (url: string) => this.allDataSources.find((ds) => ds.url === url);
    },
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
    _createStatusUpdater(id: string) {
      return (status: ConnectionStatus) => {
        if (this._dataSources[id]) {
          this._dataSources[id].status = status;
        }
      };
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
      const ds = this.getRawDataSource(id);
      if (ds) {
        ds.connect({
          onLog: useLogs()._createLogHandler(id),
          onStatusUpdate: this._createStatusUpdater(id),
        });
      }
    },
    disconnect(id: string) {
      this.getRawDataSource(id)?.disconnect();
    },
    setAutoConnect(id: string, enabled: boolean) {
      // TODO: make this general update method using partial object
      const ds = this.getRawDataSource(id);
      if (ds) {
        ds.autoConnect = enabled;
        this._saveState();
      }
    },
    _init() {
      const storedSources = localStorage.getItem(StorageKeys.DataSources);
      if (!storedSources) return;

      const parsedDataSources = JSON.parse(storedSources) as StoredDataSource[];
      for (const _cachedDs of parsedDataSources) {
        DataSource.createFromCache(_cachedDs, (id) => ({
          onLog: useLogs()._createLogHandler(id),
          onStatusUpdate: this._createStatusUpdater(id),
        })).then((ds) => {
          this._dataSources[ds.id] = ds;
          useLogStreams()._prepareDataSource(ds.id);
          this._saveState();
        });
      }
    },
  },
});
