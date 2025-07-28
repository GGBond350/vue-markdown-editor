import { prefix } from "@/common/contant";
import type { Tokens } from "@/types/parser/token";
import { astToHtml } from "..";
export const renderHeading = (node: Tokens) => {
	return `<h${node.depth} class="${prefix}-h${node.depth}" data-line="${node.position.start.line}">${node.children?.map(astToHtml).join('')}</h${node.depth}>`;
}