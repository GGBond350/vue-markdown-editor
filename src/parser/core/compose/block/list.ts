import type { ParseFnParams, Tokens } from "@/types/parser/token";
import { parseInlineElements } from "../inline";
export const parseList = ({
	line,
	lines,
	index,
	currentStatus,
	root,
	resetCurrentStatus,
}: ParseFnParams) => {
	// 处理列表中断

	if (currentStatus.currentList && index > 0) {
		const previousLine = lines[index - 1].trimStart();
		const isPreviousLineList = /^(-|\d+\.)\s+.*/.test(previousLine);
		const isEmptyCurrentLine = line.trim() === '';

		// 如果前一行是列表且当前行为空或者非列表项，则中断当前列表
		if (isPreviousLineList && (isEmptyCurrentLine || !line.trimStart().match(/^(-|\d+\.)\s+.*/))) {
			resetCurrentStatus();
		}
	}

	const trimmedLine = line.trimStart();
	let indent = line.length - trimmedLine.length;
	const match = trimmedLine.match(/^(-|\d+\.)\s+(.*)/);
	if (!match) return;
	const [_, marker, content] = match;
	const isOrdered = marker.includes('.');
	const startOffset = calculateOffset(index + 1, indent + 1, lines);
	const contentStartOffset = calculateOffset(index + 1, indent + marker.length + 1, lines);
	const contentEndOffset = contentStartOffset + content.length;

	const children = parseInlineElements(content, index, contentStartOffset);
	const listItem = {
		type: 'listItem',
		children: [
			{
				type: 'paragraph',
				children: children,
				position: {
					start: {
						line: index + 1,
						column: indent + marker.length + 1,
						offset: contentStartOffset
					},
					end: {
						line: index + 1,
						column: indent + marker.length + 1 + content.length,
						offset: contentEndOffset
					}
				}
			}
		],
		position: {
			start: {
				line: index + 1,
				column: indent + 1,
				offset: startOffset
			},
			end: {
				line: index + 1,
				column: indent + marker.length + 1 + content.length,
				offset: contentEndOffset
			}
		}
	} as Tokens;

	if (indent > currentStatus.currentIndent) {
		if (!currentStatus.currentListItem) return;

		// 标准化缩进级别，确保每级缩进为2个空格
    const indentLevel = Math.floor((indent - currentStatus.currentIndent) / 2);
    indent = currentStatus.currentIndent + indentLevel * 2;

		// 检查当前列表项是否已经包含子列表
		const existSubList = currentStatus.currentListItem.children?.find(child => child.type === 'list');

		if (!existSubList) {
			const newSubList = {
				type: 'list',
				ordered: isOrdered,
				children: [],
				position: listItem.position
			} as Tokens;
			currentStatus.currentListItem.children?.push(newSubList);
			currentStatus.listStack.push(currentStatus.currentList as Tokens);
			currentStatus.currentList = newSubList as Tokens;
		} else {
			if (existSubList.isOrder !== isOrdered) {
                // 如果当前子列表的有序性与新列表项不一致，则创建新的子列表
                const newSubList = {
                    type: 'list',
                    ordered: isOrdered,
                    children: [],
                    position: listItem.position
                } as Tokens;
                currentStatus.currentListItem.children?.push(newSubList);
                currentStatus.listStack.push(currentStatus.currentList as Tokens);
                currentStatus.currentList = newSubList;
            } else {
                currentStatus.currentList = existSubList as Tokens;
            }
		}
        currentStatus.currentList.children?.push(listItem as Tokens);

	} else if (indent < currentStatus.currentIndent) {
        while(currentStatus.listStack.length > 0 && currentStatus.listStack[currentStatus.listStack.length - 1]?.position.start.column > indent) {
            currentStatus.currentList = currentStatus.listStack.pop() as Tokens;
        }
        const newList = {
            type: 'list',
            ordered: isOrdered,
            children: [listItem],
            position: listItem.position
        } as Tokens;

        if ((!currentStatus.currentList) || currentStatus.currentList.isOrder !== isOrdered) {
            // 如果当前列表不存在或有序性不一致，则创建新的列表
            root.children.push(newList);
            currentStatus.currentList = newList;
        } else {
            currentStatus.currentList.children?.push(listItem as Tokens);
        }
	} else {
        const newList = {
            type: 'list',
            ordered: isOrdered,
            children: [listItem],
            position: listItem.position
        } as Tokens;
        if (currentStatus.currentList && currentStatus.currentList.isOrder === isOrdered) {
            currentStatus.currentList.children?.push(listItem as Tokens);
            currentStatus.currentList.position.end = listItem.position.end;
        } else {
            (currentStatus.currentList) && resetCurrentStatus();
            root.children.push(newList);
            currentStatus.currentList = newList;
        }
	}
    currentStatus.currentListItem = listItem;
    currentStatus.currentIndent = indent;
    return true; // 成功解析列表项
}


// 辅助函数：计算偏移量
const calculateOffset = (index: number, column: number, lines: string[]) => {
  let offset = 0;
  for (let i = 0; i < index - 1; i++) {
    offset += lines[i].length + 1; // +1 是因为换行符
  }
  return offset + column - 1;
};