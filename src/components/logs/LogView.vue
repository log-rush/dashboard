<template>
  <div class="log-view" :ref="(r) => (wrapper = r as HTMLDivElement)"></div>
</template>

<script setup lang="ts">
import '@log-rush/log-formatter/dist/index.css';
import { ref, defineProps, onMounted, watch } from 'vue';
import { LogFormat, LogFormatter, Optimization } from '@log-rush/log-formatter';
import { ConfigKey } from '@/core/model/config';
import { useLogs } from '@/core/adapter/logs';
import { useConfig } from '@/core/adapter/config';

const props = defineProps<{
  stream: string;
}>();

const logStore = useLogs();
const configStore = useConfig();

const wrapper = ref<HTMLDivElement | null>();
const formatter = new LogFormatter({
  format: LogFormat.ColoredHtml,
  optimizations: Optimization.O2,
});

onMounted(() => {
  const storedLogs = logStore.getLogs(props.stream);
  for (const log of storedLogs) {
    appendLog(log.message);
  }
});

watch(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  () => logStore.getLastLog(props.stream)!,
  (newLog) => {
    if (newLog) {
      appendLog(newLog.message);
    }
  },
);

const appendLog = (data: string) => {
  const formatted = formatter.format(data);
  if (wrapper.value) {
    wrapper.value.innerHTML += formatted;
    if (configStore.getConfig(ConfigKey.ScrollToBottom)) {
      wrapper.value.scrollTop = wrapper.value.scrollHeight;
    }
  }
};
</script>

<style>
.log-view {
  max-height: 100%;
  height: 100%;
  overflow-y: auto;
}

.log-view > p {
  margin: 0;
  font-family: monospace;
}
</style>
