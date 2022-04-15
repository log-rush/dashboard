import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import DashboardIndex from '@/views/dashboard/Index.vue';
import { useAuthStore } from '@/core/stores/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/',
    component: Dashboard,
    children: [
      {
        path: '',
        component: DashboardIndex,
      },
    ],
  },
];

export const Router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

Router.beforeEach((to, _from, next) => {
  if (to.fullPath === '/login') return next();

  const auth = useAuthStore();
  if (auth.isLoggedIn.value) {
    return next();
  }
  return next('/login');
});

export default Router;
