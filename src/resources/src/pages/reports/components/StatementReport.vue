<template>
  <div class="statement-report-component">
    <!-- Balance Sheet Cards (ব্যবসায়িক আর্থিক অবস্থান) -->
    <div class="card border shadow-sm mb-4">
      <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-bank text-primary"></i>
          <span class="fw-bold">ব্যবসায়িক আর্থিক স্থিতি ও ব্যালেন্স শিট (সামগ্রিক)</span>
        </div>
        <span class="badge bg-primary-subtle text-primary border border-primary-subtle">
          বর্তমান স্থিতি
        </span>
      </div>
      <div class="card-body p-3">
        <div class="row g-3">
          <!-- ১. পণ্য স্টক মজুদ সম্পদ -->
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="p-3 bg-light rounded border">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="text-muted small">মজুদ পণ্যের ক্রয়মূল্য</span>
                <i class="bi bi-boxes text-info fs-5"></i>
              </div>
              <div class="fs-5 fw-bold text-dark">
                ৳ {{ toBengaliNumber(formatAmount(balanceSheet.stockAssetValue)) }}
              </div>
              <small class="text-muted">চলতি ইনভেন্টরি সম্পদ</small>
            </div>
          </div>

          <!-- ২. কাস্টমারদের কাছে দেনা (পাওনা টাকা) -->
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="p-3 bg-light rounded border">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="text-muted small">কাস্টমার বাকি (প্রাপ্য)</span>
                <i class="bi bi-people text-success fs-5"></i>
              </div>
              <div class="fs-5 fw-bold text-success">
                ৳ {{ toBengaliNumber(formatAmount(balanceSheet.customerReceivables)) }}
              </div>
              <small class="text-muted">ক্রেতাদের কাছে পাওনা</small>
            </div>
          </div>

          <!-- ৩. সরবরাহকারীদের কাছে দেনা (বকেয়া) -->
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="p-3 bg-light rounded border">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="text-muted small">সরবরাহকারী দেনা (প্রদেয়)</span>
                <i class="bi bi-truck text-danger fs-5"></i>
              </div>
              <div class="fs-5 fw-bold text-danger">
                ৳ {{ toBengaliNumber(formatAmount(balanceSheet.supplierPayables)) }}
              </div>
              <small class="text-muted">সাপ্লায়ারদের বকেয়া পরিশোধ বাকি</small>
            </div>
          </div>

          <!-- ৪. নেট ব্যবসায়িক সম্পদ -->
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="p-3 bg-emerald-subtle rounded border border-emerald-subtle">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="text-emerald small fw-semibold">নেট ব্যবসায়িক আর্থিক মূল্য</span>
                <i class="bi bi-shield-check text-emerald fs-5"></i>
              </div>
              <div class="fs-5 fw-bold text-emerald">
                ৳ {{ toBengaliNumber(formatAmount(balanceSheet.netBusinessAsset)) }}
              </div>
              <small class="text-emerald-subtle-dark">স্টক + পাওনা - দেনা</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Period Cashflow Metrics -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-md-4">
        <div class="card border shadow-sm h-100 card-bar-success">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">নির্বাচিত সময়কালে মোট ক্যাশ ইনফ্লো (+)</span>
              <div class="stat-icon-circle bg-success-subtle text-success">
                <i class="bi bi-arrow-down-left"></i>
              </div>
            </div>
            <div class="fs-4 fw-bold text-success">
              ৳ {{ toBengaliNumber(formatAmount(cashflow.totalInflow)) }}
            </div>
            <small class="text-muted">নগদ বিক্রয় আদায় ও শেয়ারহোল্ডার মূলধন জমা</small>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card border shadow-sm h-100 card-bar-danger">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">নির্বাচিত সময়কালে মোট ক্যাশ আউটফ্লো (-)</span>
              <div class="stat-icon-circle bg-danger-subtle text-danger">
                <i class="bi bi-arrow-up-right"></i>
              </div>
            </div>
            <div class="fs-4 fw-bold text-danger">
              ৳ {{ toBengaliNumber(formatAmount(cashflow.totalOutflow)) }}
            </div>
            <small class="text-muted">ক্রয় বাবদ নগদ পরিশোধ ও মূলধন উত্তোলন</small>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card border shadow-sm h-100 card-bar-primary">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">নেট ক্যাশ ফ্লো ব্যালেন্স</span>
              <div class="stat-icon-circle bg-primary-subtle text-primary">
                <i class="bi bi-wallet"></i>
              </div>
            </div>
            <div class="fs-4 fw-bold" :class="cashflow.netCashFlow >= 0 ? 'text-primary' : 'text-danger'">
              ৳ {{ toBengaliNumber(formatAmount(cashflow.netCashFlow)) }}
            </div>
            <small class="text-muted">ইনফ্লো ও আউটফ্লোর পার্থক্য</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Statement Transactions Table Toolbar -->
    <div class="card border shadow-sm mb-3">
      <div class="card-body p-3">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-6">
            <div class="position-relative">
              <input
                v-model.trim="filterSearch"
                type="text"
                class="form-control form-control-sm ps-4"
                placeholder="পার্টির নাম, রেফারেন্স বা চালান দিয়ে খুঁজুন..." />
              <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted small pe-none"></i>
            </div>
          </div>
          <div class="col-8 col-md-4">
            <select v-model="filterType" class="form-select form-select-sm">
              <option value="all">সকল ধরনের লেনদেন</option>
              <option value="sale">পণ্য বিক্রয় (নগদ আদায়)</option>
              <option value="purchase">মালামাল ক্রয় (পরিশোধ)</option>
              <option value="capital">মূলধন জমা</option>
              <option value="withdrawal">মূলধন উত্তোলন</option>
            </select>
          </div>
          <div class="col-4 col-md-2 text-end">
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

    <!-- Statement Ledger Table -->
    <div class="card border shadow-sm">
      <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-journal-text text-dark"></i>
          <span class="fw-bold">লেনদেন স্টেটমেন্ট খতিয়ান</span>
          <span class="badge bg-secondary-subtle text-secondary border">
            {{ toBengaliNumber(filteredTransactions.length) }} টি লেনদেন
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
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <div class="text-muted small mt-2">স্টেটমেন্ট তথ্য লোড হচ্ছে...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredTransactions.length === 0" class="text-center py-5">
          <i class="bi bi-file-earmark-text text-muted fs-1 mb-2 d-block"></i>
          <p class="text-muted mb-0">নির্বাচিত সময়কালে কোনো লেনদেনের তথ্য পাওয়া যায়নি।</p>
        </div>

        <!-- Table View -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-nowrap">
                <th style="width: 45px;" class="text-center">#</th>
                <th>তারিখ</th>
                <th>লেনদেনের ধরন</th>
                <th>রেফারেন্স / ভাউচার</th>
                <th>পার্টি / খাত</th>
                <th class="text-end">মোট মূল্য</th>
                <th class="text-end text-success">জমা / ইনফ্লো (+)</th>
                <th class="text-end text-danger">খরচ / আউটফ্লো (-)</th>
                <th class="text-end">বকেয়া</th>
                <th>নোট</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tx, idx) in paginatedTransactions" :key="idx">
                <td class="text-center small text-muted">
                  {{ toBengaliNumber((currentPage - 1) * perPage + idx + 1) }}
                </td>
                <td class="small font-monospace">{{ tx.date }}</td>
                <td>
                  <span class="badge py-1 px-2 small" :class="getTypeBadgeClass(tx.type)">
                    {{ tx.typeLabel }}
                  </span>
                </td>
                <td class="font-monospace small fw-bold">{{ tx.reference || '-' }}</td>
                <td class="small fw-medium">{{ tx.party || '-' }}</td>
                <td class="text-end small">৳ {{ toBengaliNumber(formatAmount(tx.totalAmount)) }}</td>
                <td class="text-end small fw-bold text-success">
                  {{ tx.inflow > 0 ? `৳ ${toBengaliNumber(formatAmount(tx.inflow))}` : '-' }}
                </td>
                <td class="text-end small fw-bold text-danger">
                  {{ tx.outflow > 0 ? `৳ ${toBengaliNumber(formatAmount(tx.outflow))}` : '-' }}
                </td>
                <td class="text-end small">
                  <span v-if="tx.due > 0" class="text-danger fw-semibold">
                    ৳ {{ toBengaliNumber(formatAmount(tx.due)) }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td class="small text-muted">{{ tx.notes || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div v-if="filteredTransactions.length > perPage" class="card-footer bg-transparent border-top py-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div class="text-muted small">
          দেখাচ্ছে {{ toBengaliNumber((currentPage - 1) * perPage + 1) }} থেকে {{ toBengaliNumber(Math.min(currentPage * perPage, filteredTransactions.length)) }} (মোট {{ toBengaliNumber(filteredTransactions.length) }} টি লেনদেন)
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
const rawTransactions = ref<any[]>([]);
const cashflow = ref<any>({ totalInflow: 0, totalOutflow: 0, netCashFlow: 0 });
const balanceSheet = ref<any>({ stockAssetValue: 0, customerReceivables: 0, supplierPayables: 0, netBusinessAsset: 0 });

const filterSearch = ref("");
const filterType = ref("all");
const currentPage = ref(1);
const perPage = ref(15);

const filteredTransactions = computed(() => {
  let list = rawTransactions.value;
  if (filterType.value !== "all") {
    list = list.filter(t => t.type === filterType.value);
  }
  if (filterSearch.value) {
    const q = filterSearch.value.toLowerCase();
    list = list.filter(t =>
      (t.party && t.party.toLowerCase().includes(q)) ||
      (t.reference && t.reference.toLowerCase().includes(q)) ||
      (t.notes && t.notes.toLowerCase().includes(q))
    );
  }
  return list;
});

const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / perPage.value) || 1);

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredTransactions.value.slice(start, start + perPage.value);
});

