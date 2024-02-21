import InterfaceFormattedString from './formatted-string.vue'

export default {
	id: 'formatted-string',
	name: 'Formatted String',
	description: '',
	icon: 'format_quote',
	component: InterfaceFormattedString,
	types: ['text'],
	group: 'standard',
	options: {
		standard: [
			{
				field: 'toolbar',
				name: '$t:interfaces.input-rich-text-html.toolbar',
				type: 'json',
				schema: {
					default_value: [
						'bold',
						'italic',
						'underline',
					],
				},
				meta: {
					width: 'half',
					interface: 'select-multiple-dropdown',
					options: {
						choices: [
							{
								value: 'bold',
								text: '$t:wysiwyg_options.bold',
							},
							{
								value: 'italic',
								text: '$t:wysiwyg_options.italic',
							},
							{
								value: 'underline',
								text: '$t:wysiwyg_options.underline',
							},
							{
								value: 'strikeThrough',
								text: '$t:wysiwyg_options.strikethrough',
							},
							{
								value: 'subscript',
								text: '$t:wysiwyg_options.subscript',
							},
							{
								value: 'superscript',
								text: '$t:wysiwyg_options.superscript',
							},
						],
					},
				},
			},
			{
				field: 'font',
				name: '$t:font',
				type: 'string',
				meta: {
					width: 'half',
					interface: 'select-dropdown',
					options: {
						choices: [
							{ text: '$t:sans_serif', value: 'sans-serif' },
							{ text: '$t:monospace', value: 'monospace' },
							{ text: '$t:serif', value: 'serif' },
						],
					},
				},
				schema: {
					default_value: 'sans-serif',
				},
			},
		]
	},
	// preview: Preview,
}