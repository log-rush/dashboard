<template>
  <n-modal :show="stream !== undefined" transform-origin="center">
    <n-card
      style="max-width: 600px"
      title="View Logs of xxx"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <template #header-extra>
        <n-button @click="emit('close')" secondary type="tertiary" size="small">
          Close
        </n-button>
      </template>
      <n-log :rows="rows" :log="logs" trim style="height: 55vh"></n-log>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { useRootState } from '@/core/stores/root';
import { NModal, NCard, NButton, NLog } from 'naive-ui';
import { defineProps, defineEmits, computed, toRefs } from 'vue';

const rootState = useRootState();

const props = defineProps<{
  stream?: string;
}>();

const { stream } = toRefs(props);

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const logs = computed(() =>
  (rootState.reactiveState.logs[stream?.value ?? ''] ?? [])
    .map((l) => l.message)
    .join('\n'),
);
const rows = computed(
  () => (rootState.reactiveState.logs[stream?.value ?? ''] ?? []).length,
);
</script>
