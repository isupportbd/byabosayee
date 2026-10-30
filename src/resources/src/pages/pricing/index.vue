<template>
  <div class="pricing-page">
    <!-- Toast Notification -->
    <Toast ref="toastRef" />

    <!-- Top Card: মূল্য নির্ধারণ ফর্ম (পণ্য তৈরি মডিউলের আদলে ও ইউজারের স্ক্র্যাচ অনুযায়ী) -->
    <div
      class="card border shadow-sm mb-3 pricing-form-card"
      :class="{ 'pricing-form-edit-mode': isEditing }">
      
      <!-- হেডার: বামে "মূল্য নির্ধারণ", ডানে "বিক্রয়মূল্য: ভ্যাটসহ / ভ্যাট ছাড়া" রেডিও বাটন -->
      <div class="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2 py-2">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-tags-fill fs-5" style="color: #7c3aed;"></i>
          <h6 class="m-0 fw-bold">
            {{ isEditing ? 'পণ্যের মূল্য নির্ধারণ (সম্পাদনা)' : 'মূল্য নির্ধারণ' }}
          </h6>
          <span
            v-if="isEditing"
            class="badge bg-primary-subtle text-primary border border-primary-subtle small">
            এডিটিং মোড
          </span>
        </div>

        <!-- বিক্রয়মূল্য: ভ্যাটসহ / ভ্যাট ছাড়া রেডিও অপশন (স্ক্র্যাচ অনুযায়ী ডানপাশে) -->
        <div class="d-flex align-items-center gap-3">
          <span class="small fw-semibold text-secondary">বিক্রয়মূল্য:</span>
          <label class="d-inline-flex align-items-center gap-1 small fw-semibold cursor-pointer m-0 user-select-none">
            <input
              id="vatInclusive"
              v-model="vatMode"
              class="form-check-input m-0 cursor-pointer"
              type="radio"
              name="vatMode"
              value="inclusive" />
            <span>ভ্যাটসহ</span>
          </label>
          <label class="d-inline-flex align-items-center gap-1 small fw-semibold cursor-pointer m-0 user-select-none">
            <input
              id="vatExclusive"
              v-model="vatMode"
              class="form-check-input m-0 cursor-pointer"
              type="radio"
              name="vatMode"
              value="exclusive" />
            <span>ভ্যাট ছাড়া</span>
          </label>
        </div>
      </div>

      <!-- কার্ড বডি: স্ক্র্যাচ অনুযায়ী ফিল্ডসমূহ (পণ্য | প্রকৃত ক্রয়দর | বিক্রয় মূল্য | ভ্যাট রেট | বাটনদ্বয়) -->
      <div class="card-body p-3">
        <form @submit.prevent="submitForm">
          <div class="row g-2 align-items-end">
            
            <!-- ১. পণ্য (ড্রপডাউনে পণ্যের নাম _ ব্র্যান্ড _ সাইজ) -->
            <div class="col-12 col-md-3 col-lg-3">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="পণ্য নির্বাচন করুন">
                পণ্য <span class="text-danger">*</span>
              </label>
              <select
                v-model="form.itemId"
                class="form-select form-select-sm single-row-input"
                :disabled="isEditing"
                required
                @change="onItemSelect">
                <option value="" disabled>পণ্য নির্বাচন করুন...</option>
                <option v-for="it in availableItemsList" :key="it.id" :value="it.id">
                  {{ getItemFullDisplayName(it) }}
                </option>
              </select>
            </div>

            <!-- ২. প্রকৃত ক্রয়দর (অটো পপুলেটেড ও রিডঅনলি) -->
            <div class="col-6 col-md-2 col-lg-2">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="প্রকৃত ক্রয়দর">
                প্রকৃত ক্রয়দর
              </label>
              <input
                type="text"
                class="form-control form-control-sm single-row-input text-end fw-semibold frozen-input"
                :value="formatNumber(Number(selectedItemDetails?.latestUnitCost || 0).toFixed(2))"
                readonly
                tabindex="-1"
                placeholder="0.00" />
            </div>

            <!-- ৩. বিক্রয় মূল্য (ভ্যাটসহ / ভ্যাট ছাড়া) -->
            <div class="col-6 col-md-2 col-lg-2">
              <label
                class="form-label small fw-semibold mb-1 text-truncate d-block"
                :class="vatMode === 'inclusive' ? 'text-primary' : ''"
                :title="`বিক্রয় মূল্য (${vatMode === 'inclusive' ? 'ভ্যাটসহ' : 'ভ্যাট ছাড়া'})`">
                বিক্রয় মূল্য ({{ vatMode === 'inclusive' ? 'ভ্যাটসহ' : 'ভ্যাট ছাড়া' }}) <span class="text-danger">*</span>
              </label>
              <input
                v-model.number="form.sellingPrice"
                type="number"
                min="0"
                step="0.01"
                class="form-control form-control-sm single-row-input text-end fw-semibold"
                placeholder="0.00"
                required />
            </div>

            <!-- ৪. ভ্যাট রেট (%) -->
            <div class="col-6 col-md-1 col-lg-1">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="ভ্যাট রেট">
                ভ্যাট রেট
              </label>
              <input
                v-model.number="form.vatRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                class="form-control form-control-sm single-row-input text-end fw-semibold"
                placeholder="0" />
            </div>

            <!-- ৫. ছাড় (% বা ৳) -->
            <div class="col-6 col-md-2 col-lg-2">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <label class="form-label small fw-semibold m-0" title="ছাড়">
                  ছাড়
                </label>
                <div class="d-inline-flex align-items-center" style="gap: 14px;">
                  <label class="d-inline-flex align-items-center cursor-pointer m-0 user-select-none" style="gap: 4px; font-size: 0.82rem;">
                    <input
                      type="radio"
                      v-model="form.discountType"
                      value="percent"
                      name="pricingDiscountType"
                      class="form-check-input m-0 cursor-pointer" />
                    <span>%</span>
                  </label>
                  <label class="d-inline-flex align-items-center cursor-pointer m-0 user-select-none" style="gap: 4px; font-size: 0.82rem;">
                    <input
                      type="radio"
                      v-model="form.discountType"
                      value="fixed"
                      name="pricingDiscountType"
                      class="form-check-input m-0 cursor-pointer" />
                    <span>৳</span>
                  </label>
                </div>
              </div>
              <input
                v-model.number="form.discount"
                type="number"
                min="0"
                step="any"
                class="form-control form-control-sm single-row-input text-end fw-semibold"
                placeholder="0" />
            </div>

            <!-- ৬. রিসেট ও সংরক্ষণ বাটন -->
            <div class="col-12 col-md-2 col-lg-2 d-flex align-items-end gap-2">
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary px-2 d-inline-flex align-items-center justify-content-center"
                style="height: 31px;"
                title="রিসেট"
                @click="resetForm">
                <i class="bi bi-arrow-counterclockwise me-1"></i>
                <span>রিসেট</span>
              </button>
              <button
                type="submit"
                class="btn btn-sm px-2 d-inline-flex align-items-center justify-content-center gap-1 text-white shadow-sm flex-grow-1"
                style="background-color: #7c3aed; border-color: #7c3aed; height: 31px;"
                :disabled="submitting || !form.itemId || !form.sellingPrice">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
                <i v-else :class="isEditing ? 'bi bi-arrow-repeat' : 'bi bi-check-circle'"></i>
                <span>{{ isEditing ? 'আপডেট' : 'সংরক্ষণ' }}</span>
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>

    <!-- Bottom Card: সকল পণ্যের মূল্য তালিকা (ফিল্টার + সার্চ + টেবিল + পেজিনেশন) -->
    <div class="card border shadow-sm">
      <div class="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2 py-2">
        <div class="d-flex align-items-center gap-2">
          <h6 class="m-0 fw-bold">সকল পণ্যের মূল্য তালিকা</h6>
          <span class="badge bg-secondary-subtle text-secondary border">
            {{ formatNumber(filteredPricingRecords.length) }} টি
          </span>
        </div>

        <!-- ফিল্টার, সার্চ ও রিফ্রেশ বার -->
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <!-- ফিল্টার ট্যাবসমূহ (ফ্রেমওয়ার্কের স্ট্যান্ডার্ড স্টাইল) -->
          <div class="filter-tabs-wrapper">
            <button
              type="button"
              class="filter-tab-btn"
              :class="{ active: activeFilterTab === 'all' }"
              @click="activeFilterTab = 'all'">
              সকল পণ্য ({{ formatNumber(itemsList.length) }})
            </button>
            <button
              type="button"
              class="filter-tab-btn tab-priced"
              :class="{ active: activeFilterTab === 'priced' }"
              @click="activeFilterTab = 'priced'">
              নির্ধারিত ({{ formatNumber(pricedRecordsCount) }})
            </button>
            <button
              type="button"
              class="filter-tab-btn tab-pending"
              :class="{ active: activeFilterTab === 'pending' }"
              @click="activeFilterTab = 'pending'">
              নির্ধারণ বাকি ({{ formatNumber(pendingItemsCount) }})
            </button>
          </div>

          <!-- ক্যাটাগরি ফিল্টার -->
          <div style="min-width: 140px;">
            <select
              v-model="categoryFilter"
              class="form-select form-select-sm search-input-unified">
              <option value="all">সকল ক্যাটাগরি</option>
              <option v-for="cat in categoriesList" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- সার্চ বক্স (ফ্রেমওয়ার্ক স্ট্যান্ডার্ড সার্চ কম্পোনেন্ট প্যাটার্ন) -->
          <div class="position-relative" style="min-width: 180px;">
            <input
              v-model.trim="searchQuery"
              type="text"
              class="form-control form-control-sm ps-4 search-input-unified"
              placeholder="পণ্য, ব্র্যান্ড বা কোড খুঁজুন..." />
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted small pe-none"></i>
            <button
              v-if="searchQuery"
              type="button"
              class="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-2"
              @click="searchQuery = ''">
              <i class="bi bi-x"></i>
            </button>
          </div>

          <!-- ফিল্টার রিসেট / রিফ্রেশ বাটন -->
          <button
            type="button"
            class="btn btn-sm btn-secondary d-inline-flex align-items-center justify-content-center shadow-sm filter-reset-btn"
            title="সকল ফিল্টার রিসেট করুন"
            @click="resetAllFilters">
            <i class="bi bi-arrow-counterclockwise" :class="{ 'spin-icon': loading }"></i>
          </button>
        </div>
      </div>

      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-secondary" role="status">
            <span class="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <div class="text-muted small mt-2">মূল্য তালিকা লোড হচ্ছে...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredPricingRecords.length === 0" class="text-center py-5">
          <i class="bi bi-tag text-muted fs-1 mb-2 d-block"></i>
          <p class="text-muted mb-0">
            {{ searchQuery ? 'অনুসন্ধানের সাথে কোনো পণ্য মেলেনি।' : 'কোনো পণ্যের রেকর্ড পাওয়া যায়নি।' }}
          </p>
        </div>

        <!-- Table View (পণ্য তৈরি মডিউলের টেবিল হেডার ও সারির আদলে) -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="item-table-header">
              <tr class="small text-nowrap">
                <th style="width: 50px;" class="text-center">#</th>
                <th style="width: 160px;" class="text-start">বার কোড</th>
                <th style="min-width: 220px;" class="text-start">পণ্যের নাম</th>
                <th style="width: 120px;" class="text-center">ব্র্যান্ড</th>
                <th style="width: 90px;" class="text-center">সাইজ</th>
                <th style="width: 140px;" class="text-end">প্রকৃত ক্রয়দর (৳)</th>
                <th style="width: 140px;" class="text-end">বিক্রয় মূল্য (৳)</th>
                <th style="width: 90px;" class="text-center">ভ্যাট রেট</th>
                <th style="width: 90px;" class="text-center">ছাড়</th>
                <th style="width: 75px;" class="text-center">একশন</th>
              </tr>
            </thead>
            <tbody class="small">
              <tr
                v-for="(row, idx) in paginatedPricingRecords"
                :key="row.id"
                :class="{ 'table-warning-subtle': isEditing && form.itemId === row.id }">
                <td class="text-center text-muted">
                  {{ formatNumber((currentPage - 1) * perPage + idx + 1) }}
                </td>
                <td class="text-start">
                  <span v-if="row.barcode" class="font-monospace text-dark">{{ row.barcode }}</span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td class="text-start">
                  <span class="fw-semibold text-dark">{{ cleanItemName(row.name) }}</span>
                </td>
                <td class="text-center">
                  <span class="badge bg-light text-dark border fw-medium">
                    {{ row.brand?.name || '-' }}
                  </span>
                </td>
                <td class="text-center">
                  <span>{{ row.size?.name || '-' }}</span>
                  <span v-if="row.color?.name" class="text-muted ms-1">/ {{ row.color.name }}</span>
                </td>
                <td class="text-end text-muted font-monospace text-nowrap">
                  {{ formatNumber(Number(row.purchasePrice || 0).toFixed(2)) }}
                </td>
                <td class="text-end fw-bold text-nowrap">
                  <template v-if="Number(row.sellingPrice || 0) > 0">
                    <span class="text-success">
                      {{ formatNumber(Number(row.sellingPrice || 0).toFixed(2)) }}
                    </span>
                    <div class="small fw-normal" style="font-size: 0.72rem;">
                      <span :class="row.vatType === 'exclusive' ? 'text-secondary' : 'text-primary'">
                        ({{ row.vatType === 'exclusive' ? 'ভ্যাট ছাড়া' : 'ভ্যাটসহ' }})
                      </span>
                    </div>
                  </template>
                  <span v-else class="badge bg-danger-subtle text-danger border border-danger-subtle py-1">
                    নির্ধারণ বাকি
                  </span>
                </td>
                <td class="text-center text-nowrap">
                  <span v-if="Number(row.vatRate || 0) > 0" class="badge bg-light text-dark border font-monospace">
                    {{ formatNumber(row.vatRate) }}%
                  </span>
                  <span v-else class="text-muted">0%</span>
                </td>
                <td class="text-center text-nowrap">
                  <span v-if="Number(row.discount || 0) > 0" class="badge bg-light text-dark border font-monospace">
                    {{ formatNumber(row.discount) }}{{ row.discountType === 'fixed' ? ' ৳' : '%' }}
                  </span>
                  <span v-else class="text-muted">0</span>
                </td>
                <td class="text-center">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary p-1 px-2 d-inline-flex align-items-center justify-content-center shadow-none action-btn"
                    title="সম্পাদন করুন"
                    @click="startEditRow(row)">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- পেজিনেশন কম্পোনেন্ট (Framework Standard Pagination Component) -->
      <div v-if="filteredPricingRecords.length > 0" class="card-footer bg-transparent border-top py-2 px-3">
        <Pagination :data="paginationData" variant="secondary" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";
