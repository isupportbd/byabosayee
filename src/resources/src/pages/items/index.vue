<template>
  <div class="items-page">
    <!-- Toast Notification -->
    <div
      v-if="toast.show"
      class="toast-container position-fixed top-0 end-0 p-3"
      style="z-index: 1080;">
      <div
        class="toast show align-items-center border-0 shadow-lg"
        :class="`text-bg-${toast.type}`"
        role="alert">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2 py-2">
            <i
              class="bi fs-5"
              :class="{
                'bi-check-circle-fill': toast.type === 'success',
                'bi-exclamation-triangle-fill': toast.type === 'warning',
                'bi-x-circle-fill': toast.type === 'danger',
                'bi-info-circle-fill': toast.type === 'info'
              }"></i>
            <span>{{ toast.message }}</span>
          </div>
          <button
            type="button"
            class="btn-close btn-close-white me-2 m-auto"
            aria-label="Close"
            @click="toast.show = false"></button>
        </div>
      </div>
    </div>

    <!-- Top Card: আইটেম এন্ট্রি ফর্ম (সাব-ক্যাটাগরি ও সাইজ দিলে অটো আইটেম তৈরি হবে) -->
    <div
      class="card border shadow-sm mb-3 item-form-card"
      :class="{ 'item-form-edit-mode': isEditing }">
      <div class="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between py-2">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-tag-fill text-warning fs-5"></i>
          <h6 class="m-0 fw-bold">
            {{ isEditing ? 'পণ্য তথ্য সম্পাদনা' : 'নতুন পণ্য তৈরি করুন' }}
          </h6>
          <span
            v-if="isEditing"
            class="badge bg-primary-subtle text-primary border border-primary-subtle small">
            এডিটিং মোড
          </span>
        </div>
      </div>

      <div class="card-body p-3">
        <form @submit.prevent="submitForm">
          <!-- ৬ কলামে মূল ফিল্ডগুলো: ক্যাটাগরি, সাব-ক্যাটাগরি, পণ্যের নাম, পণ্য কোড (অটো), সাইজ, একক -->
          <div class="row g-2 mb-3 align-items-start">
            <!-- ১. ক্যাটাগরি -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block">
                ক্যাটাগরি <span class="text-danger">*</span>
              </label>
              <select
                v-model="form.categoryId"
                class="form-select form-select-sm single-row-input"
                required
                @change="onCategoryChange">
                <option value="" disabled>ক্যাটাগরি নির্বাচন করুন</option>
                <option v-for="cat in categoriesList" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <!-- ২. সাব-ক্যাটাগরি -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block">
                সাব-ক্যাটাগরি <span class="text-danger">*</span>
              </label>
              <select
                v-model="form.subCategoryId"
                class="form-select form-select-sm single-row-input"
                :class="{ 'frozen-input': !form.categoryId }"
                :disabled="!form.categoryId"
                required
                @change="onSubCategoryChange">
                <option value="" disabled>
                  {{ form.categoryId ? 'সাব-ক্যাটাগরি নির্বাচন করুন' : 'আগে ক্যাটাগরি দিন' }}
                </option>
                <option v-for="sub in filteredSubCategories" :key="sub.id" :value="sub.id">
                  {{ sub.name }}
                </option>
              </select>
            </div>

            <!-- ৩. পণ্যের নাম -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="পণ্যের নাম">
                পণ্যের নাম <span class="text-danger">*</span>
              </label>
              <input
                v-model.trim="form.name"
                type="text"
                class="form-control form-control-sm single-row-input"
                :class="{ 'frozen-input': !form.categoryId }"
                :placeholder="!form.categoryId ? 'আগে ক্যাটাগরি দিন' : !form.subCategoryId ? 'আগে সাব-ক্যাটাগরি দিন' : 'পণ্যের নাম দিন'"
                required />
            </div>

            <!-- ৪. পণ্য কোড (অটো) -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="কোম্পানীর অভ্যন্তরীণ পণ্য কোড (অটো)">
                পণ্য কোড (অটো) <span class="text-danger">*</span>
              </label>
              <input
                v-model.trim="form.code"
                type="text"
                class="form-control form-control-sm single-row-input font-monospace frozen-input"
                readonly
                tabindex="-1"
                placeholder="অটো কোড"
                required />
            </div>

            <!-- ৫. সাইজ -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block">
                সাইজ <span class="text-danger">*</span>
              </label>
              <select
                v-model="form.sizeId"
                class="form-select form-select-sm single-row-input"
                :class="{ 'frozen-input': !form.subCategoryId }"
                :disabled="!form.subCategoryId"
                required
                @change="onSizeChange">
                <option value="" disabled>
                  {{ form.subCategoryId ? 'সাইজ নির্বাচন করুন' : 'আগে সাব-ক্যাটাগরি দিন' }}
                </option>
                <option v-for="s in filteredSizesList" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </div>

            <!-- ৬. পরিমাপের একক -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block">
                একক (Unit) <span class="text-danger">*</span>
              </label>
              <select
                v-model="form.unitId"
                class="form-select form-select-sm single-row-input"
                :class="{ 'frozen-input': !form.categoryId || !form.subCategoryId }"
                :disabled="!form.categoryId || !form.subCategoryId"
                required>
                <option value="" disabled>
                  {{ !form.categoryId ? 'আগে ক্যাটাগরি দিন' : !form.subCategoryId ? 'আগে সাব-ক্যাটাগরি দিন' : filteredUnitsList.length === 0 ? 'এই সাব-ক্যাটাগরির কোনো একক নেই' : 'একক নির্বাচন করুন' }}
                </option>
                <option v-for="u in filteredUnitsList" :key="u.id" :value="u.id">
                  {{ u.name }} {{ u.shortName ? `(${u.shortName})` : '' }}
                </option>
              </select>
            </div>
          </div>

          <!-- Form Submit Actions -->
          <div class="d-flex align-items-center justify-content-end gap-2 pt-2 border-top">
            <button
              v-if="isEditing"
              type="button"
              class="btn btn-sm btn-outline-secondary px-3"
              @click="cancelEdit">
              <i class="bi bi-x-circle me-1"></i>
              বাতিল
            </button>
            <button
              v-else
              type="button"
              class="btn btn-sm px-3 item-btn-reset"
              @click="resetForm">
              রিসেট
            </button>
            <button
              type="submit"
              class="btn btn-sm px-3 d-inline-flex align-items-center gap-1 shadow-sm item-btn-submit"
              :class="isEditing ? 'btn-primary' : ''"
              :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i v-else :class="isEditing ? 'bi bi-arrow-repeat' : 'bi bi-check-circle'"></i>
              <span>{{ isEditing ? 'আপডেট করুন' : 'সংরক্ষণ করুন' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Bottom Card: পণ্যের তালিকা (ফিল্টার + টেবিল) -->
    <div class="card border shadow-sm">
      <div class="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2 py-2">
        <div class="d-flex align-items-center gap-2">
          <h6 class="m-0 fw-bold">সকল পণ্যের তালিকা</h6>
          <span class="badge bg-secondary-subtle text-secondary border">
            {{ toBengaliNumber(filteredItems.length) }} টি
          </span>
        </div>

        <!-- ফিল্টার বার -->
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <!-- ১. ক্যাটাগরি ফিল্টার -->
          <div style="min-width: 140px;">
            <select
              v-model="categoryFilter"
              class="form-select form-select-sm search-input-unified"
              @change="onCategoryFilterChange">
              <option value="all">সকল ক্যাটাগরি</option>
              <option v-for="cat in categoriesList" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- ২. সাব-ক্যাটাগরি ফিল্টার -->
          <div style="min-width: 150px;">
            <select
              v-model="subCategoryFilter"
              class="form-select form-select-sm search-input-unified">
              <option value="all">সকল সাব-ক্যাটাগরি</option>
              <option v-for="sub in subCategoriesForFilter" :key="sub.id" :value="sub.id">
                {{ sub.name }}
              </option>
            </select>
          </div>

          <!-- ৩. সাইজ ফিল্টার -->
          <div style="min-width: 120px;">
            <select
              v-model="sizeFilter"
              class="form-select form-select-sm search-input-unified">
              <option value="all">সকল সাইজ</option>
              <option v-for="s in uniqueSizesForFilter" :key="s" :value="s">
                {{ s }}
              </option>
            </select>
          </div>

          <!-- ৪. সার্চ বক্স -->
          <div class="position-relative" style="min-width: 170px;">
            <input
              v-model.trim="searchQuery"
              type="text"
              class="form-control form-control-sm ps-4 search-input-unified"
              placeholder="পণ্য খুঁজুন..." />
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted small pe-none"></i>
            <button
              v-if="searchQuery"
              type="button"
              class="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-2"
              @click="searchQuery = ''">
              <i class="bi bi-x"></i>
            </button>
          </div>

          <!-- ৫. ফিল্টার রিসেট বাটন (সংরক্ষণ বাটনের মতো সলিড সেকেন্ডারি ব্যাকগ্রাউন্ড ও সর্বদা সক্রিয় অবস্থা) -->
          <button
            type="button"
            class="btn btn-sm btn-secondary d-inline-flex align-items-center justify-content-center shadow-sm filter-reset-btn"
            title="সকল ফিল্টার রিসেট করুন"
            @click="resetAllFilters">
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
        </div>
      </div>

      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-secondary" role="status">
            <span class="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <div class="text-muted small mt-2">পণ্যের তালিকা লোড হচ্ছে...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredItems.length === 0" class="text-center py-5">
          <i class="bi bi-tag text-muted fs-1 mb-2 d-block"></i>
          <p class="text-muted mb-0">
            {{ isFiltered ? 'অনুসন্ধানের সাথে কোনো পণ্য মেলেনি।' : 'এখনো কোনো পণ্য তৈরি করা হয়নি।' }}
          </p>
        </div>

        <!-- Table View: #, ক্যাটাগরি, সাব-ক্যাটাগরি, পণ্যের নাম, কোড, সাইজ, একক, স্টেটাস, একশন -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="item-table-header">
              <tr class="small">
                <th style="width: 45px;" class="text-center">#</th>
                <th style="width: 15%;">ক্যাটাগরি</th>
                <th style="width: 15%;">সাব-ক্যাটাগরি</th>
                <th style="width: 25%;">পণ্যের নাম</th>
                <th style="width: 15%;">পণ্য কোড</th>
                <th style="width: 10%;">সাইজ</th>
                <th style="width: 10%;">একক</th>
                <th style="width: 80px;" class="text-center">স্টেটাস</th>
                <th style="width: 70px;" class="text-center">একশন</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in filteredItems"
                :key="item.id"
                :class="{ 'item-row-inactive': !item.isActive }">
                <td class="text-center item-index-cell small">{{ index + 1 }}</td>

                <!-- ১. ক্যাটাগরি (রেগুলার ফন্ট) -->
                <td>
                  <span class="item-cell-text item-category-cell">
                    {{ item.category?.name || '-' }}
                  </span>
                </td>

                <!-- ২. সাব-ক্যাটাগরি (রেগুলার ফন্ট) -->
                <td>
                  <span class="item-cell-text item-subcategory-cell">
                    {{ item.subCategory?.name || '-' }}
                  </span>
                </td>

                <!-- ৩. পণ্যের নাম (রেগুলার ফন্ট) -->
                <td>
                  <span class="item-cell-text item-name-cell">
                    {{ item.name }}
                  </span>
                </td>

                <!-- ৪. কোড (আলাদা কলাম) -->
                <td>
                  <span class="item-cell-text font-monospace small">
                    {{ item.code || '-' }}
                  </span>
                </td>

                <!-- ৫. সাইজ (রেগুলার ফন্ট) -->
                <td>
                  <span class="item-cell-text">
                    {{ item.size?.name || '-' }}
                  </span>
                </td>

                <!-- ৬. একক (রেগুলার ফন্ট) -->
                <td>
                  <span class="item-cell-text">
                    {{ item.unit?.name || (item.unit?.shortName ? item.unit.shortName : '-') }}
                  </span>
                </td>

                <!-- ৭. স্টেটাস টগল (কোনো টেক্সট ছাড়া) -->
                <td class="text-center">
                  <div class="form-check form-switch d-inline-flex justify-content-center m-0 align-middle">
                    <input
                      class="form-check-input my-0"
                      type="checkbox"
                      role="switch"
                      :checked="item.isActive"
                      :disabled="togglingStatusId === item.id"
                      :title="item.isActive ? 'নিষ্ক্রিয় করতে টগল করুন' : 'সক্রিয় করতে টগল করুন'"
                      @change="toggleStatus(item)"
                      style="cursor: pointer; width: 2.1rem; height: 1.15rem;" />
                  </div>
                </td>

                <!-- ৮. একশন (শুধুমাত্র এডিট বাটন) -->
                <td class="text-center">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary p-1 px-2 d-inline-flex align-items-center justify-content-center shadow-none action-btn"
                    title="সম্পাদন করুন"
                    @click="startEdit(item)">
                    <i class="bi bi-pencil"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import axios from "axios";

// Bengali Number Formatter
function toBengaliNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined || num === "") return "০";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/[0-9]/g, (w) => bengaliDigits[+w]);
}

