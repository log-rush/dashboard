import { DataSourcesService } from '../services/dataSourceService';
import { LogStreamRecord, StoredLogStream } from '../model/logStream';
import { useDataSources } from './dataSources';
import { StorageKeys, useRootState } from './root';

const _rootState = useRootState();
const saveState = () => _rootState.save('logStreams');
const { logStreams, dataSources } = _rootState.reactiveState;
const { connections } = _rootState.staticState;

const getStreamsFrom = async (dsId: string): Promise<LogStreamRecord[]> => {
  const ds = useDataSources().getDataSource(dsId);
  if (!ds) {
    return [];
  }

  for (const key of Object.keys(logStreams[dsId])) {
    logStreams[dsId][key].status = 'connecting';
  }

  const streams = await DataSourcesService.getStreams(ds.url);
  for (const stream of streams) {
    if (logStreams[dsId][stream.id]) {
      logStreams[dsId][stream.id].status = 'connected';
      continue;
    }
    logStreams[dsId][stream.id] = {
      ...stream,
      dataSource: dsId,
      status: 'connected',
      isSubscribed: false,
      fromCache: false,
    };
    _rootState.reactiveState.logs[stream.id] = {
      lastLog: undefined,
      logs: [],
    };
  }
  saveState();

  const convertedStreams: LogStreamRecord[] = [];
  for (const key of Object.keys(logStreams[dsId])) {
    convertedStreams.push(logStreams[dsId][key]);
  }
  return convertedStreams;
};

const subscribe = (ofDataSourceId: string, stream: string) => {
  if (logStreams[ofDataSourceId]?.[stream]) {
    const ds = dataSources[ofDataSourceId ?? ''];
    if (!ds) return;
    connections[ds.id].subscribe(stream);
    logStreams[ofDataSourceId][stream].isSubscribed = true;
    saveState();
  }
};

const unsubscribe = (ofDataSourceId: string, stream: string) => {
  if (logStreams[ofDataSourceId]?.[stream]) {
    const ds = dataSources[ofDataSourceId ?? ''];
    if (!ds) return;
    connections[ds.id].unsubscribe(stream);
    logStreams[ofDataSourceId][stream].isSubscribed = false;
    _rootState.reactiveState.logs[stream] = {
      lastLog: undefined,
      logs: [],
    };
    saveState();
  }
};

const init = async () => {
  const storedStreams = localStorage.getItem(StorageKeys.Streams);
  if (storedStreams) {
    console.log(storedStreams);
    const parsedLogStreams: StoredLogStream[] = JSON.parse(storedStreams);
    for (const ls of parsedLogStreams) {
      // TODO: fetch current state
      // TODO: Connect to subscribe ds
      console.log(ls.id);
      logStreams[ls.dataSource][ls.id] = {
        ...ls,
        isSubscribed: true,
        fromCache: true,
        status: 'warn',
      };
    }
  }
};
init();

const Store = {
  logStreamsForDataSource: getStreamsFrom,
  subscribe,
  unsubscribe,
};

export const useLogStreams = (): typeof Store => Store;
