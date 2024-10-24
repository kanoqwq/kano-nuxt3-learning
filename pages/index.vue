<template>
<div>
    index
    <NuxtLink to="./kano/kano">To Kano</NuxtLink>
    <div>
        <input type="number" v-model="id">
        <NuxtLink :to="`./kano/${id}`">To {{ id }}</NuxtLink>
    </div>
</div>
</template>

<script lang="ts" setup>
    import { ref } from "vue"
    const id = ref(1)
</script>

<style scoped></style>