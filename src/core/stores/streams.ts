import { DataSourcesService } from '../services/dataSourceService';
import { LogStreamRecord, StoredLogStream } from '../model/logStream';
import { useDataSources } from './dataSources';
import { StorageKeys, useRootState } from './root';
import { LogRushHttpApi } from '../api/http';

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
      if (logStreams[dsId][stream.id].isSubscribed) {
        logStreams[dsId][stream.id].status = 'connected';
      } else {
        logStreams[dsId][stream.id].status = 'available';
      }
      logStreams[dsId][stream.id].fromCache = false;
      continue;
    }
    logStreams[dsId][stream.id] = {
      ...stream,
      dataSource: dsId,
      status: 'available',
      isSubscribed: false,
      fromCache: false,
    };
    _rootState.reactiveState.logs[stream.id] = {
      lastLog: undefined,
      logs: [],
    };
  }

  for (const stream of Object.values(logStreams[dsId])) {
    if (stream.fromCache === true) {
      stream.status = 'error';
    }
  }
  saveState();

  const convertedStreams: LogStreamRecord[] = [];
  for (const key of Object.keys(logStreams[dsId])) {
    convertedStreams.push(logStreams[dsId][key]);
  }
  return convertedStreams;
};

const subscribe = (ofDataSourceId: string, stream: string) => {
  if (
    logStreams[ofDataSourceId]?.[stream] &&
    !logStreams[ofDataSourceId]?.[stream].isSubscribed
  ) {
    const ds = dataSources[ofDataSourceId ?? ''];
    if (!ds || !connections[ds.id]) return;
    logStreams[ofDataSourceId][stream].status = 'connecting';
    connections[ds.id].subscribe(stream);
    logStreams[ofDataSourceId][stream].isSubscribed = true;
    logStreams[ofDataSourceId][stream].status = 'connected';
    saveState();
  }
};

const unsubscribe = (ofDataSourceId: string, stream: string) => {
  if (logStreams[ofDataSourceId]?.[stream]) {
    const ds = dataSources[ofDataSourceId ?? ''];
    if (!ds) return;
    connections[ds.id].unsubscribe(stream);
    logStreams[ofDataSourceId][stream].isSubscribed = false;
    logStreams[ofDataSourceId][stream].status = 'available';
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
    const parsedLogStreams: StoredLogStream[] = JSON.parse(storedStreams);
    for (const ls of parsedLogStreams) {
      logStreams[ls.dataSource][ls.id] = {
        ...ls,
        isSubscribed: false,
        fromCache: true,
        status: 'connecting',
      };
      // fetch current state
      LogRushHttpApi.getStream(
        _rootState.reactiveState.dataSources[ls.dataSource].url,
        ls.id,
      ).then((stream) => {
        if (stream) {
          logStreams[ls.dataSource][ls.id].status = 'available';
          logStreams[ls.dataSource][ls.id].alias = stream.alias;
          _rootState.reactiveState.logs[ls.id] = {
            lastLog: undefined,
            logs: [],
          };
          subscribe(ls.dataSource, ls.id);
        } else {
          logStreams[ls.dataSource][ls.id].status = 'error';
        }
      });
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
