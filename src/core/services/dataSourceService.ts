import { LogRushHttpApi } from '../api/http';
import { DataSource } from '../model/dataSource';

export const DataSourcesService = {
  async registerDataSource(url: string): Promise<DataSource | undefined> {
    return await LogRushHttpApi.getDataSource(url);
  },
};
