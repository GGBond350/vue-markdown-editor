# event.ts 和 hotkey.ts 实现计划

## 1. event.ts 实现步骤

`event.ts`主要负责处理编辑器的事件，包括拖拽上传图片和粘贴上传图片。以下是实现步骤：

### 步骤1：创建类型定义

首先，创建一个`event.d.ts`文件（或直接在`event.ts`中定义）：

```typescript
// src/extensions/codemirror/event.d.ts
export interface EventOptions {
  scrollWrapper?: 'editor' | 'preview' | null;
  eventExt?: any;
  onDragUpload?: (file: File, callback: (param: { url: string; alt?: string }) => void) => void;
  onPasteUpload?: (file: File, callback: (param: { url: string; alt?: string }) => void) => void;
}

export type Callback = (param: { url: string; alt?: string }) => void;
```

### 步骤2：实现ImageHandler类

这个类用于处理图片文件的上传和临时URL的创建与清理：

```typescript
// src/extensions/codemirror/event.ts
import { EditorView, ViewPlugin } from '@codemirror/view';
import { nanoid } from 'nanoid';
import type { EventOptions, Callback } from './event.d';

// 实例属性
// 提供销毁方法，同时有效避免全局 Url 的变量污染
class ImageHandler {
  private currentObjectURL: string | null = null;

  handleImageFile(
    file: File,
    view: EditorView,
    uploadCallback?: (file: File, callback: Callback) => void,
  ) {
    if (this.currentObjectURL) {
      URL.revokeObjectURL(this.currentObjectURL);
    }

    // 创建临时URL
    const temporaryUrl = URL.createObjectURL(file);
    this.currentObjectURL = temporaryUrl;
    const imageAlt = nanoid(8);

    // 插入临时图片用作预览
    const selection = view.state.selection.main;
    const content = `![${imageAlt}](${temporaryUrl})\n`;
    const insertPos = selection.from;

    view.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: content,
      },
      selection: {
        anchor: selection.from + content.length,
        head: selection.from + content.length,
      },
    });

    // 处理上传后的信息
    // 此回调函数内部提供返回的url，作为新图片的地址
    // 可选传递alt参数，作为图片的描述
    const handleCallback: Callback = (param: { url: string; alt?: string }) => {
      try {
        const newContent = `![${param.alt || imageAlt}](${param.url})\n`;

        // 计算需要替换的范围
        const doc = view.state.doc;
        const searchStr = content;
        const searchPos = doc.slice(insertPos, insertPos + searchStr.length).toString();
        if (searchPos === searchStr) {
          view.dispatch({
            changes: {
              from: insertPos,
              to: insertPos + searchStr.length,
              insert: newContent,
            },
          });
        }

        // 清理临时URL
        URL.revokeObjectURL(temporaryUrl);
        this.currentObjectURL = null;
      } catch (err) {
        console.error("上传图片URL替换失败:", err);
      }
    };

    // 执行上传回调
    if (uploadCallback) {
      uploadCallback(file, handleCallback);
    }
  }

  destroy() {
    if (this.currentObjectURL) {
      URL.revokeObjectURL(this.currentObjectURL);
    }
  }
}
```

### 步骤3：实现拖拽上传插件

```typescript
// 继续在event.ts中
// 创建拖拽插件
const createDropPhotoExtension = (onDragUpload?: EventOptions["onDragUpload"]) => {
  return ViewPlugin.fromClass(
    class {
      private handler: ImageHandler;
      private onDragOver: (e: DragEvent) => void;
      private onDrop: (e: DragEvent) => void;
      private view: EditorView;

      constructor(view: EditorView) {
        this.view = view;
        this.handler = new ImageHandler();

        this.onDragOver = (e: DragEvent) => e.preventDefault();
        this.onDrop = (e: DragEvent) => {
          e.preventDefault();
          const files = e.dataTransfer?.files;
          if (!files?.[0]?.type.startsWith("image/")) return;

          this.handler.handleImageFile(files[0], view, onDragUpload);
        };

        this.view.dom.addEventListener("dragover", this.onDragOver);
        this.view.dom.addEventListener("drop", this.onDrop);
      }

      destroy() {
        // 必须要移除事件监听，如果不移除的话会重复绑定
        this.view.dom.removeEventListener("dragover", this.onDragOver);
        this.view.dom.removeEventListener("drop", this.onDrop);
        this.handler.destroy();
      }
    },
  );
};
```

### 步骤4：实现粘贴上传插件

```typescript
// 继续在event.ts中
// 创建粘贴插件
const createPastePhotoExtension = (onPasteUpload?: EventOptions["onPasteUpload"]) => {
  return ViewPlugin.fromClass(
    class {
      private handler: ImageHandler;
      private onPaste: (e: ClipboardEvent) => void;
      private view: EditorView;

      constructor(view: EditorView) {
        this.view = view;
        this.handler = new ImageHandler();

        this.onPaste = (e: ClipboardEvent) => {
          const items = e.clipboardData?.items;
          if (!items) return;

          for (const item of items) {
            if (item.type.startsWith("image/")) {
              e.preventDefault();
              const file = item.getAsFile();
              if (file) {
                this.handler.handleImageFile(file, view, onPasteUpload);
                break;
              }
            }
          }
        };

        this.view.dom.addEventListener("paste", this.onPaste);
      }

      destroy() {
        // 必须要移除事件监听，如果不移除的话会重复绑定
        this.view.dom.removeEventListener("paste", this.onPaste);
        this.handler.destroy();
      }
    },
  );
};
```

