# 精确同步滚动功能 - 详细执行计划 (参考 React 实现)

本计划旨在以 Vue Composable 的形式，高度复现 React 版本中基于“位置映射”的精确同步滚动功能。

## 零、核心思想复盘

React 版本的核心是一个 `ScrollSynchronizer` 类，它不依赖简单的滚动百分比，而是通过动态计算 Editor 和 Preview 区域中、有对应关系的 DOM 元素（通过 `data-line` 属性关联）的**像素级位置映射**，来实现精确同步。

---

## 第一步：Store 状态扩展

**文件**: `src/store/useEditorStore.ts`

与之前的计划一致，这是基础。

*   **新增 State**:
    *   `isSyncScroll: ref(true)`: 同步开关。
    *   `currentScrollContainer: ref<'editor' | 'preview' | null>(null)`: 解决滚动竞争的关键状态。
    *   `scrollToTop: ref<(() => void) | null>(null)`: “回到顶部”函数的引用。
*   **新增 Action**:
    *   `toggleSyncScroll()`
    *   `setCurrentScrollContainer(container: 'editor' | 'preview')`
    *   `setScrollToTopFunction(fn: () => void)`
*   **暴露**: 在 `return` 对象中暴露以上所有内容。

---

## 第二步：创建 `useSyncScroll.ts` Composable 及 `ScrollSynchronizer` 类

**文件**: `src/composables/useSyncScroll.ts`

这是整个功能的核心，我们将在这里复现 React 版本的实现。

### 2.1 `ScrollSynchronizer` 类的移植与适配

我们将创建一个 `ScrollSynchronizer` 类，其内部方法和属性将严格参考 React 版本的实现。

```typescript
class ScrollSynchronizer {
  // 属性 (Properties)
  private readonly editorElementList: number[] = [];
  private readonly previewElementList: number[] = [];
  private static readonly BOTTOM_THRESHOLD = 1; // px

  // --- 核心公共方法 ---

  public handleEditorScroll(editorView: EditorView, previewView: HTMLElement): void {
    // 对应 React 版本中的同名方法
    this.computeHeightMapping({ editorView, previewView });
    this.synchronizeScroll("editor", { editorView, previewView });
  }

  public handlePreviewScroll(previewView: HTMLElement, editorView: EditorView): void {
    // 对应 React 版本中的同名方法
    this.computeHeightMapping({ editorView, previewView });
    this.synchronizeScroll("preview", { editorView, previewView });
  }

  public handleScrollTop(editorView: EditorView, previewView: HTMLElement): void {
    // 对应 React 版本中的 scrollToTop 方法
    editorView.scrollDOM.scrollTo({ top: 0, behavior: 'smooth' });
    previewView.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- 内部实现细节 (Private Methods) ---

  private computeHeightMapping({ previewView, editorView }: { previewView: HTMLElement, editorView: EditorView }): void {
    // 1. 清空旧映射
    this.editorElementList.length = 0;
    this.previewElementList.length = 0;

    // 2. 获取 Preview 中所有带 data-line 的有效子节点
    const validNodes = Array.from(previewView.children).filter(
      node => node.hasAttribute('data-line')
    );

    // 3. 遍历节点，建立映射关系
    validNodes.forEach(node => {
      const element = node as HTMLElement;
      const lineNumber = Number(element.dataset.line);
      
      // 4. 获取 CodeMirror 中对应行的信息
      const lineInfo = editorView.state.doc.line(lineNumber);
      if (!lineInfo) return;
      const blockInfo = editorView.lineBlockAt(lineInfo.from);

      // 5. 将两边的 top 值存入数组
      this.editorElementList.push(blockInfo.top);
      this.previewElementList.push(element.offsetTop);
    });
  }

  private synchronizeScroll(source: "editor" | "preview", { editorView, previewView }: { previewView: HTMLElement, editorView: EditorView }): void {
    const sourceEl = source === 'editor' ? editorView.scrollDOM : previewView;
    const targetEl = source === 'editor' ? previewView : editorView.scrollDOM;

    // 边界检查：顶部
    if (sourceEl.scrollTop <= 0) {
      targetEl.scrollTop = 0;
      return;
    }
    // 边界检查：底部
    if (sourceEl.scrollTop + sourceEl.clientHeight + ScrollSynchronizer.BOTTOM_THRESHOLD >= sourceEl.scrollHeight) {
      targetEl.scrollTop = targetEl.scrollHeight - targetEl.clientHeight;
      return;
    }

    // 执行核心比例滚动
    this.performProportionalScroll(sourceEl, targetEl, source);
  }

  private performProportionalScroll(sourceEl: Element, targetEl: Element, source: "editor" | "preview"): void {
    const sourceList = source === "editor" ? this.editorElementList : this.previewElementList;
    const targetList = source === "editor" ? this.previewElementList : this.editorElementList;
    
    // 1. 找到当前滚动位置在源映射数组中的索引
    let scrollIndex = -1;
    for (let i = 0; i < sourceList.length - 1; i++) {
      if (sourceEl.scrollTop >= sourceList[i] && sourceEl.scrollTop < sourceList[i + 1]) {
        scrollIndex = i;
        break;
      }
    }
    if (scrollIndex === -1) return; // 未找到匹配区间

    // 2. 计算在当前区间的滚动比例
    const sourceStart = sourceList[scrollIndex];
    const sourceEnd = sourceList[scrollIndex + 1];
    const ratio = (sourceEl.scrollTop - sourceStart) / (sourceEnd - sourceStart);

    // 3. 将比例应用到目标映射数组，计算出目标滚动位置
    const targetStart = targetList[scrollIndex];
    const targetEnd = targetList[scrollIndex + 1];
    const targetScrollTop = targetStart + (targetEnd - targetStart) * ratio;

    // 4. 应用滚动
    targetEl.scrollTop = targetScrollTop;
  }
}
```

