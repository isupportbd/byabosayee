<template>
  <div class="profit-loss-report-component">
    <!-- Top KPI Cards -->
    <div class="row g-3 mb-4">
      <!-- ১. মোট বিক্রয় রাজস্ব -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-primary">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">মোট বিক্রয় রাজস্ব</span>
              <div class="stat-icon-circle bg-primary-subtle text-primary">
                <i class="bi bi-cart-check"></i>
              </div>
            </div>
            <div class="fs-4 fw-bold text-primary">
              ৳ {{ toBengaliNumber(formatAmount(summary.totalRevenue)) }}
            </div>
            <div class="small text-muted mt-1 d-flex justify-content-between">
              <span>{{ toBengaliNumber(summary.totalSalesInvoices || 0) }} টি বিক্রয় চালান</span>
              <span>{{ toBengaliNumber(summary.totalPiecesSold || 0) }} পিস বিক্রয়</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ২. বিক্রিত পণ্যের খরচ (COGS) -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-warning">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">বিক্রিত পণ্যের ক্রয় খরচ (COGS)</span>
              <div class="stat-icon-circle bg-warning-subtle text-warning">
                <i class="bi bi-tag"></i>
              </div>
            </div>
            <div class="fs-4 fw-bold text-dark">
              ৳ {{ toBengaliNumber(formatAmount(summary.totalCostOfGoodsSold)) }}
            </div>
            <div class="small text-muted mt-1">
              <span>বিক্রিত পণ্যের আসল ক্রয়মূল্য</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ৩. গ্রস প্রফিট (মোট লাভ) -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100" :class="summary.grossProfit >= 0 ? 'card-bar-success' : 'card-bar-danger'">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">মোট গ্রস মুনাফা (Gross Profit)</span>
              <div class="stat-icon-circle" :class="summary.grossProfit >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                <i class="bi bi-graph-up-arrow"></i>
              </div>
            </div>
            <div class="fs-4 fw-bold" :class="summary.grossProfit >= 0 ? 'text-success' : 'text-danger'">
              ৳ {{ toBengaliNumber(formatAmount(summary.grossProfit)) }}
            </div>
            <div class="small text-muted mt-1">
              <span>বিক্রয়মূল্য - ক্রয় খরচ</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ৪. গ্রস প্রফিট মার্জিন (%) -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-emerald">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">গড় লাভ মার্জিন (Margin %)</span>
              <div class="stat-icon-circle bg-emerald-subtle text-emerald">
                <i class="bi bi-percent"></i>
              </div>
            </div>
            <div class="fs-4 fw-bold text-emerald">
              {{ toBengaliNumber((summary.profitMarginPercent || 0).toFixed(2)) }}%
            </div>
            <div class="small text-muted mt-1">
              <span>বিক্রয়ের ওপর অর্জিত শতকরা লাভ</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toolbar & Search -->
    <div class="card border shadow-sm mb-3">
      <div class="card-body p-3">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-8">
            <div class="position-relative">
              <input
                v-model.trim="searchQuery"
                type="text"
                class="form-control form-control-sm ps-4"
                placeholder="পণ্যের নাম, বারকোড বা ক্যাটাগরি দিয়ে খুঁজুন..." />
              <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted small pe-none"></i>
            </div>
          </div>
          <div class="col-12 col-md-4 text-end">
            <button
              type="button"
              class="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1"
              @click="exportCsv">
              <i class="bi bi-download"></i>
              <span>এক্সপোর্ট সিএসভি</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sold Items Profit Table -->
    <div class="card border shadow-sm">
      <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-cash-stack text-success"></i>
          <span class="fw-bold">বিক্রিত পণ্যের লাভ ও মার্জিন বিশ্লেষণ তালিকা</span>
          <span class="badge bg-secondary-subtle text-secondary border">
            {{ toBengaliNumber(filteredItems.length) }} টি পণ্য বিক্রয় হয়েছে
          </span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="text-muted small d-none d-sm-inline">প্রতি পেজে:</span>
          <select v-model="perPage" class="form-select form-select-sm" style="width: 75px;">
            <option :value="15">১৫</option>
            <option :value="30">৩০</option>
            <option :value="50">৫০</option>
          </select>
        </div>
      </div>

      <div class="card-body p-0">
        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <div class="text-muted small mt-2">লাভ-ক্ষতি তথ্য লোড হচ্ছে...</div>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredItems.length === 0" class="text-center py-5">
          <i class="bi bi-clipboard-data text-muted fs-1 mb-2 d-block"></i>
          <p class="text-muted mb-0">নির্বাচিত সময়কালে কোনো বিক্রয় বা লাভের তথ্য পাওয়া যায়নি।</p>
        </div>

        <!-- Table View -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-nowrap">
                <th style="width: 45px;" class="text-center">#</th>
                <th>পণ্যের নাম</th>
                <th>বারকোড</th>
                <th>ক্যাটাগরি</th>
                <th>ব্র্যান্ড</th>
                <th class="text-center">বিক্রিত পিস</th>
                <th class="text-end">মোট বিক্রয়মূল্য</th>
                <th class="text-end">মোট ক্রয় খরচ</th>
                <th class="text-end text-success">অর্জিত মুনাফা</th>
                <th class="text-center">মার্জিন (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(it, idx) in paginatedItems" :key="idx">
                <td class="text-center small text-muted">
                  {{ toBengaliNumber((currentPage - 1) * perPage + idx + 1) }}
                </td>
                <td class="fw-semibold text-dark">{{ it.name }}</td>
                <td class="font-monospace small text-muted">{{ it.barcode || '-' }}</td>
                <td class="small">{{ it.categoryName || '-' }}</td>
                <td class="small">{{ it.brandName || '-' }}</td>
                <td class="text-center fw-medium">{{ toBengaliNumber(it.quantitySold) }}</td>
                <td class="text-end small">৳ {{ toBengaliNumber(formatAmount(it.totalRevenue)) }}</td>
                <td class="text-end small">৳ {{ toBengaliNumber(formatAmount(it.totalCost)) }}</td>
                <td class="text-end small fw-bold" :class="it.grossProfit >= 0 ? 'text-success' : 'text-danger'">
                  ৳ {{ toBengaliNumber(formatAmount(it.grossProfit)) }}
                </td>
                <td class="text-center">
                  <span class="badge py-1 px-2" :class="it.grossProfit >= 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'">
                    {{ toBengaliNumber(it.totalRevenue > 0 ? ((it.grossProfit / it.totalRevenue) * 100).toFixed(1) : 0) }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div v-if="filteredItems.length > perPage" class="card-footer bg-transparent border-top py-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div class="text-muted small">
          দেখাচ্ছে {{ toBengaliNumber((currentPage - 1) * perPage + 1) }} থেকে {{ toBengaliNumber(Math.min(currentPage * perPage, filteredItems.length)) }} (মোট {{ toBengaliNumber(filteredItems.length) }} টি পণ্য)
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
  period: string;
  startDate?: string;
  endDate?: string;
}>();

const loading = ref(false);
const rawItems = ref<any[]>([]);
const summary = ref<any>({
  totalSalesInvoices: 0,
  totalPiecesSold: 0,
  totalRevenue: 0,
  totalCostOfGoodsSold: 0,
  grossProfit: 0,
  profitMarginPercent: 0
});

const searchQuery = ref("");
const currentPage = ref(1);
const perPage = ref(15);

const filteredItems = computed(() => {
  let list = rawItems.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(it =>
      (it.name && it.name.toLowerCase().includes(q)) ||
      (it.barcode && it.barcode.toLowerCase().includes(q)) ||
      (it.categoryName && it.categoryName.toLowerCase().includes(q)) ||
      (it.brandName && it.brandName.toLowerCase().includes(q))
    );
  }
  return list;
});

