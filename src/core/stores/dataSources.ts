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

const deleteDataSource = (dataSource: DataSource) => {
  dataSources.value = dataSources.value.filter(
    (ds) => dataSource.url !== ds.url,
  );
};

watch(dataSources, (ds) => {
  localStorage.setItem(
    Keys.DataSources,
    JSON.stringify(
      ds.map((ds: Partial<DataSource>) => {
        delete ds['isConnected'];
        return ds;
      }),
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
      dataSources.value = [
        ...dataSources.value,
        {
          ...ds,
          isConnected: false,
        },
      ];
    }
  }
};
init();

const Store = {
  dataSources,
  createDataSource,
  deleteDataSource,
};

export const useDataSources = (): typeof Store => Store;
