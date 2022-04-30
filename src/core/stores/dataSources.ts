import { computed, reactive, UnwrapRef, watch } from 'vue';
import { Socket } from '../api/ws/socket';
import { DataSource } from '../model/dataSource';
import { DataSourcesService } from '../services/dataSourceService';

enum Keys {
  DataSources = '&ds',
}

const dataSources: Record<string, DataSource> = reactive({});
const connections: Record<string, UnwrapRef<Socket>> = reactive({});

const createDataSource = async (url: string): Promise<boolean> => {
  const dataSource = await DataSourcesService.getDataSource(url);
  if (dataSource) {
    dataSources[dataSource.id] = dataSource;
    connections[dataSource.id] = reactive(
      new Socket(dataSource.url.split('://')[1], 10, 1_000),
    );
    return true;
  }
  return false;
};

const deleteDataSource = (dataSource: DataSource) => {
  const ds = dataSources[dataSource.id];
  if (ds) {
    connections[ds.id].close();
    delete connections[ds.id];
    delete dataSources[ds.id];
  }
};

watch(dataSources, (ds) => {
  localStorage.setItem(
    Keys.DataSources,
    JSON.stringify(
      Object.values(ds).map((ds) => ({
        id: ds.id,
        name: ds.name,
        url: ds.url,
        version: ds.version,
      })),
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
      dataSources[ds.id] = { ...ds };
      connections[ds.id] = reactive(
        new Socket(ds.url.split('://')[1], 10, 1_000),
      );
    }
  }
};
init();

const Store = {
  allDataSources: computed(() => Object.values(dataSources)),
  dataSources,
  connections,
  createDataSource,
  deleteDataSource,
};

export const useDataSources = (): typeof Store => Store;
