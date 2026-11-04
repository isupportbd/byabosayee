<script setup lang="ts">
import axios from "axios";
import { debounce } from "lodash-es";
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, useAttrs, watch } from "vue";
import "vue-select/dist/vue-select.css";
import vSelect from "vue-select";
import { empty } from "../helpers/utils";

defineOptions({ name: "Select", inheritAttrs: false });

type AnyRecord = Record<string, unknown>;
type SelectValue = string | number | boolean | AnyRecord | null;
type OptionHook = ((value: unknown) => void | Promise<void>) | null;

interface FetchPack {
  url?: string | null;
  data?: string | null;
  params?: AnyRecord;
  mapFn?: (x: AnyRecord) => AnyRecord;
  option?:
    | ((value: unknown) => void | Promise<void>)
    | Array<(value: unknown) => void | Promise<void>>;
  reset?: boolean;
  reload?: boolean;
}

interface SelectProps {
  options?: any[];
  label?: string;
  reduce?: (option: any) => any;
  valueKey?: string;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  filterable?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  parentclass?: string;
  title?: string;
  must?: boolean;
  err?: string | boolean;
  hood?: string | boolean;
  defaultValue?: SelectValue;
  resetKey?: string | number | boolean | AnyRecord | null;
  fetched?: (payload: Record<string, any>) => any;
  filterBy?: (option: any, label: string, search: string) => boolean;
  noOptionsText?: string;
}

const $attrs = useAttrs();
const props = withDefaults(defineProps<SelectProps>(), {
  options: () => [],
  searchable: true,
  clearable: false,
  filterable: true,
  disabled: false,
  size: "sm",
  defaultValue: null,
  resetKey: null,
  noOptionsText: "কোনো তথ্য পাওয়া যায়নি"
});

const emit = defineEmits<{
  (event: "fetched"): void;
  (event: "clear"): void;
  (event: "change", value: unknown): void;
  (event: "update:modelValue", value: unknown): void;
  (event: "select", value: unknown): void;
}>();

const model = defineModel<SelectValue | SelectValue[]>();

const skipNextSearch = ref(false); // suppress search right after clear
const observer = ref<IntersectionObserver | null>(null);
const load = ref<HTMLElement | null>(null);

// store callbacks coming from fetchedDropdown(pack)
const hooks = ref<{ option: OptionHook | OptionHook[]; }>({ option: null });

// remember last fetch config and search so the child can refetch/append by itself
const lastPack = ref<FetchPack | null>(null);
const lastSearch = ref("");
const lastSearchRows = ref<AnyRecord[]>([]);

const hasNextPage = computed(() => {
  const total = Number((fieldData.value as { total?: number; }).total ?? 0);
  return field.all.length < total;
});

const effectiveOptions = computed<any[]>(() => {
  if (props.options && props.options.length > 0) {
    return props.options;
  }
  if (field.all && field.all.length > 0) {
    return field.all;
  }
  return props.options || [];
});

const computedLabel = computed<string>(() => {
  if (props.label) return props.label;
  const list = effectiveOptions.value;
  if (list && list.length > 0 && typeof list[0] === "object" && list[0] !== null) {
    if ("name" in list[0]) return "name";
    if ("title" in list[0]) return "title";
    if ("label" in list[0]) return "label";
  }
  return "name";
});

const computedReduce = computed(() => {
  if (props.reduce) return props.reduce;
  if (props.valueKey) {
    return (opt: any) => (opt && typeof opt === "object" ? opt[props.valueKey!] : opt);
  }
  const list = effectiveOptions.value;
  if (list && list.length > 0 && typeof list[0] !== "object") {
    return (opt: any) => opt;
  }
  return (opt: any) => {
    if (opt && typeof opt === "object" && "id" in opt) {
      return opt.id;
    }
    return opt;
  };
});

const defaultFilterBy = (option: any, label: string, search: string): boolean => {
  if (!search) return true;
  const q = search.trim().toLowerCase();
  if (label && String(label).toLowerCase().includes(q)) return true;
  if (option && typeof option === "object") {
    if (option.name && String(option.name).toLowerCase().includes(q)) return true;
    if (option.code && String(option.code).toLowerCase().includes(q)) return true;
    if (option.title && String(option.title).toLowerCase().includes(q)) return true;
    if (option.companyName && String(option.companyName).toLowerCase().includes(q)) return true;
    if (option.phone && String(option.phone).toLowerCase().includes(q)) return true;
  }
  return false;
};

// ask parent for a pack and run our internal fetcher
const callParentFetched = async (search: string, opts: Partial<FetchPack> = {}) => {
  const maybePack = await props.fetched?.({ search, ...opts });
  if (maybePack && typeof maybePack === "object") {
    await fetchedDropdown(search, { ...maybePack, ...opts });
  }
};

