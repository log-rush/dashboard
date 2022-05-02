import { reactive } from 'vue';
import { DataSourceRecord, StoredDataSource } from '../model/dataSource';
import { Log } from '../model/Log';
import { LogStreamRecord, StoredLogStream } from '../model/stream';

export enum StorageKeys {
  DataSources = '&ds',
  Streams = '&ls',
}

export type RootState = {
  dataSources: Record<string, DataSourceRecord>;
  streams: Record<string, LogStreamRecord>;
  logs: Record<string, Log[]>;
};

const rootState: RootState = reactive({
  dataSources: {},
  streams: {},
  logs: {},
});

const save = () => {
  // store data sources
  localStorage.setItem(
    StorageKeys.DataSources,
    JSON.stringify(
      Object.values(rootState.dataSources).map(
        (ds): StoredDataSource => ({
          id: ds.id,
          name: ds.name,
          url: ds.url,
          version: ds.version,
        }),
      ),
    ),
  );
  // store log streams
  localStorage.setItem(
    StorageKeys.Streams,
    JSON.stringify(
      Object.values(rootState.streams).map(
        (ls): StoredLogStream => ({
          id: ls.id,
          alias: ls.alias,
          dataSource: ls.dataSource,
        }),
      ),
    ),
  );
};

const Store = {
  rootState,
  dataSources: rootState.dataSources,
  logStreams: rootState.streams,
  save,
};

export const useRootState = (): typeof Store => Store;