import axios from "axios";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Pagination from "@/components/datatable/Pagination.vue";
import Toast from "@/components/Toast.vue";

useHead({ title: "পণ্যের মূল্য নির্ধারণ" });

const route = useRoute();
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

function showToast(message: string, type: "success" | "danger" | "warning" | "info" = "success") {
  toastRef.value?.toastme(message, type);
}

// Number Formatter (Uniform English digits)
function formatNumber(n: number | string | null | undefined): string {
  if (n === null || n === undefined || n === "") return "0";
  return String(n);
}
const toBengaliNumber = formatNumber;

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return String(iso);
  }
}

// State
const loading = ref(false);
const submitting = ref(false);
const activeFilterTab = ref<"all" | "priced" | "pending">("all");
const categoryFilter = ref<string | number>("all");
const searchQuery = ref("");

// Pagination State
const currentPage = ref(1);
const perPage = ref(10);

watch(
  () => route.query.page,
  (newPage) => {
    if (newPage) {
      currentPage.value = parseInt(String(newPage), 10) || 1;
    } else {
      currentPage.value = 1;
    }
  },
  { immediate: true }
);

watch([searchQuery, activeFilterTab, categoryFilter], () => {
  currentPage.value = 1;
});

// Data Lists
const itemsList = ref<any[]>([]);
const pricingsList = ref<any[]>([]);
const categoriesList = ref<any[]>([]);

