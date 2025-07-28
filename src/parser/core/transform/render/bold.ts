import { prefix } from "@/common/contant"
import type { Tokens } from "@/types/parser/token";
import { astToHtml } from "..";
export const renderBold = (node: Tokens) => {
	return `<strong class="${prefix}-bold">${node.children?.map(astToHtml).join('')}</strong>`
}