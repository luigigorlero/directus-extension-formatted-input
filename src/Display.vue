<script setup lang="ts">
import type { HTMLContent } from '@tiptap/vue-3'
import { useElementSize } from '@directus/composables'
import { computed, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  value: HTMLContent | null
}>(), { value: null })

const text = computed(() => props.value)

const el = ref<HTMLElement>()
const hasEllipsis = ref(false)
const { width } = useElementSize(el)

watch(width, () => {
  if (!el.value) return
  hasEllipsis.value = el.value.offsetWidth < el.value.scrollWidth
}, { immediate: true })
</script>

<template>
  <value-null v-if="!text" />
  <div v-else ref="el" v-tooltip.bottom="hasEllipsis && text" class="fi-display" v-html="text" />
</template>

<style scoped>
.fi-display {
  display: inline-block;
  width: 100%;
  vertical-align: middle;
  overflow: hidden;
  line-height: normal;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
