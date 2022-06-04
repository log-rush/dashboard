export type Log = {
  timestamp: number;
  message: string;
};

export type LogRecord = {
  logs: Log[];
  lastLog: Log | undefined;
};
