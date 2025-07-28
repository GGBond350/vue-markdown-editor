import { prefix } from "@/common/contant";
import type { Tokens } from "@/types/parser/token";
import { astToHtml } from "..";

export const renderBlockquote = (node: Tokens) => {
	return `<blockquote class="${prefix}-blockquote" data-line="${node.position.start.line}">
	${node.children?.map(astToHtml).join('')}
	</blockquote>`;
}