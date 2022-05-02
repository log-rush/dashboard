import { computed, reactive, UnwrapRef } from 'vue';
import { DataSourceConnection } from '../services/DataSourceConnection';
import { DataSource, StoredDataSource } from '../model/dataSource';
import { DataSourcesService } from '../services/dataSourceService';
import { StorageKeys, useRootState } from './root';
import { Log } from '../model/Log';

const _rootState = useRootState();
const saveState = _rootState.save;
const { dataSources } = _rootState;

const createDataSource = async (url: string): Promise<boolean> => {
  const dataSource = await DataSourcesService.getDataSource(url);
  if (dataSource) {
    dataSources[dataSource.id] = {
      ...dataSource,
      url: url,
      connection: createConnection(dataSource.id, url),
    };
    saveState();
    return true;
  }
  return false;
};

const deleteDataSource = (id: string) => {
  const ds = dataSources[id];

  if (ds) {
    dataSources[ds.id].connection.close();
    delete dataSources[ds.id];
    saveState();
  }
};

const getDataSource = (id: string | undefined): DataSource | undefined => {
  const ds = dataSources[id ?? ''];
  return reactive({
    ...ds,
    status: computed(() => ds.connection.state),
  });
};

const subscribeToStream = (ofDataSourceId: string, stream: string) => {
  const ds = dataSources[ofDataSourceId ?? ''];
  if (!ds) return;
  ds.connection.subscribe(stream);
};

const unsubscribeFromStream = (ofDataSourceId: string, stream: string) => {
  const ds = dataSources[ofDataSourceId ?? ''];
  if (!ds) return;
  ds.connection.unsubscribe(stream);
};

const createConnection = (
  id: string,
  url: string,
): UnwrapRef<DataSourceConnection> => {
  const connection = new DataSourceConnection(id, url.split('://')[1]);
  connection.setLogHandler(logHandler);
  return reactive(connection);
};

const logHandler = (stream: string, log: Log) => {
  _rootState.rootState.logs[stream].push(log);
};

const init = async () => {
  const { dataSources, save } = useRootState();
  const storedSources = localStorage.getItem(StorageKeys.DataSources);
  if (!storedSources) return;

  const parsedDataSources = JSON.parse(storedSources) as StoredDataSource[];
  for (const ds of parsedDataSources) {
    DataSourcesService.getDataSource(ds.url).then((fetchedDataSource) => {
      if (fetchedDataSource) {
        if (fetchedDataSource.id !== ds.id) {
          // TODO: handle data source id change
          // deleteDataSource(ds);
          // createDataSource(fetchedDataSource.url);
        } else {
          dataSources[ds.id].name = fetchedDataSource.name;
          dataSources[ds.id].version = fetchedDataSource.version;
        }
      }
    });
    dataSources[ds.id] = {
      ...ds,
      connection: createConnection(ds.id, ds.url),
    };
  }
  save();
};
init();

const Store = {
  allDataSources: computed(() => Object.values(useRootState().dataSources)),
  createDataSource,
  deleteDataSource,
  getDataSource,
  subscribeToStream,
  unsubscribeFromStream,
};

export const useDataSources = (): typeof Store => Store;
