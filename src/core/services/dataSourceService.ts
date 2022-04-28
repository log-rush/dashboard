import { DataSourceInfoResponse } from '../model/api/http';
import { DataSource } from '../model/dataSource';

export const DataSourcesService = {
  async connectToDataSource(url: string): Promise<DataSource | undefined> {
    const req = await fetch(`${url}info`);
    if (req.status !== 200) {
      console.error('cant get data source');
      return undefined;
    }
    const res: DataSourceInfoResponse = await req.json();
    return {
      url: url,
      name: res.name,
      version: res.version,
      isConnected: false,
    };
  },
};
