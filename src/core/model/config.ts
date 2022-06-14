export enum ConfigKey {
  LogBatchSize,
  ScrollToBottom,
}

export type Config = {
  [ConfigKey.LogBatchSize]: number;
  [ConfigKey.ScrollToBottom]: boolean;
};