const onClear = () => {
  resetMe();
  skipNextSearch.value = true;
  emit("clear");
};

const onOpen = async () => {
  if (!props.fetched) return;
  if (!field.all.length) {
    if (lastPack.value) {
      await fetchedDropdown("", { ...lastPack.value, reset: true });
    } else {
      await callParentFetched("", { reset: true });
    }
  }

  await nextTick();
  if (load.value && hasNextPage.value) {
    observer.value?.observe(load.value);
  }
};

const onClose = async () => {
  observer.value?.disconnect();
};

const onModelUpdate = async (val: unknown) => {
  const newVal = val === null || val === undefined ? "" : val;
  model.value = newVal as SelectValue;
  emit("update:modelValue", newVal);
  emit("change", newVal);
  emit("select", newVal);

  const optHooks = Array.isArray(hooks.value.option)
    ? hooks.value.option
    : hooks.value.option
      ? [hooks.value.option]
      : [];

  if (val == null || val === "") {
    for (const f of optHooks) {
      if (typeof f === "function") {
        await Promise.resolve(f(null));
      }
    }
    emit("clear");
    return;
  }

  field.val = val as SelectValue;
  for (const f of optHooks) {
    if (typeof f === "function") {
      await Promise.resolve(f(val));
    }
  }
};

const inputSearch = debounce(async (search: string, loading: (value: boolean) => void) => {
  if (!props.fetched) return;

  if (skipNextSearch.value && !search?.trim().length) {
    skipNextSearch.value = false;
    return;
  }

  if (search?.trim().length) {
    loading(true);
    if (lastPack.value) {
      await fetchedDropdown(search, { ...lastPack.value, reset: true }).finally(() =>
        loading(false)
      );
    } else {
      await callParentFetched(search, { reset: true }).finally(() => loading(false));
    }
  } else {
    field.page = 0;
    if (lastPack.value) {
      await fetchedDropdown("", { ...lastPack.value, reset: true });
    } else {
      await callParentFetched("");
    }
    pinLastSearchRows();
    await nextTick();
    if (load.value && hasNextPage.value) observer.value?.observe(load.value);
  }
}, 400);

const infiniteScroll = async ([{ isIntersecting, target }]: IntersectionObserverEntry[]) => {
  if (!isIntersecting || !props.fetched) return;

  const ul =
    target instanceof HTMLElement && target.offsetParent instanceof HTMLElement
      ? target.offsetParent
      : null;
  const scrollTop = ul?.scrollTop ?? 0;

  if (lastPack.value) {
    await fetchedDropdown(lastSearch.value, { ...lastPack.value });
  } else {
    await callParentFetched(lastSearch.value || "");
  }

  await nextTick();
  if (ul) ul.scrollTop = scrollTop;
};

onMounted(async () => {
  if (props.fetched) {
    observer.value = new IntersectionObserver(infiniteScroll);
  }

  if (props.defaultValue !== null && props.defaultValue !== undefined) {
    await nextTick();
    field.val = props.defaultValue;
    model.value = props.defaultValue;
  }
});

onBeforeUnmount(() => {
  observer.value?.disconnect();
  observer.value = null;
});

const field = reactive<{ all: AnyRecord[]; val: SelectValue; page: number; size: number; }>({
  all: [],
  val: "",
  page: 0,
  size: 10
});

const fieldData = ref<AnyRecord>({});

const resetMe = () => {
  field.all = [];
  field.page = 0;
  field.val = "";
};

const reloadMe = () => {
  field.all = [];
  field.page = 0;
};

const fetchedDropdown = async (search: string, pack: FetchPack | null = null) => {
  const url = pack?.url ?? null;
  const data = pack?.data ?? null;
  const params = pack?.params ?? {};
  const mapFn = pack?.mapFn ?? ((x: AnyRecord) => x);
  const reset = !!pack?.reset;
  const reload = !!pack?.reload;

  if ("option" in (pack ?? {})) {
    const pOpt = pack?.option;
    hooks.value.option = Array.isArray(pOpt)
      ? pOpt.filter((fn) => typeof fn === "function")
      : typeof pOpt === "function"
        ? [pOpt]
        : [];
  }

  lastPack.value = { url, data, params, mapFn };
  lastSearch.value = search ?? "";

  (reset && resetMe()) ||
    (reload && reloadMe()) ||
    (!empty(search) && !reset && !reload && reloadMe());

  field.page++;
  const param = { page: field.page, size: field.size, search: search };

  if (!url || !data) {
    return;
  }

  let key: any;
  try {
    key = await axios.get(url, { params: params ? { ...params, ...param } : param });
  } catch {
    return;
  }
  const payload = key.data[data as string] as AnyRecord;

  fieldData.value = payload;
  const rows = Array.isArray((payload as { data?: unknown; }).data)
    ? (payload as { data: AnyRecord[]; }).data
    : [];

  const options = rows
    .map((dt) => (dt == null ? null : mapFn(dt)))
    .filter((opt): opt is AnyRecord => opt != null);

  if (search?.trim().length && reset) {
    lastSearchRows.value = options.map((opt) => ({ ...opt }));
  }

  options.forEach((opt) => {
    const key = opt?.id ?? opt?.title ?? JSON.stringify(opt);
    if (
      !field.all.some(
        (o) =>
          o != null &&
          ((o as { id?: unknown; title?: unknown; }).id ??
            (o as { id?: unknown; title?: unknown; }).title ??
            JSON.stringify(o)) === key
      )
    ) {
      field.all = [...field.all, opt];
    }
  });
};

