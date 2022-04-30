import { computed, reactive, UnwrapRef, watch } from 'vue';
import { Socket } from '../api/ws/socket';
import { DataSource } from '../model/dataSource';
import { DataSourcesService } from '../services/dataSourceService';

enum Keys {
  DataSources = '&ds',
}

type DataSourceRecord = DataSource & {
  connection: UnwrapRef<Socket>;
};

const createConnection = (dataSource: DataSource): UnwrapRef<Socket> =>
  reactive(new Socket(dataSource.url.split('://')[1], 10, 1_000));

const dataSources: Record<string, DataSourceRecord> = reactive({});

const createDataSource = async (url: string): Promise<boolean> => {
  const dataSource = await DataSourcesService.getDataSource(url);
  if (dataSource) {
    dataSources[dataSource.id] = {
      ...dataSource,
      connection: createConnection(dataSource),
    };
    return true;
  }
  return false;
};

const deleteDataSource = (dataSource: DataSource) => {
  const ds = dataSources[dataSource.id];
  if (ds) {
    dataSources[ds.id].connection.close();
    delete dataSources[ds.id];
  }
};

watch(dataSources, (ds) => {
  localStorage.setItem(
    Keys.DataSources,
    JSON.stringify(
      Object.values(ds).map(
        (ds): DataSource => ({
          id: ds.id,
          name: ds.name,
          url: ds.url,
          version: ds.version,
        }),
      ),
    ),
  );
});

const init = async () => {
  const storedSources = localStorage.getItem(Keys.DataSources);
  if (storedSources) {
    const parsedDataSources = JSON.parse(storedSources) as Omit<
      DataSource,
      'isConnected'
    >[];

    for (const ds of parsedDataSources) {
      dataSources[ds.id] = {
        ...ds,
        connection: createConnection(ds),
      };
    }
  }
};
init();

const Store = {
  allDataSources: computed(() => Object.values(dataSources)),
  rawDataSources: dataSources,
  createDataSource,
  deleteDataSource,
};

export const useDataSources = (): typeof Store => Store;
