import { LogStreamRecord } from '../logStream';

export type LogStreamsStore = {
  getStreamsForDataSource: (dsId: string) => Promise<LogStreamRecord[]>;
  subscribe: (ofDataSourceId: string, stream: string) => void;
  subscribeTemp: (ofDataSourceId: string, stream: string) => () => void;
  unsubscribe: (ofDataSourceId: string, stream: string) => void;
  getSubscribedStreams: () => LogStreamRecord[];
  getSubscribedStreamsForDataSource: (dsId: string) => LogStreamRecord[];
  getCachedStreamsForDataSource: (dsId: string) => LogStreamRecord[];
};
