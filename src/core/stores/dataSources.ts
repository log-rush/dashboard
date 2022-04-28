import { ref, watch } from 'vue';
import { DataSource } from '../model/dataSource';
import { DataSourcesService } from '../services/dataSourceService';

enum Keys {
  DataSources = '&ds',
}

const dataSources = ref<DataSource[]>([]);

const createDataSource = async (url: string): Promise<boolean> => {
  const dataSource = await DataSourcesService.getDataSource(url);
  if (dataSource) {
    dataSources.value = [...dataSources.value, dataSource];
    return true;
  }
  return false;
};

watch(dataSources, (ds) => {
  localStorage.setItem(
    Keys.DataSources,
    JSON.stringify(ds.map((ds) => ds.url)),
  );
});

const init = async () => {
  const storedSources = localStorage.getItem(Keys.DataSources);
  if (storedSources) {
    const parsedDataSources = JSON.parse(storedSources) as string[];

    for (const url of parsedDataSources) {
      const ds = await DataSourcesService.getDataSource(url);
      if (ds) {
        dataSources.value = [...dataSources.value, ds];
      }
    }
  }
};
init();

const Store = {
  dataSources,
  createDataSource,
};

export const useDataSources = (): typeof Store => Store;