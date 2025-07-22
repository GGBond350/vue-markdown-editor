import type { Tokens } from "@/types/parser/token";

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
	undeline: {
		regex: /\-{2}(?<context>.*?)\-{2}/,
		process: (match, context) => createStandardToken('undeline', match, context),
	},
	delete: {
		regex: /\~\~(?<context>.*?)\~\~/,
		process: (match, context) => createStandardToken('delete', match, context),
	},
	inlineCode: {
		regex: /\`(?<context>.*?)\`/,
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
			column: 
			offset: startOffset,
		},
		end: {
			line: context.index + 1,
			column: 
			offset: endOffset,
		}
	}
}