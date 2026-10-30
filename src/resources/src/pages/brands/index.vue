<template>
  <div class="brands-page">
    <!-- Toast Notification -->
    <Toast ref="toastRef" />

    <!-- Top Action / Navigation Bar -->
    <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-bookmark-star-fill text-secondary fs-4"></i>
        <div>
          <h5 class="m-0 fw-bold">ব্র্যান্ড ব্যবস্থাপনা</h5>
          <span class="text-muted small">
            {{ activeView === 'form' ? (isEditing ? 'ব্র্যান্ড তথ্য সম্পাদন ফরম' : 'নতুন ব্র্যান্ড তৈরি ফরম') : 'সকল নিবন্ধিত ব্র্যান্ডের তালিকা' }}
          </span>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button
          v-if="activeView === 'list'"
          type="button"
          class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5 shadow-sm"
          @click="openNewBrandForm">
          <i class="bi bi-plus-circle"></i>
          <span>নতুন ব্র্যান্ড যোগ করুন</span>
        </button>

        <button
          v-if="activeView === 'form'"
          type="button"
          class="btn btn-sm btn-primary text-white d-inline-flex align-items-center gap-1.5 shadow-sm px-3"
          @click="switchView('list')">
          <i class="bi bi-card-list"></i>
          <span>ব্র্যান্ড তালিকা</span>
        </button>
      </div>
    </div>

    <!-- Brand Entry / Edit Form -->
    <div
      v-show="activeView === 'form'"
      class="card border shadow-sm mb-4 brand-form-card"
      :class="{ 'brand-form-edit-mode': isEditing }">
      <div class="card-header bg-transparent border-bottom py-2 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <h6
          class="m-0 fw-bold d-flex align-items-center gap-2"
          :class="isEditing ? 'text-primary' : 'text-secondary'">
          <i :class="isEditing ? 'bi bi-pencil-square' : 'bi bi-bookmark-plus-fill'"></i>
          <span>{{ isEditing ? 'ব্রান্ডের তথ্য সম্পাদন' : 'নতুন ব্রান্ড' }}</span>
        </h6>
        <div class="d-flex align-items-center gap-2">
          <span
            v-if="isEditing"
            class="badge bg-primary-subtle text-primary border border-primary-subtle py-1 px-2 small">
            <i class="bi bi-pencil-fill me-1"></i>সম্পাদন মোড
          </span>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 py-1 px-3 shadow-sm fw-medium"
            @click="switchView('list')">
            <i class="bi bi-card-list"></i>
            <span>ব্র্যান্ড তালিকা</span>
          </button>
        </div>
      </div>

      <div class="card-body">
        <form @submit.prevent="submitBrandForm">
          <div class="row g-2 mb-3 align-items-start">
            <!-- ১. ক্যাটাগরি (Category) -->
            <div class="col-12 col-sm-6 col-lg-4">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" for="categorySelect" title="ক্যাটাগরি">
                ক্যাটাগরি <span class="text-danger">*</span>
              </label>
              <select
                id="categorySelect"
                v-model="form.categoryId"
                class="form-select form-select-sm text-truncate"
                @change="onCategoryChange"
                required>
                <option value="" disabled>ক্যাটাগরি নির্বাচন করুন</option>
                <option v-for="cat in categoriesList" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <!-- ২. সাব-ক্যাটাগরি (Sub-category - Dependent Dropdown) -->
            <div class="col-12 col-sm-6 col-lg-4">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" for="subCategorySelect" title="সাব-ক্যাটাগরি">
                সাব-ক্যাটাগরি <span class="text-danger">*</span>
              </label>
              <select
                id="subCategorySelect"
                v-model="form.subCategoryId"
                class="form-select form-select-sm text-truncate"
                :disabled="!form.categoryId || filteredSubCategories.length === 0"
                required>
                <option value="" disabled>
                  {{ !form.categoryId ? 'আগে ক্যাটাগরি নির্বাচন করুন' : (filteredSubCategories.length === 0 ? 'কোনো সাব-ক্যাটাগরি নেই' : 'সাব-ক্যাটাগরি নির্বাচন করুন') }}
                </option>
                <option v-for="sub in filteredSubCategories" :key="sub.id" :value="sub.id">
                  {{ sub.name }}
                </option>
              </select>
            </div>

            <!-- ৩. ব্রান্ডের নাম (Brand Name) -->
            <div class="col-12 col-sm-12 col-lg-4">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="ব্রান্ডের নাম">
                ব্রান্ডের নাম <span class="text-danger">*</span>
              </label>
              <input
                v-model.trim="form.name"
                type="text"
                class="form-control form-control-sm single-row-input"
                placeholder="যেমন: Zara, Richman, নিজস্ব ব্রান্ড"
                :title="form.name || ''"
                required />
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
              class="btn btn-sm btn-outline-secondary px-3"
              @click="resetForm">
              রিসেট
            </button>
            <button
              type="submit"
              class="btn btn-sm px-3 d-inline-flex align-items-center gap-1 shadow-sm"
              :class="isEditing ? 'btn-primary' : 'btn-secondary'"
              :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i v-else :class="isEditing ? 'bi bi-arrow-repeat' : 'bi bi-check-circle'"></i>
              <span>{{ isEditing ? 'আপডেট করুন' : 'সংরক্ষণ করুন' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Brand List Section -->
    <div v-show="activeView === 'list'" class="card border shadow-sm">
      <div class="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2 py-2">
        <div class="d-flex align-items-center gap-2">
          <h6 class="m-0 fw-bold">সকল ব্রান্ডের তালিকা</h6>
          <span class="badge bg-secondary-subtle text-secondary border">
            {{ toBengaliNumber(filteredBrands.length) }} টি
          </span>
        </div>

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

          <!-- ২. সাব-ক্যাটাগরি ফিল্টার (ডিপেন্ডেন্ট) -->
          <div style="min-width: 155px;">
            <select
              v-model="subCategoryFilter"
              class="form-select form-select-sm search-input-unified"
              @change="onSubCategoryFilterChange">
              <option value="all">সকল সাব-ক্যাটাগরি</option>
              <option v-for="sub in subCategoriesForFilter" :key="sub.id" :value="sub.id">
                {{ sub.name }}
              </option>
            </select>
          </div>

          <!-- ৩. ব্রান্ড ফিল্টার -->
          <div style="min-width: 140px;">
            <select
              v-model="brandFilter"
              class="form-select form-select-sm search-input-unified">
              <option value="all">সকল ব্রান্ড</option>
              <option v-for="bName in uniqueBrandsForFilter" :key="bName" :value="bName">
                {{ bName }}
              </option>
            </select>
          </div>

          <!-- ৪. সার্চ বক্স -->
          <div class="position-relative" style="min-width: 170px;">
            <input
              v-model.trim="searchQuery"
              type="text"
              class="form-control form-control-sm ps-4 search-input-unified"
              placeholder="খুঁজুন..." />
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted small pe-none"></i>
            <button
              v-if="searchQuery"
              type="button"
              class="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-2"
              @click="searchQuery = ''">
              <i class="bi bi-x"></i>
            </button>
          </div>

          <!-- ফিল্টার রিসেট বাটন (সংরক্ষণ বাটনের মতো সলিড সেকেন্ডারি ব্যাকগ্রাউন্ড ও সক্রিয় অবস্থা) -->
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
          <div class="text-muted small mt-2">ব্রান্ডের তালিকা লোড হচ্ছে...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredBrands.length === 0" class="text-center py-5">
          <i class="bi bi-bookmark-star text-muted fs-1 mb-2 d-block"></i>
          <p class="text-muted mb-0">
            {{ searchQuery || categoryFilter !== 'all' ? 'অনুসন্ধানের সাথে কোনো ব্রান্ড মেলেনি।' : 'এখনো কোনো ব্রান্ড যোগ করা হয়নি।' }}
          </p>
        </div>

        <!-- Table View with Columns: #, Category, Sub-category, Brand Name, Status Toggle, Edit Action -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="brand-table-header">
              <tr class="small">
                <th style="width: 50px;" class="text-center">#</th>
                <th style="width: 28%;">ক্যাটাগরি</th>
                <th style="width: 28%;">সাব-ক্যাটাগরি</th>
                <th style="width: 28%;">ব্রান্ডের নাম</th>
                <th style="width: 95px;" class="text-center">স্টেটাস</th>
                <th style="width: 75px;" class="text-center">একশন</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(b, index) in filteredBrands"
                :key="b.id"
                :class="{ 'brand-row-inactive': !b.isActive }">
                <td class="text-center brand-index-cell small">{{ index + 1 }}</td>

                <!-- ১. ক্যাটাগরি -->
                <td>
                  <span class="brand-cell-text brand-category-cell">
                    {{ b.category?.name || 'সাধারণ' }}
                  </span>
                </td>

                <!-- ২. সাব-ক্যাটাগরি -->
                <td>
                  <span class="brand-cell-text brand-subcategory-cell">
                    {{ b.subCategory?.name || '-' }}
                  </span>
                </td>

                <!-- ৩. ব্রান্ডের নাম -->
                <td>
                  <span class="brand-cell-text brand-name-cell">
                    {{ b.name }}
                  </span>
                </td>

                <!-- ৪. স্টেটাস টগল (কোনো টেক্সট ছাড়া) -->
                <td class="text-center">
                  <div class="form-check form-switch d-inline-flex justify-content-center m-0 align-middle">
                    <input
                      class="form-check-input my-0"
                      type="checkbox"
                      role="switch"
                      :checked="b.isActive"
                      :disabled="togglingStatusId === b.id"
                      :title="b.isActive ? 'নিষ্ক্রিয় করতে টগল করুন' : 'সক্রিয় করতে টগল করুন'"
                      @change="toggleStatus(b)"
                      style="cursor: pointer; width: 2.1rem; height: 1.15rem;" />
                  </div>
                </td>

                <!-- ৫. একশন (শুধুমাত্র এডিট বাটন) -->
                <td class="text-center">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary p-1 px-2 d-inline-flex align-items-center justify-content-center shadow-none action-btn"
                    title="সম্পাদন করুন"
                    @click="startEdit(b)">
                    <i class="bi bi-pencil-square"></i>
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
import axios from "axios";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Toast from "@/components/Toast.vue";

const route = useRoute();
const router = useRouter();

// View State: 'list' (default) vs 'form'
const activeView = ref<"list" | "form">(route.query.view === "form" ? "form" : "list");

watch(
  () => route.query.view,
  (view) => {
    if (view === "form") {
      activeView.value = "form";
    } else {
      activeView.value = "list";
    }
  },
  { immediate: true }
);

function switchView(view: "list" | "form") {
  activeView.value = view;
  if (router) {
    router.replace({ query: { ...route.query, view } });
  }
}

function openNewBrandForm() {
  resetForm();
  switchView("form");
}

const toastRef = ref<any>(null);

function showToast(message: string, type: "success" | "danger" | "warning" = "success") {
  toastRef.value?.toastme(message, type);
}

const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
function toBengaliNumber(n: number | string) {
  return String(n).replace(/[0-9]/g, (d) => bengaliDigits[Number(d)]);
}

// State
const loading = ref(false);
const submitting = ref(false);
const togglingStatusId = ref<number | null>(null);
const searchQuery = ref("");
const categoryFilter = ref<string | number>("all");
const subCategoryFilter = ref<string | number>("all");
const brandFilter = ref<string>("all");

const categoriesList = ref<any[]>([]);
const allSubCategoriesList = ref<any[]>([]);
const brandsList = ref<any[]>([]);

// Dependent subcategories for table filter
const subCategoriesForFilter = computed(() => {
  if (categoryFilter.value === "all") {
    return allSubCategoriesList.value;
  }
  return allSubCategoriesList.value.filter(
    (s: any) => String(s.categoryId) === String(categoryFilter.value)
  );
});

// Unique brands for table filter
const uniqueBrandsForFilter = computed(() => {
  let list = brandsList.value;
  if (categoryFilter.value !== "all") {
    list = list.filter(
      (b) => String(b.categoryId) === String(categoryFilter.value) || String(b.category?.id) === String(categoryFilter.value)
    );
  }
  if (subCategoryFilter.value !== "all") {
    list = list.filter(
      (b) => String(b.subCategoryId) === String(subCategoryFilter.value) || String(b.subCategory?.id) === String(subCategoryFilter.value)
    );
  }
  const names = Array.from(new Set(list.map((b) => b.name?.trim()).filter(Boolean)));
  names.sort((a, b) => a.localeCompare(b, "bn"));
  return names;
});

function onCategoryFilterChange() {
  subCategoryFilter.value = "all";
  brandFilter.value = "all";
}

function onSubCategoryFilterChange() {
  brandFilter.value = "all";
}

const isFiltered = computed(() => {
  return (
    categoryFilter.value !== "all" ||
    subCategoryFilter.value !== "all" ||
    brandFilter.value !== "all" ||
    searchQuery.value.trim() !== ""
  );
});

function resetAllFilters() {
  categoryFilter.value = "all";
  subCategoryFilter.value = "all";
  brandFilter.value = "all";
  searchQuery.value = "";
}

// Edit State
const isEditing = ref(false);
const editingBrand = ref<any>(null);

// Form
const form = reactive({
  categoryId: "" as string | number,
  subCategoryId: "" as string | number,
  name: ""
});

// Dependent subcategories based on selected category (in Form)
const filteredSubCategories = computed(() => {
  if (!form.categoryId) return [];
  return allSubCategoriesList.value.filter((s: any) => String(s.categoryId) === String(form.categoryId));
});

function onCategoryChange() {
  form.subCategoryId = "";
}

function resetForm() {
  form.categoryId = "";
  form.subCategoryId = "";
  form.name = "";
}

function startEdit(b: any) {
  isEditing.value = true;
  editingBrand.value = b;
  form.categoryId = b.categoryId || (b.category ? b.category.id : "");
  form.subCategoryId = b.subCategoryId || (b.subCategory ? b.subCategory.id : "");
  form.name = b.name;

  switchView("form");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
  isEditing.value = false;
  editingBrand.value = null;
  resetForm();
  switchView("list");
}

// Fetch Categories & Subcategories
async function fetchCatalogData() {
  try {
    const [catRes, subRes] = await Promise.all([
      axios.get("/api/catalog/categories"),
      axios.get("/api/catalog/sub-categories")
    ]);
    categoriesList.value = catRes.data?.data || [];
    allSubCategoriesList.value = subRes.data?.data || [];
  } catch (err) {
    // If master is available
    try {
      const masterRes = await axios.get("/api/catalog/master");
      categoriesList.value = masterRes.data?.data?.categories || [];
      allSubCategoriesList.value = masterRes.data?.data?.subCategories || [];
    } catch {
      // Fallback
    }
  }
}

// Fetch Brands
async function fetchBrands() {
  loading.value = true;
  try {
    const res = await axios.get("/api/inventory/brands");
    brandsList.value = (res.data?.data || []).map((b: any) => ({
      ...b,
      isActive: b.isActive !== false && b.is_active !== false
    }));
  } catch (err: any) {
    showToast(err.response?.data?.message || "ব্রান্ড লোড করতে সমস্যা হয়েছে", "danger");
    brandsList.value = [];
  } finally {
    loading.value = false;
  }
}

// Filtered Brands
const filteredBrands = computed(() => {
  let list = brandsList.value;

  // 1. Category Filter
  if (categoryFilter.value !== "all") {
    list = list.filter(
      (b) => String(b.categoryId) === String(categoryFilter.value) || String(b.category?.id) === String(categoryFilter.value)
    );
  }

  // 2. Sub-category Filter
  if (subCategoryFilter.value !== "all") {
    list = list.filter(
      (b) => String(b.subCategoryId) === String(subCategoryFilter.value) || String(b.subCategory?.id) === String(subCategoryFilter.value)
    );
  }

  // 3. Brand Name Filter
  if (brandFilter.value !== "all") {
    list = list.filter((b) => b.name?.trim() === brandFilter.value);
  }

  // 4. Search Query Filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter((b) => {
      const matchName = b.name?.toLowerCase().includes(q);
      const matchCat = b.category?.name?.toLowerCase().includes(q);
      const matchSub = b.subCategory?.name?.toLowerCase().includes(q);
      return matchName || matchCat || matchSub;
    });
  }

  return list;
});

