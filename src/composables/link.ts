import type { Editor } from '@tiptap/vue-3'
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import isEmail from 'validator/lib/isEmail'
import isURL from 'validator/lib/isURL'
import isSlug from 'validator/lib/isSlug'

export function useLink(editor: Editor) {
  const { t } = useI18n()
  const linkDrawerOpen = ref(false)
  const link = ref<{ type: LinkTypeValue, href: string, blank: boolean | null }>({
    type: undefined,
    href: '',
    blank: null,
  })

  type LinkTypeValue = 'external_link' | 'internal_link' | 'email' | 'tel' | undefined
  type LinkType = {
    text: string
    value: LinkTypeValue
    prefix: string[]
    hidePrefix?: boolean
    placeholder?: string | boolean
    noTarget?: boolean
    newTabDefault?: boolean
  }
  const linkTypes: LinkType[] = [
    { text: 'External Link', value: 'external_link', prefix: ['http://', 'https://'], placeholder: 'https://', newTabDefault: true },
    { text: 'Internal Link', value: 'internal_link', prefix: ['/'], placeholder: '/', newTabDefault: false },
    { text: t('email'), value: 'email', prefix: ['mailto:'], hidePrefix: true, placeholder: 'mail@example.com', noTarget: true },
    { text: 'Phone Number', value: 'tel', prefix: ['tel:'], hidePrefix: true, placeholder: '+1234567890', noTarget: true },
    { text: t('other'), value: undefined, prefix: [] },
  ]

  // const linkHref = ref('')
  // const linkBlank = ref<boolean | null>(false)
  // const linkType = ref(linkTypes[0]?.value)

  const linkPlaceholder = computed(() => {
    const linkType = linkTypes.find((t) => t.value === link.value.type)

    if (linkType?.placeholder) return linkType.placeholder
    return false
  })

  const disableTarget = computed(() => {
    const linkType = linkTypes.find(({ value }) => value === link.value.type)

    if (linkType?.noTarget) return true
    return false
  })

  watchEffect(() => {
    const linkType = linkTypes.find(({ value }) => value === link.value.type)
    if (linkType?.noTarget) link.value.blank = null
  })

  const getDisplayValues = (old: Record<string, any>) => {
    let type: LinkTypeValue | undefined = old.href ? undefined : 'external_link'
    let href = old.href ? old.href : ''
    let blank: boolean | null = null

    if (old.hasOwnProperty('target')) blank = old.target === null ? false : true

    linkTypes.forEach((linkType) => {
      linkType.prefix.forEach((prefix) => {
        if (href.startsWith(prefix)) {
          type = linkType.value

          if (linkType.noTarget) blank = null
          if (linkType.hidePrefix) href = href.replace(new RegExp(`^${prefix}`, "g"), '')
          return
        }
      })
    })

    return { type, href, blank }
  }
  const getSaveableValues = () => {
    let { type, href, blank } = link.value
    let target = blank ? '_blank' : null

    if (blank) target = '_blank'

    linkTypes.forEach((linkType) => {
      if (linkType.value !== type) return
      if (blank === null && linkType.newTabDefault) target = '_blank'

      linkType.prefix.forEach((prefix) => {
        if (linkType.hidePrefix) {
          href = prefix + href
          return
        }
      })
    })

    return {
      href,
      rel: type !== 'internal_link' ? 'noopener noreferrer nofollow' : null,
      target,
    }
  }

  const validationErrors = ref<string[]>([])
  const validateInput = () => {
    const { type, href } = link.value

    validationErrors.value = []

    const externalLinkOptions = { require_protocol: true, protocols: ['http', 'https'], validate_length: false }
    const regexPhoneNumber = /^[\+]?[\d\s]+$/

    if (type === 'external_link') {
      const protocolExists = linkTypes
        .find(({ value }) => value === type)?.prefix
        .some((prefix) => href.startsWith(prefix))

      if (!protocolExists) validationErrors.value.push('Link must start with http:// or https://')
      if (!isURL(href, externalLinkOptions)) validationErrors.value.push('Invalid link format')
    }

    if (type === 'internal_link') {
      if (!href.startsWith('/')) validationErrors.value.push('Link must start with a /')
      if (!isSlug(href)) validationErrors.value.push('Invalid link format')
    }
    if (type === 'email' && !isEmail(href)) validationErrors.value.push('Invalid e-mail format')
    if (type === 'tel' && !regexPhoneNumber.test(href)) validationErrors.value.push('Invalid phone number: use only numbers & spaces')
  }

  function linkOpen() {
    const attrs = editor.getAttributes('link')
    const { type, href, blank } = getDisplayValues(attrs)

    link.value.type = type
    link.value.href = href
    link.value.blank = blank
    linkDrawerOpen.value = true
  }

  function linkClose() {
    linkDrawerOpen.value = false
    link.value.type = undefined
    link.value.href = ''
    link.value.blank = null
  }

  function linkSave() {
    validateInput()
    if (validationErrors.value.length) return

    const { href, rel, target } = getSaveableValues()
    editor.chain().focus().extendMarkRange('link').setLink({ href, rel, target }).run()
    linkClose()
  }

  function linkRemove() {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    linkClose()
  }

  return {
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
  }
}
