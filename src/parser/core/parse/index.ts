import type { ParseFnParams, RootTokens, TokenTypesValues } from "@/types/parser/token";
import { tokenizer } from "./tokenizer";
import { parseCode } from "./block/code";
import { parseHtml } from "./block/html";
import { parseHeading } from "./block/heading";
import { parseBlockquote } from "./block/blockquote";
import { parseThematicBreak } from "./block/thematicBreak";
import { parseList } from "./block/list";
import { parseTable } from "./block/table";
import { parseParagraph } from "./block/paragraph";

export interface IncrementalParseOptions {
    prevMarkdown?: string;
    preRoot?: RootTokens;
}
type ParseMapType = {
    [key in TokenTypesValues]: (params: ParseFnParams) => boolean | void;
}

export const parseMap: Partial<ParseMapType> = {
    code: parseCode,
    html: parseHtml,
    heading: parseHeading,
    blockquote: parseBlockquote,
    thematicBreak: parseThematicBreak,
    list: parseList,
    table: parseTable,
}

const parseIncrementally = (markdown: string, lines: string[], options: IncrementalParseOptions): RootTokens => {
    const preLines = options.prevMarkdown?.split("\n") || [];

    let curChangeRange: {start: number, end: number} | null = null;
    let changeRanges: {start: number, end: number}[] = [];

    for (let i = 0; i < Math.max(lines.length, preLines.length); i++) {
        const isDifferent = lines[i] !== preLines[i];

        if (isDifferent && !curChangeRange) {
            curChangeRange = { start: i, end: i };
        } else if (isDifferent && curChangeRange) {
            curChangeRange.end = i + 1;
        } else if (!isDifferent && curChangeRange) {
            changeRanges.push(curChangeRange);
            curChangeRange = null;
        }
    }

    // 处理最后一个变化范围
    if (curChangeRange) {
        changeRanges.push(curChangeRange);
    }

    if (changeRanges.length === 0 && options.preRoot) {
        return options.preRoot; // 没有变化，直接返回之前的根节点
    }

    if (changeRanges.length === 0) { // 没有变化范围, 并且没有之前的根节点
        return {
            type: 'root',
            children: [],
            position: {
                start: { line: 1, column: 1, offset: 0 },
                end: { line: lines.length, column: lines[lines.length - 1].length + 1, offset: markdown.length }
            }
        }
    }

    // 创建新的根节点
    const root: RootTokens = {
        type: 'root',
        children: [],
        position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: lines.length, column: lines[lines.length - 1].length + 1, offset: markdown.length }
        }
    }

    root.children = (options.preRoot?.children || []).filter(node => node.position.end.line < changeRanges[0].start);


    let lastEndLine = changeRanges[0].start;
    
    for (let range of changeRanges) {
        if (range.start > lastEndLine && options.preRoot?.children) {
           const unChangeNodes = options.preRoot.children.filter(node => node.position.start.line > lastEndLine && node.position.end.line <= range.start);
           root.children.push(...unChangeNodes);
        }

        // 处理变化范围内的行
        const changeText = lines.slice(range.start, range.end).join("\n");
        const changeOffset = lines.slice(0, range.start).join("\n").length + (range.start > 0 ? 1 : 0); 

        const tempRoot: RootTokens = {
            type: 'root',
            children: [],
            position: {
                start: { line: range.start + 1, column: 1, offset: changeOffset },
                end: { line: range.end, column: lines[range.end - 1].length + 1, offset: changeOffset + changeText.length }
            }
        }

        tokenizer(lines.slice(range.start, range.end), tempRoot);
        root.children.push(...tempRoot.children);
        lastEndLine = range.end;
    }

    const lineCountDiff = lines.length - preLines.length;
    const remainNodes = options.preRoot?.children
        .filter(node => node.position.start.line > changeRanges[changeRanges.length - 1].end)
        .map(node => ({
            ...node,
            position: {
                start: {
                    ...node.position.start,
                    line: node.position.start.line + lineCountDiff
                },
                end: {
                    ...node.position.end,
                    line: node.position.end.line + lineCountDiff
                }
            }
        })); 
    if (remainNodes) {
        root.children.push(...remainNodes);
    }   
    return root; 
}
export const defaultParse = parseParagraph;

export const parseMarkdown = (markdown: string, options?: IncrementalParseOptions) => {
    const lines = markdown.split("\n");
    if (options?.prevMarkdown && options.prevMarkdown === markdown) {
        // 处理增量解析逻辑

        return parseIncrementally(markdown, lines, options);
    }

    const root: RootTokens = {
        type: 'root',
        children: [],
        position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: lines.length, column: lines[lines.length - 1].length + 1, offset: markdown.length }
        }
    };
    tokenizer(lines, root);
    return root;
}