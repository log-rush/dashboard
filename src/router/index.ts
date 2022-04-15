import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [];

export const Router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default Router;
