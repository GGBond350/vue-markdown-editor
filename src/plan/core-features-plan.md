# 核心功能完善计划 (详细执行版)

本计划旨在完成编辑器后端逻辑的开发，为后续UI界面的构建奠定坚实的基础。此阶段的核心任务是创建默认配置并将所有功能模块在`useEditorState`组合式函数中进行聚合。

---

## 步骤一：创建默认工具栏配置

**目标**: 创建并导出`defaultToolbars`数组，作为编辑器工具栏和快捷键系统的默认数据源。

**文件**: `src/config/toolbar/index.ts`

### **执行步骤**:

1.  **创建文件**: 在`src/config/toolbar/`目录下创建`index.ts`文件。

2.  **写入以下代码**: 这段代码定义了工具栏的默认结构和行为。

    ```typescript
    import { type ToolbarItem, BaseToolbarType } from '@/types/toolbar';
    import { InsertTextEvent } from './event';
    import { useToolbarStore } from '@/stores/toolbar';

    // 建议：未来可以将图标作为SVG组件导入，以获得更好的可维护性和样式控制
    // import { BoldIcon, ItalicIcon, ... } from '@/assets/icons';

    // --- 默认工具栏配置数组 ---
    export const defaultToolbars: ToolbarItem[] = [
      {
        type: BaseToolbarType.HEADING,
        title: '标题',
        // icon: HeadingIcon,
        list: [
          { title: 'H1', type: BaseToolbarType.HEADING_1, onClick: () => InsertTextEvent(BaseToolbarType.HEADING_1) },
          { title: 'H2', type: BaseToolbarType.HEADING_2, onClick: () => InsertTextEvent(BaseToolbarType.HEADING_2) },
          { title: 'H3', type: BaseToolbarType.HEADING_3, onClick: () => InsertTextEvent(BaseToolbarType.HEADING_3) },
          { title: 'H4', type: BaseToolbarType.HEADING_4, onClick: () => InsertTextEvent(BaseToolbarType.HEADING_4) },
          { title: 'H5', type: BaseToolbarType.HEADING_5, onClick: () => InsertTextEvent(BaseToolbarType.HEADING_5) },
          { title: 'H6', type: BaseToolbarType.HEADING_6, onClick: () => InsertTextEvent(BaseToolbarType.HEADING_6) },
        ]
      },
      {
        type: BaseToolbarType.BOLD,
        title: '加粗',
        // icon: BoldIcon,
        onClick: () => InsertTextEvent(BaseToolbarType.BOLD),
        hotkey: { command: 'Mod-b', description: '加粗' }
      },
      {
        type: BaseToolbarType.ITALIC,
        title: '斜体',
        // icon: ItalicIcon,
        onClick: () => InsertTextEvent(BaseToolbarType.ITALIC),
        hotkey: { command: 'Mod-i', description: '斜体' }
      },
      {
        type: BaseToolbarType.STRIKETHROUGH,
        title: '删除线',
        // icon: StrikethroughIcon,
        onClick: () => InsertTextEvent(BaseToolbarType.STRIKETHROUGH),
        hotkey: { command: 'Mod-Shift-x', description: '删除线' }
      },
      {
        type: BaseToolbarType.LINE, // 分割线
      },
      {
        type: BaseToolbarType.BLOCKQUOTE,
        title: '引用',
        // icon: QuoteIcon,
        onClick: () => InsertTextEvent(BaseToolbarType.BLOCKQUOTE),
        hotkey: { command: 'Mod-Shift-q', description: '引用' }
      },
      {
        type: BaseToolbarType.UL,
        title: '无序列表',
        // icon: UlIcon,
        onClick: () => InsertTextEvent(BaseToolbarType.UL),
        hotkey: { command: 'Mod-Shift-u', description: '无序列表' }
      },
      {
        type: BaseToolbarType.OL,
        title: '有序列表',
        // icon: OlIcon,
        onClick: () => InsertTextEvent(BaseToolbarType.OL),
        hotkey: { command: 'Mod-Shift-o', description: '有序列表' }
      },
      {
        type: BaseToolbarType.CODE,
        title: '代码块',
        // icon: CodeIcon,
        onClick: () => InsertTextEvent(BaseToolbarType.CODE),
        hotkey: { command: 'Mod-Shift-c', description: '代码块' }
      },
      {
        type: BaseToolbarType.LINE, // 分割线
      },
      {
        type: BaseToolbarType.FULLSCREEN,
        title: '全屏',
        // icon: FullscreenIcon,
        onClick: () => {
          const toolbarStore = useToolbarStore();
          toolbarStore.setIsFullScreen(!toolbarStore.isFullScreen);
        },
        hotkey: { command: 'F11', description: '全屏' }
      },
    ];
    ```

