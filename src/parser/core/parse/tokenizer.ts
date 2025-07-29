import type { RootTokens } from "@/types/parser/token";
import { defaultParse, parseMap } from ".";

export const tokenizer = (lines: string[], root: RootTokens) => {
    if (!Array.isArray(lines)) {
        return new Error("The parameter is an array");
    }

    let currentOffset = 0;
    let currentStatus = {
        // heading 的层级
        depth: 0,
        // 当前的 blockquote
        currentBlockquote: null,
        // code
        inCodeBlock: false,
        codeBlockLang: "",
        codeBlockValue: "",
        codeBlockStartOffset: 0,
        codeBlockStartLine: 0,
        // list
        currentList: null,
        currentListItem: null,
        currentIndent: 0,
        listStack: [], // 用于存储列表栈
        // table
        currentTable: null,
        // html
        htmlContent: "",
        inHtmlBlock: false,
        htmlBlockTag: "",
    };

    const resetCurrentStatus = () => {
        currentStatus = {
        depth: 0,
        currentBlockquote: null,
        inCodeBlock: false,
        codeBlockLang: "",
        codeBlockValue: "",
        codeBlockStartOffset: 0,
        codeBlockStartLine: 0,
        currentList: null,
        currentListItem: null,
        currentIndent: 0,
        listStack: [],
        currentTable: null,
        htmlContent: "",
        inHtmlBlock: false,
        htmlBlockTag: "",
        };
    };

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        let isParse = false;
        for (const [key, parseFn] of Object.entries(parseMap)) {
            const res = parseFn({
               trimmedLine,
                line,
                lines,
                currentOffset,
                index,
                root,
                currentStatus,
                resetCurrentStatus,
            })
            if (res) {
                isParse = true;
						
                break;
            }
        }
        if (!isParse) {
            defaultParse({
                trimmedLine,
                line,
                lines,
                currentOffset,
                index,
                root,
                currentStatus,
                resetCurrentStatus,
            })
        }
        currentOffset += line.length + 1;
    })
}