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
    </template>
    <template #extra>
      <slot name="extra"></slot>
    </template>
    <template #footer> Copyright </template>
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
} from 'naive-ui';
import { ref, watch, defineProps, onMounted } from 'vue';
import { RouteLocationMatched, useRoute } from 'vue-router';

const breadcrumbs = ref<{ title: string; link: string }[]>([]);
const route = useRoute();

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
