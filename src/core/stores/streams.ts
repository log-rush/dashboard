import { DataSourcesService } from '../services/dataSourceService';
import { LogStream } from '../model/stream';
import { useDataSources } from './dataSources';
import { StorageKeys, useRootState } from './root';

const getStreamsFrom = async (dsId: string): Promise<LogStream[]> => {
  // TODO: store state of streams
  // const cached = logStreams[dsId];
  // if (cached) {
  //   return cached;
  // }
  const { logStreams, save } = useRootState();
  const ds = useDataSources().getDataSource(dsId);
  if (!ds) {
    return [];
  }
  const streams = await DataSourcesService.getStreams(ds.url);
  const convertedStreams: LogStream[] = [];
  for (const stream of streams) {
    logStreams[stream.id] = {
      ...stream,
      dataSource: dsId,
      status: 'disconnected',
      isSubscribed: false,
      fromCache: false,
    };
    convertedStreams.push(logStreams[stream.id]);
  }
  save();
  return convertedStreams;
};

const init = async () => {
  const storedStreams = localStorage.getItem(StorageKeys.Streams);
  if (storedStreams) {
    const parsedLogStreams = JSON.parse(storedStreams);
    for (const [id, ls] of Object.entries(parsedLogStreams)) {
      // TODO: fetch current state
      // logStreams[id] = ls.map((ls) => ({
      //   ...ls,
      //   fromCache: true,
      //   status: 'disconnected',
      // }));
    }
  }
};
init();

const Store = {
  logStreamsForDataSource: getStreamsFrom,
};

export const useLogStreams = (): typeof Store => Store;
