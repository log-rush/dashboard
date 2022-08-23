<template>
  <n-page-header>
    <n-space vertical size="large">
      <slot></slot>
    </n-space>
    <template #title>
      <n-h1 style="margin: 0">
        {{ title }}
      </n-h1>
    </template>
    <template #header>
      <n-space align="center" justify="space-between">
        <n-breadcrumb>
          <n-breadcrumb-item
            v-for="breadcrumb of breadcrumbs"
            :key="breadcrumb.title + breadcrumb.link"
          >
            <router-link :to="breadcrumb.link">
              <n-text> {{ breadcrumb.title }} </n-text>
            </router-link>
          </n-breadcrumb-item>
        </n-breadcrumb>
        <n-button size="small" circle secondary type="tertiary" @click="goBack">
          <template #icon>
            <Icon icon="mdi:chevron-left" />
          </template>
        </n-button>
      </n-space>
    </template>
    <template #extra>
      <slot name="extra"></slot>
    </template>
    <template #footer>
      log-rush © Fabian Kachlock {{ new Date().getFullYear() }} - All rights
      reserved.
    </template>
  </n-page-header>
</template>

<script setup lang="ts">
import { RouteMetaData } from '@/core/model/routeMetaData';
import {
  NH1,
  NSpace,
  NPageHeader,
  NBreadcrumb,
  NBreadcrumbItem,
  NText,
  NButton,
} from 'naive-ui';
import { ref, watch, defineProps, onMounted } from 'vue';
import { RouteLocationMatched, useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';

const breadcrumbs = ref<{ title: string; link: string }[]>([]);
const route = useRoute();
const router = useRouter();

defineProps<{
  title: string;
}>();

watch(
  () => route.matched,
  (routes) => calculateBreadcrumbs(routes),
);

onMounted(() => {
  calculateBreadcrumbs(route.matched);
});

const goBack = () => {
  router.push(route.fullPath.split('/').slice(0, -1).join('/') || '/');
};

const calculateBreadcrumbs = (routes: RouteLocationMatched[]) => {
  const breadcrumbRoutes = routes.filter((r) => r.meta && r.meta.breadcrumb);
  breadcrumbs.value = breadcrumbRoutes.map((activeRoute) => {
    const config = (activeRoute.meta as RouteMetaData).breadcrumb;
    const title =
      config?.title ??
      (config?.titleCreator && config.titleCreator(activeRoute)) ??
      '';
    const link =
      config?.link ??
      (config?.linkCreator && config.linkCreator(activeRoute)) ??
      '';
    return { title, link };
  });
};
</script>
