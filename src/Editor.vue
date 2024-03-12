<template>
  <div class="fi-editor" :class="[font, { disabled: disabled }]">
    <div class="fi-editor__toolbar">
      <VButton v-if="editorExtensions.includes('bold')" :disabled="disabled || !editor.can().toggleBold()" secondary
        icon small :active="editor.isActive('bold')" @click="editor.chain().focus().toggleBold().run()">
        <VIcon name="format_bold" />
      </VButton>
      <VButton v-if="editorExtensions.includes('italic')" :disabled="disabled || !editor.can().toggleItalic()" secondary
        icon small :active="editor.isActive('italic')" @click="editor.chain().focus().toggleItalic().run()">
        <VIcon name="format_italic" />
      </VButton>
      <VButton v-if="editorExtensions.includes('underline')" :disabled="disabled || !editor.can().toggleUnderline()"
        secondary icon small :active="editor.isActive('underline')"
        @click="editor.chain().focus().toggleUnderline().run()">
        <VIcon name="format_underlined" />
      </VButton>
      <VButton v-if="editorExtensions.includes('strike')" :disabled="disabled || !editor.can().toggleStrike()" secondary
        icon small :active="editor.isActive('strike')" @click="editor.chain().focus().toggleStrike().run()">
        <VIcon name="format_strikethrough" />
      </VButton>
      <VButton v-if="editorExtensions.includes('subscript')" :disabled="disabled || !editor.can().toggleSubscript()"
        secondary icon small :active="editor.isActive('subscript')"
        @click="editor.chain().focus().toggleSubscript().run()">
        <VIcon name="subscript" />
      </VButton>
      <VButton v-if="editorExtensions.includes('superscript')" :disabled="disabled || !editor.can().toggleSuperscript()"
        secondary icon small :active="editor.isActive('superscript')"
        @click="editor.chain().focus().toggleSuperscript().run()">
        <VIcon name="superscript" />
      </VButton>
      <VButton v-if="editorExtensions.includes('highlight')" :disabled="disabled || !editor.can().toggleHighlight()"
        secondary icon small :active="editor.isActive('highlight')"
        @click="editor.chain().focus().toggleHighlight().run()">
        <VIcon name="format_ink_highlighter" />
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
  display: flex;
  align-items: center;
  min-height: var(--theme--form--field--input--height);
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