// Form State
const isEditing = ref(false);
const vatMode = ref<"inclusive" | "exclusive">("inclusive");

const form = reactive<{
  itemId: number | string;
  sellingPrice: number | string;
  vatRate: number | string;
  discount: number | string;
  discountType: "percent" | "fixed";
}>({
  itemId: "",
  sellingPrice: "",
  vatRate: 0,
  discount: 0,
  discountType: "percent"
});

// Available Items
const availableItemsList = computed(() => itemsList.value);

// Selected Item Details
const selectedItemDetails = computed(() => {
  if (!form.itemId) return null;
  return itemsList.value.find((it) => Number(it.id) === Number(form.itemId)) || null;
});

// পণ্যের নাম থেকে সাইজের অংশ বাদ দেওয়ার ফাংশন (যেহেতু পাশে আলাদা সাইজ কলাম ও ফিল্ড রয়েছে)
function cleanItemName(name: string): string {
  if (!name) return "";
  return name
    .replace(/\s*\(\s*(?:সাইজ|size)[\s\-:—].*?\)/i, "")
    .replace(/\s*(?:সাইজ|size)[\s\-:—].*$/i, "")
    .replace(/\s*(?:সাইজ|size)\s*[-:—]?\s*.*$/i, "")
    .replace(/_[^_]+$/, "")
    .trim();
}

