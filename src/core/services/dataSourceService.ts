import { LogRushHttpApi } from '../api/http';
import {
  DataSourceInfoResponse,
  LogStreamResponse,
} from '../model/api/httpTypes';

export const DataSourcesHttpService = {
  async getDataSource(
    dsUrl: string,
  ): Promise<DataSourceInfoResponse | undefined> {
    return await LogRushHttpApi.getDataSource(dsUrl);
  },
  async getStreams(dsUrl: string): Promise<LogStreamResponse[]> {
    return await LogRushHttpApi.getAllStreams(dsUrl);
  },
};
