# 输出功能实现计划

## 1. 功能需求分析

- **核心功能**：用户能够将编辑器中的内容导出为不同格式的文件。
- **支持格式**：
  - Markdown (`.md`)：导出原始的 Markdown 文本。
  - HTML (`.html`)：将 Markdown 内容解析并渲染为包含样式的 HTML 文件。
- **交互流程**：
  1. 用户点击工具栏新增的“导出”按钮。
  2. 弹出一个下拉菜单，显示可导出的格式选项（如“导出为 Markdown”，“导出为 HTML”）。
  3. 用户选择一个格式。
  4. 程序生成相应格式的内容，并触发浏览器下载。

## 2. 技术方案设计

### 文件下载实现
- 利用 `<a>` 标签的 `download` 属性来触发浏览器下载。
- 通过 `URL.createObjectURL` 创建一个指向内存中 Blob 数据的 URL。

### 导出 Markdown
- **逻辑**：直接获取编辑器当前的全量内容。
- **实现**：创建一个包含编辑器内容的 Blob 对象，类型为 `text/markdown`。

### 导出 HTML
- **逻辑**：
  1. 获取编辑器内容。
  2. 使用你自研的 Markdown 解析器将内容转换为 HTML 字符串。
  3. （可选）为了美观，可以嵌入一些基础的 CSS 样式。
- **实现**：创建一个包含完整 HTML 结构（包括 `<html>`, `<head>`, `<body>` 和样式）的 Blob 对象，类型为 `text/html`。

## 3. 文件修改清单

1.  `src/config/toolbar/index.ts`：在工具栏配置中新增“导出”按钮及其下拉列表。
2.  `src/utils/export.ts` (新建)：封装文件导出的核心逻辑。
3.  `src/assets/images/output.svg` (可能需新建)：为导出按钮提供一个图标。
4.  `src/parser/...`：需要确保你的解析器可以被调用并返回 HTML 字符串。

## 4. 具体代码实现

### 步骤 1：创建导出工具函数 (`src/utils/export.ts`)

```typescript
/**
 * 通用的文件下载函数
 * @param content - 文件内容
 * @param filename - 下载时显示的文件名
 * @param mimeType - 文件的 MIME 类型
 */
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * 导出为 Markdown 文件
 * @param getContent - 一个函数，调用时返回当前编辑器的内容
 */
export const exportAsMarkdown = (getContent: () => string) => {
  const content = getContent();
  downloadFile(content, 'document.md', 'text/markdown;charset=utf-8');
};

/**
 * 导出为 HTML 文件
 * @param getContent - 一个函数，调用时返回当前编辑器的内容
 * @param parseToHtml - 一个函数，将 Markdown 转换为 HTML
 */
export const exportAsHtml = (getContent: () => string, parseToHtml: (md: string) => string) => {
  const markdownContent = getContent();
  const htmlContent = parseToHtml(markdownContent);

  // 嵌入基础样式，使其更美观
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; line-height: 1.6; padding: 20px; }
        /* 在这里可以添加更多从你的项目中提取的样式 */
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;

  downloadFile(fullHtml, 'document.html', 'text/html;charset=utf-8');
};
```

### 步骤 2：更新工具栏配置 (`src/config/toolbar/index.ts`)

```typescript
// ... 导入
import { exportAsMarkdown, exportAsHtml } from '@/utils/export';
import { useEditorStore } from '@/store/useEditorStore'; // 假设你用 store 管理状态
// import { yourParser } from '@/parser'; // 导入你的解析器
import OutputIcon from '@/assets/images/output.svg?component'; // 导入图标

// ... 在 defaultToolbarsConfig 中添加
{
    type: BaseToolbarType.OUTPUT, // 确保在 types/editor/toolbar.ts 中已定义
    title: "导出",
    icon: OutputIcon,
    listToolbar: [
        {
            type: 'export-markdown',
            title: '导出为 Markdown',
            onClick: () => {
                const editorStore = useEditorStore();
                exportAsMarkdown(() => editorStore.content); // 假设从 store 获取内容
            }
        },
        {
            type: 'export-html',
            title: '导出为 HTML',
            onClick: () => {
                const editorStore = useEditorStore();
                // exportAsHtml(() => editorStore.content, yourParser.parse);
            }
        }
    ]
},
```

### 步骤 3：准备图标

- 确保 `src/assets/images/` 目录下有一个名为 `output.svg` 的图标文件。如果没有，需要从设计资源中获取或创建一个。

## 5. 测试验证步骤

1.  **Markdown 导出测试**：
    - 点击“导出为 Markdown”，确认文件 `document.md` 被成功下载。
    - 打开下载的文件，确认内容与编辑器中的内容完全一致。
    - 测试包含特殊字符（如中文、emoji）的内容，确认编码正确。
2.  **HTML 导出测试**：
    - 点击“导出为 HTML”，确认文件 `document.html` 被成功下载。
    - 在浏览器中打开该 HTML 文件，确认内容和样式基本正确。
    - 检查标题、列表、代码块等元素的渲染是否符合预期。
3.  **交互测试**：
    - 确认导出按钮和下拉菜单在不同屏幕尺寸和主题下显示正常。

## 6. 后续优化方向

- **文件名自定义**：允许用户在下载前输入自定义的文件名。
- **样式一致性**：在导出 HTML 时，更完整地嵌入编辑器预览主题的 CSS，以保证导出效果与预览效果高度一致。
- **导出 PDF**：引入 `jsPDF` 和 `html2canvas` 等库，提供导出为 PDF 的功能，这是更高级的需求。
