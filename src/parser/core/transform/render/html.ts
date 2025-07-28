import type { Tokens } from '@/types/parser/token'

export const renderHtml = (node: Tokens) => {
  return node.value!
}
