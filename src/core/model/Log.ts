export interface LogRecord {
  timestamp: number;
  message: string;
}

export interface LogHistory {
  logs: LogRecord[];
  lastLog: LogRecord | undefined;
}
