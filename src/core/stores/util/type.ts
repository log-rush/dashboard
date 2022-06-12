import { ReactiveState, StaticState } from '@/core/model/state';
import { ConfigStore } from '@/core/model/stores/configStore';
import { DataSourcesStore } from '@/core/model/stores/dataSources';
import { LogsStore } from '@/core/model/stores/logsStore';
import { LogStreamsStore } from '@/core/model/stores/logStreams';

export type Stores = {
  dataSources: DataSourcesStore;
  logStreams: LogStreamsStore;
  logs: LogsStore;
  config: ConfigStore;
};

export enum StorageKeys {
  DataSources = '&ds',
  Streams = '&ls',
  Config = '&c',
  NonPersistent = '=',
}

export type CreateStoreFunc<
  SK extends keyof Stores,
  K extends StorageKeys,
  S = Stores[SK],
> = (args: {
  reactiveState: ReactiveState;
  staticState: StaticState;
  stores: Omit<Stores, SK>;
  save: (key: StorageKeys | undefined) => void;
}) => K extends StorageKeys.NonPersistent
  ? {
      key: SK;
      store: S;
      setup: () => void | Promise<void>;
    }
  : {
      key: SK;
      store: S;
      setup: () => void | Promise<void>;
      storageKey: K;
      save: () => void;
    };
