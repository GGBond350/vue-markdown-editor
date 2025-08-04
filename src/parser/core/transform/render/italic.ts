import type { Tokens } from "@/types/parser/token";
import { astToHtml } from "..";
import { prefix } from "@/common/contant";

export const renderItalic = (node: Tokens) => {
	return `<em class="${prefix}-em">${node.children?.map(astToHtml).join('')}</em>`;
}