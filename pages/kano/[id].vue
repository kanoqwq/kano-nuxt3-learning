<template>
  <div>
    kano{{ route.params.id }}
    kano{{ $route.params.id }}
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue"

const route = ueRoute()

</script>

<style scoped></style>