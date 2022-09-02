<template>
  <n-modal :show="isOpen" transform-origin="center">
    <n-card
      style="max-width: 90vw; max-height: 90vh"
      content-style="height: 100%; max-height: 100%; overflow: auto; position: relative;"
      title="Server logs"
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
        v-if="currentFileName !== undefined"
        :is-open="currentFileName !== undefined"
        :file-name="currentFileName ?? ''"
        :file-url="`${baseUrl}plugins/raw-logs/${currentFileName}`"
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
import { NModal, NCard, NButton, NList, NListItem, NSpace } from 'naive-ui';
import { defineProps, defineEmits, ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import StaticLogsModal from '../../streams/modals/StaticLogsModal.vue';

const props = defineProps<{
  isOpen: boolean;
  baseUrl: string;
}>();

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const files = ref<string[]>([]);
const currentFileName = ref<string | undefined>(undefined);

onMounted(() => {
  fetch(`${props.baseUrl}plugins/raw-logs/list-all`)
    .then((res) => res.json())
    .then((logFiles: string[]) => {
      files.value = logFiles;
    });
});

const openFile = (file: string) => {
  window.open(`${props.baseUrl}plugins/raw-logs/${file}`, '_blank');
};
const showFile = (file: string) => {
  currentFileName.value = file;
};

const closeLogModal = () => {
  currentFileName.value = undefined;
};
</script>
