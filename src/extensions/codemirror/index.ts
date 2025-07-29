import type { ToolbarItem } from "@/types/editor/toolbar";
import { createEventExtensions, type EventExtensionOptions } from "./event"
import { type Extension } from "@codemirror/state";
import { createMarkdownExtensions } from "./markdown";
import { history } from "@codemirror/commands";
import { EditorView } from "codemirror";
import { createHotkeysExtension } from "./hotkey";
import { defaultKeymap } from "@codemirror/commands";
import { keymap, highlightActiveLine } from "@codemirror/view";
import { indentOnInput } from "@codemirror/language";
import { markdownKeymap } from "@codemirror/lang-markdown";

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
				keymap.of([...defaultKeymap, ...markdownKeymap]),
				highlightActiveLine(),
				indentOnInput(),
    ];
    if (enableShotcut && options.toolbars) {
       extensions.push(
        createHotkeysExtension(options.toolbars)
       )
    }
    return extensions;
}