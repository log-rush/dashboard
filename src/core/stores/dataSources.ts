import { DataSourceConnection } from '../services/DataSourceConnection';
import { DataSourceInterface, StoredDataSource } from '../model/dataSource';
import { DataSourcesService } from '../services/dataSourceService';
import { CreateStoreFunc, StorageKeys } from './util/type';
import { Log } from '../model/log';

const createStore: CreateStoreFunc<'dataSources', StorageKeys.DataSources> = ({
  reactiveState,
  staticState,
  stores,
}) => {
  const { dataSources, logStreams } = reactiveState;
  const { connections } = staticState;

  const saveState = () => {
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
  };

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

  const getDataSource = (
    id: string | undefined,
  ): DataSourceInterface | undefined => dataSources[id ?? ''];

  const connectDataSource = (id: string) => {
    if (!connections[id] && getDataSource(id)) {
      connections[id] = createConnection(id, getDataSource(id)?.url ?? '');
    } else {
      connections[id]?.tryReConnect();
    }
  };

  const createConnection = (id: string, url: string): DataSourceConnection => {
    const connection = new DataSourceConnection(id, url.split('://')[1]);
    connection.setLogHandler(logHandler);
    connection.setStatusUpdateHandler((status) => {
      if (dataSources[id]) {
        dataSources[id].status = status;
      }
    });

    stores.logStreams.getCachedStreamsForDataSource(id).forEach((stream) => {
      connection.subscribe(stream.id);
      stores.logs.clearLogs(stream.id);
      stream.isSubscribed = true;
      stream.status = 'connected';
    });
    return connection;
  };

  const logHandler = (stream: string, log: Log) => {
    reactiveState.logs[stream].logs.push(log);
    reactiveState.logs[stream].lastLog = log;
  };

  const init = () => {
    console.log('init data sources');

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
          if (!connections[ds.id]) {
            dataSources[ds.id].status = 'available';
          }
        }
      });
      dataSources[ds.id] = {
        ...ds,
        status: 'disconnected',
      };
      logStreams[ds.id] = logStreams[ds.id] ?? {};
    }
    saveState();
  };

  const Store = {
    allDataSources: () => Object.values(dataSources),
    connectToDataSource: connectDataSource,
    createDataSource,
    deleteDataSource,
    getDataSource,
    reconnect,
  };

  return {
    key: 'dataSources',
    store: Store,
    storageKey: StorageKeys.DataSources,
    save: () => saveState(),
    setup: () => init(),
  };
};

export default createStore;
