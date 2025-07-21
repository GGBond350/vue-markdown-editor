# 计划：实现 CodeMirror 编辑器动态主题切换

**目标**：使 CodeMirror 编辑器的主题能够响应全局主题状态的变化，实现亮色/暗色模式的动态切换。

**核心技术**：CodeMirror 6 的 `Compartment` API。

---

## 详细实施步骤

### 第一步：安装所需的主题依赖

我们需要为亮色和暗色模式各准备一个高质量的主题。

1.  **安装亮色主题** (推荐 GitHub Light):
    ```bash
    pnpm install @uiw/codemirror-theme-github
    ```

2.  **安装暗色主题** (如果尚未安装):
    ```bash
    pnpm install @codemirror/theme-one-dark
    ```

### 第二步：创建并导出 `Compartment` 实例

`Compartment` 是实现动态配置的关键。我们将在管理 CodeMirror 扩展的文件中创建它，以便在多个地方共享。

**文件**: `src/extensions/codemirror/index.ts`

**操作**:
1.  引入 `Compartment`。
2.  创建一个新的 `Compartment` 实例，专门用于管理主题。
3.  导出该实例。

```typescript
// src/extensions/codemirror/index.ts

import { Compartment } from '@codemirror/state';
// ... 其他 imports

// 1. 创建一个专门用于主题的“隔间”
export const themeCompartment = new Compartment();

// ... (保留该文件原有的其他代码)
```

### 第三步：在初始配置中使用 `Compartment`

我们需要修改创建 `EditorState` 的地方，使用 `themeCompartment` 来包裹初始主题。

**文件**: `src/extensions/codemirror/index.ts` (或 `EditorState` 创建的地方)

**操作**:
1.  引入亮色和暗色主题。
2.  引入全局主题 store (假设为 `useThemeStore`)。
3.  在 `extensions` 数组中，使用 `themeCompartment.of()` 来设置初始主题，该主题根据全局状态决定。

```typescript
// src/extensions/codemirror/index.ts

import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { githubLight } from '@uiw/codemirror-theme-github';
import { useThemeStore } from '@/store/useThemeStore'; // 假设路径
import { themeCompartment } from './index'; // 引入我们创建的 Compartment

// ...

export const createEditorState = (doc: string) => {
  const themeStore = useThemeStore();
  const isDark = themeStore.isDark; // 获取初始主题状态

  return EditorState.create({
    doc,
    extensions: [
      // ... 其他扩展 (如 lineNumbers, keymap 等)
      
      // 使用 Compartment 来包裹初始主题
      themeCompartment.of(isDark ? oneDark : githubLight),
      
      // ... 其他扩展 (如 markdown())
    ]
  });
};
```

### 第四步：监听全局状态，动态更新主题

最后，我们需要在能访问到 `EditorView` 实例的地方监听全局主题的变化，并使用 `dispatch` 来更新 `Compartment` 中的内容。

**文件**: `src/composables/useEditor.ts`

**操作**:
1.  引入 `watch`、全局主题 store、两个主题以及 `themeCompartment`。
2.  获取 `EditorView` 实例 (可能需要从 Pinia store 中获取)。
3.  使用 `watch` 监听全局主题状态 (`isDark`) 的变化。
4.  在 `watch` 的回调函数中，当 `editorView` 存在时，调用 `editorView.dispatch` 并传入 `themeCompartment.reconfigure()` 来应用新主题。

```typescript
// src/composables/useEditor.ts

import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useEditorStore } from '@/store/useEditorStore';
import { useThemeStore } from '@/store/useThemeStore';
import { oneDark } from '@codemirror/theme-one-dark';
import { githubLight } from '@uiw/codemirror-theme-github';
import { themeCompartment } from '@/extensions/codemirror';

export function useEditor() {
  // ... (原有的 useEditor 逻辑)

  const editorStore = useEditorStore();
  const themeStore = useThemeStore();
  
  // 假设 editorView 实例被存储在 editorStore 中
  const { editorView } = storeToRefs(editorStore); 

  // 监听全局 isDark 状态的变化
  watch(() => themeStore.isDark, (isDarkValue) => {
    // 确保 editorView 实例已存在
    if (editorView.value) {
      const newTheme = isDarkValue ? oneDark : githubLight;
      
      // 派发一个事务来重新配置 themeCompartment
      editorView.value.dispatch({
        effects: themeCompartment.reconfigure(newTheme)
      });
    }
  }, {
    // 如果需要在 editorView 初始化后立即应用一次，可以考虑在这里处理
    // 但由于初始状态已在 EditorState.create 中设置，通常不需要 immediate: true
  });

  // ... (返回其他方法和状态)
}
```

---

## 总结

此计划通过 `Compartment` API 建立了一个从全局状态到 CodeMirror 视图的响应式数据流，实现了高效、可靠的动态主题切换。这是 CodeMirror 6 推荐的最佳实践。
