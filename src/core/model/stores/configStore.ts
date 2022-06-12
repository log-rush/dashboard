import { Config, ConfigKey } from '../config';

export type ConfigStore = {
  setConfig: <K extends ConfigKey>(key: K, value: Config[K]) => void;
  getConfig: <K extends ConfigKey>(key: K) => Config[K];
};
