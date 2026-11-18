<template>
  <div class="reports-page pb-5">
    <!-- Header Section with Breadcrumb & Timeframe Selector -->
    <div class="card border shadow-sm mb-4 bg-white">
      <div class="card-body p-3 p-md-4">
        <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
          <!-- Left: Title & Subtitle -->
          <div>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb mb-1 small">
                <li class="breadcrumb-item">
                  <router-link to="/" class="text-decoration-none text-muted">
                    <i class="bi bi-house-door me-1"></i>হোম
                  </router-link>
                </li>
                <li class="breadcrumb-item active text-dark fw-medium" aria-current="page">
                  রিপোর্টস
                </li>
              </ol>
            </nav>
            <div class="d-flex align-items-center gap-2">
              <div class="reports-header-icon bg-primary-subtle text-primary rounded p-2 d-flex align-items-center justify-content-center">
                <i class="bi bi-graph-up fs-4"></i>
              </div>
              <div>
                <h4 class="m-0 fw-bold text-dark">ব্যবসায়িক সার্বিক রিপোর্ট ও আর্থিক বিশ্লেষণ</h4>
                <p class="text-muted small mb-0 mt-0.5">
                  বিক্রয়, ক্রয়, বর্তমান স্টক, নগদ প্রবাহ এবং দেনা-পাওনার সামগ্রিক চিত্র
                </p>
              </div>
            </div>
          </div>

          <!-- Right: Period Selector & Action Buttons -->
          <div class="d-flex flex-wrap align-items-center gap-2 justify-content-lg-end">
            <!-- Period Dropdown -->
            <div class="d-flex align-items-center gap-1.5 bg-light p-1 rounded border">
              <i class="bi bi-calendar3 text-muted ms-2 small"></i>
              <select
                v-model="selectedPeriod"
                class="form-select form-select-sm border-0 bg-transparent fw-medium"
                style="width: 140px; cursor: pointer;"
                @change="handlePeriodChange">
                <option value="today">আজকের (Today)</option>
                <option value="week">চলতি সপ্তাহের</option>
                <option value="month">চলতি মাসের</option>
                <option value="year">চলতি বছরের</option>
                <option value="custom">কাস্টম তারিখ...</option>
              </select>
            </div>

            <!-- Custom Date Inputs (when custom period is selected) -->
            <div v-if="selectedPeriod === 'custom'" class="d-flex align-items-center gap-1">
              <input
                v-model="customStartDate"
                type="date"
                class="form-control form-control-sm"
                @change="fetchSummary" />
              <span class="text-muted small">থেকে</span>
              <input
                v-model="customEndDate"
                type="date"
                class="form-control form-control-sm"
                @change="fetchSummary" />
            </div>

            <!-- Reload Button -->
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
              title="তথ্য রিফ্রেশ করুন"
              :disabled="loadingSummary"
              @click="fetchSummary">
              <i class="bi bi-arrow-clockwise" :class="{ 'spin-animation': loadingSummary }"></i>
              <span class="d-none d-sm-inline">রিফ্রেশ</span>
            </button>

            <!-- Print Page Button -->
            <button
              type="button"
              class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
              title="রিপোর্ট প্রিন্ট করুন"
              @click="printReport">
              <i class="bi bi-printer"></i>
              <span class="d-none d-sm-inline">প্রিন্ট</span>
            </button>
          </div>
        </div>

        <!-- Navigation Tabs (Nexgen Modular Switcher) -->
        <hr class="my-3 opacity-25" />
        <ul class="nav nav-pills report-nav-pills gap-1 flex-nowrap overflow-auto" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              type="button"
              class="nav-link text-nowrap d-flex align-items-center gap-2 py-2 px-3 small fw-medium"
              :class="{ active: activeTab === 'summary' }"
              @click="activeTab = 'summary'">
              <i class="bi bi-speedometer2"></i>
              <span>সার্বিক সামারি</span>
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              type="button"
              class="nav-link text-nowrap d-flex align-items-center gap-2 py-2 px-3 small fw-medium"
              :class="{ active: activeTab === 'stock' }"
              @click="activeTab = 'stock'">
              <i class="bi bi-box-seam"></i>
              <span>পণ্যভিত্তিক বর্তমান স্টক</span>
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              type="button"
              class="nav-link text-nowrap d-flex align-items-center gap-2 py-2 px-3 small fw-medium"
              :class="{ active: activeTab === 'statement' }"
              @click="activeTab = 'statement'">
              <i class="bi bi-journal-text"></i>
              <span>আর্থিক ও ক্যাশফ্লো স্টেটমেন্ট</span>
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              type="button"
              class="nav-link text-nowrap d-flex align-items-center gap-2 py-2 px-3 small fw-medium"
              :class="{ active: activeTab === 'profit_loss' }"
              @click="activeTab = 'profit_loss'">
              <i class="bi bi-graph-up-arrow"></i>
              <span>লাভ-ক্ষতি ও মার্জিন</span>
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              type="button"
              class="nav-link text-nowrap d-flex align-items-center gap-2 py-2 px-3 small fw-medium"
              :class="{ active: activeTab === 'parties' }"
              @click="activeTab = 'parties'">
              <i class="bi bi-people"></i>
              <span>দেনা-পাওনা খতিয়ান</span>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Active Tab Content Area -->
    <div class="report-content-container">
      <!-- ১. সার্বিক সামারি ট্যাব -->
      <div v-show="activeTab === 'summary'">
        <div v-if="loadingSummary" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <div class="text-muted small mt-2">রিপোর্ট ডাটা লোড হচ্ছে...</div>
        </div>
        <SummaryReport
          v-else
          :summary="summaryData" />
      </div>

      <!-- ২. পণ্যভিত্তিক স্টক রিপোর্ট ট্যাব -->
      <div v-if="activeTab === 'stock'">
        <StockReport />
      </div>

      <!-- ৩. আর্থিক ও ক্যাশফ্লো স্টেটমেন্ট ট্যাব -->
      <div v-if="activeTab === 'statement'">
        <StatementReport
          :period="selectedPeriod"
          :start-date="customStartDate"
          :end-date="customEndDate" />
      </div>

      <!-- ৪. লাভ-ক্ষতি ও মার্জিন রিপোর্ট ট্যাব -->
      <div v-if="activeTab === 'profit_loss'">
        <ProfitLossReport
          :period="selectedPeriod"
          :start-date="customStartDate"
          :end-date="customEndDate" />
      </div>

      <!-- ৫. দেনা-পাওনা লেজার ট্যাব -->
      <div v-if="activeTab === 'parties'">
        <PartyLedgerReport />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import SummaryReport from "./components/SummaryReport.vue";
