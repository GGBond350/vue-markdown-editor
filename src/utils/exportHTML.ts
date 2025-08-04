export const exportHTML = (element: HTMLElement, filename: string) => {
    return new Promise((resolve) => {
        if (!element) {
            console.error("Element not found");
            return;
        }


        const htmlContent = element.outerHTML;
        const styleElements = Array.from(document.styleSheets)
            .map((sheet) => {
                try {
                    // 对于内联样式，直接读取规则
                    if (sheet.cssRules && !sheet.href) {
                        const rules = Array.from(sheet.cssRules)
                            .map((rule) => rule.cssText)
                            .join("\n");
                        return `<style>${rules}</style>`;
                    }
                    // 对于外部样式表，生成 <link> 标签
                    if (sheet.href) {
                        return `<link rel="stylesheet" href="${sheet.href}">`;
                    }
                    return "";
                } catch (e) {
                    // 如果因为跨域等原因无法访问，也尝试生成 <link> 标签
                    if (sheet.href) {
                        return `<link rel="stylesheet" href="${sheet.href}">`;
                    }
                    console.warn("无法读取样式表规则:", e);
                    return "";
                }
            })
            .join("\n");

            // 创建包含样式的HTML内容
    const fullHtmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Exported HTML</title>
            ${styleElements}
          </head>
          <body>
            ${htmlContent}
          </body>
          </html>
        `;

    const blob = new Blob([fullHtmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    resolve({});
    })
}
