import type { ParseFnParams, Tokens } from "@/types/parser/token";
import { parseInlineElements } from "../inline";
import { parseMarkdown } from "..";

export const parseBlockquote = ({
    trimmedLine,
    index,
    currentOffset,
    currentStatus,
    root,
    resetCurrentStatus
}: ParseFnParams) => {

    if (trimmedLine.startsWith(">")) {
        // Handle blockquote parsing
        const content = trimmedLine.slice(1).trim();

        currentStatus.currentBlockquote =  currentStatus.currentBlockquote || {
            type: 'blockquote',
            children: [],
            position: {
                start: {
                    line: index + 1,
                    column: 1,
                    offset: currentOffset
                },
                end: {
                    line: index + 1,
                    column: 3 + content.length, // todo 解决解析遇到空格
                    offset: currentOffset + content.length + 2,
                }
            }
        }
        root.children.push(currentStatus.currentBlockquote);
        
        // 递归解析
        const blockquoteContent = parseMarkdown(content);

        (currentStatus.currentBlockquote.children as Tokens[]).push(...blockquoteContent.children);
        return true;
    } else if (currentStatus.currentBlockquote) { // 处理懒惰行
        // 检查是否是应该结束 blockquote 的行
        const isTableRow = /^\|.*\|$/.test(trimmedLine); // 表格行
        const isCodeBlock = trimmedLine.startsWith("```"); // 代码块
        const isHeading = /^#{1,6}\s/.test(trimmedLine); // 标题
        const isThematicBreak = /^(?:-{3,}|[*]{3,})$/.test(trimmedLine); // 分隔线
        const isList = /^(-|\d+\.)\s+.*/.test(trimmedLine); // 列表
        const isEmptyLine = trimmedLine === ''; // 空行
        
        // 如果遇到这些结构，应该结束当前的 blockquote
        if (isTableRow || isCodeBlock || isHeading || isThematicBreak || isList || isEmptyLine) {
            currentStatus.currentBlockquote = null;
            return false;
        }
        
        const children = currentStatus.currentBlockquote.children as Tokens[];
        const lastChild = children?.[children.length - 1];
        // 如果最后一个子元素是段落，则追加内容
        if (lastChild?.type === 'paragraph') {
            const contentToAppend = '\n' + trimmedLine;

            const paraChildren = lastChild.children || [];
            const lastLine = paraChildren[paraChildren.length - 1];

            if (lastLine?.type === 'text') {
                lastLine.value += contentToAppend;
                lastLine.position.end.line = index + 1;
                lastLine.position.end.column = contentToAppend.length;
                lastLine.position.end.offset += contentToAppend.length;
            } else {
                paraChildren.push({
                    type: 'text',
                    value: contentToAppend,
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
                })
            }
            currentStatus.currentBlockquote.position.end = lastChild.position.end = {
                line: index + 1,
                column: trimmedLine.length + 1,
                offset: currentOffset + trimmedLine.length
            }
            return true; // 成功解析 blockquote 内容
        } else {
            // 如果不是段落，创建新的段落来容纳这个懒惰行
            const newParagraph = {
                type: 'paragraph',
                children: [{
                    type: 'text',
                    value: trimmedLine,
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
                }],
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
            
            children.push(newParagraph);
            currentStatus.currentBlockquote.position.end = newParagraph.position.end;
            return true;
        }
    }
    else {
        currentStatus.currentBlockquote = null
        return false
    }
}