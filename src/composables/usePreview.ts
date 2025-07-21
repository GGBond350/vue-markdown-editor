import { useEditorStore } from '@/store/useEditorStore';
import { handlePreviewScroll, handleScrollToTop } from '@/utils/ScrollSynchronizer';
import { storeToRefs } from 'pinia';
import { EditorView } from '@codemirror/view';
import { onUnmounted } from 'vue';
export function usePreviewState() {
    const editorStore = useEditorStore();
    const { setPreviewView } = editorStore;

    const { isSyncScroll, editorView, currentScrollContainer } = storeToRefs(editorStore);

    const initPreview = (el: HTMLElement) => {
        if (!el) {
            console.error("Preview container element is not provided.");
            return;
        }
        setPreviewView(el);

        const handleScroll = () => {
            if (currentScrollContainer.value !== 'preview') return;
            if (!el || !editorView.value) return;
            if (isSyncScroll.value) {
                handlePreviewScroll({previewView: el, editorView: editorView.value as EditorView});
            }
        }
        el.addEventListener('scroll', handleScroll);
        onUnmounted(() => {
            el.removeEventListener('scroll', handleScroll);
        });
    }

    return {
        initPreview
    }
}