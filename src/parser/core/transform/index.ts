import type { RootTokens, Tokens } from "@/types/parser/token";

export const astToHtml = (node: RootTokens | Tokens): string =>  {
	const nodeType = node.type;
}