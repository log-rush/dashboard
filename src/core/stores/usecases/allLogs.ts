import { Log } from '@/core/model/log';
import { LogStreamRecord } from '@/core/model/logStream';
import { computed, ref, watch } from 'vue';
import { CreateStoreFunc, StorageKeys } from '../util/type';

const createStore: CreateStoreFunc<'allLogs', StorageKeys.NonPersistent> = ({
  stores,
}) => {
  const init = () => {
    const subscribedStreams = computed(() =>
      stores.logStreams.getSubscribedStreams(),
    );

    watch(subscribedStreams, (streams, lastStreams) => {
      updateWatcher(streams, lastStreams);
    });
  };

  const logRef = ref<Log>({} as Log);
  const watchers: Record<
    string,
    {
      unwatch: () => void;
      flagged: boolean;
    }
  > = {};

  const updateWatcher = (
    current: LogStreamRecord[],
    last: LogStreamRecord[],
  ) => {
    for (const stream of last) {
      watchers[stream.id].flagged = true;
    }
    for (const stream of current) {
      if (stream.id in watchers) {
        watchers[stream.id].flagged = false;
      } else if (stores.logs.getLastLog(stream.id)) {
        watchers[stream.id] = {
          unwatch: watch(
            () => stores.logs.getLastLog(stream.id),
            (log) => {
              console.log('should fire');
              if (log) {
                logRef.value = log;
              }
            },
          ),
          flagged: false,
        };
      }
    }
    for (const [key, watcher] of Object.entries(watchers)) {
      if (watcher.flagged) {
        watcher.unwatch();
        delete watchers[key];
      }
    }
  };

  const getLogRef = () => {
    return logRef;
  };

  const store = {
    getLogRef,
  };

  return {
    key: 'allLogs',
    setup: () => init(),
    store: store,
  };
};

export default createStore;
