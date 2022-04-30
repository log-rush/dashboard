import { computed, watch } from 'vue';
import { DataSourceEntity } from '../entities/DataSourceEntity';
import { DataSource } from '../model/dataSource';
import { DataSourcesService } from '../services/dataSourceService';

enum Keys {
  DataSources = '&ds',
}

const dataSources: Record<string, DataSourceEntity> = {};

const createDataSource = async (url: string): Promise<boolean> => {
  const dataSource = await DataSourcesService.getDataSource(url);
  if (dataSource) {
    dataSources[dataSource.id] = new DataSourceEntity(
      dataSource.id,
      dataSource.url,
      dataSource.name,
    );
    return true;
  }
  return false;
};

const deleteDataSource = (dataSource: DataSource) => {
  const ds = dataSources[dataSource.id];
  if (ds) {
    ds.close();
    delete dataSources[ds.id];
  }
};

watch(
  () => dataSources,
  (ds) => {
    localStorage.setItem(
      Keys.DataSources,
      JSON.stringify(
        Object.values(ds).map((ds: Partial<DataSource>) => {
          delete ds['isConnected'];
          return ds;
        }),
      ),
    );
  },
);

const init = async () => {
  const storedSources = localStorage.getItem(Keys.DataSources);
  if (storedSources) {
    const parsedDataSources = JSON.parse(storedSources) as Omit<
      DataSource,
      'isConnected'
    >[];

    for (const ds of parsedDataSources) {
      dataSources[ds.id] = new DataSourceEntity(ds.id, ds.url, ds.name);
    }
  }
};
init();

const Store = {
  dataSources: computed(() => Object.values(dataSources)),
  createDataSource,
  deleteDataSource,
};

export const useDataSources = (): typeof Store => Store;
