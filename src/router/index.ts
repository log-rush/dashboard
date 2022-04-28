import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue';
import DashboardIndex from '@/views/dashboard/Index.vue';
import DataSource from '@/views/dashboard/DataSource.vue';
import DataSourcesList from '@/views/dashboard/DataSourcesList.vue';
import View from '@/views/dashboard/View.vue';
import ViewsList from '@/views/dashboard/ViewsList.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: Dashboard,
    children: [
      {
        path: '',
        component: DashboardIndex,
      },
      {
        path: '/views',
        component: ViewsList,
      },
      {
        path: '/data-sources',
        component: DataSourcesList,
      },
      {
        path: '/views/:id',
        component: View,
      },
      {
        path: '/data-sources/:id',
        component: DataSource,
      },
    ],
  },
];

export const Router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default Router;
