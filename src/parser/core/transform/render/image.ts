import { prefix } from "@/common/contant";
import type { Tokens } from "@/types/parser/token";

export const renderImage = (node: Tokens) => {
	return `<img src=${node.url} alt="${node.alt || ''}" class="${prefix}-image" title="${node.title || ''}"/>`;
}