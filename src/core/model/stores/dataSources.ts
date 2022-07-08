import { DataSourceRecord } from '../dataSource';

export type DataSourcesStore = {
  allDataSources: () => DataSourceRecord[];
  createDataSource: (url: string) => Promise<boolean>;
  deleteDataSource: (id: string) => void;
  reconnect: (id: string) => void;
  getDataSource: (id: string | undefined) => DataSourceRecord | undefined;
  connectToDataSource: (id: string) => void;
};
