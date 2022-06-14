<template>
  <page-layout title="All Logs">
    <div class="log-view" :ref="(r) => (wrapper = r as HTMLDivElement)"></div>
    <template #extra>
      <n-space>
        <n-space justify="end" align="center" :wrap="false">
          <n-space align="center" :wrap="false">
            <n-p>Show Names</n-p>
            <n-switch
              :value="showNames"
              @update:value="updateShowNames"
            ></n-switch>
          </n-space>
        </n-space>
      </n-space>
    </template>
  </page-layout>
</template>

<script setup lang="ts">
import '@log-rush/log-formatter/dist/index.css';
import PageLayout from '@/components/util/PageLayout.vue';
import { NSpace, NSwitch, NP } from 'naive-ui';
import { ref, watch } from 'vue';
import { LogFormat, LogFormatter, Optimization } from '@log-rush/log-formatter';
import { useAllLogs } from '@/core/stores/root';
import { computed } from '@vue/reactivity';

const allLogsStore = useAllLogs();

const wrapper = ref<HTMLDivElement | null>();
const showNames = computed(() => allLogsStore.getShowNames());
const formatter = new LogFormatter({
  format: LogFormat.ColoredHtml,
  optimizations: Optimization.O2,
});

watch(
  () => allLogsStore.getLogRef(),
  (newLog) => {
    if (newLog) {
      appendLog(newLog.message);
    }
  },
);

const updateShowNames = (enabled: boolean) => {
  allLogsStore.setShowNames(enabled);
};

const appendLog = (data: string) => {
  const formatted = formatter.format(data);
  if (wrapper.value) {
    wrapper.value.innerHTML += formatted;
  }
};
</script>

<style>
.log-view {
  max-height: calc(100vh - 200px);
  height: 100%;
  overflow-y: auto;
}

.log-view > p {
  margin: 0;
  font-family: monospace;
}
</style>
