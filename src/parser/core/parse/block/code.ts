import type { ParseFnParams, Tokens } from "@/types/parser/token";

export const parseCode = ({ line, lines, trimmedLine, index, currentOffset, currentStatus, root }: ParseFnParams) => {
    // todo 解决解析遇到空格
    if (trimmedLine.startsWith("```")) {
        // 处理代码块
        if (!currentStatus.inCodeBlock) {
            currentStatus.inCodeBlock = true;
            currentStatus.codeBlockLang = trimmedLine.slice(3).trim();
            currentStatus.codeBlockValue = "";
            currentStatus.codeBlockStartOffset = currentOffset;
            currentStatus.codeBlockStartLine = index + 1;
        } else {
            currentStatus.inCodeBlock = false;
            const codeToken = {
                type: 'code',
                lang: currentStatus.codeBlockLang,
                meta: null,
                value: currentStatus.codeBlockValue.trim(),
                position: {
                    start: {
                        line: currentStatus.codeBlockStartLine,
                        column: 1,
                        offset: currentStatus.codeBlockStartOffset
                    },
                    end: {
                        line: index + 1,
                        column: trimmedLine.length + 1,
                        offset: currentOffset + trimmedLine.length,
                    }
                }
            } as Tokens;
            root.children.push(codeToken);
            return true; // 成功解析代码块

        }
         return true
    } else if (currentStatus.inCodeBlock) {
        currentStatus.codeBlockValue += trimmedLine + "\n";
        if (index === lines.length -1) {
            const codeToken = {
                type: 'code',
                lang: currentStatus.codeBlockLang,
                meta: null,
                value: currentStatus.codeBlockValue.trim(),
                position: {
                    start: {
                        line: currentStatus.codeBlockStartLine,
                        column: 1,
                        offset: currentStatus.codeBlockStartOffset
                    },
                    end: {
                        line: index + 1,
                        column: line.length + 1,
                        offset: currentOffset + line.length,
                    }
                }
            } as Tokens;
            root.children.push(codeToken);
        }
        return true; // 在代码块中，继续收集内容
    }
}