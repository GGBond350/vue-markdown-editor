import type { Tokens } from "@/types/parser/token";
import hljs from "highlight.js";
import { prefix } from "@/common/contant";

export const renderCode = (node: Tokens) => {
    let language = 'plaintext';

    try {
        const lang = node.lang || 'plaintext';
        if (lang !== "plaintext" && !hljs.getLanguage(lang)) {
            node.lang = "plaintext";
        }
        (node.lang) && (language = node.lang);

    } catch (error) {
        language = 'plaintext';
    }
    const highlightedCode = hljs.highlight(node.value!, { language }).value;
    return  `<div class="${prefix}-code-container" data-line="${node.position.start.line}">
    <div class="${prefix}-code-header">
      <div class="${prefix}-code-icon">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="${prefix}-code-right">${language}</div>
    </div>
    <pre><code class="language-${language}">${highlightedCode}</code></pre>
  </div>`;
}