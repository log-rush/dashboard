import { DataSourceInterface } from '../dataSource';

export type DataSourcesStore = {
  allDataSources: () => DataSourceInterface[];
  createDataSource: (url: string) => Promise<boolean>;
  deleteDataSource: (id: string) => void;
  reconnect: (id: string) => void;
  getDataSource: (id: string | undefined) => DataSourceInterface | undefined;
  connectToDataSource: (id: string) => void;
};
