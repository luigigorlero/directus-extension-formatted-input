import { defineDisplay } from '@directus/extensions-sdk'
import Display from './Display.vue'

export default defineDisplay({
  id: 'rich_string',
  name: 'Rich String',
  icon: 'text_fields',
  description: 'Display formatted content',
  component: Display,
  options: null,
  types: ['text'],
})
