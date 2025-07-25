import type { ParseFnParams } from "@/types/parser/token";

export const parseThematicBreak = ({
	trimmedLine,
	index,
	currentOffset,
	root,
	resetCurrentStatus
}: ParseFnParams) => {
	 // todo 解决解析遇到空格
	if (!/^(?:-{3,}|[*]{3,})$/.test(trimmedLine)) return;
	
	root.children.push({
		type: 'thematicBreak',
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
	resetCurrentStatus();
	return true;
}