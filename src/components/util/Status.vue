<template>
  <n-space justify="center" align="center" style="width: 100%; height: 100%">
    <template v-if="status === 'connecting'">
      <n-spin :size="18" />
    </template>
    <template v-else-if="status === 'disconnected'">
      <div
        class="status-dot-border"
        :style="`border-color: ${theme.borderColor}`"
      ></div>
    </template>
    <template v-else>
      <div
        class="status-dot"
        :style="`background-color: ${colors[status]}`"
      ></div>
    </template>
  </n-space>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { NSpace, NSpin, useThemeVars } from 'naive-ui';
const theme = useThemeVars();
const colors = {
  connected: theme.value.successColor,
  warn: theme.value.warningColor,
  error: theme.value.errorColor,
};
defineProps<{
  status: 'disconnected' | 'connecting' | 'connected' | 'error' | 'warn';
}>();
</script>

<style scoped>
.status-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}

.status-dot-border {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid;
  background-color: transparent;
}
</style>
