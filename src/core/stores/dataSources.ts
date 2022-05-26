import { computed } from 'vue';
import { DataSourceConnection } from '../services/DataSourceConnection';
import { DataSource, StoredDataSource } from '../model/dataSource';
import { DataSourcesService } from '../services/dataSourceService';
import { StorageKeys, useRootState } from './root';
import { Log } from '../model/log';

const _rootState = useRootState();
const saveState = _rootState.save;
const { dataSources, logStreams } = _rootState.reactiveState;
const { connections } = _rootState.staticState;

const createDataSource = async (url: string): Promise<boolean> => {
  const dataSource = await DataSourcesService.getDataSource(url);
  if (dataSource) {
    dataSources[dataSource.id] = {
      ...dataSource,
      url: url,
      status: 'disconnected',
    };
    logStreams[dataSource.id] = {};
    connections[dataSource.id] = createConnection(dataSource.id, url);
    saveState();
    return true;
  }
  return false;
};

const deleteDataSource = (id: string) => {
  const ds = dataSources[id];

  if (ds) {
    connections[ds.id].close();
    delete dataSources[ds.id];
    delete connections[ds.id];
    saveState();
  }
};

const reconnect = (id: string) => {
  const ds = dataSources[id];

  if (ds) {
    connections[ds.id].tryReConnect();
  }
};

const getDataSource = (id: string | undefined): DataSource | undefined =>
  dataSources[id ?? ''];

const createConnection = (id: string, url: string): DataSourceConnection => {
  const connection = new DataSourceConnection(id, url.split('://')[1]);
  connection.setLogHandler(logHandler);
  connection.setStatusUpdateHandler((status) => {
    if (dataSources[id]) {
      dataSources[id].status = status;
    }
  });
  return connection;
};

const logHandler = (stream: string, log: Log) => {
  _rootState.reactiveState.logs[stream].push(log);
};

const init = async () => {
  const storedSources = localStorage.getItem(StorageKeys.DataSources);
  if (!storedSources) return;

  const parsedDataSources = JSON.parse(storedSources) as StoredDataSource[];
  for (const ds of parsedDataSources) {
    DataSourcesService.getDataSource(ds.url).then((fetchedDataSource) => {
      if (fetchedDataSource) {
        if (fetchedDataSource.id !== ds.id) {
          deleteDataSource(ds.id);
          createDataSource(ds.url);
        } else {
          dataSources[ds.id].name = fetchedDataSource.name;
          dataSources[ds.id].version = fetchedDataSource.version;
        }
      }
    });
    dataSources[ds.id] = {
      ...ds,
      status: 'disconnected',
    };
    logStreams[ds.id] = logStreams[ds.id] ?? {};
    connections[ds.id] = createConnection(ds.id, ds.url);
  }
  saveState();
};
init();

const Store = {
  allDataSources: computed(() =>
    Object.values(useRootState().reactiveState.dataSources),
  ),
  createDataSource,
  deleteDataSource,
  getDataSource,
  reconnect,
};

export const useDataSources = (): typeof Store => Store;