const optionKey = (o: AnyRecord) =>
  (o as { id?: unknown; title?: unknown; }).id ??
  (o as { id?: unknown; title?: unknown; }).title ??
  JSON.stringify(o);

const pinLastSearchRows = () => {
  if (!lastSearchRows.value.length) return;
  const pinKeys = new Set(lastSearchRows.value.map(optionKey));
  const rest = field.all.filter((o) => !pinKeys.has(optionKey(o)));
  field.all = [...lastSearchRows.value, ...rest];
};

const reload = async () => {
  resetMe();
  await callParentFetched("", { reset: true });
};

watch(
  () => props.resetKey,
  async (newVal, oldVal) => {
    if (oldVal === undefined) return;

    const optHooks = Array.isArray(hooks.value.option)
      ? hooks.value.option
      : hooks.value.option
        ? [hooks.value.option]
        : [];

    model.value = "";

    for (const fn of optHooks) {
      if (typeof fn === "function") {
        await Promise.resolve(fn(null));
      }
    }

    skipNextSearch.value = true;
    if (newVal == null) {
      lastPack.value = null;
      return;
    }
    await callParentFetched("", { reload: true });
    pinLastSearchRows();
    skipNextSearch.value = false;
  }
);

defineExpose({ field, fieldData, fetchedDropdown, reload });

const inputTitle = computed(() => props.title || ($attrs.title as string | undefined) || "");
const hoodHtml = computed(() =>
  props.hood === false || props.hood == null ? "" : String(props.hood)
);
const parentClass = computed(() => {
  if (props.parentclass !== undefined) return props.parentclass;
  if ($attrs.parentclass !== undefined) return String($attrs.parentclass);
  return inputTitle.value ? "mb-2" : "";
});
</script>

<template>
  <div :class="[parentClass, 'select-wrapper w-100']">
    <label
      v-if="inputTitle"
      class="text-capitalize d-flex align-items-center mb-1 form-label small fw-semibold">
      <div class="position-relative">
        <span class="text-capitalize" v-html="inputTitle"></span>
        <span
          class="position-absolute text-danger rounded-circle bg-danger must"
          :class="{ 'd-none': !props.must }"></span>
      </div>
      <div
        v-if="props.hood"
        class="text-uppercase w-100 text-end text-primary fw-semibold"
        style="font-size: 12px; margin-top: 0.15rem"
        v-html="hoodHtml"></div>
    </label>

    <v-select
      v-model="model"
      :label="computedLabel"
      :reduce="computedReduce"
      :options="effectiveOptions"
      :filterable="props.filterable"
      :filter-by="props.filterBy || defaultFilterBy"
      :placeholder="props.placeholder"
      :searchable="props.searchable"
      :clearable="props.clearable"
      :disabled="props.disabled"
      class="bootstrap-select"
      :class="[`select-${props.size}`, { 'is-invalid': !!props.err }]"
      v-bind="$attrs"
      @open="onOpen"
      @update:model-value="onModelUpdate"
      @close="onClose"
      @search="inputSearch"
      @clear="onClear">
      
      <!-- Custom open-indicator chevron using Bootstrap Icons -->
      <template #open-indicator="{ attributes }">
        <i class="bi bi-chevron-down vs__open-indicator" v-bind="attributes"></i>
      </template>

      <!-- Custom clear button using Bootstrap Icons -->
      <template #clear="{ attributes }">
        <i class="bi bi-x-lg vs__clear" v-bind="attributes"></i>
      </template>

      <!-- Forward caller-provided slots -->
      <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps" />
      </template>

      <!-- Default no-options slot -->
      <template v-if="!$slots['no-options']" #no-options="{ search }">
        <div class="vs__no-options small text-muted py-1">
          {{ search ? `"${search}" পাওয়া যায়নি` : props.noOptionsText }}
        </div>
      </template>

      <template v-if="hasNextPage" #list-footer>
        <li ref="load" class="loader small py-1">আরো লোড হচ্ছে...</li>
      </template>
    </v-select>

    <div v-if="props.err" class="form-text text-danger mt-1" style="font-size: 0.8rem">
      {{ props.err }}
    </div>
  </div>
