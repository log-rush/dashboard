<template>
  <n-modal :show="stream !== undefined" transform-origin="center">
    <n-card
      style="max-width: 90vw; max-height: 90vh"
      content-style="height: 100%; max-height: 100%; overflow: auto; position: relative;"
      title="View Logs"
      :bordered="false"
      size="huge"
      role="dialog"
    >
      <template #header-extra>
        <n-button @click="emit('close')" secondary type="tertiary" size="small">
          Close
        </n-button>
      </template>
      <log-view v-if="stream" :stream="stream" />
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { NModal, NCard, NButton } from 'naive-ui';
import { defineProps, defineEmits, toRefs } from 'vue';
import LogView from '@/components/logs/LogView.vue';

const props = defineProps<{
  stream?: string;
}>();

const { stream } = toRefs(props);

const emit = defineEmits<{
  (event: 'close'): void;
}>();
</script>
