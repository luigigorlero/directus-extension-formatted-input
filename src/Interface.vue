<script setup lang="ts">
import Editor from "./Editor.vue"
</script>

<template>
  <Suspense>
    <template #default>
      <Editor v-bind="$attrs" />
    </template>
    <template #fallback>
      Loading
    </template>
  </Suspense>
</template>
