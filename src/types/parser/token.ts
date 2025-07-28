import type { Token } from "markdown-it/index.js";

export const TOKEN_TYPES = {
    // 块级
    Heading: 'heading', // 标题
    Paragraph: 'paragraph', // 段落
    Blockquote: 'blockquote', // 引用
    ThematicBreak: 'thematicBreak', // 分割线

    // 行级
    Text: 'text', // 文本
    Bold: 'bold', // 粗体
    Italic: 'italic', // 斜体
    Underline: 'underline', // 下划线
    Delete: 'delete', // 删除线
    Link: 'link', // 链接
    Image: 'image', // 图片
    InlineCode: 'inlineCode', // 行内代码

    // 其他
    Code: 'code', // 代码块
    List: 'list', // 列表
    ListItem: 'listItem', // 列表项
    Html: 'html', // HTML
    Table: 'table', // 表格
    TableRow: 'tableRow', // 表格行
    TableCell: 'tableCell', // 表格单元格
} as const;


export type TokenTypesKeys = keyof typeof TOKEN_TYPES;
export type TokenTypesValues = typeof TOKEN_TYPES[TokenTypesKeys];
export type TokensTypes = Record<TokenTypesKeys, TokenTypesValues>;



type PositionType = {
   line: number; // 行号
   column: number; // 列号
	 offset: number; // 偏移量
}
type TokenPositionType = {
   start: PositionType;
   end: PositionType;
}

export type Tokens = {
    type: TokenTypesValues; // 类型
    value?: string; // 值
    // 标题属性
    depth?: number; // 标题的层级

    // 列表属性
    isOrder?: boolean; // 列表 是否有序

    // 链接、图片属性
    title?: string | null; // 链接、图片的标题
    url?: string; // 链接、图片的链接地址
    alt?: string; // 图片的替代文本

    // 代码属性
    lang?: string; // 代码块的语言
    meta?: string | null; // 代码块的meta(```js [meta])

    children?: Tokens[]; // 子节点
    position: TokenPositionType; // 位置
}

export type RootTokens = {
    type: 'root'; // 类型
    children: Tokens[]; // 子节点
    position: TokenPositionType; // 位置
}


export type ParseFnParams =  {
    line: string; // 行内容
    trimmedLine: string; // 去除前后空格的行内容
    lines: string[]; // 所有行内容
    index: number; // 当前行索引
    currentOffset: number; // 当前偏移量

    root: RootTokens; // 根节点
    resetCurrentStatus: () => void; // 重置当前状态

    currentStatus: {
        depth: number | null; // 当前标题深度
        currentBlockquote: Tokens | null; // 当前引用块

        inCodeBlock: boolean; // 是否在代码块中
        codeBlockLang: string; // 代码块语言
        codeBlockValue: string; // 代码块内容
        codeBlockStartOffset: number; // 代码块开始偏移量
        codeBlockStartLine: number; // 代码块开始行号

        currentList: Tokens | null; // 当前列表
        currentListItem: Tokens | null; // 当前列表项
        currentIndent: number; // 当前缩进
        listStack: Tokens[]; // 列表栈
        currentTable: Tokens | null; // 当前表格
        htmlContent: string; // HTML内容
        inHtmlBlock: boolean; // 是否在HTML块中
        htmlBlockTag: string | null; // HTML块标签

    }
}


export type ParseMapType = {}