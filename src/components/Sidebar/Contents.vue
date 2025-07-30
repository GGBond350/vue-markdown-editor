<template>
    <div class="contents-container">

        <div v-if="titles.length === 0" class="empty-state">
            暂无目录
        </div>
        <div v-else class="contents-list">
            <ContentsItem
                v-for="title in titles"
                :key="title.key"
                :title="title"
                :active-link="activeLink"
                @click="handleClickTitle"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useEditorStore } from '@/store/useEditorStore';
    import { addAnchorIds, formatContents, getClosestHeading, getHeadingElements, type Title } from '@/utils/formatContents';
    import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
    import ContentsItem from './ContentsItem.vue';

    const editorStore = useEditorStore();
    const titles = ref<Title[]>([]);
    const activeLink = ref<string>('');
    const previewViewContainer = computed(() => editorStore.previewView);

    let observer: MutationObserver | null = null;

    const updateContents = async () => {
        await nextTick();

        const container = previewViewContainer.value;
        if (!container) return;
        const headingElements = getHeadingElements(container);
        if (!headingElements || headingElements.length === 0) {
            titles.value = [];
            return;
        }

        addAnchorIds(headingElements);
        const newTitles = formatContents(headingElements);
        titles.value = newTitles;
        if (newTitles.length > 0 && !activeLink.value) {
            activeLink.value = newTitles[0].href;
        }
    }

    const handleScroll = () => {
        const container = previewViewContainer.value;
        if (!container) return;

        const headings = getHeadingElements(container);
        if (!headings || headings.length === 0) return;

        const closestHeading = getClosestHeading(headings);
        if (closestHeading) {
            const line = closestHeading.getAttribute('data-line');
            if (line) {
                activeLink.value = `#${line}`;
            }
        }
    }

    const handleClickTitle = (event: Event, title: Title) => {
        event.preventDefault();
        const container = previewViewContainer.value;
        if (!container || !title.href) return;

        // 从 href 中提取 data-line 值
        const dataLine = title.href.replace('#', '');
        const targetElement = container.querySelector(`[data-line="${dataLine}"]`);
        if (targetElement) {
            activeLink.value = title.href;
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        } 
    }

    const initObserver = () => {
        const container = previewViewContainer.value;
        if (!container) return;

        observer = new MutationObserver(() => {
            requestAnimationFrame(() => {
                updateContents();
            });
        });

        observer.observe(container, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
        });
    }

    onMounted(() => {
        updateContents();
        initObserver();
        const container = previewViewContainer.value;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }
    })

    onUnmounted(() => {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        const container = previewViewContainer.value;
        if (container) {
            container.removeEventListener('scroll', handleScroll);
        }
    })

</script>

<style scoped>

.contents-container {
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  overflow-y: auto;
}

.empty-state {
  color: var(--text-color-secondary, #999);
  text-align: center;
  padding: 20px;
  font-size: 14px;
}

.contents-list {
  width: 100%;
}
</style>