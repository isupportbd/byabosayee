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

          <!-- Right: Custom Styled Period Dropdown & Actions -->
          <div class="d-flex flex-wrap align-items-center gap-2 justify-content-lg-end">
            <!-- Custom Styled Period Dropdown -->
            <div class="position-relative" ref="dropdownRef">
              <button
                type="button"
                class="btn btn-sm btn-white border shadow-sm d-flex align-items-center gap-2 px-3 py-1.5 period-dropdown-btn"
                @click="isDropdownOpen = !isDropdownOpen">
                <i class="bi bi-calendar3 text-primary"></i>
                <span class="fw-semibold text-dark">{{ currentPeriodLabel }}</span>
                <i class="bi bi-chevron-down ms-1 text-muted small" :class="{ 'rotate-180': isDropdownOpen }"></i>
              </button>

              <!-- Floating Custom Dropdown Menu -->
              <div
                v-if="isDropdownOpen"
                class="dropdown-menu show shadow-lg border-0 py-2 mt-1 period-floating-menu position-absolute end-0">
                <div class="dropdown-header text-uppercase small fw-bold text-muted px-3 py-1">
                  সময়কাল নির্বাচন করুন
                </div>

                <button
                  type="button"
                  class="dropdown-item d-flex align-items-center justify-content-between px-3 py-2"
                  :class="{ active: selectedPeriod === 'today' }"
                  @click="selectPeriod('today')">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-sun text-warning"></i>
                    <span>আজকের দিন</span>
                  </div>
                  <i v-if="selectedPeriod === 'today'" class="bi bi-check2 text-primary fw-bold"></i>
                </button>

                <button
                  type="button"
                  class="dropdown-item d-flex align-items-center justify-content-between px-3 py-2"
                  :class="{ active: selectedPeriod === 'week' }"
                  @click="selectPeriod('week')">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-calendar-week text-info"></i>
                    <span>চলতি সপ্তাহ</span>
                  </div>
                  <i v-if="selectedPeriod === 'week'" class="bi bi-check2 text-primary fw-bold"></i>
                </button>

                <button
                  type="button"
                  class="dropdown-item d-flex align-items-center justify-content-between px-3 py-2"
                  :class="{ active: selectedPeriod === 'month' }"
                  @click="selectPeriod('month')">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-calendar-month text-primary"></i>
                    <span>চলতি মাস</span>
                  </div>
                  <i v-if="selectedPeriod === 'month'" class="bi bi-check2 text-primary fw-bold"></i>
                </button>

                <button
                  type="button"
                  class="dropdown-item d-flex align-items-center justify-content-between px-3 py-2"
                  :class="{ active: selectedPeriod === 'year' }"
                  @click="selectPeriod('year')">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-calendar4 text-success"></i>
                    <span>চলতি বছর</span>
                  </div>
                  <i v-if="selectedPeriod === 'year'" class="bi bi-check2 text-primary fw-bold"></i>
                </button>

                <div class="dropdown-divider my-1"></div>

                <button
                  type="button"
                  class="dropdown-item d-flex align-items-center justify-content-between px-3 py-2"
                  :class="{ active: selectedPeriod === 'custom' }"
                  @click="selectPeriod('custom')">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-calendar-range text-secondary"></i>
                    <span>কাস্টম তারিখ সীমা...</span>
                  </div>
                  <i v-if="selectedPeriod === 'custom'" class="bi bi-check2 text-primary fw-bold"></i>
                </button>
              </div>
            </div>

            <!-- Custom Date Inputs (when custom period is active) -->
            <div v-if="selectedPeriod === 'custom'" class="d-flex align-items-center gap-1.5 p-1 bg-light rounded border">
              <input
                v-model="customStartDate"
                type="date"
                class="form-control form-control-sm border-0 bg-white"
                @change="fetchSummary" />
              <span class="text-muted small px-1">হতে</span>
              <input
                v-model="customEndDate"
                type="date"
                class="form-control form-control-sm border-0 bg-white"
                @change="fetchSummary" />
            </div>

            <!-- Reload Button -->
            <button
              type="button"
              class="btn btn-sm btn-white border shadow-sm d-inline-flex align-items-center gap-1 px-2.5 py-1.5 text-secondary"
              title="তথ্য রিফ্রেশ করুন"
              :disabled="loadingSummary"
              @click="fetchSummary">
              <i class="bi bi-arrow-clockwise text-primary" :class="{ 'spin-animation': loadingSummary }"></i>
              <span class="d-none d-sm-inline">রিফ্রেশ</span>
            </button>

            <!-- Print Page Button -->
            <button
              type="button"
              class="btn btn-sm btn-white border shadow-sm d-inline-flex align-items-center gap-1 px-2.5 py-1.5 text-secondary"
              title="রিপোর্ট প্রিন্ট করুন"
              @click="printReport">
              <i class="bi bi-printer text-primary"></i>
              <span class="d-none d-sm-inline">প্রিন্ট</span>
            </button>
          </div>
        </div>

        <!-- Navigation Tabs (Nexgen Modular Switcher) -->
        <hr class="my-3 opacity-25" />
        <ul class="nav nav-pills report-nav-pills gap-1.5 flex-nowrap overflow-auto" role="tablist">
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
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
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

const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const loadingSummary = ref(false);
const summaryData = ref<any>({});

const currentPeriodLabel = computed(() => {
  switch (selectedPeriod.value) {
    case "today":
      return "আজকের দিন";
    case "week":
      return "চলতি সপ্তাহ";
    case "month":
      return "চলতি মাস";
    case "year":
      return "চলতি বছর";
    case "custom":
      return "কাস্টম তারিখ";
    default:
      return "চলতি মাস";
  }
});

function selectPeriod(period: string) {
  selectedPeriod.value = period;
  isDropdownOpen.value = false;
  if (period !== "custom") {
    fetchSummary();
  }
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false;
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
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.reports-header-icon {
  width: 44px;
  height: 44px;
}
.period-dropdown-btn {
  border-radius: 8px;
  background-color: #ffffff;
  transition: all 0.2s ease-in-out;
}
.period-dropdown-btn:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}
.period-floating-menu {
  min-width: 220px;
  border-radius: 10px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  z-index: 1050;
}
.period-floating-menu .dropdown-item {
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
  border-radius: 6px;
  margin: 2px 6px;
  width: auto;
  transition: all 0.15s ease;
}
.period-floating-menu .dropdown-item:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}
.period-floating-menu .dropdown-item.active {
  background-color: #eff6ff;
  color: #0284c7;
  font-weight: 600;
}
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
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
  .period-dropdown-btn,
  .period-floating-menu,
  .report-nav-pills,
  .btn,
  .breadcrumb,
  input {
    display: none !important;
  }
}
</style>
