import { EditorState, type Extension,} from "@codemirror/state";
import { EditorView, keymap, lineNumbers, ViewUpdate } from "@codemirror/view"
import { onUnmounted, ref, shallowRef, watch } from "vue";
import { markdown, markdownKeymap } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { defaultKeymap } from "@codemirror/commands";
import { createExtensions, type ExtensionsOptions } from "@/extensions/codemirror";
import { defaultToolbarsConfig } from "@/config/toolbar";
import contentInsert from "@/utils/contentInsert";
import { useEditorStore } from "@/store/useEditorStore";
import { storeToRefs } from "pinia";



export interface EditorStateOptions extends ExtensionsOptions { 

  defaultContent?: string; // 默认内容
  isPersistent?: boolean; // 是否持久化
  onContentChange?: (content: string, viewUpdate: ViewUpdate) => void; // 内容变化回调
}

export function useEditorState(options: EditorStateOptions = {}) {
	const editorStore = useEditorStore();
	const { setContent, setEditorView, updateStats } = editorStore;
	const { content, editorView, editorContainer } = storeToRefs(editorStore);
   const {
    defaultContent = "",
    isPersistent = true,
    onContentChange = (newContent, update) => {
			 const pos = update.state.selection.main.head;
			 const line = update.state.doc.lineAt(pos);
			 const stats = {
				charCount: update.state.doc.length,
				lineCount: update.state.doc.lines,
				cursorCol: pos - line.from,
				cursorRow: line.number
			};
			updateStats(stats);
		},
    toolbars = defaultToolbarsConfig, // 使用我们刚创建的默认配置
    ...restOptions // 其他如 onDragUpload 等将直接传递给扩展
  } = options;

	if (!content.value) {
		setContent(defaultContent, isPersistent); // 初始化内容
	}

  const baseExtensions = [
    lineNumbers(),
    keymap.of(markdownKeymap),
    keymap.of(defaultKeymap)
  ];
  
  const initEditor = (el: HTMLElement) => {
    if (!el) {
      console.error("Editor container element is not provided.");
      return;
    }
    editorContainer.value = el;

    const allExtensions: Extension[] = createExtensions({
      ...restOptions,
      toolbars
    });
    // 编辑器状态
    const state = EditorState.create({
      doc: content.value,
      extensions: [
        ...baseExtensions,
				...allExtensions,
        EditorView.updateListener.of((update: ViewUpdate) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            setContent(newContent, isPersistent); // 更新持久化内容
						onContentChange(newContent, update);
          }
        }),
      ]
    });
    // 编辑器视图
   const view = new EditorView({
      state,
      parent: el
    });
    setEditorView(view);
    contentInsert.setEditorView(view);
  }
    // 更新编辑器内容
  const updateContent = (newContent: string) => {
      if (!editorView.value) return;
      const curContent = editorView.value.state.doc.toString();
      if (newContent == curContent) return;

      editorView.value.dispatch({
        changes: {
          from: 0,
          to: curContent.length,
          insert: newContent
        }
      }); 
  };
  watch(()=> options.defaultContent, (newContent) => {
    if (newContent !== undefined && editorView.value && editorView.value.state.doc.toString() !== newContent) {
      updateContent(newContent);
    }
  });
  onUnmounted(() => {
    if (editorView.value) {
      editorView.value.destroy(); // 销毁编辑器视图
      editorView.value = null; // 清除引用
    }
  })
  return {
    initEditor,
    updateContent,
  }
}

