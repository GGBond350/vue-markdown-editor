# CodeMirror扩展处理方案

## React版本的扩展处理方式

React版本使用了一个名为`createEditorExtensions`的函数来组织和管理所有扩展：

```typescript
// extensions/codemirror/index.ts
export const createEditorExtensions = (options: ExtensionOptions): Extension[] => {
  const {
    scrollWrapper = "editor",
    eventExt,
    enableShortcuts,
    onDragUpload,
    onPasteUpload,
  } = options;

  // 创建基础扩展数组
  const extensions: Extension[] = [
    createMarkdownExtension(),
    createEventExtension({ scrollWrapper, eventExt, onDragUpload, onPasteUpload }),
    history(),
    EditorView.lineWrapping,
  ];

  // 是否开启快捷键支持
  if (enableShortcuts) {
    extensions.push(createHotkeysExtension(options.toolbars!));
  }

  return extensions;
};
```

这个函数将不同类型的扩展组织在一起：

1. **Markdown扩展**：提供Markdown语法支持
   ```typescript
   // extensions/codemirror/markdown.ts
   export const createMarkdownExtension = (): Extension => {
     return markdown({
       base: markdownLanguage,
       codeLanguages: languages,
     });
   };
   ```

2. **事件扩展**：处理滚动同步、拖拽上传和粘贴上传
   ```typescript
   // extensions/codemirror/event.ts
   export const createEventExtension = (eventOptions: EventOptions): any => {
     if (eventOptions.scrollWrapper !== "editor") {
       return [];
     }

     return [
       eventOptions.eventExt,
       createDropPhotoExtension(eventOptions.onDragUpload),
       createPastePhotoExtension(eventOptions.onPasteUpload),
     ].filter(Boolean);
   };
   ```

3. **快捷键扩展**：提供Markdown编辑快捷键
   ```typescript
   // extensions/codemirror/hotkeys.tsx
   export function createHotkeysExtension(toolbars: ToolbarItem[]): Extension {
     const KEY_MAP = handleHotkeys(toolbars);
     return keymap.of([
       ...Object.entries(KEY_MAP).map(([key, value]) => ({
         key,
         ...value,
       })),
     ]);
   }
   ```

React版本使用了`@uiw/react-codemirror`包，这是一个CodeMirror的React封装，并且所有的CodeMirror相关包都使用了版本6.x。

## Vue版本实现建议

基于React版本的实现和您遇到的版本冲突问题，以下是Vue版本实现的建议：

### 1. 统一使用CodeMirror 6.x版本

首先，确保只使用CodeMirror 6.x版本的相关包，移除0.20.x版本：

```bash
# 移除旧版本
npm uninstall @codemirror/basic-setup

# 确保使用6.x版本
npm install @codemirror/state@6 @codemirror/view@6 @codemirror/commands@6 @codemirror/language@6
```

### 2. 创建类似的扩展组织结构

在Vue项目中创建类似的扩展组织结构：

```
src/
  extensions/
    codemirror/
      index.ts       # 主扩展创建函数
      markdown.ts    # Markdown扩展
      event.ts       # 事件扩展（滚动、拖拽、粘贴）
      hotkeys.ts     # 快捷键扩展
```

### 3. 实现扩展创建函数

在`src/extensions/codemirror/index.ts`中实现主扩展创建函数：

```typescript
import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { history } from '@codemirror/commands';
import { createMarkdownExtension } from './markdown';
import { createEventExtension } from './event';
import { createHotkeysExtension } from './hotkeys';

export interface ExtensionOptions {
  scrollWrapper?: 'editor' | 'preview' | null;
  eventExt?: any;
  enableShortcuts?: boolean;
  toolbars?: any[];
  onDragUpload?: (file: File, callback: (param: { url: string; alt?: string }) => void) => void;
  onPasteUpload?: (file: File, callback: (param: { url: string; alt?: string }) => void) => void;
}

export const createEditorExtensions = (options: ExtensionOptions = {}): Extension[] => {
  const {
    scrollWrapper = 'editor',
    eventExt,
    enableShortcuts = false,
    toolbars = [],
    onDragUpload,
    onPasteUpload,
  } = options;

  // 创建基础扩展数组
  const extensions: Extension[] = [
    createMarkdownExtension(),
    createEventExtension({ scrollWrapper, eventExt, onDragUpload, onPasteUpload }),
    history(),
    EditorView.lineWrapping,
  ];

  // 是否开启快捷键支持
  if (enableShortcuts && toolbars.length > 0) {
    extensions.push(createHotkeysExtension(toolbars));
  }

  return extensions;
};
```

### 4. 实现各个扩展函数

然后实现各个扩展函数，例如Markdown扩展：

```typescript
// src/extensions/codemirror/markdown.ts
import { Extension } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';

export const createMarkdownExtension = (): Extension => {
  return markdown({
    codeLanguages: languages
  });
};
```

### 5. 修改useEditorState.ts

在`useEditorState.ts`中使用这些扩展：

```typescript
import { ref, shallowRef, watch } from 'vue';
import { EditorState } from '@codemirror/state';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { createEditorExtensions } from '../extensions/codemirror';
import { useEditorContent } from './useEditorContent';

export function useEditorState(options = {}) {
  const {
    defaultContent = '',
    persistContent = true,
    onChange = () => {},
    enableShortcuts = false,
    toolbars = [],
  } = options;

  // 使用内容管理组合式函数
  const { content, setContent } = useEditorContent({
    defaultContent,
    persistContent
  });

  // 编辑器状态
  const editorView = shallowRef<EditorView | null>(null);
  const editorContainer = shallowRef<HTMLElement | null>(null);
  
  // 滚动同步状态
  const currentScrollContainer = shallowRef<'editor' | 'preview' | null>(null);
  const previewElement = shallowRef<HTMLElement | null>(null);
  
  // 初始化编辑器
  const initEditor = (el: HTMLElement | null) => {
    if (!el) {
      console.error('编辑器容器元素未提供');
      return;
    }
    
    editorContainer.value = el;
    
    // 创建编辑器扩展
    const extensions = createEditorExtensions({
      scrollWrapper: currentScrollContainer.value,
      enableShortcuts,
      toolbars,
      onDragUpload: options.onDragUpload,
      onPasteUpload: options.onPasteUpload,
    });
    
    // 创建编辑器状态
    const state = EditorState.create({
      doc: content.value,
      extensions: [
        ...extensions,
        EditorView.updateListener.of((update: ViewUpdate) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            setContent(newContent);
            onChange(newContent, update);
          }
        }),
      ]
    });
    
    // 创建编辑器视图
    editorView.value = new EditorView({
      state,
      parent: el
    });
  };
  
  // 其他方法...
  
  return {
    // 状态和方法...
  };
}
```

### 6. 实现事件和快捷键扩展

根据需要实现事件扩展和快捷键扩展，参考React版本的实现。

## 总结

React版本的CodeMirror扩展处理采用了模块化的方式，将不同类型的扩展分离到不同的文件中，然后通过一个统一的函数组合它们。这种方式有以下优点：

1. **模块化**：每种扩展都有自己的文件，便于维护
2. **可扩展性**：可以轻松添加新的扩展
3. **配置灵活**：通过选项对象可以灵活配置扩展

在Vue版本中，我们可以采用类似的方式，但需要确保使用统一版本的CodeMirror包，避免版本冲突问题。
