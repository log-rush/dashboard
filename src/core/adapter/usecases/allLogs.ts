import { LogRecord } from '@/core/model/log';
import { LogStreamRecord } from '@/core/model/logStream';
import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useLogs } from '../logs';
import { useLogStreams } from '../logStreams';

export const useAllLogs = defineStore('log-rush--all-logs', () => {
  const logRef = ref<LogRecord>({} as LogRecord);
  const showNamesRef = ref<boolean>(true);
  const watchers: Record<
    string,
    {
      unwatch: () => void;
      flagged: boolean;
    }
  > = {};
  const logStreamsStore = useLogStreams();
  const logsStore = useLogs();

  const init = () => {
    const subscribedStreams = computed(
      () => logStreamsStore.getSubscribedStreams,
    );

    watch(subscribedStreams, (streams) => {
      updateWatcher(streams);
    });
  };
  init();

  const updateWatcher = (current: LogStreamRecord[]) => {
    for (const id of Object.keys(watchers)) {
      watchers[id].flagged = true;
    }
    for (const stream of current) {
      if (stream.id in watchers) {
        watchers[stream.id].flagged = false;
      } else if (logsStore.getLastLog(stream.dataSource, stream.id)) {
        watchers[stream.id] = {
          unwatch: watch(
            () => logsStore.getLastLog(stream.dataSource, stream.id),
            (log) => {
              if (log && showNamesRef.value) {
                logRef.value = {
                  message: `${stream.alias} | ${log.message}`,
                  timestamp: log.timestamp,
                };
              } else if (log) {
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
    return logRef.value;
  };

  const getLogs = () => {
    return logStreamsStore.getSubscribedStreams
      .flatMap((stream) =>
        (logsStore.getLogs(stream.dataSource, stream.id) ?? []).map((log) => {
          if (showNamesRef.value) {
            return {
              message: `${stream.alias} | ${log.message}`,
              timestamp: log.timestamp,
            };
          }
          return log;
        }),
      )
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  return {
    getLogs,
    getLogRef,
    setShowNames: (showNames: boolean) => {
      showNamesRef.value = showNames;
    },
    getShowNames: () => showNamesRef.value,
  };
});