const totalPages = computed(() => Math.ceil(filteredItems.value.length / perPage.value) || 1);

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredItems.value.slice(start, start + perPage.value);
});

async function fetchProfitLoss() {
  loading.value = true;
  currentPage.value = 1;
  try {
    const params: any = { period: props.period };
    if (props.startDate) params.startDate = props.startDate;
    if (props.endDate) params.endDate = props.endDate;

    const res = await axios.get("/api/reports/profit-loss", { params });
    const data = res.data?.data || {};
    rawItems.value = data.items || [];
    summary.value = data.summary || {};
  } catch (err) {
    console.error("Failed to load profit loss report:", err);
  } finally {
    loading.value = false;
  }
}

watch(() => [props.period, props.startDate, props.endDate], () => {
  fetchProfitLoss();
});

onMounted(() => {
  fetchProfitLoss();
});

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
  if (!filteredItems.value.length) return;
  const headers = ["পণ্যের নাম", "বারকোড", "ক্যাটাগরি", "ব্র্যান্ড", "বিক্রিত পিস", "মোট বিক্রয়মূল্য", "মোট ক্রয় খরচ", "অর্জিত লাভ", "মার্জিন %"];
  const rows = filteredItems.value.map(it => [
    `"${it.name.replace(/"/g, '""')}"`,
    `"${it.barcode || ''}"`,
    `"${it.categoryName || ''}"`,
    `"${it.brandName || ''}"`,
    it.quantitySold || 0,
    it.totalRevenue || 0,
    it.totalCost || 0,
    it.grossProfit || 0,
    it.totalRevenue > 0 ? ((it.grossProfit / it.totalRevenue) * 100).toFixed(2) : 0
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Profit_Loss_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>

<style scoped>
.card-bar-primary {
  border-left: 4px solid #0d6efd !important;
}
.card-bar-warning {
  border-left: 4px solid #ffc107 !important;
}
.card-bar-success {
  border-left: 4px solid #198754 !important;
}
.card-bar-danger {
  border-left: 4px solid #dc3545 !important;
}
.card-bar-emerald {
  border-left: 4px solid #059669 !important;
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
.text-emerald {
  color: #059669 !important;
}
.bg-emerald-subtle {
  background-color: #d1fae5 !important;
}
</style>
