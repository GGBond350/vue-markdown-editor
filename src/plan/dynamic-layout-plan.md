# 动态工作区布局实现方案

本文档详细阐述了如何将静态的编辑器布局，升级为一个功能强大、可由用户控制的动态工作区。用户将能够通过按钮自由显示或隐藏目录、帮助、编辑区和预览区等面板。

## 核心实现思路

我们将采用现代前端框架中经典的 **“状态驱动UI”** 模式。其核心思想是：

1.  **单一数据源 (Single Source of Truth)**: 在一个全局的状态管理器（Pinia Store）中，定义所有面板的可见性状态（`true`或`false`）。
2.  **UI响应状态**: 界面的各个部分（DOM元素）通过指令（如`v-show`）来“订阅”这些状态。当状态改变时，UI会自动更新。
3.  **CSS处理布局变化**: 我们将利用CSS Grid的先进特性，让布局能够自动、平滑地适应DOM元素的变化（显示或隐藏），而无需编写复杂的JavaScript来手动计算样式。

我们将通过以下三步来实现这个方案。

---

## 第一步：在Pinia Store中定义状态

我们需要一个集中的地方来管理所有面板的可见性。扩展现有的`toolbarStore`是最佳选择。

**文件**: `src/store/toolbar.ts`

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToolbarStore = defineStore('toolbar', () => {
  // 已有的 isFullscreen 状态
  const isFullscreen = ref(false);

  // --- 新增的状态，用于控制各面板的可见性 ---
  const isTocVisible = ref(true); // 目录默认可见
  const isHelpVisible = ref(true); // 帮助默认可见
  const isEditorVisible = ref(true); // 编辑区默认可见
  const isPreviewVisible = ref(true); // 预览区默认可见

  // --- 新增的 Actions，用于给工具栏按钮调用 ---
  function toggleToc() {
    isTocVisible.value = !isTocVisible.value;
  }
  function toggleHelp() {
    isHelpVisible.value = !isHelpVisible.value;
  }
  function toggleEditor() {
    isEditorVisible.value = !isEditorVisible.value;
  }
  function togglePreview() {
    isPreviewVisible.value = !isPreviewVisible.value;
  }

  return {
    isFullscreen,
    isTocVisible,
    isHelpVisible,
    isEditorVisible,
    isPreviewVisible,
    toggleToc,
    toggleHelp,
    toggleEditor,
    togglePreview,
  };
});
```

---

## 第二步：在Workspace.vue中连接状态与模板

接下来，我们在`Workspace.vue`中获取这些状态，并使用`v-show`指令将它们与对应的面板DOM元素绑定。

**文件**: `src/components/Workspace/workspace.vue`

```vue
<script setup lang="ts">
import { useToolbarStore } from '@/store/toolbar';
import { storeToRefs } from 'pinia';
// ... 其他组件的导入

const toolbarStore = useToolbarStore();
// 使用 storeToRefs 来解构store中的状态，同时保持其响应性
const { isTocVisible, isHelpVisible, isEditorVisible, isPreviewVisible } = storeToRefs(toolbarStore);
</script>

<template>
  <div class="workspace-grid">
    <div class="grid-item toolbar-area">
      <Toolbar />
    </div>
    
    <!-- 使用 v-show 指令根据状态来控制面板的显示或隐藏 -->
    <div v-show="isTocVisible" class="grid-item directory-area">
      <Directory />
    </div>
    
    <div v-show="isEditorVisible" class="grid-item editor-area">
      <Editor />
    </div>
    
    <div v-show="isPreviewVisible" class="grid-item preview-area">
      <Preview />
    </div>
    
    <div v-show="isHelpVisible" class="grid-item help-area">
      <Help />
    </div>
    
    <div class="grid-item statusbar-area">
      <StatusBar />
    </div>  
  </div>
</template>
```

---

## 第三步：升级CSS Grid以支持动态布局

这是实现优雅动态布局最关键的一步。我们修改Grid的列定义，使其能够自动适应面板的显示与隐藏。

**文件**: `src/components/Workspace/workspace.vue`

```css
<style scoped>
.workspace-grid {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-rows: auto 1fr auto;
  
  /* --- 关键修改：使用minmax()函数定义列宽 --- */
  grid-template-columns: 
    minmax(0, 0.8fr)  /* 目录区: 最小宽度0，理想宽度0.8fr */
    minmax(0, 1.2fr)  /* 编辑区: 最小宽度0，理想宽度1.2fr */
    minmax(0, 1.2fr)  /* 预览区: 最小宽度0，理想宽度1.2fr */
    minmax(0, 0.8fr); /* 帮助区: 最小宽度0，理想宽度0.8fr */

  grid-template-areas: 
    "toolbar toolbar toolbar toolbar"
    "left editor preview right"
    "statusbar statusbar statusbar statusbar";
  gap: 10px;
  padding: 10px;    
}
/* ... 其他样式保持不变 ... */
</style>
```

### `minmax(0, Xfr)` 工作原理解析

-   当一个Grid项被`v-show="false"`设置为`display: none`时，它在Grid布局中的存在会被“忽略”，其占据空间的**最小宽度会收缩为0**。
-   `minmax(0, 0.8fr)`定义了这一列的宽度下限是`0`，理想状态下的宽度是`0.8`个分数单位(`fr`)。
-   当目录面板被隐藏时，其对应的列宽会自动收缩到`0`。
-   最关键的是，CSS Grid会自动将剩余的`fr`单位（例如`1.2fr + 1.2fr + 0.8fr`）按比例重新分配给其他**仍然可见**的列，使它们平滑地填满整个工作区的宽度。

## 总结

通过以上三步，我们构建了一个强大、灵活且代码优雅的动态布局系统。整个布局的响应式调整完全由CSS Grid自动处理，无需编写任何复杂的JavaScript代码来手动计算和修改样式。开发者只需要在对应的按钮上调用Pinia Store中定义的`toggle`方法，即可轻松控制工作区的布局。
