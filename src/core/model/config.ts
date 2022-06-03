export enum ConfigKey {
  LogBatchSize,
}

export type Config = {
  [ConfigKey.LogBatchSize]: number;
};