async function fetchStatement() {
  loading.value = true;
  currentPage.value = 1;
  try {
    const params: any = { period: props.period };
    if (props.startDate) params.startDate = props.startDate;
    if (props.endDate) params.endDate = props.endDate;

    const res = await axios.get("/api/reports/statement", { params });
    const data = res.data?.data || {};
    rawTransactions.value = data.transactions || [];
    cashflow.value = data.cashflow || { totalInflow: 0, totalOutflow: 0, netCashFlow: 0 };
    balanceSheet.value = data.balanceSheet || { stockAssetValue: 0, customerReceivables: 0, supplierPayables: 0, netBusinessAsset: 0 };
  } catch (err) {
    console.error("Failed to load statement report:", err);
  } finally {
    loading.value = false;
  }
}

watch(() => [props.period, props.startDate, props.endDate], () => {
  fetchStatement();
});

onMounted(() => {
  fetchStatement();
});

function getTypeBadgeClass(type: string): string {
  switch (type) {
    case "sale":
      return "bg-success-subtle text-success border border-success-subtle";
    case "purchase":
      return "bg-primary-subtle text-primary border border-primary-subtle";
    case "capital":
      return "bg-info-subtle text-info border border-info-subtle";
    case "withdrawal":
      return "bg-danger-subtle text-danger border border-danger-subtle";
    default:
      return "bg-secondary-subtle text-secondary border";
  }
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
  if (!filteredTransactions.value.length) return;
  const headers = ["তারিখ", "লেনদেনের ধরন", "রেফারেন্স", "পার্টি / বিবরণ", "মোট মূল্য", "জমা / ইনফ্লো", "খরচ / আউটফ্লো", "বকেয়া", "নোট"];
  const rows = filteredTransactions.value.map(tx => [
    `"${tx.date}"`,
    `"${tx.typeLabel}"`,
    `"${tx.reference || ''}"`,
    `"${(tx.party || '').replace(/"/g, '""')}"`,
    tx.totalAmount || 0,
    tx.inflow || 0,
    tx.outflow || 0,
    tx.due || 0,
    `"${(tx.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Statement_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>

<style scoped>
.card-bar-primary {
  border-left: 4px solid #0d6efd !important;
}
.card-bar-danger {
  border-left: 4px solid #dc3545 !important;
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
.text-emerald {
  color: #059669 !important;
}
.bg-emerald-subtle {
  background-color: #d1fae5 !important;
}
.border-emerald-subtle {
  border-color: #a7f3d0 !important;
}
.text-emerald-subtle-dark {
  color: #065f46 !important;
}
</style>
