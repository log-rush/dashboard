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
import { h, onMounted, ref, VNode, watch } from 'vue';
import { IconRenderer, CreateIconRenderer } from '@/components/Icon';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
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

const DataSourceMenu: MenuOption[] = [
  {
    label: 'Data Sources',
    key: 'data-sources',
    icon: () => IconRenderer('mdi:server'),
    href: '/data-sources',
    children: [
      {
        label: 'a-1',
        href: '/data-sources/a-1',
        key: 'a-1',
      },
      {
        label: 'b-1',
        href: '/data-sources/b-1',
        key: 'b-1',
      },
    ],
  },
];

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
