import { computed, reactive, UnwrapRef } from 'vue';
import { DataSourceConnection } from '../services/DataSourceConnection';
import { DataSource, StoredDataSource } from '../model/dataSource';
import { DataSourcesService } from '../services/dataSourceService';
import { StorageKeys, useRootState } from './root';

const createConnection = (
  id: string,
  url: string,
): UnwrapRef<DataSourceConnection> =>
  reactive(new DataSourceConnection(id, url.split('://')[1]));

const createDataSource = async (url: string): Promise<boolean> => {
  const dataSource = await DataSourcesService.getDataSource(url);
  const { dataSources, save } = useRootState();
  if (dataSource) {
    dataSources[dataSource.id] = {
      ...dataSource,
      url: url,
      connection: createConnection(dataSource.id, url),
    };
    save();
    return true;
  }
  return false;
};

const deleteDataSource = (id: string) => {
  const { dataSources, save } = useRootState();
  const ds = dataSources[id];

  if (ds) {
    dataSources[ds.id].connection.close();
    delete dataSources[ds.id];
    save();
  }
};

const getDataSource = (id: string | undefined): DataSource | undefined => {
  const ds = useRootState().dataSources[id ?? ''];
  return reactive({
    ...ds,
    status: computed(() => ds.connection.state),
  });
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
};

export const useDataSources = (): typeof Store => Store;
