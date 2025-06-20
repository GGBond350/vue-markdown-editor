import type { Extension } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import type {ToolbarItem} from "@/types/toolbar";
export function handleHotkeys(toolbars: ToolbarItem[]) {
    const hotkeys: Record<string, { handler: () => void }> = {};
    toolbars.forEach((toolbar) => {
        if (toolbar.hotkey) {
            hotkeys[toolbar.hotkey.command] = { handler: toolbar.hotkey.handler };
        }
    });
    return hotkeys;
}

export function createHotkeysExtension(toolbars: ToolbarItem[]): Extension{
    const keyMap = handleHotkeys(toolbars);
    return keymap.of(Object.entries(keyMap).map(([key, { handler }]) => ({
        key,
        handler
    })));
}