// Item Display Name helper: "পণ্যের নাম _ ব্র্যান্ড _ সাইজ"
function getItemFullDisplayName(item: any): string {
  if (!item) return "";
  const name = cleanItemName(item.name) || "নামহীন পণ্য";
  const brand = item.brand?.name || "ব্র্যান্ডহীন";
  const size = item.size?.name ? `সাইজ: ${item.size.name}` : "";
  const parts = [name, brand];
  if (size) parts.push(size);
  return parts.join(" — ");
}

function onItemSelect() {
  const item = selectedItemDetails.value;
  if (!item) return;

  form.vatRate = item.latestVatRate !== undefined ? Number(item.latestVatRate) : 0;
  form.discount = item.latestDiscount !== undefined ? Number(item.latestDiscount) : (Number(item.discount) || 0);
  form.discountType = (item.latestDiscountType || item.discountType) === "fixed" ? "fixed" : "percent";

  if (Number(item.sellingPrice) > 0) {
    form.sellingPrice = Math.round(Number(item.sellingPrice));
  } else {
    form.sellingPrice = "";
  }
}

function resetForm() {
  isEditing.value = false;
  form.itemId = "";
  form.sellingPrice = "";
  form.vatRate = 0;
  form.discount = 0;
  form.discountType = "percent";
  vatMode.value = "inclusive";
}

