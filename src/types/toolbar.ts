import type { Component } from "vue";

export enum BaseToolbarType {
    HEADING = "heading", //标题
    HEADING_1 = "heading-1", // 一级标题
    HEADING_2 = "heading-2", // 二级标题
    HEADING_3 = "heading-3", // 三级标题
    HEADING_4 = "heading-4", // 四级标题
    HEADING_5 = "heading-5", // 五级标题
    HEADING_6 = "heading-6", // 六级标题
    BOLD = "bold", //粗体
    ITALIC = "italic", //斜体
    UNDERLINE = "underline", //下划线
    DELETE = "delete", //删除线
    LINE = "line", //水平线
    BLOCKQUOTE = "blockquote", //引用
    UL = "ul", //无序列表
    OL = "ol", //有序列表
    CODE = "code", //代码块
    INLINE_CODE = "inline-code", //行内代码
    LINK = "link", //链接
    IMAGE = "image", //图片
    IMAGE_LINK = "image-link", //图片链接
    IMAGE_UPLOAD = "image-upload", //图片上传
    TABLE = "table", //表格
    UNDO = "undo", //撤销
    REDO = "redo", //重做
    FULLSCREEN = "fullscreen", //全屏
    WRITE = "write", //写作模式
    PREVIEW = "preview", //预览模式
    CONTENTS = "contents", //目录
    HELP = "help", //帮助
    OUTPUT = "output", //输出
    EMOJI = "emoji", //表情
    SAVE = "save", //保存
    CLEAR = "clear", //清空
}

export type ExtendedToolbarType = string;

export type ToolbarType = BaseToolbarType | ExtendedToolbarType;

// BaseToolbarItem 定义了编辑器工具栏的基本项
export type BaseToolbarItem = {
    type: ToolbarType; // 工具类型
    icon?: string; // 工具图标
    title?: string; // 鼠标悬浮提示
    description?: string; // 工具描述
    disabled?: boolean; // 是否禁用
    visible?: boolean; // 是否可见
    onClick?: () => void; // 点击事件处理函数
    component?: Component; // Vue 组件
}

export type ListToolbarItem  = {
    type: ToolbarType; // 工具类型
    title: string; // 工具标题
    hotkey?: {
        command: string; // 快捷键命令
        description: string; // 快捷键描述
        handler?: () => void; // 快捷键处理函数
    };
    onClick?: () => void; // 点击事件处理函数
}
// ToolbarItem 定义了编辑器工具栏的完整项
export type ToolbarItem = BaseToolbarItem & {
    listToolbar?: ListToolbarItem[]; // 列表工具栏
    hotkey?: {
        command: string; // 快捷键命令
        description: string; // 快捷键描述
        handler?: () => void; // 快捷键处理函数
    }
    
}