// Toggle Status
async function toggleStatus(b: any) {
  const newStatus = !b.isActive;
  togglingStatusId.value = b.id;
  try {
    await axios.put(`/api/inventory/brands/${b.id}`, { isActive: newStatus });
    b.isActive = newStatus;
    showToast(`ব্রান্ড সফলভাবে ${newStatus ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`, "success");
  } catch (err: any) {
    showToast(err.response?.data?.message || "স্টেটাস পরিবর্তন ব্যর্থ হয়েছে", "danger");
  } finally {
    togglingStatusId.value = null;
  }
}

// Submit Brand Form
async function submitBrandForm() {
  if (!form.name || !form.name.trim()) {
    showToast("ব্রান্ডের নাম আবশ্যক", "danger");
    return;
  }

  if (!form.categoryId) {
    showToast("ক্যাটাগরি নির্বাচন করুন", "danger");
    return;
  }

  if (!form.subCategoryId) {
    showToast("সাব-ক্যাটাগরি নির্বাচন করুন", "danger");
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      name: form.name.trim(),
      categoryId: Number(form.categoryId),
      subCategoryId: Number(form.subCategoryId)
    };

    if (isEditing.value && editingBrand.value) {
      const res = await axios.put(`/api/inventory/brands/${editingBrand.value.id}`, payload);
      showToast(res.data?.message || "ব্রান্ড সফলভাবে আপডেট করা হয়েছে", "success");
      cancelEdit();
      await fetchBrands();
    } else {
      const res = await axios.post("/api/inventory/brands", payload);
      showToast(res.data?.message || "ব্রান্ড সফলভাবে তৈরি করা হয়েছে", "success");
      resetForm();
      await fetchBrands();
      switchView("list");
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || "সংরক্ষণ করতে সমস্যা হয়েছে", "danger");
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  await Promise.all([fetchCatalogData(), fetchBrands()]);
});
</script>

