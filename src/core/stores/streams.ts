import { DataSourcesService } from '../services/dataSourceService';
import { LogStreamRecord, StoredLogStream } from '../model/logStream';
import { LogRushHttpApi } from '../api/http';
import { CreateStoreFunc, StorageKeys } from './util/type';

const createStore: CreateStoreFunc<'logStreams', StorageKeys.Streams> = ({
  reactiveState,
  staticState,
  stores,
}) => {
  const { logStreams, dataSources } = reactiveState;
  const { connections } = staticState;

  const saveState = () => {
    localStorage.setItem(
      StorageKeys.Streams,
      JSON.stringify(
        Object.keys(reactiveState.logStreams).flatMap((id) =>
          Object.values(reactiveState.logStreams[id])
            .filter((ls) => ls.isSubscribed || ls.fromCache)
            .map(
              (ls): StoredLogStream => ({
                id: ls.id,
                alias: ls.alias,
                dataSource: ls.dataSource,
              }),
            ),
        ),
      ),
    );
  };

  const getStreamsForDataSource = async (
    dsId: string,
  ): Promise<LogStreamRecord[]> => {
    const ds = stores.dataSources.getDataSource(dsId);
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
        } else if (logStreams[dsId][stream.id].fromCache) {
          logStreams[dsId][stream.id].status = 'available';
        }
        continue;
      }
      logStreams[dsId][stream.id] = {
        ...stream,
        dataSource: dsId,
        status: 'available',
        isSubscribed: false,
        fromCache: false,
      };
      stores.logs.clearLogs(stream.id);
    }

    for (const stream of Object.values(logStreams[dsId])) {
      if (
        stream.fromCache === true &&
        stream.status !== 'connected' &&
        stream.status !== 'available'
      ) {
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
      logStreams[ofDataSourceId][stream].status = 'connecting';
      const ds = dataSources[ofDataSourceId ?? ''];
      if (!ds || !connections[ds.id]) {
        logStreams[ofDataSourceId][stream].status = 'error';
        return;
      }
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
      stores.logs.clearLogs(stream);
      saveState();
    }
  };

  const getSubscribedStreams = (): LogStreamRecord[] => {
    return Object.keys(logStreams).flatMap((ds) =>
      Object.values(logStreams[ds]).filter((stream) => !stream.isSubscribed),
    );
  };

  const getSubscribedStreamsForDataSource = (
    dsId: string,
  ): LogStreamRecord[] => {
    return (Object.values(logStreams[dsId]) ?? []).filter(
      (stream) => !stream.isSubscribed,
    );
  };

  const getCachedStreamsForDataSource = (dsId: string): LogStreamRecord[] => {
    return (Object.values(logStreams[dsId]) ?? []).filter(
      (stream) => !stream.fromCache,
    );
  };

  const init = () => {
    console.log('init streams');
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
          reactiveState.dataSources[ls.dataSource].url, // TODO: wrong dependency direction
          ls.id,
        ).then((stream) => {
          if (stream) {
            logStreams[ls.dataSource][ls.id].status = 'available';
            logStreams[ls.dataSource][ls.id].alias = stream.alias;
            stores.logs.clearLogs(ls.id);
            subscribe(ls.dataSource, ls.id);
          } else {
            logStreams[ls.dataSource][ls.id].status = 'error';
          }
        });
      }
    }
  };

  const Store = {
    getStreamsForDataSource,
    getSubscribedStreams,
    getSubscribedStreamsForDataSource,
    getCachedStreamsForDataSource,
    subscribe,
    unsubscribe,
  };

  return {
    key: 'logStreams',
    store: Store,
    storageKey: StorageKeys.Streams,
    save: () => saveState(),
    setup: () => init(),
  };
};

export default createStore;
