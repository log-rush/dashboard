<template>
  <n-modal :show="isOpen" transform-origin="center">
    <n-card
      style="max-width: 90vw; max-height: 90vh"
      content-style="height: 100%; max-height: 100%; overflow: auto; position: relative;"
      :title="`View Logfile ${fileName}`"
      :bordered="false"
      size="huge"
      role="dialog"
    >
      <template #header-extra>
        <n-button @click="emit('close')" secondary type="tertiary" size="small">
          Close
        </n-button>
      </template>
      <StaticLogView :logs="logs" />
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { NModal, NCard, NButton } from 'naive-ui';
import { defineProps, defineEmits, toRefs, onMounted, ref, watch } from 'vue';
import StaticLogView from '@/components/logs/StaticLogView.vue';

const props = defineProps<{
  isOpen: boolean;
  fileName: string;
  fileUrl: string;
}>();
const { fileUrl } = toRefs(props);
const logs = ref<string[]>([]);

onMounted(() => {
  loadFile(fileUrl.value);
});

watch(fileUrl, (newUrl) => loadFile(newUrl));

const loadFile = (url: string) => {
  fetch(url)
    .then((res) => res.text())
    .then((logFile) => {
      logs.value = logFile.split('\n');
    });
};

const emit = defineEmits<{
  (event: 'close'): void;
}>();
</script>
