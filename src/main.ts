import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import i18n from './i18n';
import { createPinia } from 'pinia';

createApp(App).use(createPinia()).use(router).use(i18n).mount('#app');
