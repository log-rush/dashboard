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
          :collapsed-width="64"
          :root-indent="12"
          :render-label="renderMenuLabel"
          :options="MainMenu"
          :expand-icon="CreateIconRenderer('mdi:chevron-down')"
          @update-value="onSelectedOption"
        />
        <div class="menu-spacer"></div>
        <n-menu
          :collapsed="collapsed"
          :collapsed-width="64"
          :root-indent="12"
          :render-label="renderMenuLabel"
          :options="BottomMenu"
          :expand-icon="CreateIconRenderer('mdi:chevron-down')"
          @update-value="onSelectedOption"
        />
      </div>
    </n-layout-sider>
    <n-layout>
      <router-view></router-view>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { NLayout, NLayoutSider, NMenu, NSpace } from 'naive-ui';
import type { MenuOption } from 'naive-ui';
import { h, ref } from 'vue';
import { IconRenderer, CreateIconRenderer } from '@/components/Icon';
import { useRouter } from 'vue-router';

const router = useRouter();
const collapsed = ref(true);

const onSelectedOption = (_key: string, option: MenuOption) => {
  if ('href' in option) {
    router.push(option.href as string);
  }
};

const renderMenuLabel = (option: MenuOption) => {
  if ('href' in option) {
    return h('router-link', { to: option.href }, [option.label as string]);
  }
  return option.label as string;
};

const BottomMenu: MenuOption[] = [
  {
    label: 'Logout',
    key: 'logout',
    href: '/log-out',
    icon: () => IconRenderer('mdi:logout'),
  },
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
  {
    label: 'Data Sources',
    key: 'data-sources',
    icon: () => IconRenderer('mdi:server'),
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
  {
    label: 'Views',
    key: 'views',
    icon: () => IconRenderer('mdi:view-dashboard-variant'),
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
