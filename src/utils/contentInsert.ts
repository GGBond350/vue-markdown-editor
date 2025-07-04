import { redo, undo } from "@codemirror/commands";
import type { EditorView } from "codemirror";


class ContentInsert {
    private editorView: EditorView | null = null;

    setEditorView(editorView: EditorView) {
        this.editorView = editorView;
    }

    getEditorView(): EditorView | null {
        return this.editorView;
    }

    insertContent(content: string, selection: {start: number, end: number}) {
        const view = this.editorView;
        if (!view) {
            console.error("EditorView is not set.");
            return;
        }
        // 获取焦点
        view.focus();
        const range = view.state.selection.ranges[0];
        let {start, end} = selection;
        if (range.from !== range.to) { // 有选中内容
            const selectedText = view.state.sliceDoc(range.from, range.to);
            content = content.slice(0, start) + selectedText + content.slice(end);
            start = start + selectedText.length;
        } 

        view.dispatch({
            changes: {
                from: range.from,
                to: range.to,
                insert: content
            },
            selection: {
                anchor: range.from + start,
                head: range.from + start
            }
        })
    }

    undo() {
        const view = this.editorView;
        if (!view) {
            console.error("EditorView is not set.");
            return;
        }
        undo(view);
    }

    redo() {
        const view = this.editorView;
        if (!view) {
            console.error("EditorView is not set.");
            return;
        }
        redo(view);
    }

}
const contentInsert = new ContentInsert();
export default contentInsert;