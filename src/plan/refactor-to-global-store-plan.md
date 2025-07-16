# 架构重构与 StatusBar 功能实现计划 (V2 - 混合模式)

## 零、总体目标

经过深入讨论，我们决定采用一种**混合模式架构**，以充分利用 Pinia 和 Composable 的各自优势。

**核心思想:**
*   **`useEditorStore` (Pinia):** 作为一个纯粹的、被动的**全局数据仓库**，负责存储需要跨组件共享的“数据状态”。
*   **`useEditor.ts` (Composable):** 作为一个**逻辑与行为封装器**，负责处理 CodeMirror 的生命周期、事件监听和复杂逻辑，并与 `useEditorStore` 交互来读写数据。

---

## 第一部分：架构重构

### 步骤 1: 创建精简版的全局 `useEditorStore`

这个 Store 只负责存储数据，不包含复杂的业务逻辑。

1.  **创建/覆盖文件**: `src/store/editorStore.ts`
2.  **编写代码**:
    ```typescript
    import { defineStore } from 'pinia';
    import { ref, shallowRef } from 'vue';
    import type { EditorView } from '@codemirror/view';

    const STORAGE_KEY = 'vue-markdown-editor-content';

    export const useEditorStore = defineStore('editor', () => {
      // --- 数据状态 (Data States) ---
      const content = ref(localStorage.getItem(STORAGE_KEY) || '');
      const editorView = shallowRef<EditorView | null>(null);
      const previewView = shallowRef<HTMLElement | null>(null);
      
      // StatusBar 相关数据
      const charCount = ref(0);
      const lineCount = ref(0);
      const cursorLine = ref(0);
      const cursorColumn = ref(0);

      // --- 设置器 (Setter Actions) ---
      const setContent = (newContent: string, isPersistent: boolean = true) => {
        content.value = newContent;
        if (isPersistent) {
          localStorage.setItem(STORAGE_KEY, newContent);
        }
      };
      const setEditorView = (view: EditorView | null) => { editorView.value = view; };
      const setPreviewView = (view: HTMLElement | null) => { previewView.value = view; };
      
      const updateStatus = (stats: {
        charCount: number;
        lineCount: number;
        cursorLine: number;
        cursorColumn: number;
      }) => {
        charCount.value = stats.charCount;
        lineCount.value = stats.lineCount;
        cursorLine.value = stats.cursorLine;
        cursorColumn.value = stats.cursorColumn;
      };

      return {
        content,
        editorView,
        previewView,
        charCount,
        lineCount,
        cursorLine,
        cursorColumn,
        setContent,
        setEditorView,
        setPreviewView,
        updateStatus,
      };
    });
    ```

### 步骤 2: 创建 `useEditor.ts` Composable

这个 Composable 是 `Editor.vue` 的“大脑”，负责所有主动逻辑。

1.  **创建/覆盖文件**: `src/composables/useEditor.ts` (可以由 `useEditorState.ts` 重命名而来)
2.  **编写代码**:
    ```typescript
    import { onMounted, onUnmounted, ref } from 'vue';
    import { useEditorStore } from '@/store/editorStore';
    import { EditorView, EditorState } from 'codemirror';
    // ... 引入您需要的其他 CodeMirror 扩展

    export function useEditor(options: { extensions: any[] }) {
      const editorStore = useEditorStore();
      const editorContainer = ref<HTMLElement | null>(null);

      const init = () => {
        const state = EditorState.create({
          doc: editorStore.content,
          extensions: [
            ...options.extensions, // 传入自定义扩展
            EditorView.updateListener.of(update => {
              if (!update.docChanged && !update.selectionSet) return;

              // --- 逻辑计算区 ---
              const newContent = update.state.doc.toString();
              const pos = update.state.selection.main.head;
              const line = update.state.doc.lineAt(pos);
              const stats = {
                charCount: update.state.doc.length,
                lineCount: update.state.doc.lines,
                cursorLine: line.number,
                cursorColumn: pos - line.from,
              };
              
              // --- 更新全局 Store ---
              editorStore.setContent(newContent);
              editorStore.updateStatus(stats);
            })
          ]
        });
        const view = new EditorView({ state, parent: editorContainer.value! });
        editorStore.setEditorView(view);
      };

      onMounted(() => {
        if (editorContainer.value) {
          init();
        }
      });
      
      onUnmounted(() => {
        editorStore.editorView?.destroy();
        editorStore.setEditorView(null);
      });

      // 只返回容器 ref，逻辑是自包含的
      return { editorContainer };
    }
    ```

### 步骤 3: 改造 `Editor.vue` (使其极简化)

`Editor.vue` 将变得非常“薄”，只负责UI渲染和调用 Composable。

1.  **修改 `<script setup>`**:
    ```typescript
    import { useEditor } from '@/composables/useEditor';
    import { createExtensions } from '@/extensions/codemirror'; // 假设扩展在这里

    // 准备给 useEditor 的配置
    const extensions = createExtensions({ ... }); 

    // 调用 Composable，它会处理所有初始化和生命周期
    const { editorContainer } = useEditor({ extensions });
    ```
2.  **修改 `<template>`**:
    ```html
    <template>
      <div ref="editorContainer" class="editor-wrapper"></div>
    </template>
    ```

### 步骤 4: 删除不再需要的 Composable

确认 `Editor.vue` 已完全改造后，删除旧文件。

1.  **删除文件**: `src/composables/useEditorContent.ts`
2.  **确认**: `useEditorState.ts` 已被 `useEditor.ts` 替代或重命名。

---

## 第二部分：`StatusBar.vue` 功能实现

这部分与之前的计划一致，因为 `useEditorStore` 已经为我们准备好了所有需要的数据。

1.  **引入 Store**: 在 `src/components/StatusBar/statusBar.vue` 中引入 `useEditorStore`。
2.  **获取状态**: 使用 `storeToRefs` 解构出 `charCount`, `lineCount`, `cursorLine`, `cursorColumn`。
3.  **渲染模板**: 在模板中直接使用这些响应式变量。

---

## 三、下一步行动

严格按照本 V2 计划，从 **第一部分：步骤 1** 开始执行。这个方案架构清晰，职责分明，是实现我们目标的最佳路径。
