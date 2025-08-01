export const exportHTML = (element: HTMLElement, filename: string) => {
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

            // 创建包含样式的HTML内容
    const fullHtmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Exported HTML</title>
            <style>
              ${styles}
            </style>
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