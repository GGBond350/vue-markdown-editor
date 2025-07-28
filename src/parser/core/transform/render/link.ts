import { prefix } from "@/common/contant";
import type { Tokens } from "@/types/parser/token";
import { astToHtml } from "..";

export const renderLink = (node: Tokens) => {
	return `<a href="${node.url}" class="${prefix}-link" target="_blank">${astToHtml(node.children![0])}</a>`;
}