// Toast
const toast = reactive({
  show: false,
  message: "",
  type: "success" as "success" | "danger" | "warning" | "info"
});

function showToast(message: string, type: "success" | "danger" | "warning" | "info" = "success") {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 3500);
}

// State
const loading = ref(false);
const submitting = ref(false);
const togglingStatusId = ref<number | null>(null);

// Catalog Lists
const categoriesList = ref<any[]>([]);
const allSubCategoriesList = ref<any[]>([]);
const allSizesList = ref<any[]>([]);
const colorsList = ref<any[]>([]);
const unitsList = ref<any[]>([]);
const brandsList = ref<any[]>([]);
const itemsList = ref<any[]>([]);

// Edit State
const isEditing = ref(false);
const editingItem = ref<any>(null);

// Form
const form = reactive({
  categoryId: "" as string | number,
  subCategoryId: "" as string | number,
  sizeId: "" as string | number,
  name: "",
  code: "",
  unitId: "" as string | number
});

// Flag to indicate if name was auto-generated
const isAutoGenerated = ref(false);

// Filtered Subcategories based on selected category (in Form)
const filteredSubCategories = computed(() => {
  if (!form.categoryId) return [];
  return allSubCategoriesList.value.filter(
    (s: any) => String(s.categoryId) === String(form.categoryId)
  );
});