function resetAllFilters() {
  activeFilterTab.value = "all";
  categoryFilter.value = "all";
  searchQuery.value = "";
  currentPage.value = 1;
  loadAllData();
}

function startEditRow(row: any) {
  isEditing.value = true;
  form.itemId = row.id;
  form.sellingPrice = Number(row.sellingPrice) > 0 ? Number(row.sellingPrice) : "";
  form.vatRate = row.vatRate !== undefined ? Number(row.vatRate) : 0;
  form.discount = row.discount !== undefined ? Number(row.discount) : 0;
  form.discountType = (row.discountType || "percent") === "fixed" ? "fixed" : "percent";
  vatMode.value = row.vatType === "exclusive" ? "exclusive" : "inclusive";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function submitForm() {
  if (!form.itemId) {
    showToast("অনুগ্রহ করে একটি পণ্য নির্বাচন করুন", "warning");
    return;
  }
  if (!form.sellingPrice || Number(form.sellingPrice) <= 0) {
    showToast("সঠিক বিক্রয় মূল্য লিখুন", "warning");
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      itemId: Number(form.itemId),
      sellingPrice: Number(form.sellingPrice),
      vatRate: Number(form.vatRate) || 0,
      vatType: vatMode.value,
      discount: Number(form.discount) || 0,
      discountType: form.discountType || "percent",
      effectiveDate: new Date().toISOString().split("T")[0]
    };

    const res = await axios.post("/api/inventory/pricings", payload);
    showToast(res.data?.message || "পণ্যের বিক্রয়মূল্য সফলভাবে সংরক্ষিত হয়েছে!", "success");
    resetForm();
    await loadAllData();
  } catch (err: any) {
    showToast(err.response?.data?.message || "মূল্য সংরক্ষণ করতে ব্যর্থ হয়েছে", "danger");
  } finally {
    submitting.value = false;
  }
}

