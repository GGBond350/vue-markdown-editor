import { astToHtml } from ".."
import type { Tokens } from "@/types/parser/token";
export const renderDelete = (node: Tokens) => {
	return `<del>${node.children?.map(astToHtml).join("")}</del>`
}