import { defineInterface } from '@directus/extensions-sdk'
import Interface from './Interface.vue'

export default defineInterface({
  id: 'formatted-input',
  name: 'Formatted Input',
  icon: 'format_quote',
  description: 'A simple Rich Inline Editor to format short texts',
  component: Interface,
  types: ['text'],
  group: 'standard',
  recommendedDisplays: ['rich_string'],
  options: [
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
              value: 'strike',
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
            {
              value: 'highlight',
              text: 'Highlight',
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
  ],
})
