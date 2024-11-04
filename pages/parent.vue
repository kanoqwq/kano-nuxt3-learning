<script setup lang="ts">
//使用中间件
// definePageMeta({
//   middleware: 'auth'
// })

//匿名路由中间件
definePageMeta({
  middleware: defineNuxtRouteMiddleware((to, from) => {
    console.log(to.path,from.path)
  })
})
</script>

<template>
  parent
  <NuxtPage/>
</template>

<style scoped>

</style>