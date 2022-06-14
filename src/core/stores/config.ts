import { Config, ConfigKey } from '../model/config';
import { CreateStoreFunc, StorageKeys } from './util/type';

const createStore: CreateStoreFunc<'config', StorageKeys.Config> = ({
  reactiveState,
}) => {
  const { config } = reactiveState;

  const defaultConfig: Config = {
    [ConfigKey.LogBatchSize]: 100,
    [ConfigKey.ScrollToBottom]: true,
  };

  const saveState = () => {
    localStorage.setItem(
      StorageKeys.Config,
      JSON.stringify(reactiveState.config),
    );
  };

  const getConfig = <K extends ConfigKey>(key: K): Config[K] => {
    return config[key];
  };

  const setConfig = <K extends ConfigKey>(key: K, value: Config[K]) => {
    config[key] = value;
    saveState();
  };

  const init = () => {
    const storedConfig = localStorage.getItem(StorageKeys.Config);
    if (storedConfig) {
      const parsedConfig = JSON.parse(storedConfig);
      for (const [key, fallback] of Object.entries(defaultConfig)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        config[key] = parsedConfig[key] ?? fallback;
      }
    } else {
      for (const [key, fallback] of Object.entries(defaultConfig)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        config[key] = fallback;
      }
    }
  };

  const Store = {
    setConfig,
    getConfig,
  };

  return {
    key: 'config',
    store: Store,
    storageKey: StorageKeys.Config,
    save: () => saveState(),
    setup: () => init(),
  };
};

export default createStore;