// Counts for filter tabs
const pendingItemsCount = computed(() => {
  return itemsList.value.filter((it) => !it.sellingPrice || Number(it.sellingPrice) <= 0).length;
});

const pricedRecordsCount = computed(() => {
  return itemsList.value.filter((it) => Number(it.sellingPrice) > 0).length;
});

// Merged Table Records
const allPricingRecords = computed(() => {
  const pricingsByItemId = new Map<number, any>();
  pricingsList.value.forEach((p) => {
    if (p.itemId && !pricingsByItemId.has(Number(p.itemId))) {
      pricingsByItemId.set(Number(p.itemId), p);
    }
  });

  return itemsList.value.map((it) => {
    const pricing = pricingsByItemId.get(Number(it.id));
    return {
      id: it.id,
      pricingId: pricing?.id || null,
      name: it.name,
      code: it.code,
      barcode: pricing?.barcode || it.latestBarcode || null,
      category: it.category,
      subCategory: it.subCategory,
      brand: it.brand,
      size: it.size,
      color: it.color,
      purchasePrice: pricing?.purchasePrice || it.latestUnitCost || it.purchasePrice || 0,
      sellingPrice: pricing?.sellingPrice || it.sellingPrice || 0,
      vatRate: pricing?.vatRate !== undefined ? Number(pricing.vatRate) : (it.latestVatRate || 0),
      vatType: pricing?.vatType || "inclusive",
      discount: pricing?.discount !== undefined && pricing?.discount !== null ? Number(pricing.discount) : (it.latestDiscount !== undefined ? Number(it.latestDiscount) : Number(it.discount || 0)),
      discountType: pricing?.discountType || it.latestDiscountType || it.discountType || "percent",
      challanDate: pricing?.challanDate || it.latestChallanDate || null,
      effectiveDate: pricing?.effectiveDate || it.priceEffectiveDate || null
    };
  });
});

// Filtered Records
const filteredPricingRecords = computed(() => {
  let list = allPricingRecords.value;

  // Filter by Tab
  if (activeFilterTab.value === "pending") {
    list = list.filter((r) => !r.sellingPrice || Number(r.sellingPrice) <= 0);
  } else if (activeFilterTab.value === "priced") {
    list = list.filter((r) => Number(r.sellingPrice) > 0);
  }

  // Filter by Category
  if (categoryFilter.value !== "all") {
    list = list.filter((r) => Number(r.category?.id) === Number(categoryFilter.value));
  }

  // Filter by Search Query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (r) =>
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.code && r.code.toLowerCase().includes(q)) ||
        (r.barcode && r.barcode.toLowerCase().includes(q)) ||
        (r.brand?.name && r.brand.name.toLowerCase().includes(q)) ||
        (r.category?.name && r.category.name.toLowerCase().includes(q)) ||
        (r.size?.name && r.size.name.toLowerCase().includes(q))
    );
  }

  return list;
});

// Pagination Computation
const paginationData = computed(() => {
  const total = filteredPricingRecords.value.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage.value));
  return {
    current_page: currentPage.value,
    last_page: lastPage,
    per_page: perPage.value,
    total: total,
    path: route.path
  };
});

