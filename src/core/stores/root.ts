import { reactive } from 'vue';
import { StoredDataSource } from '../model/dataSource';
import { StoredLogStream } from '../model/logStream';
import { ReactiveState, StaticState } from '../model/state';

export enum StorageKeys {
  DataSources = '&ds',
  Streams = '&ls',
}

const reactiveState = reactive<ReactiveState>({
  dataSources: {},
  logStreams: {},
  logs: {},
});

const staticState: StaticState = {
  connections: {},
};

const save = () => {
  // store data sources
  localStorage.setItem(
    StorageKeys.DataSources,
    JSON.stringify(
      Object.values(reactiveState.dataSources).map(
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
      Object.keys(reactiveState.logStreams).flatMap((id) =>
        Object.values(reactiveState.logStreams[id]).map(
          (ls): StoredLogStream => ({
            id: ls.id,
            alias: ls.alias,
            dataSource: ls.dataSource,
          }),
        ),
      ),
    ),
  );
};

const Store = {
  reactiveState,
  staticState,
  save,
};

export const useRootState = (): typeof Store => Store;
