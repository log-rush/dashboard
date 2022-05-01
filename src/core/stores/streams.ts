import { reactive, watch } from 'vue';
import { ConnectionStatus } from '../model/dataSource';
import { DataSourcesService } from '../services/dataSourceService';
import { LogStream } from '../model/stream';
import { useDataSources } from './dataSources';

enum Keys {
  Streams = '&ls',
}

type LogStreamRecord = LogStream & {
  status: ConnectionStatus;
  isSubscribed: boolean;
  fromCache: boolean;
};

type StoredLogStream = Omit<Omit<LogStreamRecord, 'fromCache'>, 'status'>;

const logStreams: Record<string, LogStreamRecord[]> = reactive({});

const getStreamsFrom = async (dsId: string): Promise<LogStream[]> => {
  const cached = logStreams[dsId];
  if (cached) {
    return cached;
  }
  const ds = useDataSources().getDataSource(dsId);
  if (!ds) {
    return [];
  }
  const streams = await DataSourcesService.getStreams(ds);
  logStreams[dsId] = streams.map((stream) => ({
    ...stream,
    status: 'connected',
    isSubscribed: false,
    fromCache: false,
  }));
  return streams;
};

watch(logStreams, (ls) => {
  localStorage.setItem(
    Keys.Streams,
    JSON.stringify(
      Object.entries(ls).map(([key, logStream]) => ({
        [key]: logStream.map(
          (ls): StoredLogStream => ({
            id: ls.id,
            alias: ls.alias,
            isSubscribed: ls.isSubscribed,
          }),
        ),
      })),
    ),
  );
});

const init = async () => {
  const storedStreams = localStorage.getItem(Keys.Streams);
  if (storedStreams) {
    const parsedLogStreams = JSON.parse(storedStreams) as Record<
      string,
      StoredLogStream[]
    >;

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
  rawLogStreams: logStreams,
};

export const useLogStreams = (): typeof Store => Store;
