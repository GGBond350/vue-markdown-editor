import type { ToolbarItem } from "@/types/editor/toolbar";
import { createEventExtensions, type EventExtensionOptions } from "./event"
import { type Extension } from "@codemirror/state";
import { createMarkdownExtensions } from "./markdown";
import { history } from "@codemirror/commands";
import { EditorView } from "codemirror";
import { createHotkeysExtension } from "./hotkey";

export type ExtensionsOptions = EventExtensionOptions & {
    enableShotcut?: boolean;
    toolbars?: ToolbarItem[]; 
}
export const createExtensions = (options: ExtensionsOptions): Extension[] => {
    const { 
        enableShotcut,
        eventExt,
        scrollWrapper = 'editor',
        onDragUpload,
        onPasteUpload,
    } = options;

    const extensions: Extension[] = [
        createMarkdownExtensions(),
        createEventExtensions({
            scrollWrapper,
            eventExt,
            onDragUpload,
            onPasteUpload
        }),
        history(),
       	EditorView.lineWrapping,

    ];
    if (enableShotcut && options.toolbars) {
       extensions.push(
        createHotkeysExtension(options.toolbars)
       )
    }

    return extensions;
}