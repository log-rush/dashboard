import { LogStream } from '../domain/LogStream';
import { LogStreamRecord, StoredLogStream } from '../model/logStream';
import { CreateStoreFunc, StorageKeys } from './util/type';

const createStore: CreateStoreFunc<'logStreams', StorageKeys.Streams> = ({
  reactiveState,
  stores,
}) => {
  const { logStreams } = reactiveState;

  const getStreamsForDataSource = async (
    dsId: string,
  ): Promise<LogStreamRecord[]> => {
    const ds = stores.dataSources.getRawDataSource(dsId);
    if (!ds) {
      return [];
    }

    const allStreams: LogStreamRecord[] = [];
    const streams = await ds.listStreams();
    for (const stream of streams) {
      if (stream.id in logStreams[dsId]) {
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
  };

  const subscribe = (ofDataSourceId: string, stream: string) => {
    logStreams[ofDataSourceId]?.[stream]?.subscribe();
  };

  const unsubscribe = (ofDataSourceId: string, stream: string) => {
    logStreams[ofDataSourceId]?.[stream]?.unsubscribe();
    stores.logs.clearLogs(stream);
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

  // const getCachedStreamsForDataSource = (dsId: string): LogStreamRecord[] => {
  //   return (Object.values(logStreams[dsId]) ?? []).filter(
  //     (stream) => stream.isCached,
  //   );
  // };

  const init = () => {
    return;
  };

  const Store = {
    getStreamsForDataSource,
    getSubscribedStreams,
    getSubscribedStreamsForDataSource,
    // getCachedStreamsForDataSource,
    subscribe,
    subscribeTemp,
    unsubscribe,
  };

  return {
    key: 'logStreams',
    store: Store,
    storageKey: StorageKeys.Streams,
    save: () => {
      return;
    },
    setup: () => init(),
  };
};

export default createStore;
