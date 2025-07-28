import type { Tokens } from "@/types/parser/token";
import { astToHtml } from "..";

export const renderItalic = (node: Tokens) => {
	return `<em>${node.children?.map(astToHtml).join('')}</em>`;
}