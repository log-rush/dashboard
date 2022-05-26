import { DataSourcesService } from '../services/dataSourceService';
import { LogStream, StoredLogStream } from '../model/logStream';
import { useDataSources } from './dataSources';
import { StorageKeys, useRootState } from './root';

const _rootState = useRootState();
const saveState = _rootState.save;
const { logStreams } = _rootState.reactiveState;

const getStreamsFrom = async (dsId: string): Promise<LogStream[]> => {
  // TODO: store state of streams
  // const cached = logStreams[dsId];
  // if (cached) {
  //   return cached;
  // }
  const ds = useDataSources().getDataSource(dsId);
  if (!ds) {
    return [];
  }
  const streams = await DataSourcesService.getStreams(ds.url);
  const convertedStreams: LogStream[] = [];
  for (const stream of streams) {
    logStreams[dsId][stream.id] = {
      ...stream,
      dataSource: dsId,
      status: 'disconnected',
      isSubscribed: false,
      fromCache: false,
    };
    _rootState.reactiveState.logs[stream.id] = []; // TODO: add logs store
    convertedStreams.push(logStreams[dsId][stream.id]);
  }
  saveState();
  return convertedStreams;
};

const init = async () => {
  const storedStreams = localStorage.getItem(StorageKeys.Streams);
  if (storedStreams) {
    const parsedLogStreams: StoredLogStream[] = JSON.parse(storedStreams);
    for (const ls of parsedLogStreams) {
      // TODO: fetch current state
      logStreams[ls.dataSource][ls.id] = {
        ...ls,
        isSubscribed: false,
        fromCache: true,
        status: 'disconnected',
      };
    }
  }
};
init();

const Store = {
  logStreamsForDataSource: getStreamsFrom,
};

export const useLogStreams = (): typeof Store => Store;
