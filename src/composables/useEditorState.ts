import { EditorState, type Extension,} from "@codemirror/state";
import { EditorView, ViewUpdate } from "@codemirror/view"
import { ref, shallowRef, watch } from "vue";
import { useEditorContent } from "./useEditorContent";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";


interface EditorStateOptions {
  extensions?: Extension[]; // CodeMirror 扩展
  defaultContent?: string; // 默认内容
  isPersistent?: boolean; // 是否持久化
  onContentChange?: (content: string, viewUpdate: ViewUpdate) => void; // 内容变化回调
}

export function useEditorState(options: EditorStateOptions = {}) {
  const {
    extensions = [],
    defaultContent = "",
    isPersistent = true,
    onContentChange = () => {},
  } = options;

  const { content, setStoredContent } = useEditorContent({ defaultContent, isPersistent });

  const editorView = ref<EditorView | null>(null);
  const editorContainer = ref<HTMLElement | null>(null);

  
  /**
   * - 这是一个使用`shallowRef`创建的响应式引用，可以有三种可能的值：
   *  - `'editor'`：表示用户当前正在编辑器区域滚动
   *  - `'preview'`：表示用户当前正在预览区域滚动
   *  - `null`：表示没有滚动操作或初始状态
   * - 使用`shallowRef`而不是`ref`是因为我们只需要跟踪值的变化，而不需要深层响应式
   * 
   * 当用户在编辑器或预览区域中滚动时，我们需要知道滚动发生在哪个区域.
   * 这个信息用于防止滚动同步时的无限循环（避免编辑器滚动触发预览滚动，预览滚动又触发编辑器滚动）。
   * 通过跟踪当前滚动容器，我们可以实现单向的滚动同步，只有用户主动滚动的区域才会触发同步。
   */
  const currentScrollContainer = shallowRef<'editor' | 'preview' | null>(null);

  /**
   * __说明__：
   * - 这是一个使用`shallowRef`创建的响应式引用，存储预览区域的HTML元素
   * - 初始值为`null`，表示尚未获取到预览元素
   * - 当预览组件挂载后，会将其DOM元素引用传递给这个变量
   * 
   * __使用场景__：
   * - 在实现滚动同步时，我们需要同时操作编辑器视图和预览元素
   * - 通过存储预览元素的引用，我们可以在编辑器滚动时，计算并设置预览区域的滚动位置
   * - 同样，当预览区域滚动时，我们也可以计算并设置编辑器的滚动位置

   */
  const previewElement = shallowRef<HTMLElement | null>(null);

  const initEditor = (el: HTMLElement) => {
    if (!el) {
      console.error("Editor container element is not provided.");
      return;
    }
    editorContainer.value = el;

    // 编辑器状态
    const state = EditorState.create({
      doc: content.value,
      extensions: [
        markdown({ codeLanguages: languages}),
        EditorView.updateListener.of((update: ViewUpdate) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            content.value = newContent; // 更新响应式内容
            setStoredContent(newContent); // 持久化存储
          }
        }),
        ...extensions
      ]
    });
    // 编辑器视图
    editorView.value = new EditorView({
      state,
      parent: el
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

  const setPreviewEl = (el: HTMLElement | null) => {
    previewElement.value = el;
  }

  const setCurrentScrollContainer = (container: 'editor' | 'preview' | null) => {
    currentScrollContainer.value = container;
  }

  watch(content, (newContent) => {
    if (editorView.value && editorView.value.state.doc.toString() !== newContent) {
      updateContent(newContent);
    }
  });
  return {
    editorView,
    editorContainer,
    content,
    currentScrollContainer,
    previewElement,
    initEditor,
    updateContent,
    setStoredContent,
    setPreviewEl,
    setCurrentScrollContainer
  }
}

