import type { Extension } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import type {ToolbarItem} from "@/types/editor/toolbar";
import { createHotkeyHandler, type HotkeyHandler } from "@/utils/hotkeyHandler";


function processToolbarItem (result: Record<string, HotkeyHandler>, item: ToolbarItem) {
    const handler = createHotkeyHandler(item);
    if (item.hotkey && handler) {
        result[item.hotkey.command] = handler;
    }

    if (item.listToolbar?.length) {
        item.listToolbar.forEach((subItem) => {
            if (subItem.hotkey) {
                const subHandler = createHotkeyHandler(subItem);
                subHandler && (result[subItem.hotkey.command] = subHandler);
            }
        });
    }

}

export function handleHotkeys(toolbars: ToolbarItem[]) {
    const hotkeys: Record<string, HotkeyHandler> = {};
    toolbars.forEach((item) => {
        processToolbarItem(hotkeys, item);
    });
    return hotkeys;
}

export function createHotkeysExtension(toolbars: ToolbarItem[]): Extension{
    const keyMap = handleHotkeys(toolbars);
    return keymap.of(Object.entries(keyMap).map(([key, otherValue]) => ({
        key,
        ...otherValue,
    })));
}


