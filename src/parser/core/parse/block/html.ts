import type { ParseFnParams, Tokens } from "@/types/parser/token"

const voidElements = new Set([ // 单标签元素
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
])

export const parseHtml = ({
    currentStatus,
    trimmedLine,
    line,
    index,
    currentOffset,
    root,
}: ParseFnParams) => {
    const htmlBlockStartRegex = /^\s*<([a-zA-Z][a-zA-Z0-9]*)(?![^>]*\/>)[^>]*>/;
    const htmlBlockEndRegex = /<\/([a-zA-Z][a-zA-Z0-9]*)>\s*$/;
    const selfClosingTagRegex = /^\s*<([a-zA-Z][a-zA-Z0-9]*)[^>]*\/>\s*$/;
    // 添加新的单标签正则
    const voidElementRegex = /^\s*<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/;

    if (currentStatus.inHtmlBlock) {
        currentStatus.htmlContent += line + "\n";

        if (currentStatus.htmlBlockTag && htmlBlockEndRegex.test(trimmedLine)) {
            const match = trimmedLine.match(htmlBlockEndRegex);
            const endTag = match?.[1].toLowerCase();
            if (endTag === currentStatus.htmlBlockTag) {
                currentStatus.inHtmlBlock = false;
                currentStatus.htmlBlockTag = null;
                const htmlToken = {
                    type: 'html',
                    value: escapeHtml(currentStatus.htmlContent.trim()),
                    position: {
                        start: {
                            line: index - currentStatus.htmlContent.split("\n").length + 2,
                            column: 1,
                            offset: currentOffset - currentStatus.htmlContent.length
                        },
                        end: {
                            line: index + 1,
                            column: line.length + 1,
                            offset: currentOffset + line.length
                        }
                    }
                } as Tokens;
                root.children.push(htmlToken);
                currentStatus.htmlContent = "";
            }
        }
        return true; // 在HTML块中，继续解析
    }

    if (!currentStatus.inHtmlBlock &&( htmlBlockStartRegex.test(trimmedLine) || selfClosingTagRegex.test(trimmedLine))) {
        // 优先检查是否是单标签
        const voidMatch = trimmedLine.match(voidElementRegex);
        const tagName = voidMatch?.[1].toLowerCase();
        
        if (tagName && voidElements.has(tagName)) {
            const dataLineAttr = ` data-line="${index + 1}"`;
            // 处理自闭合和非自闭合两种情况
            const content = selfClosingTagRegex.test(trimmedLine)
                ? line.replace("/>", `${dataLineAttr} />`)
                : line.replace(/>/, `${dataLineAttr}>`);
            root.children.push({
                type: 'html',
                value: escapeHtml(content.trim()),
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
            } as Tokens);
            return true; // 成功解析单标签  
        }

        currentStatus.inHtmlBlock = true;
        currentStatus.htmlBlockTag = tagName || null; // 记录最外层的标签名

        const dataLineAttr = ` data-line="${index + 1}"`;
        if (selfClosingTagRegex.test(trimmedLine)) {
            // 处理自闭合标签
            const content = line.replace("/>", `${dataLineAttr} />`);
            currentStatus.htmlContent += content + "\n";
            currentStatus.inHtmlBlock = false;
            
            root.children.push({
                type: 'html',
                value: escapeHtml(content.trim()),
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
            } as Tokens);

            currentStatus.htmlContent = "";
            return true; // 成功解析自闭合标签
        } else { // 开始标签

            currentStatus.htmlContent = line.replace(/>/, `${dataLineAttr}>`) + "\n";

            // 检查是否是单行包含一个完整的标签
            if (trimmedLine.includes(`</${tagName}`)) {
                currentStatus.inHtmlBlock = false;
                currentStatus.htmlBlockTag = null;
                const htmlToken = {
                    type: 'html',
                    value: escapeHtml(currentStatus.htmlContent.trim()),
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

                root.children.push(htmlToken);
                currentStatus.htmlContent = "";
            }
            return true; // 成功解析开始标签
        }
    }
}


// 对 html 标签进行转义和过滤
const escapeHtml = (unsafe: string): string => {
  // 移除所有事件处理器属性和危险属性
  const sanitized = unsafe
    .replace(/\son\w+\s*=\s*["']?[^"']*["']?/gi, "") // 移除所有事件处理器
    .replace(/\s(?:javascript|data):[^\s>]*/gi, "") // 移除javascript:和data:协议
    .replace(/\sformaction\s*=\s*["']?[^"']*["']?/gi, "") // 移除formaction属性
    .replace(/\sform\s*=\s*["']?[^"']*["']?/gi, ""); // 移除form属性

  return sanitized;
};
