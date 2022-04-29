<template>
  <n-config-provider :theme="darkTheme">
    <n-dialog-provider>
      <div id="main">
        <router-view></router-view>
      </div> </n-dialog-provider
    >>
  </n-config-provider>
</template>

<script setup lang="ts">
import { darkTheme, NConfigProvider, NDialogProvider } from 'naive-ui';
</script>

<style>
#main {
  position: fixed;
  inset: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
