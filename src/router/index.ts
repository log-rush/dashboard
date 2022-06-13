import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue';
import DashboardIndex from '@/views/dashboard/Index.vue';
import DataSource from '@/views/dashboard/DataSource.vue';
import DataSourcesList from '@/views/dashboard/DataSourcesList.vue';
import View from '@/views/dashboard/View.vue';
import ViewsList from '@/views/dashboard/ViewsList.vue';
import AllLogs from '@/views/dashboard/AllLogs.vue';
import EmptyOutlet from '@/components/util/EmptyRouterView.vue';
import { createRouteMeta } from '@/core/model/routeMetaData';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: Dashboard,
    meta: createRouteMeta({
      breadcrumb: {
        title: 'Dashboard',
        link: '/',
      },
    }),
    children: [
      {
        path: '',
        component: DashboardIndex,
      },
      {
        path: '/data-sources',
        component: EmptyOutlet,
        meta: createRouteMeta({
          breadcrumb: {
            title: 'DataSources',
            link: '/data-sources',
          },
        }),
        children: [
          {
            path: '',
            component: DataSourcesList,
          },
          {
            path: '/data-sources/:id',
            component: DataSource,
            meta: createRouteMeta({}),
          },
        ],
      },
      {
        path: '/views',
        component: ViewsList,
      },
      {
        path: '/all-logs',
        component: AllLogs,
      },
      {
        path: '/views/:id',
        component: View,
      },
    ],
  },
];

export const Router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default Router;
