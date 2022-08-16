import { UnwrapNestedRefs } from 'vue';
import { DataSourceRecord, StoredDataSource } from '@/core/model/dataSource';
import { CreateStoreFunc, StorageKeys } from './util/type';
import { DataSource } from '@/core/domain/DataSource';
import { LogRecord } from '@/core/model/log';

const createStore: CreateStoreFunc<'dataSources', StorageKeys.DataSources> = ({
  reactiveState,
}) => {
  const { dataSources, logStreams } = reactiveState;

  const saveState = () => {
    localStorage.setItem(
      StorageKeys.DataSources,
      JSON.stringify(
        Object.values(reactiveState.dataSources).map((ds) =>
          ds.toStorageRecord(),
        ),
      ),
    );
  };

  const getRawDataSource = (
    id: string | undefined,
  ): UnwrapNestedRefs<DataSource | undefined> => dataSources[id ?? ''];

  const getDataSource = (
    id: string | undefined,
  ): DataSourceRecord | undefined => getRawDataSource(id)?.toRecord();

  const createDataSource = async (url: string): Promise<boolean> => {
    const dataSource = await DataSource.create(url);
    if (dataSource) {
      dataSources[dataSource.id] = dataSource;
      logStreams[dataSource.id] = {};
      saveState();
      return true;
    }
    return false;
  };

  const deleteDataSource = (id: string) => {
    const ds = dataSources[id];

    if (ds) {
      ds.disconnect();
      delete dataSources[ds.id];
      saveState();
    }
  };

  const connectDataSource = (id: string) => {
    getRawDataSource(id)?.connect({
      onLog: logHandler,
    });
  };

  const reconnect = (id: string) => {
    getRawDataSource(id)?.reconnect();
  };

  const logHandler = (stream: string, log: LogRecord) => {
    reactiveState.logs[stream].logs.push(log);
    reactiveState.logs[stream].lastLog = log;
  };

  const setAutoConnect = (id: string, enabled: boolean) => {
    getRawDataSource(id)?.setAutoConnect(enabled);
    saveState();
  };

  const init = () => {
    const storedSources = localStorage.getItem(StorageKeys.DataSources);
    if (!storedSources) return;

    const parsedDataSources = JSON.parse(storedSources) as StoredDataSource[];
    for (const _cachedDs of parsedDataSources) {
      DataSource.createFromCache(_cachedDs, {
        onLog: logHandler,
      }).then((ds) => {
        dataSources[ds.id] = ds;
        logStreams[ds.id] = logStreams[ds.id] ?? {}; // TODO: handle this in logStreams store
        saveState();
      });
    }
  };

  const Store = {
    allDataSources: () => Object.values(dataSources).map((ds) => ds.toRecord()),
    connectToDataSource: connectDataSource,
    createDataSource,
    deleteDataSource,
    getDataSource,
    getRawDataSource,
    reconnect,
    setAutoConnect,
  };

  return {
    key: 'dataSources',
    store: Store,
    storageKey: StorageKeys.DataSources,
    save: () => saveState(),
    setup: () => init(),
  };
};

export default createStore;
