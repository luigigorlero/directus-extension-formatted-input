<template>
  <div class="fi-editor" :class="[font, { disabled: disabled }]">
    <div class="fi-editor__toolbar">
      <VButton v-if="editorExtensions.includes('bold')" v-tooltip="t('wysiwyg_options.bold')" :disabled="disabled || !editor.can().toggleBold()" secondary
        icon small :active="editor.isActive('bold')" @click="editor.chain().focus().toggleBold().run()">
        <VIcon name="format_bold" />
      </VButton>
      <VButton v-if="editorExtensions.includes('italic')" v-tooltip="t('wysiwyg_options.italic')" :disabled="disabled || !editor.can().toggleItalic()" secondary
        icon small :active="editor.isActive('italic')" @click="editor.chain().focus().toggleItalic().run()">
        <VIcon name="format_italic" />
      </VButton>
      <VButton v-if="editorExtensions.includes('underline')" v-tooltip="t('wysiwyg_options.underline')" :disabled="disabled || !editor.can().toggleUnderline()"
        secondary icon small :active="editor.isActive('underline')"
        @click="editor.chain().focus().toggleUnderline().run()">
        <VIcon name="format_underlined" />
      </VButton>
      <VButton v-if="editorExtensions.includes('strike')" v-tooltip="t('wysiwyg_options.strikethrough')" :disabled="disabled || !editor.can().toggleStrike()" secondary
        icon small :active="editor.isActive('strike')" @click="editor.chain().focus().toggleStrike().run()">
        <VIcon name="format_strikethrough" />
      </VButton>
      <VButton v-if="editorExtensions.includes('subscript')" v-tooltip="t('wysiwyg_options.subscript')" :disabled="disabled || !editor.can().toggleSubscript()"
        secondary icon small :active="editor.isActive('subscript')"
        @click="editor.chain().focus().toggleSubscript().run()">
        <VIcon name="subscript" />
      </VButton>
      <VButton v-if="editorExtensions.includes('superscript')" v-tooltip="t('wysiwyg_options.superscript')" :disabled="disabled || !editor.can().toggleSuperscript()"
        secondary icon small :active="editor.isActive('superscript')"
        @click="editor.chain().focus().toggleSuperscript().run()">
        <VIcon name="superscript" />
      </VButton>
      <VButton v-if="editorExtensions.includes('highlight')" v-tooltip="'Highlight'" :disabled="disabled || !editor.can().toggleHighlight()"
        secondary icon small :active="editor.isActive('highlight')"
        @click="editor.chain().focus().toggleHighlight().run()">
        <VIcon name="format_ink_highlighter" />
      </VButton>
      <VButton v-if="editorExtensions.includes('code')" v-tooltip="'Code'" :disabled="disabled || !editor.can().toggleCode()" secondary
        icon small :active="editor.isActive('code')" @click="editor.chain().focus().toggleCode().run()">
        <VIcon name="code" />
      </VButton>
      <template v-if="editorExtensions.includes('link')">
        <span style="width: 12px;" />
        <div>
          <VButton v-tooltip="t('wysiwyg_options.link')"
            :disabled="disabled || !editor.can().setLink({ href: '' }) || (!editor.isActive('link') && editor.view.state.selection?.from === editor.view.state.selection?.to)"
            secondary icon small :active="editor.isActive('link')" @click="linkOpen">
            <VIcon name="link" />
          </VButton>
          <VButton v-tooltip="'Remove link'" :disabled="disabled || !editor.isActive('link')" secondary icon small
            @click="linkRemove">
            <VIcon name="link_off" />
          </VButton>
        </div>
      </template>
      <template v-if="editorExtensions.includes('hardBreak')">
        <span style="width: 12px;" />
        <VButton v-tooltip="'Hard Break'" :disabled="disabled || !editor.can().setHardBreak()" secondary icon small
          @click="editor.chain().focus().setHardBreak().run()">
          <VIcon name="wrap_text" />
        </VButton>
      </template>

      <VButton v-tooltip="'Clear formatting'" class="ml-auto" :disabled="disabled" icon small
        @click="editor.chain().focus().unsetAllMarks().run()">
        <VIcon name="format_clear" />
      </VButton>
    </div>

    <EditorContent class="fi-editor__content" :editor="editor" />

    <VDrawer v-model="linkDrawerOpen" :title="t('wysiwyg_options.link')" icon="link" @cancel="linkClose">
      <VCardText>
        <div class="grid">
          <VNotice v-if="validationErrors.length" type="danger" class="field">
            <div>
              <p>{{ t('validation_errors_notice') }}</p>
              <ul>
                <li v-for="error in validationErrors">{{ error }}</li>
              </ul>
            </div>
          </VNotice>
          <div class="field">
            <div class="type-label">{{ t('type') }}</div>
            <VSelect v-model="link.type" :items="linkTypes" />
          </div>
          <div class="field">
            <div class="type-label">{{ t('url') }}</div>
            <VInput v-model="link.href" :placeholder="linkPlaceholder" />
          </div>
          <div class="field">
            <div class="type-label">{{ t('open_link_in') }}</div>
            <VCheckbox v-model="link.blank" :label="t('new_tab')" :disabled="disableTarget" block />
          </div>
        </div>
      </VCardText>
      <template #actions>
        <VButton v-tooltip.bottom="'Save'" icon rounded :disabled="link.href === null" @click="linkSave">
          <VIcon name="check" />
        </VButton>
        <VButton v-tooltip.bottom="'Remove'" icon rounded :disabled="!editor.isActive('link')" danger
          @click="linkRemove">
          <VIcon name="delete" />
        </VButton>
      </template>
    </VDrawer>
  </div>
