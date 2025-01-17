import { defineDisplay } from '@directus/extensions-sdk'

export default defineDisplay({
  id: 'rich_string',
  name: 'Rich String',
  icon: 'text_fields',
  description: 'Display formatted content',
  component: ({ value }: { value: string }) => (value.replace(/<\/?[^>]+(>|$)/g, '')),
  options: null,
  types: ['text'],
})
