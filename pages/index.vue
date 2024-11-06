<template>
  <div class="page">
    <!--    {{ data }}-->11
  </div>
</template>

<script lang="ts" setup>
import {useHTTPFetch} from "~/composables/useHTTPFetch";

//数据库查询
const info = useCookie('userInfo');
console.log(info.value)
try {
  const {data} = await useHTTPFetch('/api/note/note', {method: "get",})
  console.log('useHTTPFetch', data.value)
} catch (err) {
}
</script>

<style scoped></style>