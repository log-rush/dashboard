import { ref, watch } from 'vue';
import { DataSource } from '../model/dataSource';
import { DataSourcesService } from '../services/dataSourceService';

enum Keys {
  DataSources = '&ds',
}

const dataSources = ref<DataSource[]>([]);

const createDataSource = async (url: string): Promise<boolean> => {
  const dataSource = await DataSourcesService.connectToDataSource(url);
  if (dataSource) {
    dataSources.value.push(dataSource);
    return true;
  }
  return false;
};

watch(dataSources, (ds) => {
  localStorage.setItem(
    Keys.DataSources,
    JSON.stringify(
      ds.map((ds: Partial<DataSource>) => {
        delete ds['isConnected'];
      }),
    ),
  );
});

const init = () => {
  const storedSources = localStorage.getItem(Keys.DataSources);
  if (storedSources) {
    const parsedDataSources = JSON.parse(storedSources) as Omit<
      DataSource,
      'isConnected'
    >[];
    dataSources.value = parsedDataSources.map((ds) => ({
      ...ds,
      isConnected: false,
    }));
  }
};
init();

const Store = {
  dataSources,
  createDataSource,
};

export const useDataSources = (): typeof Store => Store;
