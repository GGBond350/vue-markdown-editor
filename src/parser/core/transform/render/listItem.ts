import { prefix } from "@/common/contant";
import type { Tokens } from "@/types/parser/token";
import { astToHtml } from "..";

export const renderListItem = (node: Tokens) => {
	return `<li class="${prefix}-li">${node.children?.map(astToHtml).join('')}</li>`
}