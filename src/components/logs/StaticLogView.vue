<template>
  <div class="log-view" :ref="(r) => (wrapper = r as HTMLDivElement)"></div>
</template>

<script setup lang="ts">
import '@log-rush/log-formatter/dist/index.css';
import { ref, defineProps, onMounted, watch, toRefs } from 'vue';
import { LogFormat, LogFormatter, Optimization } from '@log-rush/log-formatter';
import { ConfigKey } from '@/core/model/config';
import { useConfig } from '@/core/adapter/config';

const props = defineProps<{
  logs: string[];
}>();
const { logs } = toRefs(props);

const wrapper = ref<HTMLDivElement | null>();
const formatter = new LogFormatter({
  format: LogFormat.ColoredHtml,
  optimizations: Optimization.O2,
});
const configStore = useConfig();

onMounted(() => {
  if (wrapper.value) {
    wrapper.value.innerHTML = '';
  }
  for (const log of logs.value) {
    appendLog(log);
  }
});

watch(logs, (newLogs) => {
  if (wrapper.value) {
    wrapper.value.innerHTML = '';
  }
  for (const log of newLogs) {
    appendLog(log);
  }
});

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
