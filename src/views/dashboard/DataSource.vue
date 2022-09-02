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
          <div id="spacer"></div>
          <n-popover
            placement="bottom"
            trigger="click"
            v-if="showServerLogsButton"
          >
            <template #trigger>
              <n-button secondary>
                <template #icon>
                  <Icon icon="mdi:dots-vertical"></Icon>
                </template>
              </n-button>
            </template>
            <n-space vertical>
              <n-button
                v-if="showServerLogsButton"
                secondary
                @click="showServerLogsModalOpen = true"
              >
                Show raw server logs
              </n-button>
            </n-space>
          </n-popover>
        </n-space>
        <ShowRawServerLogsModal
          :base-url="dataSource.url"
          :is-open="showServerLogsModalOpen"
          @close="showServerLogsModalOpen = false"
        />
        <n-h2>LogStreams</n-h2>
        <LogFileModal
          :isOpen="detailStream !== undefined"
          :data-source="dataSource.id"
          :stream="detailStream"
          @close="detailStream = undefined"
        />
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
                  <template v-if="dataSource?.status === 'connected'">
                    <n-button secondary @click="openLogPeek(stream.id)"
                      >Show Logs</n-button
                    >
                    <n-button
                      v-if="!stream.isSubscribed"
                      secondary
                      type="success"
                      @click="subscribe(stream.id)"
                      >Subscribe</n-button
                    >
                    <n-button
                      v-else
                      secondary
                      type="error"
                      @click="unsubscribe(stream.id)"
                      >Unsubscribe</n-button
                    >
                    <n-popover placement="bottom" trigger="click">
                      <template #trigger>
                        <n-button secondary>
                          <template #icon>
                            <Icon icon="mdi:dots-vertical"></Icon>
                          </template>
                        </n-button>
                      </template>
                      <n-space vertical>
                        <n-button
                          v-if="showLogFilesButton"
                          secondary
                          @click="detailStream = stream.id"
                        >
                          Show Logfiles
                        </n-button>
                      </n-space>
                    </n-popover>
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
      <LogPeekModal
        :stream="logPeekStream"
        :data-source="dataSource.id"
        @close="closeLogPeek()"
      />
    </template>
    <template v-else>
      <n-empty description="DataSource ot found"> </n-empty>
    </template>
    <template #extra>
      <n-space>
        <n-space justify="end" align="center" :wrap="false">
          <Status :status="dataSource?.status ?? 'warn'" />
          <template v-if="dataSource">
            <n-button
              v-if="
                dataSource.status === 'warn' || dataSource.status === 'error'
              "
              key="reconnectButton"
              secondary
              @click="reconnect()"
              >Reconnect</n-button
            >
            <n-button
              v-if="dataSource.status === 'available'"
              key="connectButton"
              secondary
              type="success"
              @click="connect(dataSource?.id ?? '')"
              >Connect</n-button
            >
            <n-button
              v-if="dataSource.status === 'connected'"
              key="disconnectButton"
              secondary
              type="tertiary"
              @click="disconnect(dataSource?.id ?? '')"
              >Disconnect</n-button
            >
            <n-button
              key="refreshButton"
              secondary
              type="tertiary"
              @click="refresh()"
              >Refresh</n-button
            >
            <n-button
              key="deleteButton"
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
  NPopover,
  useDialog,
} from 'naive-ui';
import PageLayout from '@/components/util/PageLayout.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { DataSourceRecord } from '@/core/model/dataSource';
import Status from '@/components/util/Status.vue';
import { useRoute, useRouter } from 'vue-router';
import LogPeekModal from '@/components/streams/modals/LogPeekModal.vue';
import { LogStreamRecord } from '@/core/model/logStream';
import { DataSourcePluginsResponse } from '@/core/model/api/httpTypes';
import { useDataSources } from '@/core/adapter/dataSources';
import { useLogStreams } from '@/core/adapter/logStreams';
import { useConfig } from '@/core/adapter/config';
import { Icon } from '@iconify/vue';
import LogFileModal from '../../components/streams/modals/LogFileModal.vue';
import ShowRawServerLogsModal from '@/components/plugins/raw-logs/ShowRawServerLogsModal.vue';

const dataSourcesStore = useDataSources();
const logStreamStore = useLogStreams();
const configStore = useConfig();
const dialog = useDialog();
const route = useRoute();
const router = useRouter();
const dataSource = computed<DataSourceRecord | undefined>(() =>
  dataSourcesStore.getDataSource(route.params['id'] as string),
);
const logStreams = ref<LogStreamRecord[]>([]);
const closeLogPeekFunction = ref<(() => void) | undefined>(undefined);
const logPeekStream = ref<string | undefined>(undefined);
const dataSourcePlugins = ref<DataSourcePluginsResponse | undefined>(undefined);
const showLogFilesButton = computed(() =>
  dataSourcePlugins.value?.routerPlugins.includes('persistency'),
); // TODO: store this in const
const showServerLogsButton = computed(() =>
  dataSourcePlugins.value?.routerPlugins.includes('raw-logs'),
); // TODO: store this in const
const detailStream = ref<string | undefined>(undefined);
const showServerLogsModalOpen = ref(false);

onMounted(() => {
  refresh();
});

watch(dataSource, () => {
  refresh();
});

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
  refresh();
};

const disconnect = (id: string) => {
  dataSourcesStore.disconnect(id);
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
    dataSourcePlugins.value = await configStore.getDataSourcePlugins(
      dataSource.value.url,
    );
  }
};

const reconnect = () => {
  if (dataSource.value) {
    dataSourcesStore.reconnect(dataSource.value.id);
  }
};
</script>

<style lang="css">
div:has(> div#spacer) {
  flex-grow: 1;
}
</style>
