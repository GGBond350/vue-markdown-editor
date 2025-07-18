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

## 第二步：创建 `ScrollSynchronizer` 工具类

**文件**: `src/utils/ScrollSynchronizer.ts`

这一步将纯粹的、与框架无关的滚动同步逻辑封装在一个独立的类中，以提高代码的可复用性和可测试性。

*   **职责**: 包含所有核心计算逻辑，如高度映射、比例滚动等。
*   **实现**:
    *   创建一个 `ScrollSynchronizer` 类。
    *   将 React 版本 `handle-scroll.ts` 中的所有方法 (`computeHeightMapping`, `synchronizeScroll`, `performProportionalScroll` 等) 移植到这个类中。
    *   确保该文件不包含任何 Vue 特有的 API (如 `ref`, `watch`)。
    *   导出这个类 `export class ScrollSynchronizer { ... }`。

```typescript
// src/utils/ScrollSynchronizer.ts
import type { EditorView } from '@codemirror/view';

export class ScrollSynchronizer {
  // 属性 (Properties)
  private readonly editorElementList: number[] = [];
  private readonly previewElementList: number[] = [];
  private static readonly BOTTOM_THRESHOLD = 1; // px

  // --- 核心公共方法 ---
  public handleEditorScroll(editorView: EditorView, previewView: HTMLElement): void {
    this.computeHeightMapping({ editorView, previewView });
    this.synchronizeScroll("editor", { editorView, previewView });
  }

  public handlePreviewScroll(previewView: HTMLElement, editorView: EditorView): void {
    this.computeHeightMapping({ editorView, previewView });
    this.synchronizeScroll("preview", { editorView, previewView });
  }

  public handleScrollTop(editorView: EditorView, previewView: HTMLElement): void {
    editorView.scrollDOM.scrollTo({ top: 0, behavior: 'smooth' });
    previewView.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- 内部实现细节 (Private Methods) ---
  private computeHeightMapping({ previewView, editorView }: { previewView: HTMLElement, editorView: EditorView }): void {
    this.editorElementList.length = 0;
    this.previewElementList.length = 0;
    const validNodes = Array.from(previewView.children).filter(node => node.hasAttribute('data-line'));
    validNodes.forEach(node => {
      const element = node as HTMLElement;
      const lineNumber = Number(element.dataset.line);
      if (!lineNumber) return;
      const lineInfo = editorView.state.doc.line(lineNumber);
      if (!lineInfo) return;
      const blockInfo = editorView.lineBlockAt(lineInfo.from);
      this.editorElementList.push(blockInfo.top);
      this.previewElementList.push(element.offsetTop);
    });
  }

  private synchronizeScroll(source: "editor" | "preview", { editorView, previewView }: { previewView: HTMLElement, editorView: EditorView }): void {
    const sourceEl = source === 'editor' ? editorView.scrollDOM : previewView;
    const targetEl = source === 'editor' ? previewView : editorView.scrollDOM;
    if (sourceEl.scrollTop <= 0) {
      targetEl.scrollTop = 0;
      return;
    }
    if (sourceEl.scrollTop + sourceEl.clientHeight + ScrollSynchronizer.BOTTOM_THRESHOLD >= sourceEl.scrollHeight) {
      targetEl.scrollTop = targetEl.scrollHeight - targetEl.clientHeight;
      return;
    }
    this.performProportionalScroll(sourceEl, targetEl, source);
  }

  private performProportionalScroll(sourceEl: Element, targetEl: Element, source: "editor" | "preview"): void {
    const sourceList = source === "editor" ? this.editorElementList : this.previewElementList;
    const targetList = source === "editor" ? this.previewElementList : this.editorElementList;
    let scrollIndex = -1;
    for (let i = 0; i < sourceList.length - 1; i++) {
      if (sourceEl.scrollTop >= sourceList[i] && sourceEl.scrollTop < sourceList[i + 1]) {
        scrollIndex = i;
        break;
      }
    }
    if (scrollIndex === -1) return;
    const sourceStart = sourceList[scrollIndex];
    const sourceEnd = sourceList[scrollIndex + 1];
    const ratio = (sourceEl.scrollTop - sourceStart) / (sourceEnd - sourceStart);
    const targetStart = targetList[scrollIndex];
    const targetEnd = targetList[scrollIndex + 1];
    const targetScrollTop = targetStart + (targetEnd - targetStart) * ratio;
    targetEl.scrollTop = targetScrollTop;
  }
}
```

---

## 第三步：创建 `useSyncScroll.ts` Composable

**文件**: `src/composables/useSyncScroll.ts`

这个 Composable 作为“连接器”，将 Vue 的响应式系统与 `ScrollSynchronizer` 工具类连接起来。

*   **职责**:
    1.  导入 `ScrollSynchronizer` 类并实例化。
    2.  从 `useEditorStore` 获取响应式状态 (`isSyncScroll`, `editorView` 等)。
    3.  设置 `watch` 来监听 DOM 元素是否就绪。
    4.  在 `watch` 回调中，为 DOM 元素绑定滚动和鼠标事件处理器。
    5.  创建事件处理器 (`handleEditorScroll` 等)，在内部调用 `synchronizer` 实例的相应方法。
    6.  使用 `onUnmounted` 清理所有事件监听器。
*   **实现**:

```typescript
// src/composables/useSyncScroll.ts
import { watch, onUnmounted } from 'vue';
import { useEditorStore } from '@/store/useEditorStore';
import { storeToRefs } from 'pinia';
import { ScrollSynchronizer } from '@/utils/ScrollSynchronizer';

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

  editorStore.setScrollToTopFunction(scrollTop);

  watch([editorView, previewContainer], ([newEditorView, newPreviewContainer]) => {
    if (newEditorView && newPreviewContainer) {
      const editorScrollEl = newEditorView.scrollDOM;
      const previewScrollEl = newPreviewContainer;

      editorScrollEl.addEventListener('scroll', handleEditorScroll);
      previewScrollEl.addEventListener('scroll', handlePreviewScroll);
      
      editorScrollEl.addEventListener('mouseenter', () => editorStore.setCurrentScrollContainer('editor'));
      previewScrollEl.addEventListener('mouseenter', () => editorStore.setCurrentScrollContainer('preview'));

      onUnmounted(() => {
        editorScrollEl.removeEventListener('scroll', handleEditorScroll);
        previewScrollEl.removeEventListener('scroll', handlePreviewScroll);
        editorScrollEl.removeEventListener('mouseenter', () => editorStore.setCurrentScrollContainer('editor'));
        previewScrollEl.removeEventListener('mouseenter', () => editorStore.setCurrentScrollContainer('preview'));
      }, newEditorView.dom); // 将 onUnmounted 绑定到 EditorView 的生命周期
    }
  }, { immediate: true });
}
```

---

## 第四步：在 `Workspace.vue` 中启用

**文件**: `src/components/Workspace/workspace.vue`

*   这一步保持不变，在 `<script setup>` 中调用 `useSyncScroll();` 即可。

---

## 第五步：在 `StatusBar.vue` 中添加 UI

**文件**: `src/components/StatusBar/statusBar.vue`

*   这一步也保持不变，通过 `useEditorStore` 获取 `isSyncScroll`, `toggleSyncScroll`, `scrollToTop` 并绑定到 UI 控件上。

---

这个更详细的计划为您拆解了 `ScrollSynchronizer` 的内部逻辑，并展示了如何在 Vue Composable 中组织和调用它。

如果您对这份计划满意，**请切换到 "Act Mode"**，我将严格按照此计划为您创建和修改文件。
