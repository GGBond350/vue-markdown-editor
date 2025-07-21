import { EditorState, type Extension, Compartment } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, ViewUpdate } from "@codemirror/view"
import { onUnmounted, ref, shallowRef, watch } from "vue";
import { createExtensions, type ExtensionsOptions } from "@/extensions/codemirror";
import { defaultToolbarsConfig } from "@/config/toolbar";
import contentInsert from "@/utils/contentInsert";
import { useEditorStore } from "@/store/useEditorStore";
import { useThemeStore } from "@/store/useThemeStore";
import { storeToRefs } from "pinia";
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { handleEditorScroll } from "@/utils/ScrollSynchronizer";
export const themeCompartment = new Compartment();
const darkModeThemes = [githubDark,  
		EditorView.theme({
			"&": {
				backgroundColor: "#242424 !important",
			},
			".cm-gutters": {
				backgroundColor: "#242424 !important", 
			},
		}, { dark: true })
];
export interface EditorStateOptions extends ExtensionsOptions {

  defaultContent?: string; // 默认内容
  isPersistent?: boolean; // 是否持久化
  onContentChange?: (content: string, viewUpdate: ViewUpdate) => void; // 内容变化回调
}

export function useEditorState(options: EditorStateOptions = {}) {
	const editorStore = useEditorStore();
	const themeStore = useThemeStore();
	const isDarkMode = themeStore.currentTheme === 'dark';
	const { setContent, setEditorView, updateStats } = editorStore;
	const { content, editorView, editorContainer, isSyncScroll, previewView, currentScrollContainer} = storeToRefs(editorStore);
   const {
    defaultContent = "",
    isPersistent = true,
    onContentChange = () => {}, // 默认内容变化回调
    toolbars = defaultToolbarsConfig, // 使用我们刚创建的默认配置
    ...restOptions // 其他如 onDragUpload 等将直接传递给扩展
  } = options;

	if (!content.value) {
		setContent(defaultContent, isPersistent); // 初始化内容
	}

  const initEditor = (el: HTMLElement) => {
    if (!el) {
      console.error("Editor container element is not provided.");
      return;
    }
    editorContainer.value = el;
    const eventExt = EditorView.domEventHandlers({
      scroll: () => {
        if (currentScrollContainer.value !== 'editor')  return;
        const view = editorView.value;
        if (!(view && previewView.value && isSyncScroll.value)) return;

        handleEditorScroll({editorView: view as EditorView, previewView: previewView.value});
      }
    })
    const allExtensions: Extension[] = createExtensions({
      ...restOptions,
      toolbars,
			eventExt
    });
    // 编辑器状态
    const state = EditorState.create({
      doc: content.value,
      extensions: [
				...allExtensions,
				themeCompartment.of(isDarkMode ? darkModeThemes : githubLight),
        EditorView.updateListener.of((update: ViewUpdate) => {
          if (update.docChanged || update.selectionSet) {
            const pos = update.state.selection.main.head;
            const line = update.state.doc.lineAt(pos);
            const stats = {
              charCount: update.state.doc.length,
              lineCount: update.state.doc.lines,
              cursorRow: line.number,
              cursorCol: pos - line.from + 1 // 计算光标列位置
            }
            updateStats(stats); // 更新统计信息
            if (update.docChanged) {
              const newContent = update.state.doc.toString();
              setContent(newContent, isPersistent); // 更新持久化内容
              onContentChange(newContent, update);
            }
          }
        }),
      ]
    });
    console.log("Editor state initialized with extensions:", allExtensions);
    // 编辑器视图
   const view = new EditorView({
      state,
      parent: el
    });
    setEditorView(view);
    contentInsert.setEditorView(view); 
    // 初始化状态栏
    const initialState = view.state;
    const initialPos = initialState.selection.main.head;
    const initialLine = initialState.doc.lineAt(initialPos);
    updateStats( {
      charCount: initialState.doc.length,
      lineCount: initialState.doc.lines,
      cursorRow: initialLine.number,
      cursorCol: initialPos - initialLine.from + 1 // 计算光标列位置
    });
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

	watch(() => themeStore.currentTheme, (newTheme) => {
		if (editorView.value) {
			const isDarkMode = newTheme === 'dark';
			editorView.value.dispatch({
				effects: themeCompartment.reconfigure(isDarkMode ? darkModeThemes : githubLight)
			});
		}
	})


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

