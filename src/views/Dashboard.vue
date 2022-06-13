<template>
  <n-layout has-sider style="height: 100%">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="200"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div class="menu-layout">
        <n-menu
          :collapsed="collapsed"
          :render-label="renderMenuLabel"
          :options="MainMenu"
          :value="selectedValue"
          :expand-icon="CreateIconRenderer('mdi:chevron-down')"
        />
        <n-menu
          :collapsed="collapsed"
          :render-label="renderMenuLabel"
          :options="DataSourceMenu"
          :value="selectedValue"
          :expand-icon="CreateIconRenderer('mdi:chevron-down')"
        />
        <n-menu
          :collapsed="collapsed"
          :render-label="renderMenuLabel"
          :options="ViewsMenu"
          :value="selectedValue"
          :expand-icon="CreateIconRenderer('mdi:chevron-down')"
        />
        <n-menu
          :collapsed="collapsed"
          :render-label="renderMenuLabel"
          :options="AllLogsMenu"
          :value="selectedValue"
          :expand-icon="CreateIconRenderer('mdi:chevron-down')"
        />
        <div class="menu-spacer"></div>
        <n-menu
          :collapsed="collapsed"
          :render-label="renderMenuLabel"
          :options="BottomMenu"
          :value="selectedValue"
          :expand-icon="CreateIconRenderer('mdi:chevron-down')"
        />
      </div>
    </n-layout-sider>
    <div style="position: relative; padding: 24px; width: 100%">
      <router-view></router-view>
    </div>
  </n-layout>
</template>

<script setup lang="ts">
import { NLayout, NLayoutSider, NMenu } from 'naive-ui';
import type { MenuOption } from 'naive-ui';
import { computed, h, onMounted, ref, VNode, watch } from 'vue';
import { IconRenderer, CreateIconRenderer } from '@/components/Icon';
import { RouterLink, useRoute } from 'vue-router';
import { useDataSources } from '@/core/stores/root';

const route = useRoute();
const dataSourcesStore = useDataSources();
const collapsed = ref(true);
const selectedValue = ref<string | undefined>(undefined);

watch(
  () => route.path,
  (path) => setMenuSelectionByPath(path),
);

onMounted(() => {
  setMenuSelectionByPath(route.path);
});

const setMenuSelectionByPath = (path: string) => {
  const parts = path.split('/');
  if (parts.length > 1) {
    if (parts[parts.length - 1] === '') {
      selectedValue.value = 'home';
    } else {
      selectedValue.value = parts[parts.length - 1];
    }
  }
};

const renderMenuLabel = (option: MenuOption) => {
  if ('href' in option) {
    return h(RouterLink as unknown as VNode, { to: option.href }, () => [
      option.label,
    ]);
  }
  return option.label as string;
};

const BottomMenu: MenuOption[] = [
  {
    label: 'Settings',
    key: 'settings',
    href: '/settings',
    icon: () => IconRenderer('mdi:cog'),
  },
];

const MainMenu: MenuOption[] = [
  {
    label: 'Home',
    key: 'home',
    href: '/',
    icon: () => IconRenderer('mdi:home'),
  },
];

const DataSourceMenu = computed(
  () =>
    [
      {
        label: 'Data Sources',
        key: 'data-sources',
        icon: () => IconRenderer('mdi:server'),
        href: '/data-sources',
        children: dataSourcesStore.allDataSources().map((ds) => ({
          label: ds.name,
          href: `/data-sources/${ds.id}`,
          key: ds.id,
        })),
      },
    ] as MenuOption[],
);

const ViewsMenu: MenuOption[] = [
  {
    label: 'Views',
    key: 'views',
    icon: () => IconRenderer('mdi:view-dashboard-variant'),
    href: '/views',
    children: [
      {
        label: 'a-2',
        href: '/views/a-2',
        key: 'a-2',
      },
      {
        label: 'b-2',
        href: '/views/b-2',
        key: 'b-2',
      },
    ],
  },
];

const AllLogsMenu: MenuOption[] = [
  {
    label: 'All Logs',
    key: 'all-logs',
    href: '/all-logs',
    icon: () => IconRenderer('mdi:archive-outline'),
  },
];
</script>

<style>
.menu-layout {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  height: 100%;
}

.menu-spacer {
  flex: 1;
}
</style>
