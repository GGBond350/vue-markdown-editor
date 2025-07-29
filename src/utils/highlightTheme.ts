// 动态管理 highlight.js 主题
export function loadHighlightTheme(isDark: boolean) {
  // 移除已存在的 highlight.js 样式
  const existingLink = document.getElementById('highlight-theme');
  if (existingLink) {
    existingLink.remove();
  }

  // 创建新的样式链接
  const link = document.createElement('link');
  link.id = 'highlight-theme';
  link.rel = 'stylesheet';
  link.type = 'text/css';
  
  // 根据主题选择样式文件
  if (isDark) {
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css';
  } else {
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
  }
  
  // 添加到页面头部
  document.head.appendChild(link);
}

// 初始化主题
export function initHighlightTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  loadHighlightTheme(isDark);
}
