<template>
  <div class="stock-report-component">
    <!-- Top KPI Cards -->
    <div class="row g-3 mb-4">
      <!-- ১. মোট পণ্য পদ -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-primary">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">মোট পণ্য আইটেম</span>
              <div class="stat-icon-circle bg-primary-subtle text-primary">
                <i class="bi bi-tags"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-4 fw-bold text-primary">{{ toBengaliNumber(summaryData.totalProducts || 0) }}</span>
              <span class="text-muted ms-1 small">টি ধরন</span>
            </div>
            <div class="small text-muted mt-1 d-flex justify-content-between">
              <span>পর্যাপ্ত: <b class="text-success">{{ toBengaliNumber((summaryData.totalProducts || 0) - (summaryData.lowStockItems || 0) - (summaryData.outStockItems || 0)) }}</b></span>
              <span>ঘাটতি: <b class="text-danger">{{ toBengaliNumber((summaryData.lowStockItems || 0) + (summaryData.outStockItems || 0)) }}</b></span>
            </div>
          </div>
        </div>
      </div>

      <!-- ২. মোট পিস মজুদ -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-info">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">মোট বর্তমান মজুদ</span>
              <div class="stat-icon-circle bg-info-subtle text-info">
                <i class="bi bi-box-seam"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-4 fw-bold text-info">{{ toBengaliNumber(summaryData.totalPieces || 0) }}</span>
              <span class="text-muted ms-1 small">পিস ইন স্টক</span>
            </div>
            <div class="small text-muted mt-1">
              <span class="text-secondary"><i class="bi bi-check2-circle text-info me-1"></i>গুদাম ও বিক্রয়কেন্দ্র মজুদ</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ৩. ক্রয়মূল্যে মোট ইনভেন্টরি সম্পদ -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-warning">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">ক্রয়মূল্যে মোট স্টক সম্পদ</span>
              <div class="stat-icon-circle bg-warning-subtle text-warning">
                <i class="bi bi-wallet2"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-4 fw-bold text-dark">৳ {{ toBengaliNumber(formatAmount(summaryData.totalCostValue)) }}</span>
            </div>
            <div class="small text-muted mt-1">
              <span>পণ্যে আটকে থাকা মূলধন</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ৪. বিক্রয়মূল্যে প্রত্যাশিত সেলস ও সম্ভাব্য লাভ -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-success">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">সম্ভাব্য মোট বিক্রয়মূল্য</span>
              <div class="stat-icon-circle bg-success-subtle text-success">
                <i class="bi bi-cash-coin"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-4 fw-bold text-success">৳ {{ toBengaliNumber(formatAmount(summaryData.totalSellingValue)) }}</span>
            </div>
            <div class="small text-muted mt-1 d-flex justify-content-between">
              <span>সম্ভাব্য মুনাফা:</span>
              <span class="fw-bold text-success">৳ {{ toBengaliNumber(formatAmount(summaryData.totalPotentialProfit)) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="card border shadow-sm mb-3">
      <div class="card-body p-3">
        <div class="row g-2 align-items-center">
          <!-- সার্চ বক্স -->
          <div class="col-12 col-md-4">
            <div class="position-relative">
              <input
                v-model.trim="searchQuery"
                type="text"
                class="form-control form-control-sm ps-4"
                placeholder="পণ্যের নাম, কোড, বারকোড বা ডিজাইন দিয়ে খুঁজুন..."
                @keyup.enter="fetchStockReport" />
              <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted small pe-none"></i>
              <button
                v-if="searchQuery"
                type="button"
                class="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-2"
                @click="searchQuery = ''; fetchStockReport()">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>

          <!-- ক্যাটাগরি ফিল্টার -->
          <div class="col-6 col-md-2">
            <select
              v-model="selectedCategoryId"
              class="form-select form-select-sm"
              @change="fetchStockReport">
              <option value="">সকল ক্যাটাগরি</option>
              <option v-for="cat in categoriesList" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- ব্র্যান্ড ফিল্টার -->
          <div class="col-6 col-md-2">
            <select
              v-model="selectedBrandId"
              class="form-select form-select-sm"
              @change="fetchStockReport">
              <option value="">সকল ব্র্যান্ড</option>
              <option v-for="b in brandsList" :key="b.id" :value="b.id">
                {{ b.name }}
              </option>
            </select>
          </div>

          <!-- স্টক স্ট্যাটাস ফিল্টার -->
          <div class="col-8 col-md-3">
            <select
              v-model="selectedStatus"
              class="form-select form-select-sm"
              @change="fetchStockReport">
              <option value="all">সকল স্টক অবস্থা</option>
              <option value="in_stock">পর্যাপ্ত স্টক (In Stock)</option>
              <option value="low_stock">লো-স্টক এলার্ট (Low Stock)</option>
              <option value="out_of_stock">স্টক শূন্য (Out of Stock)</option>
            </select>
          </div>

          <!-- অ্যাকশন বাটনসমূহ -->
          <div class="col-4 col-md-1 d-flex gap-1 justify-content-end">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              title="ফিল্টার রিসেট"
              @click="resetFilters">
              <i class="bi bi-arrow-counterclockwise"></i>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-success"
              title="এক্সেল/সিএসভি ডাউনলোড"
              @click="exportCsv">
              <i class="bi bi-file-earmark-excel"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stock Table -->
    <div class="card border shadow-sm">
      <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-box-seam-fill text-primary"></i>
          <span class="fw-bold">পণ্যভিত্তিক বর্তমান স্টক বিস্তারিত তালিকা</span>
          <span class="badge bg-secondary-subtle text-secondary border">
            {{ toBengaliNumber(itemsList.length) }} টি পাওয়া গেছে
          </span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="text-muted small d-none d-sm-inline">প্রতি পেজে:</span>
          <select v-model="perPage" class="form-select form-select-sm" style="width: 75px;">
            <option :value="15">১৫</option>
            <option :value="30">৩০</option>
            <option :value="50">৫০</option>
            <option :value="100">১০০</option>
          </select>
        </div>
      </div>

      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <div class="text-muted small mt-2">স্টক তথ্য লোড হচ্ছে...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="itemsList.length === 0" class="text-center py-5">
          <i class="bi bi-box text-muted fs-1 mb-2 d-block"></i>
          <p class="text-muted mb-0">নির্বাচিত ফিল্টারে কোনো পণ্যের স্টক তথ্য পাওয়া যায়নি।</p>
        </div>

        <!-- Table View -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-nowrap">
                <th style="width: 45px;" class="text-center">#</th>
                <th>পণ্যের নাম</th>
                <th>কোড / বারকোড</th>
                <th>ক্যাটাগরি</th>
                <th>ব্র্যান্ড</th>
                <th>সাইজ / কালার</th>
                <th class="text-end">ক্রয়মূল্য</th>
                <th class="text-end">বিক্রয়মূল্য</th>
                <th class="text-center">বর্তমান স্টক</th>
                <th class="text-end">মোট স্টক মূল্য</th>
                <th class="text-center">অবস্থা</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in paginatedItems" :key="item.id">
                <td class="text-center small text-muted">
                  {{ toBengaliNumber((currentPage - 1) * perPage + idx + 1) }}
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ item.name }}</div>
                  <small v-if="item.designCode" class="text-muted">ডিজাইন: {{ item.designCode }}</small>
                </td>
                <td>
                  <div class="font-monospace small fw-bold text-primary">{{ item.code || '-' }}</div>
                  <div v-if="item.barcode" class="font-monospace small text-muted">{{ item.barcode }}</div>
                </td>
                <td>
                  <span class="small">{{ item.categoryName || '-' }}</span>
                  <div v-if="item.subCategoryName" class="text-muted small">{{ item.subCategoryName }}</div>
                </td>
                <td class="small">{{ item.brandName || '-' }}</td>
                <td class="small">
                  <span>{{ item.sizeName || '-' }}</span>
                  <span v-if="item.colorName" class="text-muted"> / {{ item.colorName }}</span>
                </td>
                <td class="text-end small">৳ {{ toBengaliNumber(formatAmount(item.purchasePrice)) }}</td>
                <td class="text-end small fw-medium text-success">৳ {{ toBengaliNumber(formatAmount(item.sellingPrice)) }}</td>
                <td class="text-center">
                  <span class="badge fs-6 px-2.5 py-1" :class="getStockBadgeClass(item)">
                    {{ toBengaliNumber(item.stockQuantity) }} {{ item.unitName || 'পিস' }}
                  </span>
                </td>
                <td class="text-end small fw-bold text-dark">
                  ৳ {{ toBengaliNumber(formatAmount(item.stockCostValue)) }}
                </td>
                <td class="text-center">
                  <span v-if="item.stockStatus === 'out_of_stock'" class="badge bg-danger-subtle text-danger border border-danger-subtle">
                    স্টক শূন্য
                  </span>
                  <span v-else-if="item.stockStatus === 'low_stock'" class="badge bg-warning-subtle text-warning border border-warning-subtle">
                    লো-স্টক (৫০ বা কম পিস)
                  </span>
                  <span v-else class="badge bg-success-subtle text-success border border-success-subtle">
                    পর্যাপ্ত স্টক
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div v-if="itemsList.length > perPage" class="card-footer bg-transparent border-top py-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div class="text-muted small">
          দেখাচ্ছে {{ toBengaliNumber((currentPage - 1) * perPage + 1) }} থেকে {{ toBengaliNumber(Math.min(currentPage * perPage, itemsList.length)) }} (মোট {{ toBengaliNumber(itemsList.length) }} টি পণ্য)
        </div>
        <div class="d-flex gap-1 align-items-center">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary px-2"
            :disabled="currentPage === 1"
            @click="currentPage--">
            <i class="bi bi-chevron-left"></i>
          </button>
          <span class="px-2 small text-muted">
            পেজ {{ toBengaliNumber(currentPage) }} / {{ toBengaliNumber(totalPages) }}
          </span>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary px-2"
            :disabled="currentPage >= totalPages"
            @click="currentPage++">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import axios from "axios";

