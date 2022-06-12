import { reactive } from 'vue';
import { Config } from '../model/config';
import { ReactiveState, StaticState } from '../model/state';
import createConfigStore from './config';
import createDataSourcesStore from './dataSources';
import createLogStreamsStore from './streams';
import createLogsStore from './logs';
import { StorageKeys, Stores } from './util/type';
import { ConfigStore } from '../model/stores/configStore';
import { DataSourcesStore } from '../model/stores/dataSources';
import { LogStreamsStore } from '@/core/model/stores/logStreams';
import { LogsStore } from '../model/stores/logsStore';

const reactiveState = reactive<ReactiveState>({
  dataSources: {},
  logStreams: {},
  logs: {},
  config: {} as Config,
});

const staticState: StaticState = {
  connections: {},
};

const stores: Stores = {
  config: {} as ConfigStore,
  dataSources: {} as DataSourcesStore,
  logStreams: {} as LogStreamsStore,
  logs: {} as LogsStore,
};

const noop = () => {
  return;
};

const saveState = (key: StorageKeys | undefined) => {
  if (key) {
    (
      Object.values(storeModules).find(
        (mod) => 'storageKey' in mod && mod.storageKey === key,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
      )?.save ?? noop
    )();
  } else {
    Object.values(storeModules).forEach((mod) => {
      if ('save' in mod) {
        mod.save();
      }
    });
  }
};

const storeArgument = {
  reactiveState,
  staticState,
  stores,
  save: saveState,
};

const storeModules = {
  configStore: createConfigStore(storeArgument),
  dataSourcesStore: createDataSourcesStore(storeArgument),
  logStreamsStore: createLogStreamsStore(storeArgument),
  logsStore: createLogsStore(storeArgument),
};

const init = () => {
  storeModules.configStore.setup();
  stores[storeModules.configStore.key] = storeModules.configStore.store;

  storeModules.dataSourcesStore.setup();
  stores[storeModules.dataSourcesStore.key] =
    storeModules.dataSourcesStore.store;

  storeModules.logStreamsStore.setup();
  stores[storeModules.logStreamsStore.key] = storeModules.logStreamsStore.store;

  storeModules.logsStore.setup();
  stores[storeModules.logsStore.key] = storeModules.logsStore.store;
};
init();

export const useConfig = () => stores.config;
export const useDataSources = () => stores.dataSources;
export const useLogStreams = () => stores.logStreams;
export const useLogs = () => stores.logs;
