<template>
  <n-page-header>
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
    <template #title>
      <n-h1 style="margin: 0">log-rush Dashboard</n-h1>
    </template>
    <template #header>
      <n-breadcrumb>
        <n-breadcrumb-item>
          <router-link to="/">
            <n-text> Dashboard </n-text>
          </router-link>
        </n-breadcrumb-item>
      </n-breadcrumb>
    </template>
    <template #extra>
      <n-space>
        <n-button ghost>Refresh</n-button>
      </n-space>
    </template>
    <template #footer> Copyright </template>
  </n-page-header>
</template>

<script setup lang="ts">
import {
  NH1,
  NH2,
  NSpace,
  NPageHeader,
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NText,
} from 'naive-ui';
</script>
