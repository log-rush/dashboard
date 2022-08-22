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
            <n-button secondary size="small" @click="openFile(file)">
              Open Logfile
              <template #icon>
                <Icon icon="mdi:open-in-new" />
              </template>
            </n-button>
          </template>
        </n-list-item>
      </n-list>
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
import { NModal, NCard, NButton, NList, NListItem } from 'naive-ui';
import { defineProps, defineEmits, toRefs, watch, ref, computed } from 'vue';
import { Icon } from '@iconify/vue';

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
</script>