</template>

<style lang="scss">
.select-wrapper {
  position: relative;
}

.loader {
  text-align: center;
  color: #bbbbbb;
}

.must {
  width: 4px;
  height: 4px;
  top: 0;
  margin-top: 5px;
  margin-left: 2px;
}

/* Bootstrap 5 Unified Select Styles */
.v-select.bootstrap-select {
  width: 100%;
  font-family: inherit;

  .vs__dropdown-toggle {
    display: flex;
    align-items: center;
    background-color: var(--bs-body-bg, #ffffff);
    border: 1px solid var(--bs-border-color, #ced4da);
    border-radius: var(--bs-border-radius-sm, 0.25rem);
    padding: 0 6px 0 8px;
    min-height: 31px;
    height: 31px;
    box-sizing: border-box;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  &.select-sm .vs__dropdown-toggle {
    min-height: 31px;
    height: 31px;
    font-size: 0.82rem;
  }

  &.select-md .vs__dropdown-toggle {
    min-height: 38px;
    height: 38px;
    font-size: 0.875rem;
  }

  &.vs--open .vs__dropdown-toggle,
  .vs__dropdown-toggle:focus-within {
    border-color: #86b7fe;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
  }

  &.vs--disabled .vs__dropdown-toggle {
    background-color: var(--bs-secondary-bg, #e9ecef);
    cursor: not-allowed;
    opacity: 0.75;
  }

  .vs__selected-options {
    display: flex;
    flex: 1 1 auto;
    min-width: 0;
    max-width: 100%;
    position: relative;
    padding: 0;
    margin: 0;
    height: 100%;
    align-items: center;
    overflow: hidden;
    white-space: nowrap;
  }

  /* When single item is selected and NOT actively searching */
  &.vs--single:not(.vs--searching) {
    .vs__selected {
      display: block;
      width: 100%;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
      padding: 0 2px 0 0;
      font-size: 0.82rem;
      color: var(--bs-body-color, #212529);
      line-height: normal;
      border: none;
      background: transparent;
    }

    .vs__search {
      position: absolute;
      top: 0;
      left: 0;
      width: 100% !important;
      height: 100% !important;
      opacity: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      cursor: pointer;
    }
  }

  /* When searching or when opened */
  &.vs--single.vs--searching,
  &.vs--single.vs--open {
    .vs__selected {
      position: absolute;
      opacity: 0.25;
      pointer-events: none;
    }

    .vs__search {
      position: relative !important;
      width: 100% !important;
      height: 100% !important;
      opacity: 1 !important;
      font-size: 0.82rem;
      color: var(--bs-body-color, #212529);
      margin: 0;
      padding: 0;
      border: none;
      background: transparent;
      outline: none;
      cursor: text;
    }
  }

  /* When searching actively, hide selected completely */
  &.vs--single.vs--searching .vs__selected {
    display: none !important;
  }

  /* When NO item is selected (placeholder state) */
  .vs__search {
    width: 100%;
    min-width: 0;
    font-size: 0.82rem;
    color: var(--bs-body-color, #212529);
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    line-height: normal;
    outline: none;

    &::placeholder {
      color: var(--bs-secondary-color, #6c757d);
      font-size: 0.82rem;
    }
  }

  .vs__actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding: 0 0 0 4px;
    margin-left: auto;
    cursor: pointer;
  }

  .vs__open-indicator {
    display: inline-block;
    transition: transform 150ms ease;
    font-size: 0.72rem;
    color: #6c757d;
  }

  &.vs--open .vs__open-indicator {
    transform: rotate(180deg);
  }

  .vs__clear {
    margin-right: 4px;
    font-size: 0.8rem;
    color: #adb5bd;
    cursor: pointer;
    line-height: 1;

    &:hover {
      color: #dc3545;
    }
  }

  .vs__dropdown-menu {
    position: absolute;
    top: calc(100% + 2px);
    left: 0;
    z-index: 99999 !important;
    width: 100%;
    min-width: 160px;
    max-height: 240px;
    overflow-y: auto;
    background-color: var(--bs-body-bg, #ffffff);
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 0.375rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);
    padding: 4px 0;
    margin: 0;
    list-style: none;
  }

  .vs__dropdown-option {
    padding: 5px 10px;
    font-size: 0.82rem;
    color: var(--bs-body-color, #212529);
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .vs__dropdown-option--highlight {
    background-color: #0d6efd;
    color: #ffffff;
  }

  .vs__dropdown-option--selected {
    font-weight: 600;
    background-color: rgba(13, 110, 253, 0.1);
    color: #0d6efd;
  }

  .vs__no-options {
    text-align: center;
    padding: 8px;
    font-size: 0.8rem;
    color: #6c757d;
  }
}
</style>