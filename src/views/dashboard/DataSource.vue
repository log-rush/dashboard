<template>
  <page-layout :title="dataSource?.name ?? 'unknown DataSource'">
    <n-space vertical size="large">
      <n-h2>LogStreams</n-h2>
      <n-space vertical>
        <n-list bordered v-if="logStreams.length > 0">
          <n-list-item v-for="stream of logStreams" :key="stream.id">
            <n-thing>
              <template #header>
                {{ stream.alias }}
              </template>
              <template #description>
                {{ stream.id }}
              </template>
            </n-thing>
            <template #suffix>
              <n-space justify="end" align="center" :wrap="false">
                <n-button>Subscribe</n-button>
                <n-button @click="logPeekOpen = stream.id">Show Logs</n-button>
              </n-space>
            </template>
          </n-list-item>
        </n-list>
        <n-empty v-if="!dataSource" description="DataSource not found">
        </n-empty>
        <n-empty
          v-else-if="logStreams.length === 0"
          description="No LogStream found"
        >
        </n-empty>
      </n-space>
    </n-space>
    <LogPeekModal
      :is-open="logPeekOpen !== undefined"
      @close="logPeekOpen = undefined"
    />
    <template #extra>
      <n-space>
        <n-space justify="end" align="center" :wrap="false">
          <Status :status="getStatus(dataSource?.id)" />
          <n-button @click="deleteDataSource(dataSource)">Delete</n-button>
        </n-space>
        <n-button ghost @click="refresh()">Refresh</n-button>
      </n-space>
    </template>
  </page-layout>
</template>

<script setup lang="ts">
import {
  NSpace,
  NButton,
  NList,
  NListItem,
  NThing,
  NEmpty,
  NH2,
  useDialog,
} from 'naive-ui';
import PageLayout from '@/components/util/PageLayout.vue';
import { onMounted, ref } from 'vue';
import { useDataSources } from '@/core/stores/dataSources';
import { ConnectionStatus, DataSource } from '@/core/model/dataSource';
import Status from '@/components/util/Status.vue';
import { useRoute, useRouter } from 'vue-router';
import { useLogStreams } from '@/core/stores/streams';
import LogPeekModal from '@/components/streams/modals/LogPeekModal.vue';
import { LogStream } from '@/core/model/stream';

const dataSourcesStore = useDataSources();
const logStreamStore = useLogStreams();
const dialog = useDialog();
const route = useRoute();
const router = useRouter();
const dataSource = ref<DataSource | undefined>(undefined);
const logStreams = ref<LogStream[]>([]);
const logPeekOpen = ref<string | undefined>(undefined);

onMounted(async () => {
  const id = route.params['id'] as string;
  if (id) {
    dataSource.value = dataSourcesStore.getDataSource(id);
    logStreams.value = await logStreamStore.logStreamsForDataSource(id);
  }
});

const getStatus = (id: string | undefined): ConnectionStatus => {
  if (id) {
    return dataSourcesStore.getDataSource(id)?.status ?? 'warn';
  }
  return 'disconnected';
};

const deleteDataSource = (ds: DataSource | undefined) => {
  if (!ds) return;
  dialog.create({
    title: 'Confirm deletion',
    content: `Are you sure, you want to delete the data source ${ds.name}?`,
    negativeText: 'Cancel',
    positiveText: 'Sure',
    closable: false,
    showIcon: false,
    bordered: true,

    onPositiveClick: () => {
      dataSourcesStore.deleteDataSource(ds.id);
      router.push('/data-sources');
    },
  });
};

const refresh = async () => {
  if (dataSource.value) {
    logStreams.value = await logStreamStore.logStreamsForDataSource(
      dataSource.value.id,
    );
  }
};
</script>