// Filtered Sizes based on selected category / subcategory or all sizes
const filteredSizesList = computed(() => {
  if (form.subCategoryId) {
    const matched = allSizesList.value.filter(
      (s: any) => String(s.subCategoryId) === String(form.subCategoryId)
    );
    if (matched.length > 0) return matched;
  }
  if (form.categoryId) {
    const matched = allSizesList.value.filter(
      (s: any) => String(s.categoryId) === String(form.categoryId)
    );
    if (matched.length > 0) return matched;
  }
  return allSizesList.value;
});

// Filtered Units based on selected category & subcategory (or general units if none assigned)
const filteredUnitsList = computed(() => {
  if (form.subCategoryId) {
    const matched = unitsList.value.filter(
      (u: any) => String(u.subCategoryId) === String(form.subCategoryId)
    );
    if (matched.length > 0) return matched;
  }
  if (form.categoryId) {
    const matched = unitsList.value.filter(
      (u: any) => String(u.categoryId) === String(form.categoryId)
    );
    if (matched.length > 0) return matched;
  }
  const unassigned = unitsList.value.filter((u: any) => !u.categoryId && !u.subCategoryId);
  return unassigned.length > 0 ? unassigned : unitsList.value;
});

/**
 * অটো আইটেম তৈরির লজিক:
 * সাব-ক্যাটাগরি ও সাইজ উভয়ই পাওয়া গেলে আইটেমের নাম হবে: "[সাব-ক্যাটাগরি] সাইজ-[সাইজ]"
 * যেমন: লোফার সাইজ-৩৯, ডেনিম শার্ট সাইজ-M ইত্যাদি
 */
