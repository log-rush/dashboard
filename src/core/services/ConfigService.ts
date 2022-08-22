import { LogRushHttpApi } from '../api/http';
import { DataSourcePluginsResponse } from '../model/api/httpTypes';

export const ConfigService = {
  async getPlugins(
    dsUrl: string,
  ): Promise<DataSourcePluginsResponse | undefined> {
    return await LogRushHttpApi.getPlugins(dsUrl);
  },
};
