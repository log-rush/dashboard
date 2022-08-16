import { DataSource } from '@/core/domain/DataSource';
import { UnwrapNestedRefs } from 'vue';
import { DataSourceRecord } from '../dataSource';

export type DataSourcesStore = {
  allDataSources: () => DataSourceRecord[];
  createDataSource: (url: string) => Promise<boolean>;
  deleteDataSource: (id: string) => void;
  reconnect: (id: string) => void;
  setAutoConnect: (id: string, enabled: boolean) => void;
  getDataSource: (id: string | undefined) => DataSourceRecord | undefined;
  getRawDataSource: (
    id: string | undefined,
  ) => UnwrapNestedRefs<DataSource> | undefined;
  connectToDataSource: (id: string) => void;
};
