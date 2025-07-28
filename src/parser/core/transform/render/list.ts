import { prefix } from "@/common/contant";
import type { Tokens } from "@/types/parser/token";
import { astToHtml } from "..";

export const renderList = (node: Tokens) => {
	const listTag = node.isOrder ? 'ol' : 'ul';
	return `<${listTag} class="${prefix}-${listTag}" data-line="${node.position.start.line}">${node.children?.map(astToHtml).join('')}</${listTag}>` 
}