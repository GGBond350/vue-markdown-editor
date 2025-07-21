# 复盘：同步滚动中的“抖动” (Jittering) 问题

## 一、问题现象

在实现了编辑器（Editor）与预览区（Preview）的双向同步滚动后，出现了一个新的问题：当滚动其中一个区域时，两个区域的滚动条会发生快速、来回的“抖动”或“振荡”，导致滚动体验非常糟糕。

## 二、问题根源：无限事件循环 (Infinite Event Loop)

“抖动”问题的根源在于一个设计不当导致的**无限事件反馈循环**。

其发生过程如下：

1.  用户**手动滚动**编辑器（Editor）。
2.  触发 Editor 的 `scroll` 事件，调用 `handleEditorScroll` 函数。
3.  `handleEditorScroll` 函数通过编程方式（`element.scrollTop = ...`）**滚动**了预览区（Preview）。
4.  **问题的关键点**：由程序触发的滚动同样会触发 `scroll` 事件。因此，Preview 的 `scroll` 事件被触发了。
5.  触发 Preview 的 `scroll` 事件，调用 `handlePreviewScroll` 函数。
6.  `handlePreviewScroll` 函数反过来又通过编程方式**滚动**了编辑器（Editor）。
7.  编辑器被程序滚动，再次触发了它自己的 `scroll` 事件...

这个 **Editor 滚动 -> Preview 滚动 -> Editor 滚动 -> ...** 的过程形成了一个没有出口的死循环。由于这个循环执行得非常快，在视觉上就表现为两个滚动条在互相“推挤”，产生了抖动。

## 三、解决方案：使用“状态锁”打破事件循环

要解决这个问题，我们必须在事件处理链路中打破这个循环。最优雅的解决方案是引入一个“状态锁”，来区分**用户的“主动”滚动**和**程序的“被动”滚动**。

我们利用已经存在的 `currentScrollContainer` 这个 state (`'editor' | 'preview' | null`) 作为我们的“状态锁”。

**核心逻辑是：只允许当前鼠标所在的、由用户“主动”滚动的那个区域去触发同步逻辑。**

### 1. 实现步骤

我们需要在**两个**滚动事件处理器中都加入一个**守卫条件 (Guard Clause)**。

**在 `useEditor.ts` 中 (处理编辑器滚动):**

```typescript
const scrollEventExt = EditorView.domEventHandlers({
  scroll: (event, view) => {
    // 守卫条件：只有当鼠标在编辑器区域 (`currentScrollContainer === 'editor'`) 时，才执行同步。
    if (currentScrollContainer.value !== 'editor' || !isSyncScroll.value || !previewContainer.value) {
      return; // 提前退出，打破循环
    }
    // 执行同步逻辑
    handleEditorScroll(view, previewContainer.value);
  }
});
```

**在 `usePreview.ts` 或 `Preview.vue` 中 (处理预览区滚动):**

```typescript
const handleScroll = (event: Event) => {
  // 守卫条件：只有当鼠标在预览区域 (`currentScrollContainer === 'preview'`) 时，才执行同步。
  if (currentScrollContainer.value !== 'preview' || !isSyncScroll.value || !editorView.value) {
    return; // 提前退出，打破循环
  }
  // 执行同步逻辑
  handlePreviewScroll(event.target as HTMLElement, editorView.value);
};
```

### 2. 为什么这样修改就解决了问题？

让我们重新审视一下事件流程：

1.  用户将鼠标移入 **Editor** 区域，`@mouseenter` 事件触发，`currentScrollContainer` 的值被设置为 `'editor'`。
2.  用户**手动滚动 Editor**。
3.  Editor 的 `scroll` 事件触发。守卫条件 `currentScrollContainer.value !== 'editor'` **不成立**，程序继续执行，滚动了 Preview。
4.  Preview 被程序滚动，触发了它自己的 `scroll` 事件。
5.  在 Preview 的事件处理器中，守卫条件 `currentScrollContainer.value !== 'preview'` **成立** (因为当前值仍然是 `'editor'`)，因此函数直接 `return`。
6.  **循环被打破。**

反之，当用户在 Preview 区域滚动时，逻辑完全对称，同样能有效打破循环。

## 四、相关知识拓展

### 1. 事件循环与反馈抑制 (Event Loop & Feedback Suppression)

这个问题是前端开发中一个典型的“事件反馈”问题。在任何需要双向数据绑定或状态同步的场景（例如：两个滑块互相影响、颜色选择器和输入框同步），都可能遇到类似的问题。

解决方案的核心思想都是**反馈抑制**或**循环中断**。常见的方法有：

*   **状态锁 (State Locking)**：如此次我们使用的 `currentScrollContainer`，通过一个状态来标识事件的“来源”，从而决定是否执行响应。
*   **防抖/节流 (Debounce/Throttle)**：虽然不能从根本上解决循环，但可以通过延迟或减少事件处理频率来极大地减轻抖动现象，在某些要求不高的场景下是一种简易的解决方案。
*   **临时解绑事件 (Temporary Detach)**：在执行程序化操作之前，先用 `removeEventListener` 解绑对方的事件监听，操作完成后再用 `addEventListener` 重新绑定。这种方法比较“重”，代码也更复杂，通常不作为首选。

### 2. 区分用户事件与程序事件

在复杂的交互中，区分一个事件是由用户真实操作（如点击、滚动）触发，还是由代码（如 `element.click()`、`element.scrollTop = ...`）触发，是一个非常重要的能力。

*   **`event.isTrusted`**: 这是一个非常有用的事件属性。如果事件是由用户直接操作触发的，`event.isTrusted` 的值为 `true`。如果事件是由 JavaScript 代码创建或派发的，它的值为 `false`。在某些场景下，可以直接用 `if (!event.isTrusted) return;` 来忽略所有由程序触发的事件。但它并不适用于所有情况，比如我们的滚动场景，因为程序化设置 `scrollTop` 产生的 `scroll` 事件，其 `isTrusted` 属性通常仍然是 `true`。
*   **状态管理**：如此次我们所做的，通过一个外部状态来管理和判断事件的上下文，是更可靠、更通用的解决方案。
