<template>
  <div class="withdrawal-list-page">
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

    <!-- Header Actions -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div class="d-flex align-items-center gap-2">
        <div class="header-icon-box bg-danger text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
          <i class="bi bi-dash-circle-fill fs-5"></i>
        </div>
        <div>
          <h5 class="m-0 fw-bold">মূলধন / লাভ উত্তোলন তালিকা</h5>
          <small class="text-muted">শেয়ারহোল্ডার ও ব্যবসায়ীদের তহবিল উত্তোলনের বিবরণী</small>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <router-link
          to="/accounts/withdrawals/create"
          class="btn btn-sm btn-danger text-white d-inline-flex align-items-center gap-1.5 px-3 py-1.5 shadow-sm fw-medium">
          <i class="bi bi-dash-circle"></i>
          <span>+নতুন উত্তোলন যোগ</span>
        </router-link>
        <router-link
          to="/accounts/capital"
          class="btn btn-sm btn-outline-emerald d-inline-flex align-items-center gap-1.5 px-3 py-1.5 shadow-sm fw-medium">
          <i class="bi bi-wallet2"></i>
          <span>মূলধন তালিকা</span>
        </router-link>
      </div>
    </div>

    <!-- 1. Top Summary Metric Cards (3 Columns) -->
    <div class="row g-3 mb-4">
      <!-- মোট উত্তোলন -->
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="card border shadow-sm h-100 card-bar-danger">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">মোট উত্তোলন</span>
              <div class="stat-icon-circle bg-danger-subtle text-danger">
                <i class="bi bi-cash-coin"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-5 fw-bold text-danger me-1">৳ {{ toBengaliNumber(formatAmount(summary.totalAmount)) }}</span>
            </div>
            <div class="small text-muted mt-1">
              <i class="bi bi-arrow-down-right-circle text-danger me-1"></i>সর্বমোট তহবিল কর্তন
            </div>
          </div>
        </div>
      </div>

      <!-- মোট উত্তোলনকারী -->
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="card border shadow-sm h-100 card-bar-warning">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">উত্তোলনকারী অংশীদার</span>
              <div class="stat-icon-circle bg-warning-subtle text-warning">
                <i class="bi bi-person-lines-fill"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-5 fw-bold text-warning me-1">{{ toBengaliNumber(summary.shareholdersCount) }}</span>
              <span class="text-muted small">জন</span>
            </div>
            <div class="small text-muted mt-1">
              <i class="bi bi-people text-warning me-1"></i>উত্তোলনকারী শেয়ারহোল্ডার
            </div>
          </div>
        </div>
      </div>

      <!-- মোট উত্তোলন ভাউচার -->
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="card border shadow-sm h-100 card-bar-secondary">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">উত্তোলন ভাউচার সংখ্যা</span>
              <div class="stat-icon-circle bg-secondary-subtle text-secondary">
                <i class="bi bi-receipt-cutoff"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-5 fw-bold text-secondary me-1">{{ toBengaliNumber(summary.count) }}</span>
              <span class="text-muted small">টি ভাউচার</span>
            </div>
            <div class="small text-muted mt-1">
              <i class="bi bi-file-earmark-diff text-secondary me-1"></i>মোট উত্তোলন লেনদেন
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Main List Card -->
    <div class="card border shadow-sm">
      <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <h6 class="m-0 fw-bold">উত্তোলন ভাউচার বিবরণী</h6>
          <span class="badge bg-secondary-subtle text-secondary border">
            {{ toBengaliNumber(withdrawalsList.length) }} টি রেকর্ড
          </span>
        </div>

        <div class="d-flex align-items-center gap-2 flex-wrap">
          <!-- Filter Tabs by Shareholder -->
          <div class="filter-tabs-wrapper">
            <button
              type="button"
              class="filter-tab-btn"
              :class="{ active: selectedShareholderFilter === 'all' }"
              @click="selectedShareholderFilter = 'all'">
              সকল ({{ toBengaliNumber(withdrawalsList.length) }})
            </button>
            <button
              v-for="sh in summary.shareholderBreakdown"
              :key="sh.name"
              type="button"
              class="filter-tab-btn"
              :class="{ active: selectedShareholderFilter === sh.name }"
              @click="selectedShareholderFilter = sh.name">
              {{ sh.name }} (৳{{ toBengaliNumber(formatAmount(sh.total)) }})
            </button>
          </div>

          <!-- Date Filters -->
          <div class="d-flex align-items-center gap-1">
            <input
              v-model="startDate"
              type="date"
              class="form-control form-control-sm py-1"
              style="width: 135px;"
              title="শুরুর তারিখ"
              @change="fetchWithdrawals" />
            <span class="text-muted small">হতে</span>
            <input
              v-model="endDate"
              type="date"
              class="form-control form-control-sm py-1"
              style="width: 135px;"
              title="শেষ তারিখ"
              @change="fetchWithdrawals" />
            <button
              v-if="startDate || endDate"
              type="button"
              class="btn btn-sm btn-outline-secondary p-1"
              title="তারিখ ফিল্টার মুছুন"
              @click="clearDateFilter">
              <i class="bi bi-x"></i>
            </button>
          </div>

          <!-- Search Input -->
          <div class="position-relative" style="min-width: 200px;">
            <input
              v-model.trim="searchQuery"
              type="text"
              class="form-control form-control-sm ps-4"
              placeholder="নাম, ভাউচার বা কারণ খুঁজুন..." />
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted small pe-none"></i>
            <button
              v-if="searchQuery"
              type="button"
              class="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-2"
              @click="searchQuery = ''">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-danger" role="status">
            <span class="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <div class="text-muted small mt-2">উত্তোলন বিবরণী লোড হচ্ছে...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredWithdrawals.length === 0" class="text-center py-5">
          <i class="bi bi-dash-circle text-muted fs-1 mb-2 d-block"></i>
          <p class="text-muted mb-2">
            {{ searchQuery || selectedShareholderFilter !== 'all' ? 'অনুসন্ধানের সাথে কোনো উত্তোলন রেকর্ড মেলেনি।' : 'এখনো কোনো উত্তোলন রেকর্ড পাওয়া যায়নি।' }}
          </p>
          <router-link
            to="/accounts/withdrawals/create"
            class="btn btn-sm btn-danger text-white px-3 py-1 shadow-sm">
            +নতুন উত্তোলন যোগ করুন
          </router-link>
        </div>

        <!-- Table View -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th class="ps-3 text-center" style="width: 50px;">#</th>
                <th style="min-width: 105px;">তারিখ</th>
                <th style="min-width: 180px;">উত্তোলনকারী ও পদবী</th>
                <th style="min-width: 150px;">পেমেন্ট মাধ্যম ও ভাউচার</th>
                <th class="text-end" style="min-width: 130px;">টাকার পরিমাণ</th>
                <th style="min-width: 180px;">উত্তোলনের কারণ / বিবরণ</th>
                <th class="text-end pe-3" style="width: 100px;">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(wth, idx) in filteredWithdrawals" :key="wth.id">
                <td class="ps-3 text-center text-muted small">
                  {{ toBengaliNumber(idx + 1) }}
                </td>

                <!-- Date -->
                <td>
                  <span class="fw-semibold text-dark">{{ toBengaliDate(wth.date) }}</span>
                </td>

                <!-- Shareholder Name & Ownership -->
                <td>
                  <div class="d-flex align-items-center gap-1.5">
                    <span class="fw-bold text-dark">{{ wth.shareholderName }}</span>
                    <span class="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle small py-0.5">
                      {{ wth.ownershipType || 'মালিক' }}
                    </span>
                  </div>
                </td>

                <!-- Payment Method & Voucher -->
                <td>
                  <div class="d-flex flex-column">
                    <span class="small fw-semibold text-dark">
                      <i class="bi bi-credit-card me-1 text-muted"></i>{{ wth.paymentMethod || 'নগদ' }}
                    </span>
                    <small v-if="wth.voucherNo" class="text-muted" title="ভাউচার নং">
                      ভাউচার: {{ wth.voucherNo }}
                    </small>
                    <small v-if="wth.accountDetails" class="text-muted text-truncate" style="max-width: 170px;" :title="wth.accountDetails">
                      {{ wth.accountDetails }}
                    </small>
                  </div>
                </td>

                <!-- Amount -->
                <td class="text-end">
                  <span class="fw-bold fs-6 text-danger">
                    ৳ {{ toBengaliNumber(formatAmount(wth.amount)) }}
                  </span>
                </td>

                <!-- Notes / Reason -->
                <td>
                  <span class="small text-muted text-truncate d-inline-block" style="max-width: 250px;" :title="wth.notes || '-'">
                    {{ wth.notes || '-' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="text-end pe-3">
                  <div class="d-inline-flex align-items-center gap-1">
                    <router-link
                      :to="`/accounts/withdrawals/create?id=${wth.id}`"
                      class="btn btn-sm btn-outline-primary btn-action-icon"
                      title="সম্পাদন করুন">
                      <i class="bi bi-pencil-square"></i>
                    </router-link>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger btn-action-icon"
                      title="মুছে ফেলুন"
                      @click="confirmDelete(wth)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot class="table-light">
              <tr class="fw-bold">
                <td colspan="4" class="ps-3 text-end text-dark">মোট উত্তোলন:</td>
                <td class="text-end text-danger fs-6">৳ {{ toBengaliNumber(formatAmount(filteredTotal)) }}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="deletingWithdrawal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom py-2 text-bg-danger">
            <h6 class="modal-title small fw-bold">
              <i class="bi bi-exclamation-triangle-fill me-1"></i>উত্তোলন মুছে ফেলা
            </h6>
            <button type="button" class="btn-close btn-close-white" @click="deletingWithdrawal = null"></button>
          </div>
          <div class="modal-body text-center py-3">
            <p class="mb-1 text-dark">
              আপনি কি নিশ্চিত যে <strong>{{ deletingWithdrawal.shareholderName }}</strong> এর <strong>৳ {{ toBengaliNumber(formatAmount(deletingWithdrawal.amount)) }}</strong> এর উত্তোলন রেকর্ডটি মুছে ফেলতে চান?
            </p>
            <small class="text-danger">এই লেনদেন মুছে ফেললে সার্বিক ব্যালেন্স সমন্বয় হবে।</small>
          </div>
          <div class="modal-footer border-top py-1.5 justify-content-center">
            <button type="button" class="btn btn-sm btn-outline-secondary px-3" @click="deletingWithdrawal = null">
              বাতিল
            </button>
            <button
              type="button"
              class="btn btn-sm btn-danger px-3 d-inline-flex align-items-center gap-1"
              :disabled="deleteLoading"
              @click="executeDelete">
              <span v-if="deleteLoading" class="spinner-border spinner-border-sm"></span>
              <span v-else>হ্যাঁ, মুছুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";

const loading = ref(false);
const withdrawalsList = ref<any[]>([]);
const summary = ref<any>({
  totalAmount: 0,
  count: 0,
  shareholdersCount: 0,
  shareholderBreakdown: []
});

const selectedShareholderFilter = ref("all");
const searchQuery = ref("");
const startDate = ref("");
const endDate = ref("");

const deletingWithdrawal = ref<any>(null);
const deleteLoading = ref(false);

const toast = reactive({
  show: false,
  message: "",
  type: "success"
});

function showToast(message: string, type: "success" | "danger" | "warning" | "info" = "success") {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 4000);
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

function toBengaliDate(dateStr: string): string {
  if (!dateStr) return "-";
  return toBengaliNumber(dateStr);
}

async function fetchWithdrawals() {
  loading.value = true;
  try {
    const params: any = {};
    if (startDate.value) params.startDate = startDate.value;
    if (endDate.value) params.endDate = endDate.value;

    const res = await axios.get("/api/accounts/withdrawals", { params });
    withdrawalsList.value = res.data?.data || [];
    summary.value = res.data?.summary || {
      totalAmount: 0,
      count: 0,
      shareholdersCount: 0,
      shareholderBreakdown: []
    };
  } catch (err: any) {
    showToast(err.response?.data?.message || "উত্তোলন বিবরণী লোড করতে ব্যর্থ হয়েছে", "danger");
  } finally {
    loading.value = false;
  }
}

function clearDateFilter() {
  startDate.value = "";
  endDate.value = "";
  fetchWithdrawals();
}

const filteredWithdrawals = computed(() => {
  let list = withdrawalsList.value;

  if (selectedShareholderFilter.value !== "all") {
    list = list.filter((item) => item.shareholderName === selectedShareholderFilter.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (item) =>
        item.shareholderName.toLowerCase().includes(q) ||
        (item.voucherNo && item.voucherNo.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        (item.paymentMethod && item.paymentMethod.toLowerCase().includes(q))
    );
  }

  return list;
});

const filteredTotal = computed(() => {
  return filteredWithdrawals.value.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
});

function confirmDelete(wth: any) {
  deletingWithdrawal.value = wth;
}

async function executeDelete() {
  if (!deletingWithdrawal.value) return;
  deleteLoading.value = true;
  try {
    const res = await axios.delete(`/api/accounts/withdrawals/${deletingWithdrawal.value.id}`);
    showToast(res.data?.message || "উত্তোলন রেকর্ড সফলভাবে মুছে ফেলা হয়েছে", "success");
    deletingWithdrawal.value = null;
    await fetchWithdrawals();
  } catch (err: any) {
    showToast(err.response?.data?.message || "মুছে ফেলতে ব্যর্থ হয়েছে", "danger");
  } finally {
    deleteLoading.value = false;
  }
}

onMounted(() => {
  fetchWithdrawals();
});
</script>

<style scoped>
.btn-emerald {
  background-color: #059669;
  border-color: #059669;
}
.btn-emerald:hover {
  background-color: #047857;
  border-color: #047857;
}
.btn-outline-emerald {
  color: #059669;
  border-color: #059669;
}
.btn-outline-emerald:hover {
  background-color: #059669;
  color: #ffffff;
}
.text-emerald {
  color: #059669 !important;
}
.bg-emerald {
  background-color: #059669 !important;
}
.bg-emerald-subtle {
  background-color: rgba(5, 150, 105, 0.1) !important;
}
.border-emerald-subtle {
  border-color: rgba(5, 150, 105, 0.25) !important;
}

.card-bar-danger {
  border-top: 3px solid #dc3545 !important;
}
.card-bar-warning {
  border-top: 3px solid #ffc107 !important;
}
.card-bar-secondary {
  border-top: 3px solid #6c757d !important;
}

.stat-icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.filter-tabs-wrapper {
  display: inline-flex;
  background: #f1f5f9;
  padding: 2px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}
.filter-tab-btn {
  border: none;
  background: transparent;
  padding: 4px 10px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
  border-radius: 4px;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.filter-tab-btn.active {
  background: #ffffff;
  color: #dc3545;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-action-icon {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}
</style>
