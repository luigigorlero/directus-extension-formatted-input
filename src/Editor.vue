<template>
  <div class="fi-editor" :class="[font, { disabled: disabled }]">
    <div class="fi-editor__toolbar">
      <VButton v-for="extension in toolbarExtensions"
        :disabled="disabled || !editor.can()?.[extensionsMap?.[extension]?.command]()" secondary icon small
        :active="editor.isActive(extension)" @click="editor.chain().focus()?.[extensionsMap?.[extension]?.command]().run()">
        <VIcon :name="extensionsMap![extension]?.icon" />
      </VButton>
      <VButton class="ml-auto" :disabled="disabled" secondary icon small
        @click="editor.chain().focus().unsetAllMarks().run()">
        <VIcon name="format_clear" />
      </VButton>
    </div>
    <EditorContent class="fi-editor__content" :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3'
import { onBeforeUnmount, ref, watch } from 'vue'
import type { HTMLContent } from '@tiptap/vue-3'
import { loadExtensions } from './extensions'

type Formats = 'bold' | 'highlight' | 'italic' | 'strike' | 'subscript' | 'superscript' | 'underline'

const props = withDefaults(defineProps<{
  value: HTMLContent | null
  disabled: boolean
  toolbar?: Formats[] | null
  font?: 'sans-serif' | 'serif' | 'monospace'
}>(), {
  value: null,
  disabled: false,
  toolbar: null,
  font: 'sans-serif',
})
const emit = defineEmits<{ (e: "input", value: HTMLContent): void }>()

const editorInitiated = ref<boolean>(false)
const extensions = await loadExtensions(props)
console.log(props.toolbar, extensions)
const editor = new Editor({
  editable: !props.disabled,
  content: props.value,
  extensions,
  onUpdate: ({ editor }) => {
    if (editor.isEmpty && !editorInitiated.value) return
    emit('input', editor.getHTML())
  },
})

const editorExtensions = editor.extensionManager.extensions.map((ext) => ext.name)
const toolbarExtensions = props.toolbar?.filter((v: Formats | string) => editorExtensions?.includes(v))
const extensionsMap: { [key in Formats]: { command: string, icon: string } } = {
  bold: { command: 'toggleBold', icon: 'format_bold' },
  italic: { command: 'toggleItalic', icon: 'format_italic' },
  underline: { command: 'toggleUnderline', icon: 'format_underlined' },
  strike: { command: 'toggleStrike', icon: 'format_strikethrough' },
  subscript: { command: 'toggleSubscript', icon: 'subscript' },
  superscript: { command: 'toggleSuperscript', icon: 'superscript' },
  highlight: { command: 'toggleHighlight', icon: 'format_ink_highlighter' },
}

watch(() => props.value, (value) => {
  if (!value) return

  const isSame = editor.getHTML() === value
  if (isSame) return

  editor.commands.setContent(value, false)
  editorInitiated.value = true
}, { immediate: true })
watch(() => props.disabled, (disabled) => editor.setEditable(!disabled))

onBeforeUnmount(() => editor.destroy())
</script>

<style scoped>
.fi-editor.monospace {
  --v-textarea-font-family: var(--theme--fonts--monospace--font-family);
}

.fi-editor.serif {
  --v-textarea-font-family: var(--theme--fonts--serif--font-family);
}

.fi-editor.sans-serif {
  --v-textarea-font-family: var(--theme--fonts--sans--font-family);
}

.fi-editor__toolbar {
  display: flex;
  margin-bottom: 4px;
}

.fi-editor__toolbar .v-button+.v-button {
  margin-left: 2px;
}

.fi-editor__toolbar .v-button.ml-auto {
  margin-left: auto;
}

.fi-editor__content {
  padding: var(--theme--form--field--input--padding);
  color: var(--theme--foreground);
  font-family: var(--v-textarea-font-family, var(--theme--fonts--sans--font-family));
  background-color: var(--theme--background);
  border: var(--theme--border-width) solid var(--theme--form--field--input--border-color);
  border-radius: var(--theme--border-radius);
  transition: border-color var(--fast) var(--transition);
}

.fi-editor__content:focus,
.fi-editor__content:focus-within {
  border-color: var(--theme--form--field--input--border-color-focus) !important;
  box-shadow: var(--theme--form--field--input--box-shadow-focus) !important;
}
</style>