const paginatedPricingRecords = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredPricingRecords.value.slice(start, start + perPage.value);
});

async function loadAllData() {
  loading.value = true;
  try {
    const [itemsRes, pricingsRes, catsRes] = await Promise.all([
      axios.get("/api/inventory/items"),
      axios.get("/api/inventory/pricings"),
      axios.get("/api/catalog/categories").catch(() => ({ data: { data: [] } }))
    ]);
    itemsList.value = itemsRes.data?.data || [];
    pricingsList.value = pricingsRes.data?.data || [];
    categoriesList.value = catsRes.data?.data || [];
  } catch (err: any) {
    showToast(err.response?.data?.message || "ডাটা লোড করতে ব্যর্থ হয়েছে", "danger");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadAllData();
});
</script>

<style scoped>
.pricing-page {
  font-family: inherit;
}

.pricing-form-card {
  border-top: 3px solid #7c3aed !important;
}

.pricing-form-edit-mode {
  border-top: 3px solid #0d6efd !important;
}

.single-row-input {
  height: 31px;
  font-size: 0.82rem;
  font-family: inherit;
}

.frozen-input {
  background-color: var(--app-hover, #f8f9fa) !important;
  color: var(--app-text-muted, #6c757d) !important;
  opacity: 0.85;
  cursor: not-allowed;
}

/* Filter Tabs Styling */
.filter-tabs-wrapper {
  display: inline-flex;
  align-items: center;
  background-color: var(--bs-tertiary-bg, rgba(0, 0, 0, 0.03));
  border: 1px solid var(--bs-border-color, #d9dee3);
  border-radius: 0.375rem;
  padding: 2px;
  height: 31px;
  box-sizing: border-box;
}

.filter-tab-btn {
  border: none;
  background: transparent;
  color: var(--bs-secondary-color, #6c757d);
  font-size: 0.78rem;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 0.25rem;
  transition: all 0.15s ease-in-out;
  line-height: 1.4;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  height: 25px;
  cursor: pointer;

  &:hover {
    color: var(--bs-primary, #0d6efd);
    background-color: rgba(13, 110, 253, 0.08);
  }

  &.active {
    background-color: #6c757d;
    color: #ffffff !important;
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(108, 117, 125, 0.25);
  }

  &.tab-priced {
    color: #198754;

    &:hover {
      color: #146c43;
      background-color: rgba(25, 135, 84, 0.12);
    }

    &.active {
      background-color: #198754 !important;
      color: #ffffff !important;
      font-weight: 600;
      box-shadow: 0 1px 2px rgba(25, 135, 84, 0.3);
    }
  }

  &.tab-pending {
    color: #dc3545;

    &:hover {
      color: #b02a37;
      background-color: rgba(220, 53, 69, 0.12);
    }

    &.active {
      background-color: #dc3545 !important;
      color: #ffffff !important;
      font-weight: 600;
      box-shadow: 0 1px 2px rgba(220, 53, 69, 0.3);
    }
  }
}

.search-input-unified {
  height: 31px;
  border: 1px solid var(--bs-border-color, #d9dee3) !important;
  border-radius: 0.375rem !important;
  font-size: 0.8125rem;
}

.filter-reset-btn {
  height: 31px;
  width: 32px;
}

.table-warning-subtle {
  background-color: rgba(255, 193, 7, 0.12) !important;
}

.cursor-pointer {
  cursor: pointer;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Dark theme adaptiveness (items/index.vue এর আদলে) */
html[data-bs-theme="dark"] {
  .frozen-input {
    background-color: rgba(255, 255, 255, 0.05) !important;
    color: #d1d5db !important;
  }

  .filter-tabs-wrapper {
    background-color: rgba(255, 255, 255, 0.05) !important;
    border-color: #333333 !important;
  }

  .search-input-unified {
    background-color: #121212 !important;
    border-color: #333333 !important;
    color: #f0f0f0 !important;
  }
}
</style>
