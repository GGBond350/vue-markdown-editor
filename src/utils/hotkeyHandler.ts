import { insertContentEvent } from "@/config/toolbar/event";
import { useToolbarStore } from "@/store/toolbar";
import { BaseToolbarType, type ToolbarItem, type ToolbarType } from "@/types/editor/toolbar";


/**
 * 主要功能是将工具栏项目的快捷键配置转换为CodeMirror可以使用的快捷键处理器
 */

export type HotkeyType = {
    command: string; // 快捷键命令
    description: string; // 快捷键描述
    handler?: () => void; // 快捷键处理函数
}

export type HotkeyHandler = {
    run: () => boolean; // 执行快捷键命令
    preventDefault: boolean; // 是否阻止默认行为
}

export function createInsertContentHotkeyHandler(hotkey: HotkeyType): HotkeyHandler {
    return {
        run: () => {
            if (hotkey.handler) { 
                hotkey.handler();
                return true;
            }
            insertContentEvent(hotkey.description as ToolbarType);
            return true;
        },
        preventDefault: true
    };
}


export function createFullScreenHotkeyHandler(hotkey: HotkeyType): HotkeyHandler {
    return {
        run: () => {
            const currentState = useToolbarStore();
            currentState.toggleFullscreen();
            hotkey.handler?.();
            return true;
        },
        preventDefault: true
    };
}

export function createSaveHotkeyHandler(hotkey: HotkeyType): HotkeyHandler {
    return {
        run: () => {
            hotkey.handler?.();
            return true;
        },
        preventDefault: true
    };
}

export function createHotkeyHandler (item: ToolbarItem): HotkeyHandler {
    if (item.type === BaseToolbarType.FULLSCREEN) {
        return createFullScreenHotkeyHandler(item.hotkey!);
    } else if (item.type === BaseToolbarType.SAVE) {
        return createSaveHotkeyHandler(item.hotkey!);
    } else {
        return createInsertContentHotkeyHandler(item.hotkey!);
    }
}