# Vue Markdown 编辑器重构方案：配置驱动的动态布局系统

## 一、 引言

本项目旨在将当前的Vue Markdown编辑器重构为一个高度可配置、低耦合的现代化前端应用。通过借鉴业界优秀的React项目设计，我们将实现一个由中心化配置驱动的动态布局和工具栏系统。

本次重构的核心思想是：**UI由配置定义，逻辑由Store驱动，组件负责响应。**

---

## 二、 增强的状态层 (`store/toolbar.ts`)

状态层是所有逻辑的“大脑”。我们将使用Pinia来创建一个`toolbarStore`，它将统一管理所有与UI布局和工具栏相关的状态和行为。

```typescript
// src/store/toolbar.ts
import { defineStore } from 'pinia';
import { ref, shallowRef, type Component } from 'vue';

export const useToolbarStore = defineStore('toolbar', () => {
  // --- 核心状态 ---
  const isFullscreen = ref(false);
  const isEditorVisible = ref(true);
  const isPreviewVisible = ref(true);
  
  // --- 侧边栏容器状态 ---
  const isLeftSidebarVisible = ref(false);
  const leftSidebarComponent = shallowRef<Component | null>(null);
  const leftSidebarMark = ref<string | null>(null);
  
  const isRightSidebarVisible = ref(false);
  const rightSidebarComponent = shallowRef<Component | null>(null);
  const rightSidebarMark = ref<string | null>(null);

  // --- Actions ---

  function toggleFullscreen() { /* ... */ }
  function setWriteOnly() {
    isEditorVisible.value = true;
    isPreviewVisible.value = false;
  }
  function setPreviewOnly() {
    isEditorVisible.value = false;
    isPreviewVisible.value = true;
  }
  function setDefaultMode() {
    isEditorVisible.value = true;
    isPreviewVisible.value = true;
  }

  function setLeftSidebar(component: Component, mark: string) {
    if (leftSidebarMark.value === mark) {
      isLeftSidebarVisible.value = !isLeftSidebarVisible.value;
    } else {
      isLeftSidebarVisible.value = true;
      leftSidebarComponent.value = component;
      leftSidebarMark.value = mark;
    }
  }
  
  function setRightSidebar(component: Component, mark: string) {
    if (rightSidebarMark.value === mark) {
      isRightSidebarVisible.value = !isRightSidebarVisible.value;
    } else {
      isRightSidebarVisible.value = true;
      rightSidebarComponent.value = component;
      rightSidebarMark.value = mark;
    }
  }

  return {
    isFullscreen, isEditorVisible, isPreviewVisible,
    isLeftSidebarVisible, leftSidebarComponent, leftSidebarMark,
    isRightSidebarVisible, rightSidebarComponent, rightSidebarMark,
    toggleFullscreen, setWriteOnly, setPreviewOnly, setDefaultMode,
    setLeftSidebar, setRightSidebar
  };
});
```

---

## 三、 全新的配置层 (`config/toolbar/index.ts`)

这是本次重构的基石。我们将创建一个中心化的配置文件来定义整个工具栏的结构和行为。

```typescript
// src/config/toolbar/index.ts
import { markRaw, type Component } from 'vue';

// 导入需要用到的组件
import Directory from '@/components/Sidebar/Directory.vue';
import Help from '@/components/Sidebar/Help.vue';
import FullscreenButton from '@/components/Toolbar/buttons/FullscreenButton.vue';

// 定义配置项的接口
export interface ToolbarItemConfig {
  id: string;
  type: 'button' | 'divider' | 'component';
  title?: string;
  icon?: string; // SVG string or path
  // 对于复杂按钮，直接提供组件
  component?: Component;
  // 对于简单按钮，定义其行为
  action?: {
    type: 'storeAction' | 'sidebar';
    name: string; // store action 的名字
    payload?: any;
  };
}

// 默认工具栏配置
export const defaultToolbarConfig: ToolbarItemConfig[] = [
  // 模式一：组件驱动按钮 (用于有复杂内部逻辑的按钮)
  { id: 'fullscreen', type: 'component', component: markRaw(FullscreenButton) },
  
  { id: 'divider-1', type: 'divider' },

  // 模式二：Action驱动按钮 (用于触发简单store action的按钮)
  { id: 'write-only', type: 'button', title: '只写', action: { type: 'storeAction', name: 'setWriteOnly' } },
  { id: 'preview-only', type: 'button', title: '只读', action: { type: 'storeAction', name: 'setPreviewOnly' } },
  { id: 'default-mode', type: 'button', title: '默认', action: { type: 'storeAction', name: 'setDefaultMode' } },

  { id: 'divider-2', type: 'divider' },

  // 模式三：带Payload的Action按钮 (用于侧边栏等)
  { 
    id: 'directory', 
    type: 'button', 
    title: '目录', 
    action: { 
      type: 'sidebar', 
      name: 'setLeftSidebar', 
      payload: { component: markRaw(Directory), mark: 'directory' } 
    } 
  },
  { 
    id: 'help', 
    type: 'button', 
    title: '帮助', 
    action: { 
      type: 'sidebar', 
      name: 'setRightSidebar', 
      payload: { component: markRaw(Help), mark: 'help' } 
    } 
  },
];
```

