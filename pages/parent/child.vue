<script setup lang="ts">
const route = useRoute()
onMounted(() => {
  console.log(route.query.userInfo)
})
</script>

<template>
  <strong>child子组件，父组件为parent</strong>
  <hr/>
  <strong>{{ JSON.parse($route.query.userInfo) }}</strong>
</template>

<style scoped>

</style>