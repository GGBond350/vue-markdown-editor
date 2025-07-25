import type { ParseFnParams, Tokens } from "@/types/parser/token";
import { parseInlineElements } from "../inline";

export const parseTable = ({
    trimmedLine,
    index,
    currentStatus,
    currentOffset,
    root,
}: ParseFnParams) => {

    const tableRegex = /^\|.*\|$/;
    const tableSeparatorRegex = /^\|.*?---.*?\|$/;
    if (!tableRegex.test(trimmedLine)) {
        currentStatus.currentTable = null;
        return;
    }

    if (!tableSeparatorRegex.test(trimmedLine)) {
        const cells = trimmedLine.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0);
        
        const tableRow = {
            type: 'tableRow',
            children: cells.map((cell, i) => {
                // todo 解决解析遇到空格、| 、转义字符等问题
                const currentColumnOffset = i > 0 ? cells[i - 1].length : 0; // 当前列的偏移量
                const currentCellOffset = currentOffset + currentColumnOffset;
                const child = parseInlineElements(cell, index, currentCellOffset);

                return {
                    type: 'tableCell',
                    children: child,
                    position: {
                        start: {
                            line: index + 1,
                            column: 1 + currentColumnOffset,
                            offset: currentOffset
                        },
                        end: {
                            line: index + 1,
                            column: currentColumnOffset + cell.length + 1,
                            offset: currentOffset + currentColumnOffset + cell.length
                        }
                    }
                }
            }),
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
        } as Tokens;

        if (!currentStatus.currentTable) {
            currentStatus.currentTable = {
                type: 'table',
                children: [],
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
            }
            root.children.push(currentStatus.currentTable);
        }
        currentStatus.currentTable.children?.push(tableRow);
        currentStatus.currentTable.position.end = tableRow.position.end;
    }
    return true; // 成功解析表格行
}