---

## 四、 改造的视图层 (`components/Toolbar/Toolbar.vue`)

`Toolbar.vue`将不再包含任何写死的按钮，而是根据配置文件动态渲染。

```vue
<!-- src/components/Toolbar/Toolbar.vue -->
<script setup lang="ts">
import { defaultToolbarConfig, type ToolbarItemConfig } from '@/config/toolbar';
import { useToolbarStore } from '@/store/toolbar';
import ToolbarButton from './ToolbarButton.vue';
import ToolbarDivider from './ToolbarDivider.vue';

const store = useToolbarStore();

function handleAction(action: ToolbarItemConfig['action']) {
  if (!action) return;

  const { type, name, payload } = action;
  const storeAction = (store as any)[name];

  if (typeof storeAction !== 'function') return;

  if (type === 'storeAction') {
    storeAction();
  } else if (type === 'sidebar' && payload) {
    storeAction(payload.component, payload.mark);
  }
}
</script>

<template>
  <div class="toolbar-container">
    <template v-for="item in defaultToolbarConfig" :key="item.id">
      <!-- 渲染组件驱动的按钮 -->
      <component v-if="item.type === 'component'" :is="item.component" />
      
      <!-- 渲染Action驱动的按钮 -->
      <ToolbarButton
        v-else-if="item.type === 'button'"
        :title="item.title"
        :icon="item.icon"
        @click="handleAction(item.action)"
      />

      <!-- 渲染分割线 -->
      <ToolbarDivider v-else-if="item.type === 'divider'" />
    </template>
  </div>
</template>
```

---

## 五、 动态布局的实现 (`components/Workspace/workspace.vue`)

`Workspace.vue`将作为布局的最终响应者，它订阅store中的状态，并动态调整其子组件的渲染。

```vue
<!-- src/components/Workspace/workspace.vue -->
<script setup lang="ts">
import { useToolbarStore } from '@/store/toolbar';
import Editor from '@/components/Editor/Editor.vue';
import Preview from '@/components/Preview/Preview.vue';

const store = useToolbarStore();
</script>

<template>
  <div class="workspace-container" :class="{ 'is-fullscreen': store.isFullscreen }">
    <!-- 左侧边栏容器 -->
    <aside v-show="store.isLeftSidebarVisible" class="sidebar left-sidebar">
      <component :is="store.leftSidebarComponent" />
    </aside>

    <!-- 主工作区 -->
    <main class="main-content">
      <Editor v-if="store.isEditorVisible" />
      <Preview v-if="store.isPreviewVisible" />
    </main>

    <!-- 右侧边栏容器 -->
    <aside v-show="store.isRightSidebarVisible" class="sidebar right-sidebar">
      <component :is="store.rightSidebarComponent" />
    </aside>
  </div>
</template>
```

---

## 六、 结论

通过以上重构，我们将得到一个：
*   **高度可配置**：调整工具栏只需修改`config`文件。
*   **高度解耦**：UI、状态、配置三者分离，各司其职。
*   **易于维护和扩展**：添加新功能（无论是简单的按钮还是复杂的侧边栏）都变得非常清晰和简单。

这个方案为项目未来的健康发展奠定了坚实的架构基础。
