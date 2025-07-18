import { EditorView } from "codemirror";
import { defineStore } from "pinia";
import { ref, shallowRef} from "vue";

const STORAGE_KEY = 'vue-markdown-editor-content';
export const useEditorStore = defineStore('editor', () => {
	const content = ref<string>(localStorage.getItem(STORAGE_KEY) || '');

	const editorView = ref<EditorView | null>(null);
	const editorContainer = shallowRef<HTMLElement | null>(null);

	const previewView = ref<EditorView | null>(null);
	const previewContainer = shallowRef<HTMLElement | null>(null);

	const currentScrollContainer = shallowRef<'editor' | 'preview' | null>(null);
	const isSyncScroll = ref<boolean>(true);
	const scrollToTop = ref<(() => void) | null>(null);

	const charCount = ref<number>(0);
	const lineCount = ref<number>(0);
	const cursorRow = ref<number>(0);
	const cursorCol = ref<number>(0);

	const setContent = (newContent: string, isPersistent: boolean = true) => {
		content.value = newContent;
		if (isPersistent) {
			localStorage.setItem(STORAGE_KEY, newContent);
		}
	}
	const setEditorView = (view: EditorView | null) => {
		editorView.value = view;
	}
	const setEditorContainer = (container: HTMLElement | null) => {
		editorContainer.value = container;
	}

	const setPreviewView = (view: EditorView | null) => {
		previewView.value = view;
	}
	const setPreviewContainer = (container: HTMLElement | null) => {
		previewContainer.value = container;
	}

	const setCurrentScrollContainer = (container: 'editor' | 'preview' | null) => {
    	currentScrollContainer.value = container;
  	}
	const toggleSyncScroll = () => {
		isSyncScroll.value = !isSyncScroll.value;
	}

	const setScrollToTopFunction = (fn: () => void) => {
		scrollToTop.value = fn;
	}

	// 更新统计信息
	const updateStats = (stats: {
		charCount: number;
		lineCount: number;
		cursorRow: number;
		cursorCol: number;
	}) => {
		charCount.value = stats.charCount;
		lineCount.value = stats.lineCount;
		cursorRow.value = stats.cursorRow;
		cursorCol.value = stats.cursorCol;
	}

	return {
		content,
		editorView,
		previewView,
		charCount,
		lineCount,
		cursorRow,
		cursorCol,
		editorContainer,
		previewContainer,
		currentScrollContainer,
		isSyncScroll,
		scrollToTop,
		setContent,
		setEditorView,
		setPreviewView,
		updateStats,
		setEditorContainer,
		setPreviewContainer,
		setCurrentScrollContainer,
		toggleSyncScroll,
		setScrollToTopFunction
	}
})