function updateAutoItemName() {
  if (isEditing.value) return; // Do not overwrite on edit unless user changes dropdowns deliberately

  const subCat = allSubCategoriesList.value.find(
    (s: any) => String(s.id) === String(form.subCategoryId)
  );
  const sizeObj = allSizesList.value.find(
    (s: any) => String(s.id) === String(form.sizeId)
  );

  if (subCat && sizeObj) {
    form.name = `${subCat.name} সাইজ-${sizeObj.name}`;
    isAutoGenerated.value = true;
  }
}

function onCategoryChange() {
  form.subCategoryId = "";
  form.sizeId = "";
  form.name = "";
  form.unitId = "";
  if (!form.code) {
    form.code = generateNextProductCode();
  }
  isAutoGenerated.value = false;
}

function onSubCategoryChange() {
  form.sizeId = "";
  const subCat = allSubCategoriesList.value.find(
    (s: any) => String(s.id) === String(form.subCategoryId)
  );
  if (subCat && !form.name) {
    form.name = subCat.name;
  }
  if (!form.code) {
    form.code = generateNextProductCode();
  }
  updateAutoItemName();
  if (filteredUnitsList.value.length === 1 && !form.unitId) {
    form.unitId = filteredUnitsList.value[0].id;
  }
}

function onSizeChange() {
  updateAutoItemName();
  if (!form.code) {
    form.code = generateNextProductCode();
  }
  // Auto-select unit if exactly 1 matching unit exists for this subcategory/category and unit isn't selected
  if (filteredUnitsList.value.length === 1 && !form.unitId) {
    form.unitId = filteredUnitsList.value[0].id;
  }
}

