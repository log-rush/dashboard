<template>
  <page-layout title="All Logs">
    <div class="log-view" :ref="(r) => (wrapper = r as HTMLDivElement)"></div>
    <subscription-manager
      :is-open="managerModalOpen"
      @close="managerModalOpen = false"
    ></subscription-manager>
    <template #extra>
      <n-space>
        <n-space justify="end" align="center" :wrap="false">
          <n-button secondary size="large" @click="toggle">
            <n-space align="center" :wrap="false">
              <div @click.stop="">
                <n-switch
                  :value="showNames"
                  @update:value="updateShowNames"
                ></n-switch>
              </div>
              <n-p>Show Names</n-p>
            </n-space>
          </n-button>
          <n-button secondary size="large" @click="resetLogs">
            Clear
            <template #icon>
              <Icon icon="mdi:archive-remove-outline"></Icon>
            </template>
          </n-button>
          <n-button secondary size="large" @click="managerModalOpen = true">
            Manage
            <template #icon>
              <Icon icon="mdi:archive-cog-outline"></Icon>
            </template>
          </n-button>
        </n-space>
      </n-space>
    </template>
  </page-layout>
</template>

<script setup lang="ts">
import '@log-rush/log-formatter/dist/index.css';
import PageLayout from '@/components/util/PageLayout.vue';
import { NSpace, NSwitch, NP, NButton } from 'naive-ui';
import { Icon } from '@iconify/vue';
import { onMounted, ref, watch } from 'vue';
import { LogFormat, LogFormatter, Optimization } from '@log-rush/log-formatter';
import { computed } from '@vue/reactivity';
import { ConfigKey } from '@/core/model/config';
import { useAllLogs } from '@/core/adapter/usecases/allLogs';
import { useConfig } from '@/core/adapter/config';
import SubscriptionManager from '@/components/allLogs/modals/SubscriptionManager.vue';

const allLogsStore = useAllLogs();
const configStore = useConfig();

const wrapper = ref<HTMLDivElement | null>();
const managerModalOpen = ref(false);
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

onMounted(() => {
  showStoredLogs();
});

const updateShowNames = (enabled: boolean) => {
  allLogsStore.setShowNames(enabled);
  resetLogs();
  showStoredLogs();
};

const toggle = () => {
  updateShowNames(!showNames.value);
};

const showStoredLogs = () => {
  const storedLogs = allLogsStore.getLogs();
  for (const log of storedLogs) {
    appendLog(log.message);
  }
};

const appendLog = (data: string) => {
  if (data.length === 0) return;
  const formatted = formatter.format(data);
  if (wrapper.value) {
    wrapper.value.innerHTML += formatted;
    if (configStore.getConfig(ConfigKey.ScrollToBottom)) {
      wrapper.value.scrollTop = wrapper.value.scrollHeight;
    }
  }
};

const resetLogs = () => {
  if (wrapper.value) {
    wrapper.value.innerHTML = '';
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
