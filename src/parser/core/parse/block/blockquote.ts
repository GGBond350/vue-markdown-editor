import type { ParseFnParams, Tokens } from "@/types/parser/token";
import { parse } from "vue/compiler-sfc";
import { parseInlineElements } from "../inline";
import { parseMarkdown } from "..";
import type Token from "markdown-it/lib/token.mjs";

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
            // 如果不是 blockquote 的行，重置当前状态
            currentStatus.currentBlockquote = null;
            return false;
        }
    }
    else {
        // 如果不是 blockquote 的行，重置当前状态
        resetCurrentStatus();
    }
}