### 2.2 `useSyncScroll` Composable 的实现

```typescript
import { watch, onUnmounted } from 'vue';
import { useEditorStore } from '@/store/useEditorStore';
import { storeToRefs } from 'pinia';
import type { EditorView } from '@codemirror/view';

// ... 上面定义的 ScrollSynchronizer 类 ...

export function useSyncScroll() {
  const editorStore = useEditorStore();
  const { editorView, previewContainer, isSyncScroll, currentScrollContainer } = storeToRefs(editorStore);
  const synchronizer = new ScrollSynchronizer();

  const handleEditorScroll = () => {
    if (!isSyncScroll.value || !editorView.value || !previewContainer.value || currentScrollContainer.value === 'preview') return;
    synchronizer.handleEditorScroll(editorView.value, previewContainer.value);
  };

  const handlePreviewScroll = () => {
    if (!isSyncScroll.value || !editorView.value || !previewContainer.value || currentScrollContainer.value === 'editor') return;
    synchronizer.handlePreviewScroll(previewContainer.value, editorView.value);
  };
  
  const scrollTop = () => {
    if (!editorView.value || !previewContainer.value) return;
    synchronizer.handleScrollTop(editorView.value, previewContainer.value);
  }

  // 注册回到顶部函数到 Store
  editorStore.setScrollToTopFunction(scrollTop);

  // 监听 DOM 元素准备就绪
  watch([editorView, previewContainer], ([newEditorView, newPreviewContainer]) => {
    if (newEditorView && newPreviewContainer) {
      const editorScrollEl = newEditorView.scrollDOM;
      editorScrollEl.addEventListener('scroll', handleEditorScroll);
      newPreviewContainer.addEventListener('scroll', handlePreviewScroll);
      
      editorScrollEl.addEventListener('mouseenter', () => editorStore.setCurrentScrollContainer('editor'));
      newPreviewContainer.addEventListener('mouseenter', () => editorStore.setCurrentScrollContainer('preview'));
    }
  }, { immediate: true });

  // 清理副作用
  onUnmounted(() => {
    if (editorView.value) {
      editorView.value.scrollDOM.removeEventListener('scroll', handleEditorScroll);
      // ... 移除 mouseenter 监听
    }
    if (previewContainer.value) {
      previewContainer.value.removeEventListener('scroll', handlePreviewScroll);
      // ... 移除 mouseenter 监听
    }
  });
}
```

---

## 第三步：在 `Workspace.vue` 中启用

**文件**: `src/components/Workspace/workspace.vue`

*   这一步保持不变，在 `<script setup>` 中调用 `useSyncScroll();` 即可。

---

## 第四步：在 `StatusBar.vue` 中添加 UI

**文件**: `src/components/StatusBar/statusBar.vue`

*   这一步也保持不变，通过 `useEditorStore` 获取 `isSyncScroll`, `toggleSyncScroll`, `scrollToTop` 并绑定到 UI 控件上。

---

这个更详细的计划为您拆解了 `ScrollSynchronizer` 的内部逻辑，并展示了如何在 Vue Composable 中组织和调用它。

如果您对这份计划满意，**请切换到 "Act Mode"**，我将严格按照此计划为您创建和修改文件。
