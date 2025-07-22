import type { ToolbarType } from "@/types/editor/toolbar";
import { toolbarTemplate, type ToolbarTemplateValue } from "./template";
import contentInsert from "@/utils/contentInsert";

export function insertContentEvent(type: ToolbarType) {
    const {content, selection} = toolbarTemplate[type] as ToolbarTemplateValue;
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

