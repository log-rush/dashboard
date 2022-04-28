import { RouteLocationMatched } from 'vue-router';

export type RouteMetaData = {
  breadcrumb?: {
    title?: string;
    link?: string;
    titleCreator?: (route: RouteLocationMatched) => string;
    linkCreator?: (route: RouteLocationMatched) => string;
  };
};

export const createRouteMeta = (config: RouteMetaData): RouteMetaData => config;
