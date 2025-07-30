import Heading1Icon from '@/assets/images/heading-1.svg?component';
import Heading2Icon from '@/assets/images/heading-2.svg?component';
import Heading3Icon from '@/assets/images/heading-3.svg?component';
import BoldIcon from '@/assets/images/bold.svg?component';
import ItalicIcon from '@/assets/images/italic.svg?component';
import UnderLineIcon from '@/assets/images/underline.svg?component';
import DeleteIcon from '@/assets/images/delete.svg?component';
import BlockQuoteIcon from '@/assets/images/blockquote.svg?component';
import UnorderedListIcon from '@/assets/images/ul.svg?component';
import OrderedListIcon from '@/assets/images/ol.svg?component';
import CodeBlockIcon from '@/assets/images/code.svg?component';
import InlineCodeIcon from '@/assets/images/inlinecode.svg?component';
import LinkIcon from '@/assets/images/link.svg?component';
import ImageIcon from '@/assets/images/image.svg?component';
import TableIcon from '@/assets/images/table.svg?component';
import ThematicBreakIcon from '@/assets/images/thematic-break.svg?component';
import UndoIcon from '@/assets/images/undo.svg?component';
import RedoIcon from '@/assets/images/redo.svg?component';
import FullScreenIcon from '@/assets/images/fullscreen.svg?component';
import SaveIcon from '@/assets/images/save.svg?component';
import { Hotkey } from './hotkeys';
import type { Component } from 'vue';

export interface HelpItem {
    title: string;
    icon: string | Component;
    rule: string;
}

export const grammar: HelpItem[] = [
    {
        title: '一级标题',
        icon: Heading1Icon,
        rule: '# heading'
    },
    {
        title: '二级标题',
        icon: Heading2Icon,
        rule: '## heading'
    },
    {
        title: '三级标题',
        icon: Heading3Icon,
        rule: '### heading'
    },
    {
        title: '粗体',
        icon: BoldIcon,
        rule: '**bold text**'
    },
    {
        title: '斜体',
        icon: ItalicIcon,
        rule: '_italic text_'
    },
    {
        title: '下划线',
        icon: UnderLineIcon,
        rule: '--underline text--'
    },
    {
        title: '删除线',
        icon: DeleteIcon,
        rule: '~~delete text~~'
    },
    {
        title: '引用',
        icon: BlockQuoteIcon,
        rule: '> quote text'
    },
    {
        title: '无序列表',
        icon: UnorderedListIcon,
        rule: '- list item'
    },
    {
        title: '有序列表',
        icon: OrderedListIcon,
        rule: '1. list item'
    },
    {
        title: '代码块',
        icon: CodeBlockIcon,
        rule: '```lang\ncode\n```'
    },
    {
        title: '行内代码',
        icon: InlineCodeIcon,
        rule: '`inline code`'
    },
    {
        title: '链接',
        icon: LinkIcon,
        rule: '[link text](url)'
    },
    {
        title: '图片',
        icon: ImageIcon,
        rule: '![alt text](image url)'
    },
    {
        title: '分割线',
        icon: ThematicBreakIcon,
        rule: '---'
    },{
        title: '表格',
        icon: TableIcon,
        rule: `| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |`
    },
]

// 快捷键
export const shortcuts: HelpItem[] = [
    {
        title: '加粗',
        icon: BoldIcon,
        rule: Hotkey.BOLD.formatCommand
    },
    {
        title: '斜体',
        icon: ItalicIcon,
        rule: Hotkey.ITALIC.formatCommand
    },
    {
        title: '下划线',
        icon: UnderLineIcon,
        rule: Hotkey.UNDERLINE.formatCommand
    },
    {
        title: '删除线',
        icon: DeleteIcon,
        rule: Hotkey.DELETE.formatCommand
    },
    {
        title: '引用',
        icon: BlockQuoteIcon,
        rule: Hotkey.BLOCKQUOTE.formatCommand
    },
    {
        title: '无序列表',
        icon: UnorderedListIcon,
        rule: Hotkey.UNORDERED_LIST.formatCommand
    },
    {
        title: '有序列表',
        icon: OrderedListIcon,
        rule: Hotkey.ORDERED_LIST.formatCommand
    },
    {
        title: '代码块',
        icon: CodeBlockIcon,
        rule: Hotkey.CODE_BLOCK.formatCommand
    },
    {
        title: '行内代码',
        icon: InlineCodeIcon,
        rule: Hotkey.INLINE_CODE.formatCommand
    },
    {
        title: '链接',
        icon: LinkIcon,
        rule: Hotkey.LINK.formatCommand
    },
    {
        title: '表格',
        icon: TableIcon,
        rule: Hotkey.TABLE.formatCommand
    },
    {
        title: '撤销',
        icon: UndoIcon,
        rule: Hotkey.UNDO.formatCommand
    },
    {
        title: '重做',
        icon: RedoIcon,
        rule: Hotkey.REDO.formatCommand
    },
    {
        title: '全屏',
        icon: FullScreenIcon,
        rule: Hotkey.FULL_SCREEN.formatCommand
    },
    {
        title: '保存',
        icon: SaveIcon,
        rule: Hotkey.SAVE.formatCommand
    }
]