import type { EditorView } from "codemirror";


interface SyncScrollInstances {
  editorView: EditorView;
  previewView: HTMLElement;
}
type AreaType = 'editor' | 'preview';

export class ScrollSynchronizer {

    // 每一行代码块的顶部位置 (`offsetTop`)
    private readonly editorElementList: number[] = [];
    private readonly previewElementList: number[] = [];

    private static readonly SCROLL_ANIMATION_DURATION = 100; // 滚动动画持续时间，单位毫秒
    private static readonly MIN_SCROLL_SYNC_DISTANCE = 10; // 最小滚动同步距离，单位像素

    private static readonly BOTTOM_THRESHOLD = 1; // 底部阈值，单位像素


    // 计算编辑器和预览区域的对应关系
    private calculateHeightMapping({editorView, previewView}: SyncScrollInstances){
        this.clearMapping();

        const previewValidElements = this.getValidPreviewElements(previewView);

        previewValidElements.forEach((element: HTMLElement) => {
            const lineNumber = this.getLineNumber(element);

            if (!this.isValidLineNumber(lineNumber, editorView)) return;

            const editorLineInfo = this.getEditorLineInfo(editorView, lineNumber);
            if (!editorLineInfo) return;

            this.editorElementList.push(editorLineInfo.top);
            this.previewElementList.push(element.offsetTop);    
        });
    }

    // 同步滚动
    private synchronizeScroll(curArea: AreaType, {editorView, previewView}: SyncScrollInstances) {
        const { scrollElement, targetElement } = this.getScrollElement(curArea, { editorView, previewView });
        if (!scrollElement || !targetElement) return;

        if (scrollElement.scrollTop <= 0) {
            targetElement.scrollTop = 0;
            return;
        }

        if (this.isScrolledToBottom(scrollElement)) {
            this.scrollToBottom(targetElement);
            return;
        }
        this.scrollByRatio(targetElement, scrollElement, curArea);
    }

    // 获取预览区域有效节点
    private getValidPreviewElements(previewView: HTMLElement): HTMLElement[] {
        return Array.from(previewView.childNodes).filter((node: ChildNode) => {
            const element = node as HTMLElement;
            return !((element.nodeName === 'P' && element.clientHeight == 0) || element.nodeType === 3); // 只保留段落和文本节点
        }) as HTMLElement[];
    }

    // 获取行号
    private getLineNumber(element: HTMLElement): number {
        const lineNumber = element.getAttribute('data-line');
        return lineNumber ? Number(lineNumber) : -1;

    }

    // 判断行号是否有效
    private isValidLineNumber(lineNumber: number, editorView: EditorView): boolean {
        return lineNumber >= 0 && editorView.state?.doc && lineNumber < editorView.state.doc.lines;
    }

    // 获取编辑器行信息
    private getEditorLineInfo(editorView: EditorView, lineNumber: number) {
        const line = editorView.state?.doc?.line(lineNumber);
        return line ? editorView.lineBlockAt(line.from) : null;
    }

    // 清除编辑器和预览区域的映射关系
    private clearMapping() {
        this.editorElementList.length = 0;
        this.previewElementList.length = 0;
    }

    // 获取滚动元素
    private getScrollElement(curArea: AreaType, {editorView, previewView}: SyncScrollInstances) {

        const scrollElement = curArea === 'editor' ? editorView.scrollDOM : previewView;
        const targetElement = curArea === 'editor' ? previewView : editorView.scrollDOM;

        return { scrollElement, targetElement };
    }

    // 判断是否滚动到底部
    private isScrolledToBottom(element: HTMLElement): boolean {
        return (element.scrollHeight - element.scrollTop + ScrollSynchronizer.BOTTOM_THRESHOLD <= element.clientHeight);
    }

    // 滚动到顶部
    private scrollToTop({editorView, previewView}: SyncScrollInstances): void {
        editorView.scrollDOM.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        previewView.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // 滚动到底部
    private scrollToBottom(targetElement: HTMLElement): void {
        const targetScrollTop = targetElement.scrollHeight - targetElement.clientHeight;
        const currentScrollTop = targetElement.scrollTop;
        const scrollDistance = targetScrollTop - currentScrollTop;
        

    }

    // 比例滚动
    private scrollByRatio(targetElement: HTMLElement, scrollElement: HTMLElement, curArea: AreaType): void {

    }

    // 获取滚动索引
    private getScrollIndex(sourceList: number[], scrollTop: number): number {
       for (let i = 0; i < sourceList.length - 1; i++) {
        if (scrollTop < sourceList[i]) return i;
       }
       return sourceList.length - 1;
    }

    // 计算滚动位置
    private calculateScrollPosition(index: number ,sourceList: number[], targetList: number[], scrollTop: number) {
        const sourceDistance = sourceList[index + 1] - sourceList[index];
        const targetDistance = targetList[index + 1] - targetList[index];

        if (sourceDistance < ScrollSynchronizer.MIN_SCROLL_SYNC_DISTANCE || targetDistance < ScrollSynchronizer.MIN_SCROLL_SYNC_DISTANCE) {
            return {
                ratio: -1,
                targetScrollTop: 0
            }
        }

        const ratio = Math.min(0, Math.max(1, (scrollTop - sourceList[index]) / sourceDistance));
        let targetScrollTop = targetList[index] + ratio * targetDistance;

        if (targetScrollTop < 0) {
            targetScrollTop = 0;
        } else if (targetScrollTop > targetList[targetList.length - 1]) {
            targetScrollTop = targetList[targetList.length - 1];
        }
        return {
            ratio,
            targetScrollTop
        }

    }

    // 处理编辑区域滚动
    public handleEditorScroll(editorView: EditorView, previewView: HTMLElement | null): void {
        if (!previewView) return;
        this.calculateHeightMapping({editorView, previewView});
        this.synchronizeScroll('editor', {editorView, previewView});
    }

    // 处理预览区域滚动
    public handlePreviewScroll(previewView: HTMLElement | null, editorView: EditorView): void {
        if (!previewView) return;
        this.calculateHeightMapping({editorView, previewView});
        this.synchronizeScroll('preview', {editorView, previewView});
    }

    // 处理滚动到顶部
    public handleScrollToTop(editorView: EditorView, previewView: HTMLElement | null): void {
        if (!previewView) return;
        this.calculateHeightMapping({editorView, previewView});
        this.scrollToTop({editorView, previewView});
    }


}

export const scrollSynchronizer = new ScrollSynchronizer();

export const handleEditorScroll = ({editorView, previewView}: SyncScrollInstances): void => {
    scrollSynchronizer.handleEditorScroll(editorView, previewView);
};

export const handlePreviewScroll = ({editorView, previewView}: SyncScrollInstances): void => {
    scrollSynchronizer.handlePreviewScroll(previewView, editorView);
};

export const handleScrollToTop = ({editorView, previewView}: SyncScrollInstances): void => {
    scrollSynchronizer.handleScrollToTop(editorView, previewView);
};