</template>

<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3'
import { onBeforeUnmount, ref, watch } from 'vue'
import type { HTMLContent } from '@tiptap/vue-3'
import { loadExtensions } from './extensions'
import { useLink } from './composables/link'
import { useI18n } from 'vue-i18n'

type Formats = 'bold' | 'highlight' | 'italic' | 'strike' | 'subscript' | 'superscript' | 'underline' | 'code' | 'link'

const { t } = useI18n()
const props = withDefaults(defineProps<{
  value: HTMLContent | null
  disabled: boolean
  toolbar?: Formats[] | null
  font?: 'sans-serif' | 'serif' | 'monospace'
}>(), {
  value: null,
  disabled: false,
  toolbar: () => ['bold', 'italic', 'underline'],
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
const {
  disableTarget,
  linkDrawerOpen,
  link,
  linkTypes,
  linkPlaceholder,
  linkOpen,
  linkClose,
  linkSave,
  linkRemove,
  validationErrors,
} = useLink(editor)

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
  flex-wrap: wrap;
  column-gap: 2px;
  margin-bottom: 4px;
}

.fi-editor__toolbar .v-button {
  margin-top: 2px;
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

.fi-editor__content:deep(.tiptap) {
  flex: 1;
}

.fi-editor__content:deep(a) {
  color: var(--theme--primary, var(--primary));
  text-decoration: underline;
  text-underline-offset: 4px;
}

.fi-editor__content:deep(code) {
  background-color: var(--background-normal-alt);
  border-radius: 2px;
  padding: 1px 2px;
}

.fi-editor__content:focus,
.fi-editor__content:focus-within {
  border-color: var(--theme--form--field--input--border-color-focus) !important;
  box-shadow: var(--theme--form--field--input--box-shadow-focus) !important;
}

.v-drawer .grid {
  display: grid;
  gap: var(--theme--form--row-gap) var(--theme--form--column-gap);
}

.v-drawer .grid .field .type-label {
  margin-bottom: 8px;
}

@media (min-width: 600px) {
  .v-drawer .v-card-text {
    padding-left: 32px;
    padding-right: 32px;
  }
}
</style>