const props = defineProps<{
  initialStatus?: string;
  initialSearch?: string;
}>();

const loading = ref(false);
const itemsList = ref<any[]>([]);
const summaryData = ref<any>({});
const categoriesList = ref<any[]>([]);
const brandsList = ref<any[]>([]);

const searchQuery = ref(props.initialSearch || "");
const selectedCategoryId = ref("");
const selectedBrandId = ref("");
const selectedStatus = ref(props.initialStatus || "all");

const currentPage = ref(1);
const perPage = ref(15);

const totalPages = computed(() => Math.ceil(itemsList.value.length / perPage.value) || 1);

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return itemsList.value.slice(start, start + perPage.value);
});

async function fetchDropdowns() {
  try {
    const [catRes, brandRes] = await Promise.all([
      axios.get("/api/catalog/categories").catch(() => ({ data: { data: [] } })),
      axios.get("/api/inventory/brands").catch(() => ({ data: { data: [] } }))
    ]);
    categoriesList.value = catRes.data?.data || [];
    brandsList.value = brandRes.data?.data || [];
  } catch (e) {
    console.error("Dropdown error:", e);
  }
}

async function fetchStockReport() {
  loading.value = true;
  currentPage.value = 1;
  try {
    const params: any = {};
    if (searchQuery.value) params.search = searchQuery.value;
    if (selectedCategoryId.value) params.categoryId = selectedCategoryId.value;
    if (selectedBrandId.value) params.brandId = selectedBrandId.value;
    if (selectedStatus.value && selectedStatus.value !== "all") params.status = selectedStatus.value;

    const res = await axios.get("/api/reports/stock", { params });
    itemsList.value = res.data?.data || [];
    summaryData.value = res.data?.summary || {};
  } catch (error) {
    console.error("Failed to load stock report:", error);
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  searchQuery.value = "";
  selectedCategoryId.value = "";
  selectedBrandId.value = "";
  selectedStatus.value = "all";
  fetchStockReport();
}

function getStockBadgeClass(item: any): string {
  if (item.stockQuantity <= 0) return "bg-danger text-white";
  if (item.stockQuantity <= (item.alertQuantity || 5)) return "bg-warning text-dark";
  return "bg-success text-white";
}

function toBengaliNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === "") return "০";
  const str = String(val);
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return str.replace(/[0-9]/g, (w) => bengaliDigits[+w]);
}

