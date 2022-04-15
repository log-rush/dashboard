import { h, VNodeChild } from 'vue';
import { Icon } from '@iconify/vue';

export const IconRenderer = (icon: string) => h(Icon, { icon: icon });
export const CreateIconRenderer =
  (icon: string): (() => VNodeChild) =>
  () =>
    IconRenderer(icon);
