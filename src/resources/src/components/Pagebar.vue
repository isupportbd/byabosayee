<template></template>

<script setup lang="ts">
import { inject, onMounted, watch } from "vue";

defineOptions({ name: "PageBar", inheritAttrs: false });

interface PageBarProps {
  title?: string;
}

const props = defineProps<PageBarProps>();
const setPageTitle = inject<((t: string) => void) | null>("setPageTitle", null);

onMounted(() => {
  if (props.title && setPageTitle) {
    setPageTitle(props.title);
  }
});

watch(
  () => props.title,
  (newTitle) => {
    if (newTitle && setPageTitle) {
      setPageTitle(newTitle);
    }
  }
);
</script>

<style lang="scss" scoped></style>
