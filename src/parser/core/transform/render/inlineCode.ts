import { prefix } from "@/common/contant";
import type { Tokens } from "@/types/parser/token";

export const renderInlineCode = (node: Tokens) => {
	const escapedValue = node.children![0].value!.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return `<code class="${prefix}-inline-code">${escapedValue}</code>`;
}