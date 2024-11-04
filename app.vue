<template>
  <a-config-provider
      :theme="theme"
  >
  <!--路由入口-->
    <NuxtPage />
  </a-config-provider>
</template>

<script lang="ts" setup>
import {theme} from './theme'
</script>
