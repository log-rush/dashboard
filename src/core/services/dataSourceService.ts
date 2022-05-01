import { LogRushHttpApi } from '../api/http';
import { DataSource } from '../model/dataSource';
import { LogStream } from '../model/stream';

export const DataSourcesService = {
  async getDataSource(ds: DataSource): Promise<DataSource | undefined> {
    return await LogRushHttpApi.getDataSource(ds.url);
  },
  async getStreams(ds: DataSource): Promise<LogStream[]> {
    return await LogRushHttpApi.getAllStreams(ds.url);
  },
};
