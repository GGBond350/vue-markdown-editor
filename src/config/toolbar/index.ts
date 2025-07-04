import { BaseToolbarType, type ToolbarItem } from "@/types/toolbar";
import HeadingIcon from "@/assets/images/heading.svg"
import BoldIcon from "@/assets/images/bold.svg"
import ItalicIcon from "@/assets/images/italic.svg"
import UnderLineIcon from "@/assets/images/underline.svg"
import DeleteIcon from "@/assets/images/delete.svg"
import BlockQuoteIcon from "@/assets/images/blockquote.svg"
import UnorderedListIcon from "@/assets/images/ul.svg"
import OrderedListIcon from "@/assets/images/ol.svg"
import CodeBlockIcon from "@/assets/images/code.svg"
import InlineCodeIcon from "@/assets/images/inlinecode.svg"
import LinkIcon from "@/assets/images/link.svg"
import ImageIcon from "@/assets/images/image.svg"
import TableIcon from "@/assets/images/table.svg"
import UndoIcon from "@/assets/images/undo.svg"
import RedoIcon from "@/assets/images/redo.svg"
import FullScreenIcon from "@/assets/images/fullscreen.svg"
import SaveIcon from "@/assets/images/save.svg"
import { Hotkey } from "../hotkeys";
import contentInsert from "@/utils/contentInsert";
import { insertContentEvent, redoEvent, undoEvent } from "./event";

