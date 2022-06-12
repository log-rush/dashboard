import { DataSource } from '../dataSource';

export type DataSourcesStore = {
  allDataSources: () => DataSource[];
  createDataSource: (url: string) => Promise<boolean>;
  deleteDataSource: (id: string) => void;
  reconnect: (id: string) => void;
  getDataSource: (id: string | undefined) => DataSource | undefined;
  connectToDataSource: (id: string) => void;
};