### 步骤5：实现主事件扩展函数

```typescript
// 继续在event.ts中
export const createEventExtension = (eventOptions: EventOptions = {}): any => {
  const { scrollWrapper = 'editor', eventExt, onDragUpload, onPasteUpload } = eventOptions;
  
  if (scrollWrapper !== "editor") {
    return [];
  }

  return [
    eventExt,
    createDropPhotoExtension(onDragUpload),
    createPastePhotoExtension(onPasteUpload),
  ].filter(Boolean);
};
```

## 2. hotkey.ts 实现步骤

`hotkey.ts`负责处理编辑器的快捷键，包括Markdown格式化快捷键。以下是实现步骤：

### 步骤1：创建工具栏项目类型

首先，创建一个工具栏项目类型（可以放在单独的文件中，如`src/types/toolbar.ts`）：

```typescript
// src/types/toolbar.ts
export interface ToolbarItem {
  name: string;
  icon?: string;
  title?: string;
  hotkey?: string;
  handler?: (view: any) => boolean;
}
```

### 步骤2：创建处理快捷键的工具函数

创建一个工具函数来处理快捷键映射（可以放在单独的文件中，如`src/utils/handle-hotkeys.ts`）：

```typescript
// src/utils/handle-hotkeys.ts
import { EditorView } from '@codemirror/view';
import type { ToolbarItem } from '../types/toolbar';

export function handleHotkeys(toolbars: ToolbarItem[]) {
  const keyMap: Record<string, { run: (view: EditorView) => boolean }> = {};

  toolbars.forEach((item) => {
    if (item.hotkey && item.handler) {
      keyMap[item.hotkey] = {
        run: item.handler,
      };
    }
  });

  return keyMap;
}
```

### 步骤3：实现快捷键扩展函数

```typescript
// src/extensions/codemirror/hotkey.ts
import { Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { handleHotkeys } from '../../utils/handle-hotkeys';
import type { ToolbarItem } from '../../types/toolbar';

export function createHotkeysExtension(toolbars: ToolbarItem[] = []): Extension {
  const KEY_MAP = handleHotkeys(toolbars);
  
  return keymap.of([
    ...Object.entries(KEY_MAP).map(([key, value]) => ({
      key,
      ...value,
    })),
  ]);
}
```

### 步骤4：创建默认工具栏配置（可选）

如果需要默认的工具栏配置，可以创建一个配置文件：

```typescript
// src/config/toolbar.ts
import { EditorView } from '@codemirror/view';
import type { ToolbarItem } from '../types/toolbar';

// 加粗处理函数示例
function handleBold(view: EditorView): boolean {
  const selection = view.state.selection.main;
  const selectedText = view.state.sliceDoc(selection.from, selection.to);
  
  const newText = selectedText ? `**${selectedText}**` : '**粗体文本**';
  
  view.dispatch({
    changes: {
      from: selection.from,
      to: selection.to,
      insert: newText
    },
    selection: {
      anchor: selection.from + (selectedText ? 2 : 0),
      head: selection.from + newText.length - (selectedText ? 2 : 0)
    }
  });
  
  return true;
}

// 更多处理函数...

export const defaultToolbars: ToolbarItem[] = [
  {
    name: 'bold',
    title: '加粗',
    hotkey: 'Mod-b',
    handler: handleBold
  },
  // 更多工具栏项目...
];

export const toolbarConfig = {
  getAllToolbars: () => defaultToolbars
};
```

## 3. 将这些扩展整合到index.ts中

最后，在`index.ts`中整合所有扩展：

```typescript
// src/extensions/codemirror/index.ts
import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { history } from '@codemirror/commands';
import { createMarkdownExtension } from './markdown';
import { createEventExtension } from './event';
import { createHotkeysExtension } from './hotkey';
import type { EventOptions } from './event.d';
import type { ToolbarItem } from '../../types/toolbar';

export interface ExtensionOptions extends EventOptions {
  enableShortcuts?: boolean;
  toolbars?: ToolbarItem[];
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

## 4. 在useEditorState中使用这些扩展

最后，在`useEditorState.ts`中使用这些扩展：

```typescript
// 在useEditorState.ts中
import { createEditorExtensions } from '../extensions/codemirror';
import { defaultToolbars } from '../config/toolbar'; // 如果你创建了默认工具栏配置

// 在initEditor函数中
const extensions = createEditorExtensions({
  scrollWrapper: currentScrollContainer.value,
  enableShortcuts: true,
  toolbars: defaultToolbars, // 或者从选项中传入
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
```

## 注意事项

1. 需要安装`nanoid`包用于生成唯一ID：`npm install nanoid`
2. 确保所有CodeMirror相关包都使用6.x版本
3. 根据实际需求调整工具栏配置和快捷键处理函数
4. 如果需要更复杂的滚动同步功能，可以在event.ts中添加相关代码