import StockReport from "./components/StockReport.vue";
import StatementReport from "./components/StatementReport.vue";
import ProfitLossReport from "./components/ProfitLossReport.vue";
import PartyLedgerReport from "./components/PartyLedgerReport.vue";

const activeTab = ref<"summary" | "stock" | "statement" | "profit_loss" | "parties">("summary");
const selectedPeriod = ref("month"); // 'today' | 'week' | 'month' | 'year' | 'custom'
const customStartDate = ref("");
const customEndDate = ref("");

const loadingSummary = ref(false);
const summaryData = ref<any>({});

function handlePeriodChange() {
  if (selectedPeriod.value !== "custom") {
    fetchSummary();
  }
}

async function fetchSummary() {
  loadingSummary.value = true;
  try {
    const params: any = { period: selectedPeriod.value };
    if (selectedPeriod.value === "custom") {
      if (customStartDate.value) params.startDate = customStartDate.value;
      if (customEndDate.value) params.endDate = customEndDate.value;
    }
    const res = await axios.get("/api/reports/summary", { params });
    summaryData.value = res.data?.data || {};
  } catch (error) {
    console.error("Failed to fetch summary:", error);
  } finally {
    loadingSummary.value = false;
  }
}

function printReport() {
  window.print();
}

onMounted(() => {
  fetchSummary();
});
</script>

<style scoped>
.reports-header-icon {
  width: 44px;
  height: 44px;
}
.report-nav-pills .nav-link {
  color: #4b5563;
  background-color: #f3f4f6;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}
.report-nav-pills .nav-link:hover {
  background-color: #e5e7eb;
  color: #111827;
}
.report-nav-pills .nav-link.active {
  background-color: #0d6efd;
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(13, 110, 253, 0.25);
}
.spin-animation {
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
@media print {
  .report-nav-pills,
  .btn,
  .breadcrumb,
  select,
  input {
    display: none !important;
  }
}
</style>
