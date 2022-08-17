import { defineStore } from 'pinia';
import { Config, ConfigKey } from '../model/config';
import { StorageKeys } from '../stores/util/type';

export const useConfig = defineStore('log-rush-config', {
  state: () => ({
    config: {
      [ConfigKey.LogBatchSize]: 100,
      [ConfigKey.ScrollToBottom]: true,
    } as Config,
  }),
  getters: {
    getConfig:
      (state) =>
      <K extends ConfigKey>(key: K): Config[K] =>
        state.config[key],
  },
  actions: {
    _saveState() {
      localStorage.setItem(StorageKeys.Config, JSON.stringify(this.config));
    },
    setConfig<K extends ConfigKey>(key: K, value: Config[K]) {
      this.config[key] = value;
      this._saveState();
    },
    _init() {
      const storedConfig = localStorage.getItem(StorageKeys.Config);
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig) as Partial<Config>;
        for (const key of Object.keys(this.config) as unknown as ConfigKey[]) {
          const storedValue = parsedConfig[key];
          if (storedValue !== undefined) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.config[key] = storedValue;
          }
        }
      }
    },
  },
});
