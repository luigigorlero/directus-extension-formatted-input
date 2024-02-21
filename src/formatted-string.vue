<script setup lang="ts">
import { reactive, ref, watchEffect } from 'vue'
import DOMPurify from 'dompurify'

type Formats = 'bold' | 'italic' | 'strikeThrough' | 'subscript' | 'superscript' | 'underline'

const props = withDefaults(
	defineProps<{
		value: string | null;
		disabled?: boolean;
		toolbar?: Formats[];
		font?: 'sans-serif' | 'serif' | 'monospace';
		direction?: string;
	}>(),
	{
		toolbar: () => [
			'bold',
			'italic',
			'underline',
		],
		font: 'sans-serif',
	}
)
const emit = defineEmits(['input'])
const editor = ref<HTMLElement>()
const state = reactive<{ [key in Formats]: boolean }>({
	bold: false,
	italic: false,
	strikeThrough: false,
	subscript: false,
	superscript: false,
	underline: false,
})
const iconMap: { [key in Formats]: string } = {
	bold: 'format_bold',
	italic: 'format_italic',
	strikeThrough: 'format_strikethrough',
	subscript: 'subscript',
	superscript: 'superscript',
	underline: 'format_underlined',
}
const editing = ref(false)

watchEffect(() => {
	if (!editor.value) return
	if (props.value !== editor.value.innerHTML) editor.value.innerHTML = props.value ?? ''
})

function isFormat<T extends object>(
	x: T,
	k: PropertyKey
): k is keyof T {
	return k in x
}

function exec(command: string) {
	document.execCommand('StyleWithCSS', false, false)
	document.execCommand(command, false, null)
	checkCursorFormat()
	editor.value?.focus()
}
function checkCursorFormat() {
	Object.keys(state).forEach((format) => {
		if (!editor.value) return
		if (isFormat(state, format)) state[format] = document.queryCommandState(format)
	})
}

function handleBlur() {
	if (editing.value) return

	Object.keys(state).forEach((format) => {
		if (!editor.value) return
		if (isFormat(state, format)) state[format] = false
	})
}
function handleKeydown(e: KeyboardEvent) {
	checkCursorFormat()
	if (e.key === 'Enter') {
		e.preventDefault()
		editor.value?.blur()
	}
}
function handlePaste(e: ClipboardEvent) {
	const paste = (e?.clipboardData)?.getData('text/plain')
	e.preventDefault()
	e.stopPropagation()

	if (!paste) return
	document.execCommand('insertText', false, DOMPurify.sanitize(paste.replace(/[\n\r]|\s\s+/g, ' ')))
}
</script>

<template>
	<div id="formatted-string" :class="[font, { disabled: disabled }]">
		<div class="fi-toolbar">
			<VButton v-for="format of props.toolbar" :disabled="disabled" active icon outlined :secondary="!state[format]" small
				@click="exec(format)" @mousedown="editing = true" @mouseup="editing = false">
				<VIcon :name="iconMap[format]" />
			</VButton>
		</div>
		<div ref="editor" class="fi-editor" contenteditable @blur="handleBlur" @click="checkCursorFormat"
			@focus="checkCursorFormat" @input="emit('input', editor?.innerHTML ?? null)" @keydown="handleKeydown"
			@paste="handlePaste" :model-value="value" />
	</div>
</template>

<style>
#formatted-string {
	font-weight: normal;
	font-style: normal;
	text-decoration: none;
}

#formatted-string.monospace {
	--v-textarea-font-family: var(--theme--fonts--monospace--font-family);
}

#formatted-string.serif {
	--v-textarea-font-family: var(--theme--fonts--serif--font-family);
}

#formatted-string.sans-serif {
	--v-textarea-font-family: var(--theme--fonts--sans--font-family);
}

#formatted-string .fi-toolbar {
	margin: 20px 0 8px;
	display: flex;
	gap: 8px;
}

#formatted-input .fi-toolbar .v-button .content {
	text-transform: capitalize;
}

#formatted-string .fi-editor {
	height: var(--theme--form--field--input--height);
	padding: var(--theme--form--field--input--padding);
	color: var(--theme--foreground);
	font-family: var(--v-textarea-font-family, var(--theme--fonts--sans--font-family));
	background-color: var(--theme--background);
	border: var(--theme--border-width) solid var(--theme--form--field--input--border-color);
	border-radius: var(--theme--border-radius);
	transition: border-color var(--fast) var(--transition);
	white-space: nowrap;
	overflow: hidden;
}

#formatted-string .fi-editor b {
	font-weight: bold;
}

#formatted-string .fi-editor:focus,
#formatted-string .fi-editor:focus-within {
	border-color: var(--theme--form--field--input--border-color-focus) !important;
	box-shadow: var(--theme--form--field--input--box-shadow-focus) !important;
}
</style>