function resetForm() {
  form.categoryId = "";
  form.subCategoryId = "";
  form.sizeId = "";
  form.name = "";
  form.code = generateNextProductCode();
  form.unitId = "";
  isAutoGenerated.value = false;
}

function startEdit(item: any) {
  isEditing.value = true;
  editingItem.value = item;
  form.categoryId = item.categoryId || (item.category ? item.category.id : "");
  form.subCategoryId = item.subCategoryId || (item.subCategory ? item.subCategory.id : "");
  form.sizeId = item.sizeId || (item.size ? item.size.id : "");
  form.name = item.name || "";
  form.code = item.code || "";
  form.unitId = item.unitId || (item.unit ? item.unit.id : "");
  isAutoGenerated.value = false;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
  isEditing.value = false;
  editingItem.value = null;
  resetForm();
}

// Filters State
const categoryFilter = ref("all");
const subCategoryFilter = ref("all");
const sizeFilter = ref("all");
const searchQuery = ref("");

const isFiltered = computed(() => {
  return (
    categoryFilter.value !== "all" ||
    subCategoryFilter.value !== "all" ||
    sizeFilter.value !== "all" ||
    searchQuery.value.trim().length > 0
  );
});

const subCategoriesForFilter = computed(() => {
  if (categoryFilter.value === "all") return allSubCategoriesList.value;
  return allSubCategoriesList.value.filter(
    (s: any) => String(s.categoryId) === String(categoryFilter.value)
  );
});

const uniqueSizesForFilter = computed(() => {
  const set = new Set<string>();
  itemsList.value.forEach((item) => {
    if (item.size?.name) set.add(item.size.name);
  });
  return Array.from(set);
});

function onCategoryFilterChange() {
  subCategoryFilter.value = "all";
}

function resetAllFilters() {
  categoryFilter.value = "all";
  subCategoryFilter.value = "all";
  sizeFilter.value = "all";
  searchQuery.value = "";
}

// Filtered Items
const filteredItems = computed(() => {
  let list = itemsList.value;

  // 1. Category Filter
  if (categoryFilter.value !== "all") {
    list = list.filter(
      (item) =>
        String(item.categoryId) === String(categoryFilter.value) ||
        String(item.category?.id) === String(categoryFilter.value)
    );
  }

  // 2. Sub-category Filter
  if (subCategoryFilter.value !== "all") {
    list = list.filter(
      (item) =>
        String(item.subCategoryId) === String(subCategoryFilter.value) ||
        String(item.subCategory?.id) === String(subCategoryFilter.value)
    );
  }

  // 3. Size Filter
  if (sizeFilter.value !== "all") {
    list = list.filter((item) => item.size?.name === sizeFilter.value);
  }

  // 4. Search Query Filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter((item) => {
      const matchName = item.name?.toLowerCase().includes(q);
      const matchCode = item.code?.toLowerCase().includes(q);
      const matchCat = item.category?.name?.toLowerCase().includes(q);
      const matchSub = item.subCategory?.name?.toLowerCase().includes(q);
      const matchBrand = item.brand?.name?.toLowerCase().includes(q);
      return matchName || matchCode || matchCat || matchSub || matchBrand;
    });
  }

  return list;
});

