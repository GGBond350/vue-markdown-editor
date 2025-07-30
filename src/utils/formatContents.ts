export type Title = {
    key: string; // 每个标题项的唯一标识符
    href: string; // 标题的锚点链接
    title: string; // 标题文本内容
    children: Title[]; // 可选的子标题列表
    nodeName: string; // HTML节点名称，例如 'h1', 'h2', 'h3' 等
}

export const formatContents = (rootElement: NodeListOf<HTMLElement>): Title[] => {
    
    const rootElementArr = Array.from(rootElement).map(item => {
        const dataLine = item.getAttribute('data-line');
        const title: Title =  {
            key: dataLine || '',
            href: `#${dataLine}`,
            title: item.innerText,
            children: [],
            nodeName: item.nodeName.toLowerCase(),
        }
        return title;
    })
    let result = rootElementArr;
    let preLength = 0;
    let newLength = result.length;
    while (preLength !== newLength) {
        preLength = newLength;
        const list: Title[] = [];
        let children: Title[] = [];

        for (let index = result.length - 1; index >=0; index--) {
            const current = result[index];
            const prev = result[index - 1];
            if (prev && prev.nodeName.charAt(1) === current.nodeName.charAt(1)) {
                // 同级标题
                children.unshift(current);
            } else if (prev && prev.nodeName.charAt(1) < current.nodeName.charAt(1)) {
                // 当前标题是上一个标题的子标题
                children.unshift(current);
                prev.children = [...prev.children, ...children];
                children = [];
            } else {
                // 当前标题是上一个标题的父标题或者没有前一个
                children.unshift(current);
                list.unshift(...children);
                children = [];
            }
        }
        result = list;
        newLength = result.length;
    }
    return result;
}


/**
 * 为标题元素添加锚点ID
 * @param headingElements 标题元素列表
 */
export const addAnchorIds = (headingElements: NodeListOf<HTMLElement>) => {
    headingElements.forEach((element) => {
        const dataLine = element.getAttribute('data-line');
        if (dataLine) {
            element.id = dataLine; // 设置标题元素的ID为data-line的值
        }
    });
}

/**
 * 获取预览容器中的所有标题元素
 * @param container 预览容器元素
 * @returns 标题元素的NodeList
 */

export const getHeadingElements = (container: HTMLElement | null): NodeListOf<HTMLElement> | null => {
    if (!container) return null;
    return container.querySelectorAll('h1, h2, h3, h4, h5, h6') as NodeListOf<HTMLElement>;
}

/**
 * 计算当前视口中最接近顶部的标题
 * @param headingElements 标题元素列表
 * @returns 最接近顶部的标题元素
 */
export const getClosestHeading = (headingElements: NodeListOf<HTMLElement>): HTMLElement | null => {
  if (!headingElements || headingElements.length === 0) return null;

  let closestTitle: HTMLElement | null = null;
  let minDistance = Infinity;

  headingElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const distance = Math.abs(rect.top);
    if (distance < minDistance) {
      minDistance = distance;
      closestTitle = element;
    }
  });

  return closestTitle;
};

