<template>
  <div class="row align-items-center">
    <div v-if="!hideDetails && !data.hide_details" class="col-12 col-md-6 mb-2 mb-md-0">
      <div class="py-1 text-black-50 text-center text-md-start small">
        Showing {{ page.from }} to {{ page.to }} of {{ nFormatter(page.total) }} entries
      </div>
    </div>
    <div :class="(hideDetails || data.hide_details) ? 'col-12 d-flex justify-content-end' : 'col-12 col-md-6'">
      <nav :class="['datatable-pagination', `pagination-${variant}`]" aria-label="Page navigation">
        <ul class="pagination justify-content-center justify-content-md-end mb-0">
          <!-- First -->
          <li :class="['page-item', { disabled: noPreviousPage }]">
            <button type="button" class="page-link" :aria-disabled="noPreviousPage ? 'true' : 'false'"
              :tabindex="noPreviousPage ? -1 : 0" @click.prevent="!noPreviousPage && loadPage(1)">
              <i class="bi bi-chevron-double-left"></i>
            </button>
          </li>

          <!-- Prev -->
          <li :class="['page-item', { disabled: noPreviousPage }]">
            <button type="button" class="page-link" :aria-disabled="noPreviousPage ? 'true' : 'false'"
              :tabindex="noPreviousPage ? -1 : 0"
              @click.prevent="!noPreviousPage && loadPage(props.data.current_page - 1)">
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>

          <li class="page-item">
            <div class="input-group input-group-sm">
              <Input v-model="page.page" type="text" category="number" topclass="m-0" class="text-center"
                style="width: 70px" @keyup.enter="loadPage(page.page)" />
            </div>
          </li>

          <li class="page-item">
            <span class="page-link text-nowrap"> of {{ nFormatter(props.data.last_page) }} </span>
          </li>

          <!-- Next -->
          <li :class="['page-item', { disabled: noNextPage }]">
            <button type="button" class="page-link" :aria-disabled="noNextPage ? 'true' : 'false'"
              :tabindex="noNextPage ? -1 : 0" @click.prevent="!noNextPage && loadPage(props.data.current_page + 1)">
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>

          <!-- Last -->
          <li :class="['page-item', { disabled: noNextPage }]">
            <button type="button" class="page-link" :aria-disabled="noNextPage ? 'true' : 'false'"
              :tabindex="noNextPage ? -1 : 0" @click.prevent="!noNextPage && loadPage(props.data.last_page)">
              <i class="bi bi-chevron-double-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watchEffect } from "vue";
import { useRoute } from "vue-router";
import Input from "@/components/Input.vue";
import { formatCompactNumber } from "@/helpers/nformatter";
import { useGum } from "@/plugins/gum";

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  path?: string;
  hide_details?: boolean;
  onPageChange?: (page: number) => void;
  links?: Array<{
    url?: string | null;
    page?: number;
    label: string;
    active: boolean;
    onClick?: () => void;
  }>;
}

interface PaginationProps {
  data: PaginationData;
  selectedoption?: string | number;
  search?: string;
  variant?: string;
  hideDetails?: boolean;
}

const props = withDefaults(defineProps<PaginationProps>(), {
  search: "",
  variant: "dark",
  hideDetails: false
});

const emit = defineEmits<{
  (e: "change", page: number): void;
  (e: "update:page", page: number): void;
}>();

const gum = useGum();
const route = useRoute();

const page = reactive({ page: 1, from: 0, to: 0, total: 0 });

const noPreviousPage = computed(() => Number(props.data.current_page) - 1 <= 0);
const noNextPage = computed(() => Number(props.data.current_page) + 1 > Number(props.data.last_page));

const loadPage = (pageNo: string | number) => {
  let p = parseInt(String(pageNo), 10);

  // fallback if NaN
  if (Number.isNaN(p)) p = Number(props.data.current_page) || 1;

  const last = Number(props.data.last_page) || 1;

  // clamp between 1 and last
  if (p < 1) p = 1;
  if (p > last) p = last;

  page.page = p;

  // 1. Direct onPageChange callback if supplied in data object
  if (typeof (props.data as any)?.onPageChange === "function") {
    (props.data as any).onPageChange(p);
  }

  // 2. Direct onClick callback on matching link if supplied
  if (Array.isArray((props.data as any)?.links)) {
    const link = (props.data as any).links.find((l: any) => Number(l.page) === p || String(l.label).includes(String(p)) || l.url === `#page-${p}`);
    if (link && typeof link.onClick === "function") {
      link.onClick();
    }
  }

  // 3. Emit change and update:page events
  emit("change", p);
  emit("update:page", p);

  // 4. Gum router navigation if path provided
  if (props.data.path) {
    return gum.get(props.data.path, {
      query: { page: p, size: props.selectedoption, search: props.search },
      routePath: route?.path,
      preserveState: true,
      preserveScroll: true,
      skipFetch: true
    });
  }
};

const nFormatter = formatCompactNumber;

watchEffect(() => {
  page.page = Number(props.data.current_page) || 1;
  page.from = ((Number(props.data.current_page) || 1) - 1) * (Number(props.data.per_page) || 15) + 1;
  page.to = Math.min((Number(props.data.current_page) || 1) * (Number(props.data.per_page) || 15), Number(props.data.total) || 0);
  page.total = Number(props.data.total) || 0;
});
</script>

<style lang="scss" scoped>
ul.pagination {
  margin: 0;

  :deep(.page-item.disabled .page-link),
  :deep(.page-link:disabled),
  :deep(.page-link[aria-disabled="true"]) {
    pointer-events: none;
    cursor: not-allowed;
    opacity: 0.5;
  }

  .page-link {
    border-radius: 5px !important;
    margin-left: 0;
    border-color: #cdcdcd !important;
    color: inherit;
    box-shadow: none;
  }
}
</style>