function formatAmount(val: number | string | undefined | null): string {
  const num = Number(val) || 0;
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function exportCsv() {
  if (!itemsList.value.length) return;
  const headers = ["পণ্য কোড", "বারকোড", "পণ্যের নাম", "ডিজাইন", "ক্যাটাগরি", "ব্র্যান্ড", "সাইজ", "ক্রয়মূল্য", "বিক্রয়মূল্য", "মজুদ পিস", "মোট স্টক মূল্য"];
  const rows = itemsList.value.map(it => [
    `"${it.code || ''}"`,
    `"${it.barcode || ''}"`,
    `"${it.name.replace(/"/g, '""')}"`,
    `"${it.designCode || ''}"`,
    `"${it.categoryName || ''}"`,
    `"${it.brandName || ''}"`,
    `"${it.sizeName || ''}"`,
    it.purchasePrice || 0,
    it.sellingPrice || 0,
    it.stockQuantity || 0,
    it.stockCostValue || 0
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Stock_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

watch(() => [props.initialStatus, props.initialSearch], () => {
  if (props.initialStatus) selectedStatus.value = props.initialStatus;
  if (props.initialSearch !== undefined) searchQuery.value = props.initialSearch;
  fetchStockReport();
});

onMounted(() => {
  fetchDropdowns();
  fetchStockReport();
});
</script>

<style scoped>
.card-bar-primary {
  border-left: 4px solid #0d6efd !important;
}
.card-bar-info {
  border-left: 4px solid #0dcaf0 !important;
}
.card-bar-warning {
  border-left: 4px solid #ffc107 !important;
}
.card-bar-success {
  border-left: 4px solid #198754 !important;
}
.stat-icon-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
</style>
