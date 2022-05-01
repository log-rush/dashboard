import { computed, reactive, UnwrapRef, watch } from 'vue';
import { DataSourceConnection } from '../services/DataSourceConnection';
import { DataSource } from '../model/dataSource';
import { DataSourcesService } from '../services/dataSourceService';

enum Keys {
  DataSources = '&ds',
}

type DataSourceRecord = DataSource & {
  connection: UnwrapRef<DataSourceConnection>;
};

const createConnection = (
  dataSource: DataSource,
): UnwrapRef<DataSourceConnection> =>
  reactive(
    new DataSourceConnection(dataSource.id, dataSource.url.split('://')[1]),
  );

const dataSources: Record<string, DataSourceRecord> = reactive({});

const createDataSource = async (url: string): Promise<boolean> => {
  const dataSource = await DataSourcesService.getDataSource({
    url,
  } as DataSource);
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

const getDataSource = (id: string): DataSourceRecord | undefined =>
  dataSources[id];

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
      DataSourcesService.getDataSource(ds).then((fetchedDataSource) => {
        if (fetchedDataSource) {
          if (fetchedDataSource.id !== ds.id) {
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
  getDataSource,
};

export const useDataSources = (): typeof Store => Store;
