<template>
  <page-layout title="Dashboard">
    <n-space vertical size="large">
      <n-space vertical>
        <n-h2>Overview</n-h2>
        <n-text> Nothing to display yet... </n-text>
      </n-space>
      <n-space vertical>
        <n-h2>Actions</n-h2>
        <n-space size="small">
          <n-button ghost type="primary"> Add a new Datasource </n-button>
          <n-button ghost type="primary"> Create a new View </n-button>
        </n-space>
      </n-space>
    </n-space>
    <template #extra>
      <n-space>
        <n-button ghost>Refresh</n-button>
      </n-space>
    </template>
  </page-layout>
</template>

<script setup lang="ts">
import { NH2, NSpace, NButton, NText } from 'naive-ui';
import PageLayout from '@/components/util/PageLayout.vue';
</script>
