import type { ParseFnParams } from "@/types/parser/token"
import { parseInlineElements } from "../inline"

export const parseParagraph = ({
	trimmedLine,
	index,
	currentOffset,
	root,
}: ParseFnParams) => {

	const children = parseInlineElements(trimmedLine, index, currentOffset);
	if (children.length === 0) return;

	root.children.push({
		type: "paragraph",
		children,
		position: {
			start: {
				line: index + 1,
				column: 1,
				offset: currentOffset
			},
			end: {
				line: index + 1,
				column: trimmedLine.length + 1,
				offset: currentOffset + trimmedLine.length
			}
		}
	});
	return true;
}