<template>
  <page-layout title="Dashboard">
    <n-space vertical size="large">
      <n-space vertical :size="0">
        <n-h2>Overview</n-h2>
        <n-h3> DataSources ({{ allDataSources.length }}) </n-h3>
        <n-space vertical size="small">
          <n-space align="center">
            <Status :status="'connected'" />
            <n-p> Connected: {{ connectedCount }} </n-p>
          </n-space>
          <n-space align="center">
            <Status :status="'available'" />
            <n-p> Available: {{ availableCount }} </n-p>
          </n-space>
          <n-space align="center">
            <Status :status="'disconnected'" />
            <n-p> Disconnected: {{ disconnectedCount }} </n-p>
          </n-space>
          <n-space align="center">
            <Status :status="'warn'" />
            <n-p> Warning: {{ warnCount }} </n-p>
          </n-space>
          <n-space align="center">
            <Status :status="'error'" />
            <n-p> Error: {{ errorCount }} </n-p>
          </n-space>
        </n-space>
      </n-space>
      <n-space vertical>
        <n-h2>Actions</n-h2>
        <n-space size="small">
          <n-button secondary type="primary" @click="createModelOpen = true">
            Add a new DataSource
          </n-button>
        </n-space>
        <CreateDataSource
          :is-open="createModelOpen"
          @close="createModelOpen = false"
        />
      </n-space>
    </n-space>
    <template #extra>
      <n-space>
        <n-button secondary type="tertiary">Refresh</n-button>
      </n-space>
    </template>
  </page-layout>
</template>

<script setup lang="ts">
import { NH2, NH3, NP, NSpace, NButton } from 'naive-ui';
import Status from '@/components/util/Status.vue';
import PageLayout from '@/components/util/PageLayout.vue';
import CreateDataSource from '@/components/dataSources/modals/CreateDataSource.vue';
import { ref, computed } from 'vue';
import { useDataSources } from '@/core/stores/root';

const dataSourcesStore = useDataSources();
const createModelOpen = ref(false);
const allDataSources = computed(() => dataSourcesStore.allDataSources());
const connectedCount = computed(
  () => allDataSources.value.filter((ds) => ds.status === 'connected').length,
);
const availableCount = computed(
  () => allDataSources.value.filter((ds) => ds.status === 'available').length,
);
const warnCount = computed(
  () => allDataSources.value.filter((ds) => ds.status === 'warn').length,
);
const disconnectedCount = computed(
  () =>
    allDataSources.value.filter((ds) => ds.status === 'disconnected').length,
);
const errorCount = computed(
  () => allDataSources.value.filter((ds) => ds.status === 'error').length,
);
</script>
