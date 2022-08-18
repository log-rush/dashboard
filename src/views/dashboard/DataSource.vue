<template>
  <page-layout :title="dataSource?.name ?? 'unknown DataSource'">
    <template v-if="dataSource">
      <n-space vertical size="large">
        <n-space :size="30">
          <n-space vertical :size="0">
            <n-p> ID </n-p>
            <n-h6>{{ dataSource.id }}</n-h6>
          </n-space>
          <n-space vertical :size="0">
            <n-p> URL </n-p>
            <n-h6>{{ dataSource.url }}</n-h6>
          </n-space>
          <n-space vertical :size="0">
            <n-p> VERSION </n-p>
            <n-h6>{{ dataSource.version }}</n-h6>
          </n-space>
          <n-space vertical :size="0">
            <n-p> AUTO_CONNECT </n-p>
            <n-switch
              :value="dataSource.autoConnect"
              @update:value="toggleAutoConnect"
            ></n-switch>
          </n-space>
        </n-space>
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
                  <Status :status="stream.status" />
                  <template v-if="getStatus(dataSource?.id) === 'connected'">
                    <n-button @click="openLogPeek(stream.id)"
                      >Show Logs</n-button
                    >

                    <n-button
                      v-if="!stream.isSubscribed"
                      @click="subscribe(stream.id)"
                      >Subscribe</n-button
                    >
                    <n-button
                      v-else
                      type="error"
                      ghost
                      @click="unsubscribe(stream.id)"
                      >Unsubscribe</n-button
                    >
                  </template>
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
      <LogPeekModal :stream="logPeekStream" @close="closeLogPeek()" />
    </template>
    <template v-else>
      <n-empty description="DataSource ot found"> </n-empty>
    </template>
    <template #extra>
      <n-space>
        <n-space justify="end" align="center" :wrap="false">
          <Status :status="getStatus(dataSource?.id)" />
          <template v-if="dataSource">
            <n-button
              v-if="getStatus(dataSource?.id) === 'disconnected'"
              secondary
              @click="reconnect()"
              >Reconnect</n-button
            >
            <n-button
              v-if="getStatus(dataSource?.id) === 'available'"
              secondary
              type="success"
              @click="connect(dataSource?.id ?? '')"
              >Connect</n-button
            >
            <n-button secondary type="tertiary" @click="refresh()"
              >Refresh</n-button
            >
            <n-button
              secondary
              type="error"
              @click="deleteDataSource(dataSource)"
              >Delete</n-button
            >
          </template>
        </n-space>
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
  NH6,
  NP,
  NSwitch,
  useDialog,
} from 'naive-ui';
import PageLayout from '@/components/util/PageLayout.vue';
import { onMounted, ref } from 'vue';
import { ConnectionStatus, DataSourceRecord } from '@/core/model/dataSource';
import Status from '@/components/util/Status.vue';
import { useRoute, useRouter } from 'vue-router';
import LogPeekModal from '@/components/streams/modals/LogPeekModal.vue';
import { LogStreamRecord } from '@/core/model/logStream';
import { useDataSources } from '@/core/adapter/dataSources';
import { useLogStreams } from '@/core/adapter/logStreams';

const dataSourcesStore = useDataSources();
const logStreamStore = useLogStreams();
const dialog = useDialog();
const route = useRoute();
const router = useRouter();
const dataSource = ref<DataSourceRecord | undefined>(undefined);
const logStreams = ref<LogStreamRecord[]>([]);
const closeLogPeekFunction = ref<(() => void) | undefined>(undefined);
const logPeekStream = ref<string | undefined>(undefined);

onMounted(async () => {
  const id = route.params['id'] as string;
  if (id) {
    dataSource.value = dataSourcesStore.getDataSource(id);
    logStreams.value = await logStreamStore.getStreamsForDataSource(id);
  }
});

const getStatus = (id: string | undefined): ConnectionStatus => {
  if (id) {
    return dataSourcesStore.getDataSource(id)?.status ?? 'warn';
  }
  return 'disconnected';
};

const deleteDataSource = (ds: DataSourceRecord | undefined) => {
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

const toggleAutoConnect = (enabled: boolean) => {
  if (dataSource.value) {
    dataSourcesStore.setAutoConnect(dataSource.value.id, enabled);
    dataSource.value.autoConnect = enabled;
  }
};

const connect = (id: string) => {
  dataSourcesStore.connect(id);
};

const subscribe = (id: string) => {
  logStreamStore.subscribe(dataSource.value?.id ?? '', id);
};

const unsubscribe = (id: string) => {
  logStreamStore.unsubscribe(dataSource.value?.id ?? '', id);
};

const openLogPeek = (stream: string) => {
  logPeekStream.value = stream;
  closeLogPeekFunction.value = logStreamStore.subscribeTemporary(
    dataSource.value?.id ?? '',
    stream,
  );
};

const closeLogPeek = () => {
  if (closeLogPeekFunction.value) {
    closeLogPeekFunction.value();
    logPeekStream.value = undefined;
    closeLogPeekFunction.value = undefined;
  }
};

const refresh = async () => {
  if (dataSource.value) {
    logStreams.value = await logStreamStore.getStreamsForDataSource(
      dataSource.value.id,
    );
  }
};

const reconnect = () => {
  if (dataSource.value) {
    dataSourcesStore.reconnect(dataSource.value.id);
  }
};
</script>