<style scoped>
.brands-page {
  font-family: inherit;
}

.brand-form-card {
  border-top: 3px solid #6c757d !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.brand-form-edit-mode {
  border-top: 3px solid #0d6efd !important;
  border-color: rgba(13, 110, 253, 0.45) !important;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.08) !important;
}

.single-row-input {
  height: 31px;
  line-height: 1.2;
}

/* Inactive Row Styling */
.brand-row-inactive {
  opacity: 0.52;
  background-color: rgba(0, 0, 0, 0.02) !important;
  transition: opacity 0.2s ease;
}
.brand-row-inactive:hover {
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

/* ৩টি কলামের জন্য সমান ও রেগুলার ফন্ট সাইজ */
.brand-cell-text {
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.4;
}

.brand-category-cell {
  color: #374151;
}

.brand-subcategory-cell {
  color: #4b5563;
}

.brand-name-cell {
  color: #111827;
}

/* ফিল্টার রিসেট বাটন (সংরক্ষণ বাটনের মতো সলিড সেকেন্ডারি ব্যাকগ্রাউন্ড ও সক্রিয় অবস্থা) */
.filter-reset-btn {
  height: 31px;
  width: 32px;
  min-width: 32px;
  border-radius: 6px;
  padding: 0;
  font-size: 0.95rem;
  background-color: #6c757d !important;
  border-color: #6c757d !important;
  color: #ffffff !important;
  transition: all 0.15s ease;
}

.filter-reset-btn:hover {
  background-color: #5c636a !important;
  border-color: #565e64 !important;
  color: #ffffff !important;
  transform: translateY(-1px);
}

.filter-reset-btn:active {
  background-color: #565e64 !important;
  border-color: #51585e !important;
  color: #ffffff !important;
}
</style>

<!-- Unscoped Dark Theme Styles for Pure Neutral Black / Charcoal (Zero Blue) -->
<style lang="scss">
.theme-dark,
[data-bs-theme="dark"] {
  .brands-page {
    /* Top Form Card */
    .brand-form-card {
      background-color: #1b1b1f !important;
      border-color: #2e2e2e !important;
      border-top: 3px solid #6c757d !important;
      color: #f0f0f0 !important;

      .card-header {
        background-color: #171719 !important;
        border-bottom-color: #262626 !important;
      }
    }

    .brand-form-edit-mode {
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
    .brand-table-header th {
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

    .brand-name-cell {
      color: #ffffff !important;
    }

    .brand-subcategory-cell {
      color: #cccccc !important;
    }

    .brand-index-cell {
      color: #888888 !important;
    }

    /* Inactive Row in Dark Mode */
    .brand-row-inactive {
      opacity: 0.42 !important;
      background-color: rgba(255, 255, 255, 0.015) !important;

      .brand-name-cell,
      .brand-subcategory-cell {
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

    .brand-cell-text {
      font-weight: 400 !important;
    }

    .brand-category-cell {
      color: #d1d5db !important;
    }

    .brand-subcategory-cell {
      color: #9ca3af !important;
    }

    .brand-name-cell {
      color: #ffffff !important;
      font-weight: 400 !important;
    }

    .filter-reset-btn {
      background-color: #38383e !important;
      border-color: #484852 !important;
      color: #ffffff !important;

      &:hover {
        background-color: #45454d !important;
        border-color: #555560 !important;
        color: #ffffff !important;
      }
    }
  }
}
</style>
