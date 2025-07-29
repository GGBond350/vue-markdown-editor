import type { Tokens, TokenTypesValues } from "@/types/parser/token";

interface MarkdownPattern {
	regex: RegExp;
	process: (match: RegExpMatchArray, context: ProcessContext) => Tokens;
}

interface ProcessContext { 
	line: string; // 当前行内容
	index: number; // 当前行索引
	offset: number; // 当前行偏移量
	currentOffset: number; // 当前偏移量
	parseInlineElements: (line: string, index: number, currentOffset: number) => Tokens[]; // 解析行内元素
}

const MARKDOWN_PATTERNS_MAP: Record<string, MarkdownPattern> = {
	bold: {
		regex: /\*\*(?<context>.*?)\*\*/,
		process: (match, context) => createStandardToken('bold', match, context),
	},
	italic: {
		regex: /\_(?<context>.*?)\_/,
		process: (match, context) => createStandardToken('italic', match, context),
	},
	underline: {
		regex: /\-{2}(?<context>.*?)\-{2}/,
		process: (match, context) => createStandardToken('underline', match, context),
	},
	delete: {
		regex: /\~\~(?<context>.*?)\~\~/,
		process: (match, context) => createStandardToken('delete', match, context),
	},
	inlineCode: {
		regex: /`(?<content>.*?)`/,
		process: (match, context) => {
			if (!match[1].trim()) {
				return createTextToken(match[0], match, context);
			}
			return {
				type: 'inlineCode',
				children: [createTextToken(match.groups?.content || "", match, context)],
				position: createPosition(match, context),
			}
		},
	},
	image: {
		regex: /!\[(?<alt>.*?)\]\((?<url>.*?)\)/,
		process: (match, context) => {
			return {
				type: 'image',
				title: null,
				alt: match.groups?.alt || '',
				url: match.groups?.url || '',
				position: createPosition(match, context),
			};
		},
	},
	link: {
		regex: /(?<!!)\[(?<text>[^\]]+)\]\((?<url>[^)]+)\)/,
		process: (match, context) => {
			return {
				type: 'link',
				title: null,
				url: match.groups?.url || '',
				children: [createTextToken(match.groups?.text || "", match, context)],
				position: createPosition(match, context),
			};
		},
	}
}

function createPosition(match: RegExpMatchArray, context: ProcessContext) {
	const startOffset = context.currentOffset + context.offset + (match.index ?? 0);
	const endOffset = startOffset + match[0].length;
	return {
		start: {
			line: context.index + 1,
			column: context.offset + (match.index ?? 0) + 1,
			offset: startOffset,
		},
		end: {
			line: context.index + 1,
			column: context.offset + (match.index ?? 0) + match[0].length + 1,
			offset: endOffset,
		}
	}
}


function createTextToken(value: string, match: RegExpMatchArray, context: ProcessContext): Tokens {
    return {
        type: 'text',
        value,
        position: createPosition(match, context),
    };
}

function createStandardToken(type: TokenTypesValues, match: RegExpMatchArray, context: ProcessContext): Tokens {
    const innerContent = match.groups?.context || match[1];
    const innerCurrentOffset = context.currentOffset + context.offset + (match.index ?? 0) + (type === 'bold' || type === 'delete' || type === 'underline' ? 2 : 1);
    return {
        type,
        children: context.parseInlineElements(innerContent, context.index, innerCurrentOffset),
        position: createPosition(match, context),
    };
}

function findNextMatch(line: string, offset: number) {
   let bestMatch: { type: string, match: RegExpMatchArray} | null = null;

   for (const [type, pattern] of Object.entries(MARKDOWN_PATTERNS_MAP)) {
    const match = line.slice(offset).match(pattern.regex);
    if (!match) continue;

    if (!bestMatch || (match?.index ?? Infinity) < (bestMatch.match?.index ?? Infinity)) {
        bestMatch = { type, match };
    }
   }
   return bestMatch;
}

export function parseInlineElements(line: string, index: number, currentOffset: number): Tokens[] {
    let offset = 0;
    let children: Tokens[] = [];
    let lastIndex = 0;

    const context: ProcessContext = {
        line,
        index,
        offset,
        currentOffset,
        parseInlineElements
    }

    while (offset < line.length) {
        const nextMatch = findNextMatch(line, offset);
        if (!nextMatch) break;

        const { type, match } = nextMatch;

        // 处理匹配前的文本

        if (match.index && match.index > 0) {
            children.push({
                type: 'text',
                value: line.slice(offset, offset + match.index),
                position: {
                    start: {
                        line: index + 1,
                        column: offset + 1,
                        offset: currentOffset + offset
                    },
                    end: {
                        line: index + 1,
                        column: offset + match.index + 1,
                        offset: currentOffset + offset + match.index
                    }
                }
            })
        }

        // 处理匹配到的内容
        context.offset = offset;
        children.push(MARKDOWN_PATTERNS_MAP[type].process(match, context));
        offset += (match.index ?? 0) + match[0].length;
        lastIndex = offset;
    }
    // 处理行尾的文本
    if (lastIndex < line.length) { 
        children.push({
            type: 'text',
            value: line.slice(lastIndex),
            position: {
                start: {
                    line: index + 1,
                    column: lastIndex + 1,
                    offset: currentOffset + lastIndex
                },
                end: {
                    line: index + 1,
                    column: line.length + 1,
                    offset: currentOffset + line.length
                }
            }
        });
    }
    return children;
}