// Toggle Status
async function toggleStatus(item: any) {
  togglingStatusId.value = item.id;
  const newStatus = !item.isActive;
  try {
    const res = await axios.put(`/api/inventory/items/${item.id}`, {
      isActive: newStatus
    });
    item.isActive = newStatus;
    showToast(
      res.data?.message || (newStatus ? "পণ্য সক্রিয় করা হয়েছে" : "পণ্য নিষ্ক্রিয় করা হয়েছে"),
      "success"
    );
  } catch (err: any) {
    showToast(err.response?.data?.message || "স্টেটাস পরিবর্তন ব্যর্থ হয়েছে", "danger");
  } finally {
    togglingStatusId.value = null;
  }
}

// Submit Form (Create or Update)
async function submitForm() {
  if (!form.categoryId) {
    showToast("ক্যাটাগরি নির্বাচন করা আবশ্যক", "warning");
    return;
  }
  if (!form.subCategoryId) {
    showToast("সাব-ক্যাটাগরি নির্বাচন করা আবশ্যক", "warning");
    return;
  }
  if (!form.sizeId) {
    showToast("সাইজ নির্বাচন করা আবশ্যক", "warning");
    return;
  }
  if (!form.name.trim()) {
    showToast("পণ্যের নাম আবশ্যক", "warning");
    return;
  }
  if (!form.code.trim()) {
    showToast("পণ্য কোড / বারকোড আবশ্যক", "warning");
    return;
  }
  if (!form.unitId) {
    showToast("পরিমাপের একক নির্বাচন করা আবশ্যক (ক্রয়, বিক্রয় ও স্টক ব্যবস্থাপনার ভিত্তি)", "warning");
    return;
  }
  submitting.value = true;
  try {
    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      categoryId: Number(form.categoryId),
      subCategoryId: Number(form.subCategoryId),
      sizeId: Number(form.sizeId),
      unitId: Number(form.unitId)
    };

    if (isEditing.value && editingItem.value) {
      const res = await axios.put(`/api/inventory/items/${editingItem.value.id}`, payload);
      showToast(res.data?.message || "পণ্য সফলভাবে আপডেট হয়েছে", "success");
      cancelEdit();
    } else {
      const res = await axios.post("/api/inventory/items", payload);
      showToast(res.data?.message || "পণ্য সফলভাবে তৈরি হয়েছে", "success");
      resetForm();
    }
    await fetchItems();
  } catch (err: any) {
    showToast(err.response?.data?.message || "সংরক্ষণ ব্যর্থ হয়েছে", "danger");
  } finally {
    submitting.value = false;
  }
}

// Fetch Catalog Data (Categories, Sub-categories, Sizes, Colors, Units)
async function fetchCatalogData() {
  try {
    const masterRes = await axios.get("/api/catalog/master");
    const data = masterRes.data?.data || {};
    categoriesList.value = data.categories || [];
    allSubCategoriesList.value = data.subCategories || [];
    allSizesList.value = data.sizes || [];
    colorsList.value = data.colors || [];
    unitsList.value = data.units || [];
  } catch {
    try {
      const [catRes, subRes] = await Promise.all([
        axios.get("/api/catalog/categories"),
        axios.get("/api/catalog/sub-categories")
      ]);
      categoriesList.value = catRes.data?.data || [];
      allSubCategoriesList.value = subRes.data?.data || [];
    } catch {
      // Fallback
    }
  }
}

// Fetch Brands
async function fetchBrands() {
  try {
    const res = await axios.get("/api/inventory/brands");
    brandsList.value = res.data?.data || [];
  } catch {
    brandsList.value = [];
  }
}

// Fetch Items
async function fetchItems() {
  loading.value = true;
  try {
    const res = await axios.get("/api/inventory/items");
    itemsList.value = res.data?.data || [];
  } catch (err: any) {
    showToast(err.response?.data?.message || "আইটেম তালিকা লোড করা যায়নি", "danger");
  } finally {
    loading.value = false;
  }
}

// Company Settings Prefix
const productPrefix = ref("PRD-");

function generateNextProductCode(): string {
  const nextNum = itemsList.value.length + 1;
  return `${productPrefix.value}${nextNum}`;
}

async function fetchCompanySettings() {
  try {
    const res = await axios.get("/api/company/profile");
    if (res.data?.data?.productPrefix) {
      productPrefix.value = res.data.data.productPrefix;
    }
  } catch {
    productPrefix.value = "PRD-";
  }
}

