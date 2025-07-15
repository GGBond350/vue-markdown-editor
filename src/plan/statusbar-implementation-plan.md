# StatusBar 功能实现计划

本计划旨在为 Vue-Markdown-Editor 项目实现一个功能完善的状态栏（StatusBar）。该计划结合了对参考 React 版本的分析和行业最佳实践。

## 一、 最终功能清单

状态栏将从左到右包含以下四个核心功能区域：

1.  **文本统计 (Text Stats)**
    *   **内容:** 实时显示当前文档的字数、字符数和总行数。
    *   **显示格式:** `字数: 123 | 字符: 456 | 行: 78`
    *   **价值:** 提供核心的写作反馈，比 React 版本功能更全面。

2.  **光标位置 (Cursor Position)**
    *   **内容:** 实时显示光标所在的行号和列号。
    *   **显示格式:** `行: 52, 列: 16`
    *   **价值:** 补足了 React 版本缺失的关键功能，对开发者和精确编辑者至关重要。

3.  **同步滚动开关 (Sync Scroll Toggle)**
    *   **内容:** 提供一个 Checkbox 或开关，用于启用/禁用编辑区和预览区的同步滚动。
    *   **价值:** 与 React 版本对齐，提供灵活的滚动控制。

4.  **回到顶部按钮 (Scroll to Top Button)**
    *   **内容:** 一个可点击的按钮或链接，用于将编辑区和预览区同时滚动到顶部。
    *   **价值:** 与 React 版本对齐，方便长文档导航。

## 二、 技术实现步骤

我们将采用 Pinia 作为状态管理中心，解耦数据生产者（Editor）和数据消费者（StatusBar）。

### 第一步：创建数据中心 `useEditorStore`

这是所有状态功能的数据中枢。

1.  **创建文件:** 在 `src/store/` 目录下创建一个新文件 `editorStore.ts`。
2.  **定义 State:** 在 store 中定义以下 state：
    *   `wordCount`: `ref<number>(0)` - 单词数
    *   `charCount`: `ref<number>(0)` - 字符数
    *   `lineCount`: `ref<number>(0)` - 总行数
    *   `cursorLine`: `ref<number>(0)` - 光标所在行
    *   `cursorColumn`: `ref<number>(0)` - 光标所在列
3.  **定义 Actions:** 创建一个 `updateStatus` action，用于一次性更新所有统计数据。

**代码示例 (`src/store/editorStore.ts`):**
```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useEditorStore = defineStore('editor', () => {
  // 文本统计
  const wordCount = ref(0);
  const charCount = ref(0);
  const lineCount = ref(0);

  // 光标位置
  const cursorLine = ref(0);
  const cursorColumn = ref(0);

  // Action: 用于从 Editor 组件更新状态
  const updateStatus = (stats: {
    wordCount: number;
    charCount: number;
    lineCount: number;
    cursorLine: number;
    cursorColumn: number;
  }) => {
    wordCount.value = stats.wordCount;
    charCount.value = stats.charCount;
    lineCount.value = stats.lineCount;
    cursorLine.value = stats.cursorLine;
    cursorColumn.value = stats.cursorColumn;
  };

  return {
    wordCount,
    charCount,
    lineCount,
    cursorLine,
    cursorColumn,
    updateStatus,
  };
});
```

### 第二步：在 `Editor` 组件中生产数据

`Editor` 组件负责监听自身变化，并计算最新的统计数据，然后通过 action 更新到 Store 中。

1.  **引入 Store:** 在 `Editor.vue` 的 `<script setup>` 中，导入并使用 `useEditorStore`。
2.  **监听更新:** 利用 CodeMirror 6 的 `EditorView.updateListener` 扩展。这个监听器会在编辑器内容或光标位置变化时触发。
3.  **计算数据:** 在监听器的回调函数中，从 `update.state` 对象中获取所需信息：
    *   **字符数:** `update.state.doc.length`
    *   **行数:** `update.state.doc.lines`
    *   **单词数:** 需要一个辅助函数，通过正则表达式 `/\b\w+\b/g` 来匹配和计算。
    *   **光标位置:**
        *   获取光标位置: `const pos = update.state.selection.main.head`
        *   获取所在行: `const line = update.state.doc.lineAt(pos)`
        *   行号: `line.number`
        *   列号: `pos - line.from`
4.  **调用 Action:** 将计算出的所有数据，通过 `editorStore.updateStatus(...)` 提交到 Pinia。

### 第三步：在 `StatusBar` 组件中消费数据

`StatusBar` 的任务最简单，它只需要从 Store 中读取数据并展示即可。

1.  **引入 Store:** 在 `StatusBar.vue` 的 `<script setup>` 中，导入并使用 `useEditorStore`。
2.  **获取 State:** 使用 `storeToRefs` 从 store 中解构出所有需要的 state，以保持其响应性。
3.  **渲染模板:** 在 `<template>` 中，将这些响应式数据绑定到对应的显示位置。

**代码示例 (`src/components/StatusBar/statusBar.vue`):**
```vue
<script setup lang="ts">
import { useEditorStore } from '@/store/editorStore';
import { storeToRefs } from 'pinia';

const editorStore = useEditorStore();
const { wordCount, charCount, lineCount, cursorLine, cursorColumn } = storeToRefs(editorStore);
</script>

<template>
  <div class="statusbar">
    <div class="statusbar-left">
      <span>字数: {{ wordCount }}</span>
      <span class="divider">|</span>
      <span>字符: {{ charCount }}</span>
      <span class="divider">|</span>
      <span>行: {{ lineCount }}</span>
    </div>
    <div class="statusbar-right">
      <span>行: {{ cursorLine }}, 列: {{ cursorColumn }}</span>
      <!-- 同步滚动和回到顶部的功能将在这里实现 -->
    </div>
  </div>
</template>

<style scoped>
/* 添加基本样式 */
.statusbar {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  font-size: 12px;
  color: var(--text-color);
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-color);
  height: 24px;
  align-items: center;
}
.statusbar-left, .statusbar-right {
  display: flex;
  gap: 8px;
}
.divider {
  color: var(--border-color);
}
</style>
```

## 三、 下一步行动

按照以上步骤，从创建 `editorStore.ts` 文件开始，即可逐步完成整个 `StatusBar` 的功能开发。
