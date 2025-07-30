import type { ToolbarType } from "@/types/editor/toolbar";
import { getToolbarTemplate, toolbarTemplate, type ToolbarTemplateValue } from "./template";
import contentInsert from "@/utils/contentInsert";

export function insertContentEvent(type: ToolbarType, payload?: any) {
    const {content, selection} = getToolbarTemplate(type, payload);
    contentInsert.insertContent(content, selection);
}

export function undoEvent() {
    contentInsert.undo();
}

export function redoEvent() {
    contentInsert.redo();
}

export function insertEmojiEvent(emoji: any) {
    contentInsert.insertTextAtCursor(emoji.native);
}

