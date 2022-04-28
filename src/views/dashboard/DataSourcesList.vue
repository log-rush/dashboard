<template>
  <n-page-header>
    <n-space vertical size="large">
      <n-space vertical>
        <n-list bordered v-if="allDataSources.length > 0">
          <n-list-item
            v-for="dataSource of allDataSources"
            :key="dataSource.url"
          >
            <n-thing>
              <template #header>
                {{ dataSource.name }}
              </template>
              <template #description>
                {{ dataSource.url }} ({{ dataSource.version }})
              </template>
            </n-thing>
            <template #suffix>
              <n-space justify="end" align="center" :wrap="false">
                (Status)
                <n-button>Delete</n-button>
                <n-button>Show</n-button>
              </n-space>
            </template>
          </n-list-item>
        </n-list>
        <n-empty
          v-if="allDataSources.length === 0"
          description="No DataSource registered"
        >
          <template #extra>
            <n-button size="small" @click="createModelOpen = true">
              Register a DataSource
            </n-button>
          </template>
        </n-empty>
      </n-space>
      <CreateDataSource
        :is-open="createModelOpen"
        @close="createModelOpen = false"
      />
    </n-space>
    <template #title>
      <n-h1 style="margin: 0">Datasources</n-h1>
    </template>
    <template #header>
      <n-breadcrumb>
        <n-breadcrumb-item>
          <router-link to="/">
            <n-text> Dashboard </n-text>
          </router-link>
        </n-breadcrumb-item>
        <n-breadcrumb-item>
          <router-link to="/data-sources">
            <n-text> Datasources </n-text>
          </router-link>
        </n-breadcrumb-item>
      </n-breadcrumb>
    </template>
    <template #extra>
      <n-space>
        <n-button ghost @click="createModelOpen = true">Add New</n-button>
        <n-button ghost>Refresh</n-button>
      </n-space>
    </template>
    <template #footer> Copyright </template>
  </n-page-header>
</template>

<script setup lang="ts">
import {
  NH1,
  NSpace,
  NPageHeader,
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NText,
  NList,
  NListItem,
  NThing,
  NEmpty,
} from 'naive-ui';
import CreateDataSource from '@/components/dataSources/modals/CreateDataSource.vue';
import { computed, ref } from 'vue';
import { useDataSources } from '@/core/stores/dataSources';

const dataSources = useDataSources();
const allDataSources = computed(() => dataSources.dataSources.value);
const createModelOpen = ref(false);
</script>
