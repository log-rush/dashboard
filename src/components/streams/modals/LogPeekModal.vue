<template>
  <n-modal :show="isOpen" transform-origin="center">
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
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { NModal, NCard, NButton } from 'naive-ui';
import { defineProps, defineEmits } from 'vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (event: 'close'): void;
}>();
</script>
