import type { Editor } from '@tiptap/vue-3'
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import isEmail from 'validator/lib/isEmail'
import isURL from 'validator/lib/isURL'
import isSlug from 'validator/lib/isSlug'

export function useLink(editor: Editor) {
  const { t } = useI18n()

  type LinkType = {
    text: string
    value: string | null
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
    { text: t('other'), value: null, prefix: [] },
  ]

  const linkDrawerOpen = ref(false)
  const linkHref = ref('')
  const linkBlank = ref<boolean | null>(false)
  const linkType = ref(linkTypes[0]?.value)

  const linkPlaceholder = computed(() => {
    const link = linkTypes.find((t) => t.value === linkType.value)

    if (link?.placeholder) return link.placeholder
    return false
  })

  const disableTarget = computed(() => {
    const link = linkTypes.find(({ value }) => value === linkType.value)

    if (link?.noTarget) return true
    return false
  })

  watchEffect(() => {
    const link = linkTypes.find(({ value }) => value === linkType.value)
    if (link?.noTarget) linkBlank.value = null
  })

  const getSaveableValues = () => {
    const type = linkType.value
    let href = linkHref.value
    const newTab = linkBlank.value
    let target = newTab ? '_blank' : null

    if (newTab) target = '_blank'

    linkTypes.forEach((linkType) => {
      if (linkType.value !== type) return
      if (newTab === null && linkType.newTabDefault) target = '_blank'

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
    const type = linkType.value
    const href = linkHref.value

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
    linkHref.value = attrs.href
    linkBlank.value = attrs.target === null ? false : true
    linkDrawerOpen.value = true
  }

  function linkClose() {
    linkDrawerOpen.value = false
    linkHref.value = ''
    linkBlank.value = null
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
    linkHref,
    linkBlank,
    linkType,
    linkTypes,
    linkPlaceholder,
    linkOpen,
    linkClose,
    linkSave,
    linkRemove,
    validationErrors,
  }
}