---

## 步骤二：完善`useEditorState.ts`组合式函数

**目标**: 将`useEditorState.ts`改造为编辑器的“主引擎”，聚合所有状态、扩展和事件逻辑。

**文件**: `src/composables/useEditorState.ts`

### **执行步骤**:

1.  **替换文件内容**: 使用以下代码完全替换`src/composables/useEditorState.ts`的现有内容。

    ```typescript
    import { ref, shallowRef, onUnmounted, watch } from 'vue';
    import { EditorState, type Extension } from '@codemirror/state';
    import { EditorView, ViewUpdate } from '@codemirror/view';
    import { useEditorContent } from './useEditorContent';
    import { createEditorExtensions, type EditorExtensionOptions } from '@/extensions/codemirror';
    import { defaultToolbars } from '@/config/toolbar';
    import { contentInsert } from '@/utils/contentInsert';

    // 合并 EditorExtensionOptions 和我们自己的选项
    export interface UseEditorStateOptions extends EditorExtensionOptions {
      defaultContent?: string;
      isPersistent?: boolean;
      onContentChange?: (content: string, viewUpdate: ViewUpdate) => void;
    }

    export function useEditorState(options: UseEditorStateOptions = {}) {
      const {
        defaultContent = "",
        isPersistent = true,
        onContentChange = () => {},
        toolbars = defaultToolbars,
        ...restOptions // 其他所有选项将直接传递给 createEditorExtensions
      } = options;

      const { content, setStoredContent } = useEditorContent({ defaultContent, isPersistent });

      const editorView = ref<EditorView | null>(null);
      const editorContainer = ref<HTMLElement | null>(null);

      const initEditor = (el: HTMLElement) => {
        if (!el) {
          console.error("Editor container element is not provided.");
          return;
        }
        editorContainer.value = el;

        // 创建所有扩展
        const allExtensions = createEditorExtensions({
          toolbars,
          ...restOptions,
        });

        const state = EditorState.create({
          doc: content.value,
          extensions: [
            ...allExtensions,
            EditorView.updateListener.of((update: ViewUpdate) => {
              if (update.docChanged) {
                const newContent = update.state.doc.toString();
                content.value = newContent;
                if (isPersistent) {
                  setStoredContent(newContent);
                }
                onContentChange(newContent, update);
              }
            }),
          ]
        });

        const view = new EditorView({
          state,
          parent: el
        });
        
        editorView.value = view;
        
        // 关键：将 editorView 实例传递给 contentInsert 工具
        contentInsert.setEditorView(view);
      };

      // 监听外部内容变化并更新编辑器
      watch(() => options.defaultContent, (newVal) => {
        if (newVal !== undefined && editorView.value && newVal !== editorView.value.state.doc.toString()) {
          editorView.value.dispatch({
            changes: { from: 0, to: editorView.value.state.doc.length, insert: newVal },
          });
        }
      });

      // 确保在组件卸载时销毁编辑器实例，防止内存泄漏
      onUnmounted(() => {
        if (editorView.value) {
          editorView.value.destroy();
          editorView.value = null;
        }
      });

      return {
        editorContainer,
        initEditor,
        content,
        editorView, // 返回 editorView 实例以供其他部分使用
      };
    }
    ```

### **代码解释**:

*   **统一配置入口**: `UseEditorStateOptions`现在是配置编辑器的唯一入口点。
*   **动态扩展创建**: `createEditorExtensions`在`initEditor`函数内部被调用，确保它在编辑器初始化时运行。
*   **内容双向同步**:
    *   `EditorView.updateListener`监听编辑器内部变化，并更新`content` ref，同时调用外部的`onContentChange`回调。
    *   `watch`函数监听外部传入的`defaultContent` (通常是`v-model`的值)，当外部内容变化时，更新编辑器。
*   **依赖注入**: `contentInsert.setEditorView(view)`这行代码至关重要，它将`EditorView`的实例注入到内容插入工具中，使其能够对编辑器执行操作。
*   **资源管理**: `onUnmounted`钩子确保了`EditorView`实例在组件销毁时被正确清理，避免了内存泄漏。

---

完成以上两个步骤后，编辑器的所有核心逻辑就准备就绪了。此时，虽然还没有UI，但编辑器在功能上已经是一个可以通过`useEditorState`驱动的完整引擎了。