onMounted(async () => {
  await Promise.all([fetchCompanySettings(), fetchCatalogData(), fetchBrands(), fetchItems()]);
  if (!isEditing.value) {
    form.code = generateNextProductCode();
  }
});
</script>

<style scoped>
.items-page {
  font-family: inherit;
}

.item-form-card {
  border-top: 3px solid #d97706 !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.text-warning {
  color: #b45309 !important;
}

.item-form-edit-mode {
  border-top: 3px solid #0d6efd !important;
  border-color: rgba(13, 110, 253, 0.45) !important;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.08) !important;
}

.single-row-input {
  height: 31px;
  line-height: 1.2;
}

.frozen-input,
.form-select.frozen-input,
.form-control.frozen-input,
.form-select:disabled,
.form-control:disabled {
  background-color: #f1f3f5 !important;
  cursor: not-allowed !important;
  color: #6c757d !important;
  border-color: #ced4da !important;
  user-select: none !important;
}

/* Inactive Row Styling */
.item-row-inactive {
  opacity: 0.52;
  background-color: rgba(0, 0, 0, 0.02) !important;
  transition: opacity 0.2s ease;
}
.item-row-inactive:hover {
  opacity: 0.85;
}

/* Action Buttons */
.action-btn {
  font-size: 0.82rem;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.search-input-unified {
  height: 31px;
  font-size: 0.82rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-input-unified:focus {
  border-color: #6c757d;
  box-shadow: 0 0 0 0.15rem rgba(108, 117, 125, 0.2);
}

/* ৩টি বা সকল কলামের জন্য সমান ও রেগুলার ফন্ট সাইজ */
.item-cell-text {
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.4;
}

.item-category-cell {
  color: #374151;
}

.item-subcategory-cell {
  color: #4b5563;
}

.item-name-cell {
  color: #111827;
}

/* বাটনগুলো কার্ডের টপ বার কালারের (#d97706) সাথে হুবহু সামঞ্জস্যপূর্ণ */
.item-btn-submit {
  background-color: #d97706 !important;
  border-color: #d97706 !important;
  color: #ffffff !important;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
}

.item-btn-submit:hover,
.item-btn-submit:focus {
  background-color: #b45309 !important;
  border-color: #b45309 !important;
  color: #ffffff !important;
  box-shadow: 0 2px 6px rgba(217, 119, 6, 0.35) !important;
  transform: translateY(-1px);
}

.item-btn-submit:active {
  background-color: #92400e !important;
  border-color: #92400e !important;
  color: #ffffff !important;
  transform: translateY(0);
}

.item-btn-submit:disabled {
  background-color: #d97706 !important;
  border-color: #d97706 !important;
  opacity: 0.65;
  color: #ffffff !important;
}

.item-btn-reset {
  background-color: transparent !important;
  border: 1px solid #d97706 !important;
  color: #b45309 !important;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
}

.item-btn-reset:hover,
.item-btn-reset:focus {
  background-color: #fef3c7 !important;
  border-color: #b45309 !important;
  color: #92400e !important;
  transform: translateY(-1px);
}

.item-btn-reset:active {
  background-color: #fde68a !important;
  border-color: #92400e !important;
  color: #78350f !important;
  transform: translateY(0);
}

/* ফিল্টার রিসেট বাটন (বার কালার থিম) */
.filter-reset-btn {
  height: 31px;
  width: 32px;
  min-width: 32px;
  border-radius: 6px;
  padding: 0;
  font-size: 0.95rem;
  background-color: #d97706 !important;
  border-color: #d97706 !important;
  color: #ffffff !important;
  transition: all 0.15s ease;
}

.filter-reset-btn:hover {
  background-color: #b45309 !important;
  border-color: #b45309 !important;
  color: #ffffff !important;
  transform: translateY(-1px);
}

.filter-reset-btn:active {
  background-color: #92400e !important;
  border-color: #92400e !important;
  color: #ffffff !important;
}
</style>

<!-- Unscoped Dark Theme Styles for Pure Neutral Black / Charcoal (Zero Blue) -->
<style lang="scss">
.theme-dark,
[data-bs-theme="dark"] {
  .items-page {
    /* Top Form Card */
    .item-form-card {
      background-color: #1b1b1f !important;
      border-color: #2e2e2e !important;
      border-top: 3px solid #f59e0b !important;
      color: #f0f0f0 !important;

      .card-header {
        background-color: #171719 !important;
        border-bottom-color: #262626 !important;
      }
    }

    .item-form-edit-mode {
      border-top: 3px solid #0d6efd !important;
      border-color: rgba(13, 110, 253, 0.55) !important;
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.12) !important;
    }

    /* Form Inputs - Strict Neutral Dark */
    .form-control,
    .form-select {
      background-color: #121212 !important;
      border-color: #333333 !important;
      color: #f0f0f0 !important;

      &:focus {
        background-color: #121212 !important;
        border-color: #6c757d !important;
        box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.25) !important;
        color: #ffffff !important;
      }

      &::placeholder {
        color: #737373 !important;
      }
    }

    .form-select option {
      background-color: #1b1b1f !important;
      color: #f0f0f0 !important;
    }

    .frozen-input,
    .form-select.frozen-input,
    .form-control.frozen-input,
    .form-select:disabled,
    .form-control:disabled {
      background-color: #17171a !important;
      border-color: #2b2b30 !important;
      color: #888888 !important;
      cursor: not-allowed !important;
    }

    /* Table Card */
    .card {
      background-color: #1b1b1f !important;
      border-color: #2e2e2e !important;
      color: #f0f0f0 !important;

      .card-header {
        background-color: #171719 !important;
        border-bottom-color: #262626 !important;
      }
    }

    /* Table Header */
    .item-table-header th {
      background-color: #161618 !important;
      color: #a6a6a6 !important;
      border-bottom: 1px solid #2a2a2a !important;
    }

    /* Table Rows & Cells */
    .table > :not(caption) > * > * {
      background-color: transparent !important;
      border-bottom-color: #262626 !important;
      color: #e5e5e5 !important;
    }

    .table-hover > tbody > tr:hover > * {
      background-color: rgba(255, 255, 255, 0.035) !important;
    }

    .item-cell-text {
      font-weight: 400 !important;
    }

    .item-name-cell {
      color: #ffffff !important;
      font-weight: 400 !important;
    }

    .item-category-cell {
      color: #d1d5db !important;
    }

    .item-subcategory-cell {
      color: #9ca3af !important;
    }

    .item-index-cell {
      color: #888888 !important;
    }

    /* Inactive Row in Dark Mode */
    .item-row-inactive {
      opacity: 0.42 !important;
      background-color: rgba(255, 255, 255, 0.015) !important;

      .item-name-cell,
      .item-category-cell,
      .item-subcategory-cell {
        color: #666666 !important;
      }

      &:hover {
        opacity: 0.85 !important;
      }
    }

    .search-input-unified {
      background-color: #121212 !important;
      border-color: #333333 !important;
      color: #f0f0f0 !important;

      &:focus {
        background-color: #121212 !important;
        border-color: #6c757d !important;
        box-shadow: 0 0 0 0.15rem rgba(108, 117, 125, 0.25) !important;
      }

      &::placeholder {
        color: #808080 !important;
      }
    }

    /* বাটনগুলো ডার্ক মোডে বার কালারের (#f59e0b) সাথে মেলানো */
    .item-btn-submit {
      background-color: #f59e0b !important;
      border-color: #f59e0b !important;
      color: #121212 !important;
      font-weight: 600 !important;

      &:hover,
      &:focus {
        background-color: #fbbf24 !important;
        border-color: #fbbf24 !important;
        color: #000000 !important;
        box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4) !important;
      }

      &:disabled {
        background-color: #f59e0b !important;
        border-color: #f59e0b !important;
        opacity: 0.6 !important;
        color: #121212 !important;
      }
    }

    .item-btn-reset {
      border: 1px solid #f59e0b !important;
      color: #fbbf24 !important;
      background-color: transparent !important;

      &:hover,
      &:focus {
        background-color: rgba(245, 158, 11, 0.16) !important;
        border-color: #fbbf24 !important;
        color: #fcd34d !important;
      }
    }

    .filter-reset-btn {
      background-color: #f59e0b !important;
      border-color: #f59e0b !important;
      color: #121212 !important;

      &:hover {
        background-color: #fbbf24 !important;
        border-color: #fbbf24 !important;
        color: #000000 !important;
      }
    }

    .text-warning {
      color: #fbbf24 !important;
    }
  }
}
</style>
