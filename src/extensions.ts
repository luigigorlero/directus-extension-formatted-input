import { Node } from '@tiptap/core'
import type { AnyExtension, Extensions } from '@tiptap/core'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Highlight from '@tiptap/extension-highlight'

export interface ExtensionMeta {
  name: string
  title: string
  package: string
  group: 'mark'
  options: any[]
  defaults: object
  load(props: object): PromiseLike<AnyExtension> | AnyExtension
}

export const extensionsMeta: ExtensionMeta[] = [
  {
    name: 'bold',
    title: 'Bold',
    package: '@tiptap/extension-bold',
    group: 'mark',
    defaults: {},
    options: [],
    load: () => Bold,
  },
  {
    name: 'italic',
    title: 'Italic',
    package: '@tiptap/extension-italic',
    group: 'mark',
    defaults: {},
    options: [],
    load: () => Italic,
  },
  {
    name: 'underline',
    title: 'Underline',
    package: '@tiptap/extension-underline',
    group: 'mark',
    defaults: {},
    options: [],
    load: () => Underline,
  },
  {
    name: 'strike',
    title: 'Strike',
    package: '@tiptap/extension-strike',
    group: 'mark',
    defaults: {},
    options: [],
    load: () => Strike,
  },
  {
    name: 'subscript',
    title: 'Subscript',
    package: '@tiptap/extension-subscript',
    group: 'mark',
    defaults: {},
    options: [],
    load: () => Subscript,
  },
  {
    name: 'superscript',
    title: 'Superscript',
    package: '@tiptap/extension-superscript',
    group: 'mark',
    defaults: {},
    options: [],
    load: () => Superscript,
  },
  {
    name: 'highlight',
    title: 'Highlight',
    package: '@tiptap/extension-highlight',
    group: 'mark',
    defaults: {},
    options: [],
    load: () => Highlight,
  },
]

const OneLiner = Node.create({
  name: 'oneLiner',
  topNode: true,
  content: 'inline*',
})

export async function loadExtensions(props: { toolbar: string[] | null }): Promise<Extensions> {
  const extensions: Extensions = [OneLiner, Text]

  const exts = await Promise.all(
    extensionsMeta.filter((ext) => props.toolbar?.includes(ext.name)).map((ext) => ext.load(props)),
  )

  extensions.push(...exts)

  return extensions
}
