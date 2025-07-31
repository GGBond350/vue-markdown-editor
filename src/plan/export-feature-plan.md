# 导出功能实现计划

## 1. 功能需求分析 (参考 React 版本)

-   **导出格式**: 支持导出为 `HTML` 和 `PDF` 文件。
-   **触发方式**: 通过工具栏的 "输出" 按钮，弹出一个侧边栏，提供导出选项。
-   **导出内容**: 导出预览区域 (`Preview`) 的完整渲染后内容。
-   **图片处理**: 导出时，需要将编辑器中的图片占位符 (`![alt](📷 id)`) 替换为真实的 Base64 数据，以确保图片在导出的文件中能正常显示。

## 2. 技术选型

-   **PDF 导出**: `html2pdf.js` - 与 React 版本保持一致，功能强大，配置简单。
-   **HTML 导出**: 原生 DOM 操作和 `Blob` API - 无需额外依赖。
-   **UI 组件**: 使用原生 HTML 或项目已有的组件库来构建侧边栏。

## 3. 详细执行步骤

### 第一步：安装依赖

首先，需要安装 `html2pdf.js` 及其类型定义文件。

```bash
pnpm add html2pdf.js
pnpm add -D @types/html2pdf.js
```

### 第二步：创建导出工具函数

在 `src/utils/` 目录下创建三个新的工具函数文件。

#### `src/utils/exportHTML.ts`

```typescript
// 功能：将指定的 HTML 元素及其内联样式导出为 HTML 文件。
export const exportHTML = (element: HTMLElement, fileName: string) => {
  return new Promise((resolve) => {
    if (!element) {
      console.error("Element not found");
      return;
    }

    const htmlContent = element.outerHTML;

    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n");
        } catch (e) {
          console.error("Error accessing stylesheet:", e);
          return "";
        }
      })
      .join("\n");

    const fullHtmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${fileName}</title>
        <style>${styles}</style>
      </head>
      <body>${htmlContent}</body>
      </html>
    `;

    const blob = new Blob([fullHtmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    resolve({});
  });
};
```

#### `src/utils/exportPDF.ts`

```typescript
// 功能：使用 html2pdf.js 将指定的 HTML 元素导出为 PDF 文件。
import html2pdf from "html2pdf.js";

export const exportPdf = (element: HTMLElement, filename: string) => {
  return new Promise((resolve) => {
    const options = {
      margin: 10,
      filename: `${filename}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().from(element).set(options).save();
    resolve({});
  });
};
```

#### `src/utils/processExportContent.ts`

这是最关键的一步，用于处理图片占位符。

```typescript
// 功能：在导出前，处理 HTML 内容，将图片占位符替换为真实的 Base64 数据。
import { useEditorStore } from '@/store/useEditorStore';

export const processContentForExport = (element: HTMLElement): HTMLElement => {
  const clonedElement = element.cloneNode(true) as HTMLElement;
  const editorStore = useEditorStore();

  // 查找所有使用占位符的图片
  const images = clonedElement.querySelectorAll('img[src^="data:image/svg+xml"]'); // 假设占位符是SVG

  images.forEach(img => {
    // 从某个属性中获取真实的图片ID，例如 data-id
    const imageId = img.getAttribute('data-image-id'); 
    if (imageId) {
      const realBase64 = editorStore.getImage(imageId);
      if (realBase64) {
        img.setAttribute('src', realBase64);
      } else {
        // 如果找不到图片，可以设置一个默认的“图片丢失”图像
        img.setAttribute('alt', `图片丢失: ${img.getAttribute('alt')}`);
      }
    }
  });

  return clonedElement;
};
```
**注意**: 上述 `processContentForExport` 的实现需要根据你的 `renderImage` 函数做相应调整。你需要确保在渲染图片占位符时，将 `imageId` 存储在 `<img>` 标签的某个属性上（如 `data-image-id`），以便在这里能够获取到。

### 第三步：创建侧边栏导出组件

在 `src/components/Sidebar/` 目录下创建一个新的组件 `Output.vue`。

#### `src/components/Sidebar/Output.vue`

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useEditorStore } from '@/store/useEditorStore';
import { exportHTML } from '@/utils/exportHTML';
import { exportPdf } from '@/utils/exportPDF';
import { processContentForExport } from '@/utils/processExportContent';

const editorStore = useEditorStore();
const fileType = ref<'PDF' | 'HTML'>('PDF');
const fileName = ref('markdown');
const loading = ref(false);

const handleExport = async () => {
  if (!editorStore.previewView) {
    console.error("预览区域未找到！");
    return;
  }

  loading.value = true;

  // 1. 克隆并处理内容（替换图片占位符）
  const elementToExport = processContentForExport(editorStore.previewView);

  // 2. 根据选择的类型导出
  try {
    if (fileType.value === 'PDF') {
      await exportPdf(elementToExport, fileName.value);
    } else {
      await exportHTML(elementToExport, fileName.value);
    }
  } catch (error) {
    console.error('导出失败:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="sidebar-output-container">
    <h3>导出文件</h3>
    <form @submit.prevent="handleExport">
      <div class="form-group">
        <label for="file-type">文件类型</label>
        <select id="file-type" v-model="fileType">
          <option value="PDF">PDF</option>
          <option value="HTML">HTML</option>
        </select>
      </div>
      <div class="form-group">
        <label for="file-name">文件名</label>
        <input id="file-name" type="text" v-model="fileName" />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '正在导出...' : '导出' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
/* 添加一些基础样式 */
.sidebar-output-container {
  padding: 15px;
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
}
input, select, button {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
button {
  cursor: pointer;
}
button:disabled {
  cursor: not-allowed;
}
</style>
```

### 第四步：集成到工具栏和主界面

1.  **添加 `Output` 按钮到工具栏模板**:
    -   修改 `src/config/toolbar/template.ts`，添加 `OUTPUT` 类型。

2.  **在主工作区组件中引入 `Output.vue`**:
    -   修改 `src/components/Workspace/workspace.vue` (或你的主布局文件)。
    -   添加一个用于显示/隐藏侧边栏的状态。
    -   在侧边栏区域使用 `<component :is="activeSidebarComponent" />` 来动态加载 `Output.vue`。

3.  **处理工具栏点击事件**:
    -   在 `src/components/Toolbar/index.vue` 中，为 `Output` 按钮添加点击事件。
    -   点击时，切换主工作区中侧边栏的显示状态，并设置 `activeSidebarComponent` 为 `Output` 组件。

## 4. 测试验证

1.  **功能测试**:
    -   上传一张图片。
    -   点击导出按钮，分别导出为 HTML 和 PDF。
    -   打开导出的文件，确认内容、样式和图片都正常显示。
2.  **边界测试**:
    -   在没有图片的情况下导出。
    -   在内容为空的情况下导出。
    -   导出包含复杂格式（表格、代码块等）的内容。
3.  **性能测试**:
    -   导出一个包含多张大图的文档，观察导出时间和浏览器响应情况。

这个计划涵盖了从依赖安装到最终测试的所有步骤，可以作为你实现导出功能的完整指南。
