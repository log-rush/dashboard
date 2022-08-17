// import { LogRecord } from '@/core/model/log';
// import { LogStreamRecord } from '@/core/model/logStream';
// import { computed, ref, watch } from 'vue';
// import { CreateStoreFunc, StorageKeys } from '../util/type';

// const createStore: CreateStoreFunc<'allLogs', StorageKeys.NonPersistent> = ({
//   stores,
// }) => {
//   const init = () => {
//     const subscribedStreams = computed(() =>
//       stores.logStreams.getSubscribedStreams(),
//     );

//     watch(subscribedStreams, (streams) => {
//       updateWatcher(streams);
//     });
//   };

//   const logRef = ref<LogRecord>({} as LogRecord);
//   const showNamesRef = ref<boolean>(true);
//   const watchers: Record<
//     string,
//     {
//       unwatch: () => void;
//       flagged: boolean;
//     }
//   > = {};

//   const updateWatcher = (current: LogStreamRecord[]) => {
//     for (const id of Object.keys(watchers)) {
//       watchers[id].flagged = true;
//     }
//     for (const stream of current) {
//       if (stream.id in watchers) {
//         watchers[stream.id].flagged = false;
//       } else if (stores.logs.getLastLog(stream.id)) {
//         watchers[stream.id] = {
//           unwatch: watch(
//             () => stores.logs.getLastLog(stream.id),
//             (log) => {
//               if (log && showNamesRef.value) {
//                 logRef.value = {
//                   message: `${stream.alias} | ${log.message}`,
//                   timestamp: log.timestamp,
//                 };
//               } else if (log) {
//                 logRef.value = log;
//               }
//             },
//           ),
//           flagged: false,
//         };
//       }
//     }
//     for (const [key, watcher] of Object.entries(watchers)) {
//       if (watcher.flagged) {
//         watcher.unwatch();
//         delete watchers[key];
//       }
//     }
//   };

//   const getLogRef = () => {
//     return logRef.value;
//   };

//   const getLogs = () => {
//     return stores.logStreams
//       .getSubscribedStreams()
//       .flatMap((stream) =>
//         (stores.logs.getLogs(stream.id) ?? []).map((log) => {
//           if (showNamesRef.value) {
//             return {
//               message: `${stream.alias} | ${log.message}`,
//               timestamp: log.timestamp,
//             };
//           }
//           return log;
//         }),
//       )
//       .sort((a, b) => a.timestamp - b.timestamp);
//   };

//   const store = {
//     getLogs,
//     getLogRef,
//     setShowNames: (showNames: boolean) => {
//       showNamesRef.value = showNames;
//     },
//     getShowNames: () => showNamesRef.value,
//   };

//   return {
//     key: 'allLogs',
//     setup: () => init(),
//     store: store,
//   };
// };

// export default createStore;
