# 图片上传功能实现计划

## 1. 功能需求分析

- **核心功能**：用户能够从本地选择图片文件，并将其插入到 Markdown 编辑器中。
- **交互流程**：
  1. 用户点击工具栏中的“图片”按钮，展开下拉菜单。
  2. 用户点击“上传图片”选项。
  3. 浏览器弹出文件选择对话框。
  4. 用户选择一个或多个图片文件。
  5. 图片被处理并转换为 Markdown 格式的图片链接。
  6. 格式化的内容被插入到编辑器当前光标位置。
- **技术方案**：为简化实现，初期采用 Base64 编码方式将图片直接嵌入到 Markdown 内容中。

## 2. 技术方案设计

### Base64 方案
- **优点**：
  - 实现简单，不依赖外部服务或后端。
  - 图片数据随 Markdown 内容一同保存，可移植性好。
- **缺点**：
  - Base64 编码会使图片体积增大约 33%。
  - 大量或大尺寸图片会导致 Markdown 文件过大，影响加载和渲染性能。

### 实现思路
1.  **触发上传**：通过动态创建一个 `<input type="file">` 元素并模拟点击来触发文件选择。
2.  **读取文件**：使用 `FileReader` API 读取用户选择的图片文件。
3.  **编码转换**：通过 `reader.readAsDataURL(file)` 将图片文件转换为 Base64 格式的 Data URL。
4.  **内容插入**：将生成的 Data URL 构造成 `![alt](data:image/png;base64,...)` 格式的 Markdown 图片语法，并插入到编辑器中。

## 3. 文件修改清单

1.  `src/config/toolbar/index.ts`：为“上传图片”工具栏项添加 `onClick` 事件处理器。
2.  `src/utils/imageUpload.ts` (新建)：封装图片上传的核心逻辑，包括文件读取和 Base64 转换。
3.  `src/config/toolbar/event.ts`：可能需要扩展或复用现有的 `insertContentEvent` 来处理图片插入。

## 4. 具体代码实现

### 步骤 1：创建图片上传工具函数 (`src/utils/imageUpload.ts`)

```typescript
import { insertContentEvent } from "@/config/toolbar/event";

/**
 * 将 File 对象转换为 Base64 字符串
 * @param file - 用户选择的图片文件
 * @returns - 返回一个包含 Base64 URL 和文件名的 Promise
 */
const fileToBase64 = (file: File): Promise<{ url: string; alt: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        alt: file.name,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * 处理图片上传的函数
 * 触发文件选择，读取文件，并将其插入编辑器
 */
export const handleImageUpload = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true; // 允许选择多个文件

  input.onchange = async (event) => {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        const { url, alt } = await fileToBase64(file);
        // 复用或创建一个新的事件来插入图片
        // 假设 insertContentEvent 可以处理图片类型
        insertContentEvent('image-link', { url, alt });
      } catch (error) {
        console.error('图片上传失败:', error);
        // 可以在此处添加用户提示
      }
    }
  };

  input.click();
};
```

### 步骤 2：更新工具栏配置 (`src/config/toolbar/index.ts`)

```typescript
// ... 导入 handleImageUpload
import { handleImageUpload } from '@/utils/imageUpload'; // 假设的路径

// ... 在 defaultToolbarsConfig 中找到图片项
{
    type: BaseToolbarType.IMAGE,
    title: "图片",
    icon: ImageIcon,
    listToolbar: [
        {
            type: BaseToolbarType.IMAGE_UPLOAD,
            title: "上传图片",
            // 添加 onClick 事件处理器
            onClick: handleImageUpload,
        },
        {
            type: BaseToolbarType.IMAGE_LINK,
            title: "图片链接",
            // ...
            onClick: () => insertContentEvent(BaseToolbarType.IMAGE_LINK),
        }
    ]
},
// ...
```

### 步骤 3：调整内容插入事件 (`src/config/toolbar/event.ts`)

检查 `insertContentEvent` 函数，确保它能正确处理图片链接的插入。可能需要调整 `src/utils/contentInsert.ts`。

```typescript
// src/utils/contentInsert.ts

// ...
// 在 getTemplate 函数中
    case BaseToolbarType.IMAGE_LINK:
      // 确保可以接收对象参数
      if (typeof payload === 'object' && payload.url) {
        return `![${payload.alt || ''}](${payload.url})\n`;
      }
      return `![alt](url)\n`;
// ...
```

## 5. 测试验证步骤

1.  **功能测试**：
    - 点击“上传图片”按钮，确认文件选择框能正常弹出。
    - 选择单个图片（如 `.jpg`, `.png`, `.gif`），确认图片能以 Base64 格式插入编辑器。
    - 选择多个图片，确认它们能被依次插入。
    - 测试取消文件选择，确认无任何操作发生，无错误抛出。
2.  **预览验证**：
    - 确认插入的 Base64 图片在预览区域能正常显示。
3.  **性能考量**：
    - 尝试上传一个较大的图片文件（如 > 2MB），观察编辑器的响应速度。
    - 记录下此时的性能表现，为后续优化（如图片压缩）提供依据。
4.  **边界测试**：
    - 尝试上传非图片文件，确认程序不会崩溃，并能优雅地处理错误（虽然 `accept="image/*"` 已做限制，但用户可手动更改）。

## 6. 可能遇到的问题和解决方案

- **问题**：Base64 字符串过长，导致性能问题。
  - **解决方案**：在 `fileToBase64` 中添加图片压缩逻辑。可以使用 `canvas` 在前端进行压缩后再转为 Base64。
- **问题**：用户体验不佳，上传过程没有提示。
  - **解决方案**：可以引入一个简单的加载状态或通知组件，在图片处理期间给予用户反馈。
- **问题**：代码复用性。
  - **解决方案**：确保逻辑封装良好，未来若要从 Base64 方案切换到服务器上传方案，只需替换 `handleImageUpload` 中的核心处理逻辑，而无需改动大量代码。
