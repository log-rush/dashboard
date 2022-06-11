import { computed } from 'vue';
import { Config, ConfigKey } from '../model/config';
import { StorageKeys, useRootState } from './root';

const _rootState = useRootState();
const saveState = () => _rootState.save('config');
const { config } = _rootState.reactiveState;

const defaultConfig: Config = {
  [ConfigKey.LogBatchSize]: 100,
};

const getConfig = (key: ConfigKey) => {
  return config[key];
};

const setConfig = <K extends ConfigKey>(key: K, value: Config[K]) => {
  config[key] = value;
  saveState();
};

const init = async () => {
  const storedConfig = localStorage.getItem(StorageKeys.Config);
  if (storedConfig) {
    const parsedConfig = JSON.parse(storedConfig);
    for (const [key, fallback] of Object.entries(defaultConfig)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      config[key] = parsedConfig[key] ?? fallback;
    }
  }
};
init();

const Store = {
  setConfig,
  getConfig: (key: ConfigKey) => computed(() => getConfig(key)),
};

export const useConfig = (): typeof Store => Store;
