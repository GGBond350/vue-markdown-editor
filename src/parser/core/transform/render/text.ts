import type { Tokens } from "@/types/parser/token";

export const renderText = (node: Tokens) => {
  return node.value!.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
