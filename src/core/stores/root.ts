import { reactive } from 'vue';
import { Config } from '../model/config';
import { StoredDataSource } from '../model/dataSource';
import { StoredLogStream } from '../model/logStream';
import { ReactiveState, StaticState } from '../model/state';

export enum StorageKeys {
  DataSources = '&ds',
  Streams = '&ls',
  Config = '&c',
}

const reactiveState = reactive<ReactiveState>({
  dataSources: {},
  logStreams: {},
  logs: {},
  config: {} as Config,
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
        Object.values(reactiveState.logStreams[id])
          .filter((ls) => ls.isSubscribed)
          .map(
            (ls): StoredLogStream => ({
              id: ls.id,
              alias: ls.alias,
              dataSource: ls.dataSource,
            }),
          ),
      ),
    ),
  );
  // store config
  localStorage.setItem(
    StorageKeys.Config,
    JSON.stringify(reactiveState.config),
  );
};

const Store = {
  reactiveState,
  staticState,
  save,
};

export const useRootState = (): typeof Store => Store;
