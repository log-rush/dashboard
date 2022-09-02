<template>
  <n-modal :show="isOpen" transform-origin="center">
    <n-card
      style="max-width: 90vw; max-height: 90vh"
      content-style="height: 100%; max-height: 100%; overflow: auto; position: relative;"
      :title="`Logfiles of ${stream}`"
      :bordered="false"
      size="huge"
      role="dialog"
    >
      <n-list>
        <n-list-item v-for="file in files" :key="file">
          {{ file }}
          <template #suffix>
            <n-space justify="end" size="small" align="center" :wrap="false">
              <n-button secondary size="small" @click="showFile(file)">
                Show Logs
                <template #icon>
                  <Icon icon="mdi:eye-outline" />
                </template>
              </n-button>
              <n-button secondary size="small" @click="openFile(file)">
                Open Logfile
                <template #icon>
                  <Icon icon="mdi:open-in-new" />
                </template>
              </n-button>
            </n-space>
          </template>
        </n-list-item>
      </n-list>
      <StaticLogsModal
        v-if="currentFileUrl !== undefined"
        :is-open="currentFileUrl !== undefined"
        :file-name="currentFileName ?? ''"
        :file-url="currentFileUrl"
        @close="closeLogModal()"
      />
      <template #header-extra>
        <n-button @click="emit('close')" secondary type="tertiary" size="small">
          Close
        </n-button>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { useDataSources } from '@/core/adapter/dataSources';
import { PersistencyPluginApi } from '@/core/services/plugins/persistency/PersistencyPluginApi';
import { NModal, NCard, NButton, NList, NListItem, NSpace } from 'naive-ui';
import { defineProps, defineEmits, toRefs, watch, ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import StaticLogsModal from './StaticLogsModal.vue';

const props = defineProps<{
  isOpen: boolean;
  dataSource: string;
  stream: string | undefined;
}>();
const { stream, dataSource } = toRefs(props);

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const dataSourcesStore = useDataSources();
const files = ref<string[]>([]);
const ds = computed(() =>
  dataSourcesStore.getDataSource(dataSource.value ?? ''),
);
const currentFileUrl = ref<string | undefined>(undefined);
const currentFileName = ref<string | undefined>(undefined);

watch([stream, ds], async ([stream, ds]) => {
  if (ds && stream) {
    files.value = await PersistencyPluginApi.getLogFiles(ds.url, stream);
  }
});

const openFile = (file: string) => {
  if (ds.value && stream.value) {
    window.open(
      `${ds.value.url}plugins/persistency/logs/${stream.value}/${file}`,
      '_blank',
    );
  }
};
const showFile = (file: string) => {
  if (ds.value && stream.value) {
    currentFileUrl.value = `${ds.value.url}plugins/persistency/logs/${stream.value}/${file}`;
    currentFileName.value = file;
  }
};

const closeLogModal = () => {
  currentFileUrl.value = undefined;
  currentFileName.value = undefined;
};
</script>
