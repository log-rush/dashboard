<template>
  <page-layout title="Datasources">
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
                <n-p>
                  {{ dataSource.url }} ({{ dataSource.version }})
                  <n-text italic> ({{ dataSource.id }}) </n-text>
                </n-p>
              </template>
            </n-thing>
            <template #suffix>
              <n-space justify="end" align="center" :wrap="false">
                <Status :status="getStatus(dataSource.id)" />
                <n-button
                  v-if="dataSource.status === 'available'"
                  @click="connect(dataSource.id)"
                  >Connect</n-button
                >
                <n-button
                  v-if="dataSource.status === 'connected'"
                  @click="handleShow(dataSource.id)"
                  >Show</n-button
                >
                <n-button
                  type="error"
                  ghost
                  @click="deleteDataSource(dataSource.id, dataSource.name)"
                  >Delete</n-button
                >
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

    <template #extra>
      <n-space>
        <n-button ghost @click="createModelOpen = true">Add New</n-button>
        <n-button ghost>Refresh</n-button>
      </n-space>
    </template>
  </page-layout>
</template>

<script setup lang="ts">
import {
  NSpace,
  NButton,
  NList,
  NListItem,
  NThing,
  NEmpty,
  NP,
  NText,
  useDialog,
} from 'naive-ui';
import PageLayout from '@/components/util/PageLayout.vue';
import CreateDataSource from '@/components/dataSources/modals/CreateDataSource.vue';
import { ref } from 'vue';
import { useDataSources } from '@/core/stores/dataSources';
import { useRouter } from 'vue-router';
import Status from '@/components/util/Status.vue';

const dataSourcesStore = useDataSources();
const dialog = useDialog();
const router = useRouter();
const allDataSources = dataSourcesStore.allDataSources;
const createModelOpen = ref(false);

const getStatus = (id: string) =>
  dataSourcesStore.getDataSource(id)?.status ?? 'warn';

const deleteDataSource = (id: string, name: string) => {
  dialog.create({
    title: 'Confirm deletion',
    content: `Are you sure, you want to delete the data source ${name}?`,
    negativeText: 'Cancel',
    positiveText: 'Sure',
    closable: false,
    showIcon: false,
    bordered: true,

    onPositiveClick: () => {
      dataSourcesStore.deleteDataSource(id);
    },
  });
};

const connect = (id: string) => {
  dataSourcesStore.connectToDataSource(id);
};

const handleShow = (id: string) => {
  router.push(`/data-sources/${id}`);
};
</script>
