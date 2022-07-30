import { LogStream } from '../domain/LogStream';
import { LogStreamRecord, StoredLogStream } from '../model/logStream';
import { CreateStoreFunc, StorageKeys } from './util/type';

const createStore: CreateStoreFunc<'logStreams', StorageKeys.Streams> = ({
  reactiveState,
  stores,
}) => {
  const { logStreams } = reactiveState;

  const saveState = () => {
    localStorage.setItem(
      StorageKeys.Streams,
      JSON.stringify(
        Object.keys(reactiveState.logStreams).flatMap((id) =>
          Object.values(reactiveState.logStreams[id])
            .filter((ls) => ls.isSubscribed || ls.isCached)
            .map((ls) => ls.toStorageRecord()),
        ),
      ),
    );
  };

  const getStreamsForDataSource = async (
    dsId: string,
  ): Promise<LogStreamRecord[]> => {
    const ds = stores.dataSources.getRawDataSource(dsId);
    if (!ds) {
      return [];
    }
    // TODO: set state to loading temp? (or only cached ones)
    const allStreams: LogStreamRecord[] = [];
    const streams = await ds.listStreams();
    for (const stream of streams) {
      if (stream.id in logStreams[dsId]) {
        // stream already existing
        if (logStreams[dsId][stream.id].isCached) {
          // handle cached stream
          const newStream = await logStreams[dsId][stream.id].revokeCacheStatus(
            ds,
          );
          if (newStream) {
            logStreams[dsId][stream.id] = newStream;
          }
        }
        allStreams.push(logStreams[dsId][stream.id]);
        continue;
      } else {
        // new stream
        const newStream = await LogStream.create(ds, stream.id);
        if (newStream) {
          allStreams.push(newStream);
          logStreams[dsId][stream.id] = newStream;
          stores.logs.clearLogs(stream.id);
        }
      }
    }
    return allStreams;

    //for (const key of Object.keys(logStreams[dsId])) {
    //  logStreams[dsId][key].status = 'connecting';
    //}
    //
    //const streams = await DataSourcesService.getStreams(ds.url);
    //for (const stream of streams) {
    //  if (logStreams[dsId][stream.id]) {
    //    if (logStreams[dsId][stream.id].isSubscribed) {
    //      logStreams[dsId][stream.id].status = 'connected';
    //    } else if (logStreams[dsId][stream.id].isCached) {
    //      logStreams[dsId][stream.id].status = 'available';
    //    }
    //    continue;
    //  }
    //  logStreams[dsId][stream.id] = {
    //    ...stream,
    //    dataSource: dsId,
    //    status: 'available',
    //    isSubscribed: false,
    //    isCached: false,
    //  };
    //  stores.logs.clearLogs(stream.id);
    //}
    //
    //for (const stream of Object.values(logStreams[dsId])) {
    //  if (
    //    stream.isCached === true &&
    //    stream.status !== 'connected' &&
    //    stream.status !== 'available'
    //  ) {
    //    stream.status = 'error';
    //  }
    //}
    //saveState();
    //
    //const convertedStreams: LogStreamRecord[] = [];
    //for (const key of Object.keys(logStreams[dsId])) {
    //  convertedStreams.push(logStreams[dsId][key]);
    //}
    //return convertedStreams;
  };

  const subscribe = (ofDataSourceId: string, stream: string) => {
    logStreams[ofDataSourceId]?.[stream]?.subscribe();
    saveState();
  };

  const unsubscribe = (ofDataSourceId: string, stream: string) => {
    logStreams[ofDataSourceId]?.[stream]?.unsubscribe();
    stores.logs.clearLogs(stream);
    saveState();
  };

  const subscribeTemp = (ofDataSourceId: string, stream: string) => {
    const close = logStreams[ofDataSourceId]?.[stream]?.subscribeTemporary();
    return () => {
      if (close()) {
        stores.logs.clearLogs(stream);
      }
    };
  };

  const getSubscribedStreams = (): LogStreamRecord[] => {
    return Object.keys(logStreams).flatMap((ds) =>
      Object.values(logStreams[ds]).filter((stream) => stream.isSubscribed),
    );
  };

  const getSubscribedStreamsForDataSource = (
    dsId: string,
  ): LogStreamRecord[] => {
    return (Object.values(logStreams[dsId]) ?? []).filter(
      (stream) => stream.isSubscribed,
    );
  };

  const getCachedStreamsForDataSource = (dsId: string): LogStreamRecord[] => {
    return (Object.values(logStreams[dsId]) ?? []).filter(
      (stream) => stream.isCached,
    );
  };

  const init = () => {
    const storedStreams = localStorage.getItem(StorageKeys.Streams);
    if (storedStreams) {
      const parsedLogStreams: StoredLogStream[] = JSON.parse(storedStreams);
      for (const ls of parsedLogStreams) {
        LogStream.createFromCache(ls).then((logStream) => {
          if (logStream) {
            logStreams[ls.dataSource][ls.id] = logStream;
            stores.logs.clearLogs(logStream.id);
            saveState();
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
    subscribeTemp,
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
