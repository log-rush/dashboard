<template>
  <div :ref="(r) => (wrapper = r as HTMLDivElement)"></div>
</template>

<script setup lang="ts">
import '@log-rush/log-formatter/dist/index.css';
import { useLogs } from '@/core/stores/logs';
import { ref, defineProps, onMounted } from 'vue';
import { LogFormat, LogFormatter, Optimization } from '@log-rush/log-formatter';

const props = defineProps<{
  stream: string;
}>();

const logStore = useLogs();
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

const appendLog = (data: string) => {
  const formatted = formatter.format(data);
  if (wrapper.value) {
    wrapper.value.innerHTML += formatted;
  }
};
</script>