export const defaultToolbarsConfig: ToolbarItem[] = [

    {
        type: BaseToolbarType.HEADING,
        title: "标题",
        icon: HeadingIcon,
        listToolbar: [
            {
                type: BaseToolbarType.HEADING_1,
                title: "标题 1",
                hotkey: Hotkey.HEADINGS.FIFTH.toConfig(),
                onClick: () => insertContentEvent(BaseToolbarType.HEADING_1),
            },
            {
                type: BaseToolbarType.HEADING_2,
                title: "标题 2",
                hotkey: Hotkey.HEADINGS.SECOND.toConfig(),
                onClick: () => insertContentEvent(BaseToolbarType.HEADING_2),
            },
            {
                type: BaseToolbarType.HEADING_3,
                title: "标题 3",
                hotkey: Hotkey.HEADINGS.THIRD.toConfig(),
                onClick: () => insertContentEvent(BaseToolbarType.HEADING_3),
            },
            {
                type: BaseToolbarType.HEADING_4,
                title: "标题 4",
                hotkey: Hotkey.HEADINGS.FOURTH.toConfig(),
                onClick: () => insertContentEvent(BaseToolbarType.HEADING_4),
            },
            {
                type: BaseToolbarType.HEADING_5,
                title: "标题 5",
                hotkey: Hotkey.HEADINGS.FIFTH.toConfig(),
                onClick: () => insertContentEvent(BaseToolbarType.HEADING_5),
            },
            {
                type: BaseToolbarType.HEADING_6,
                title: "标题 6",
                hotkey: Hotkey.HEADINGS.SIXTH.toConfig(),
                onClick: () => insertContentEvent(BaseToolbarType.HEADING_6),
            },
        ]
    },
    {
        type: BaseToolbarType.BOLD,
        title: "粗体",
        icon: BoldIcon,
        description: Hotkey.BOLD.formatCommand,
        hotkey: Hotkey.BOLD.toConfig(),
        onClick: () => insertContentEvent(BaseToolbarType.BOLD),
    },
    {
        type: BaseToolbarType.ITALIC,
        title: "斜体",
        icon: ItalicIcon,
        description: Hotkey.ITALIC.formatCommand,
        hotkey: Hotkey.ITALIC.toConfig(),
        onClick: () => insertContentEvent(BaseToolbarType.ITALIC),
    }, 
    {
        type: BaseToolbarType.UNDERLINE,
        title: "下划线",
        icon: UnderLineIcon,
        description: Hotkey.UNDERLINE.formatCommand,
        hotkey: Hotkey.UNDERLINE.toConfig(),
        onClick: () => insertContentEvent(BaseToolbarType.UNDERLINE),
    }, 
    {
        type: BaseToolbarType.DELETE,
        title: "删除线",
        icon: DeleteIcon,
        description: Hotkey.DELETE.formatCommand,
        hotkey: Hotkey.DELETE.toConfig(),
        onClick: () => insertContentEvent(BaseToolbarType.DELETE),
    },
    {type : 'separator'},
    {
        type: BaseToolbarType.BLOCKQUOTE,
        title: "引用",
        icon: BlockQuoteIcon,
        description: Hotkey.BLOCKQUOTE.formatCommand,
        hotkey: Hotkey.BLOCKQUOTE.toConfig(),
        onClick: () => insertContentEvent(BaseToolbarType.BLOCKQUOTE),
    },
    {
        type: BaseToolbarType.UL,
        title: "无序列表",
        icon: UnorderedListIcon,
        description: Hotkey.UNORDERED_LIST.formatCommand,
        hotkey: Hotkey.UNORDERED_LIST.toConfig(),
        onClick: () => insertContentEvent(BaseToolbarType.UL),
    },
    {
        type: BaseToolbarType.OL,
        title: "有序列表",
        icon: OrderedListIcon,
        description: Hotkey.ORDERED_LIST.formatCommand,
        hotkey: Hotkey.ORDERED_LIST.toConfig(),
        onClick: () => insertContentEvent(BaseToolbarType.OL),
    },
    {
        type: BaseToolbarType.CODE,
        title: "代码块",
        icon: CodeBlockIcon,
        description: Hotkey.CODE_BLOCK.formatCommand,
        hotkey: Hotkey.CODE_BLOCK.toConfig(),
        onClick: () => insertContentEvent(BaseToolbarType.CODE),
    },
    {
        type: BaseToolbarType.INLINE_CODE,
        title: "行内代码",
        icon: InlineCodeIcon,
        description: Hotkey.INLINE_CODE.formatCommand,
        hotkey: Hotkey.INLINE_CODE.toConfig(),
        onClick: () => insertContentEvent(BaseToolbarType.INLINE_CODE),
    },
    {
        type: BaseToolbarType.LINK,
        title: "链接",
        icon: LinkIcon,
        description: Hotkey.LINK.formatCommand,
        hotkey: Hotkey.LINK.toConfig(),
        onClick: () => insertContentEvent(BaseToolbarType.LINK),
    },
    {
        type: BaseToolbarType.IMAGE,
        title: "图片",
        icon: ImageIcon,
        listToolbar: [
            {
                type: BaseToolbarType.IMAGE_UPLOAD,
                title: "上传图片",
            },
            {
                type: BaseToolbarType.IMAGE_LINK,
                title: "图片链接",
                hotkey: Hotkey.LINK.toConfig(),
                onClick: () => insertContentEvent(BaseToolbarType.IMAGE_LINK),
            }
        ]
    },
    {
        type: BaseToolbarType.TABLE,
        title: "表格",
        icon: TableIcon,
        description: Hotkey.TABLE.formatCommand,
        hotkey: Hotkey.TABLE.toConfig(),
        onClick: () => insertContentEvent(BaseToolbarType.TABLE),
    },
    { type: 'separator' },
    {
        type: BaseToolbarType.UNDO,
        title: "撤销",
        icon: UndoIcon,
        hotkey: Hotkey.UNDO.toConfig(),
        onClick: () => undoEvent(),
    },
    {
        type: BaseToolbarType.REDO,
        title: "重做",
        icon: RedoIcon,
        hotkey: Hotkey.REDO.toConfig(),
        onClick: () => redoEvent(),
    },
    { type: 'separator' },
    {
        type: BaseToolbarType.FULLSCREEN,
        title: "全屏",
        icon: FullScreenIcon,
        hotkey: Hotkey.FULL_SCREEN.toConfig(),
    },
    {
      type : BaseToolbarType.SAVE,
      title : "保存",
      icon : SaveIcon,
      hotkey : Hotkey.SAVE
    }
]