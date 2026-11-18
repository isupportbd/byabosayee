<template>
  <div class="parties-report-component">
    <!-- Top Summary Cards -->
    <div class="row g-3 mb-4">
      <!-- ১. মোট সরবরাহকারী দেনা -->
      <div class="col-12 col-md-6">
        <div class="card border shadow-sm h-100 card-bar-danger">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">সরবরাহকারী ও কারখানা দেনা (বকেয়া)</span>
              <div class="stat-icon-circle bg-danger-subtle text-danger">
                <i class="bi bi-truck"></i>
              </div>
            </div>
            <div class="fs-4 fw-bold text-danger">
              ৳ {{ toBengaliNumber(formatAmount(totals.totalSupplierDue)) }}
            </div>
            <div class="small text-muted mt-1">
              <span>মোট {{ toBengaliNumber(vendorsList.length) }} জন সরবরাহকারী ও কারখানার লেনদেন হিসাব</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ২. মোট কাস্টমার পাওনা -->
      <div class="col-12 col-md-6">
        <div class="card border shadow-sm h-100 card-bar-success">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">কাস্টমার বাকি (প্রাপ্য টাকা)</span>
              <div class="stat-icon-circle bg-success-subtle text-success">
                <i class="bi bi-people"></i>
              </div>
            </div>
            <div class="fs-4 fw-bold text-success">
              ৳ {{ toBengaliNumber(formatAmount(totals.totalCustomerDue)) }}
            </div>
            <div class="small text-muted mt-1">
              <span>মোট {{ toBengaliNumber(customersList.length) }} জন নিবন্ধিত খদ্দের বা পার্টির বাকি হিসাব</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View Mode Switch & Search Toolbar -->
    <div class="card border shadow-sm mb-3">
      <div class="card-body p-3">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-4">
            <div class="btn-group w-100" role="group">
              <button
                type="button"
                class="btn btn-sm"
                :class="activeSection === 'vendors' ? 'btn-primary' : 'btn-outline-secondary'"
                @click="activeSection = 'vendors'">
                <i class="bi bi-truck me-1"></i>সরবরাহকারী দেনা ({{ toBengaliNumber(vendorsList.length) }})
              </button>
              <button
                type="button"
                class="btn btn-sm"
                :class="activeSection === 'customers' ? 'btn-primary' : 'btn-outline-secondary'"
                @click="activeSection = 'customers'">
                <i class="bi bi-people me-1"></i>কাস্টমার বাকি ({{ toBengaliNumber(customersList.length) }})
              </button>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="position-relative">
              <input
                v-model.trim="searchQuery"
                type="text"
                class="form-control form-control-sm ps-4"
                placeholder="পার্টির নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..." />
              <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted small pe-none"></i>
            </div>
          </div>

          <div class="col-12 col-md-2 text-end">
            <button
              type="button"
              class="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 w-100 justify-content-center"
              @click="exportCsv">
              <i class="bi bi-download"></i>
              <span>এক্সপোর্ট সিএসভি</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Container -->
    <div class="card border shadow-sm">
      <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <i class="bi fs-5" :class="activeSection === 'vendors' ? 'bi-truck text-primary' : 'bi-people text-success'"></i>
          <span class="fw-bold">
            {{ activeSection === 'vendors' ? 'সরবরাহকারী ও কারখানাভিত্তিক মোট দেনা ও পরিশোধ খতিয়ান' : 'কাস্টমারভিত্তিক মোট বিক্রয় ও বাকি আদায়ের খতিয়ান' }}
          </span>
          <span class="badge bg-secondary-subtle text-secondary border">
            {{ toBengaliNumber(currentList.length) }} জন
          </span>
        </div>
      </div>

      <div class="card-body p-0">
        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <div class="text-muted small mt-2">পার্টি তথ্য লোড হচ্ছে...</div>
        </div>

        <!-- Empty -->
        <div v-else-if="currentList.length === 0" class="text-center py-5">
          <i class="bi bi-inbox text-muted fs-1 mb-2 d-block"></i>
          <p class="text-muted mb-0">কোনো তথ্য পাওয়া যায়নি।</p>
        </div>

        <!-- Table View -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="small text-nowrap">
                <th style="width: 45px;" class="text-center">#</th>
                <th>পার্টির নাম</th>
                <th v-if="activeSection === 'vendors'">ধরন</th>
                <th>মোবাইল নম্বর</th>
                <th class="text-center">চালান সংখ্যা</th>
                <th class="text-end">মোট লেনদেন মূল্য</th>
                <th class="text-end text-success">পরিশোধিত টাকা</th>
                <th class="text-end text-danger">বর্তমান বকেয়া</th>
                <th class="text-center">অবস্থা</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(party, idx) in currentList" :key="idx">
                <td class="text-center small text-muted">{{ toBengaliNumber(idx + 1) }}</td>
                <td class="fw-semibold text-dark">{{ party.name }}</td>
                <td v-if="activeSection === 'vendors'">
                  <span class="badge bg-light text-dark border">{{ party.type || 'সাপ্লায়ার' }}</span>
                </td>
                <td class="font-monospace small">{{ party.mobile || '-' }}</td>
                <td class="text-center">{{ toBengaliNumber(party.invoiceCount) }} টি</td>
                <td class="text-end small">
                  ৳ {{ toBengaliNumber(formatAmount(activeSection === 'vendors' ? party.totalPurchases : party.totalSales)) }}
                </td>
                <td class="text-end small fw-medium text-success">
                  ৳ {{ toBengaliNumber(formatAmount(party.totalPaid)) }}
                </td>
                <td class="text-end small fw-bold" :class="party.totalDue > 0 ? 'text-danger' : 'text-muted'">
                  ৳ {{ toBengaliNumber(formatAmount(party.totalDue)) }}
                </td>
                <td class="text-center">
                  <span v-if="party.totalDue > 0" class="badge bg-danger-subtle text-danger border border-danger-subtle">
                    বকেয়া আছে
                  </span>
                  <span v-else class="badge bg-success-subtle text-success border border-success-subtle">
                    পরিশোধিত
                  </span>
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
import { ref, computed, onMounted } from "vue";
import axios from "axios";

const loading = ref(false);
const vendorsList = ref<any[]>([]);
const customersList = ref<any[]>([]);
const totals = ref<any>({ totalSupplierDue: 0, totalCustomerDue: 0 });

const activeSection = ref<"vendors" | "customers">("vendors");
const searchQuery = ref("");

const currentList = computed(() => {
  const baseList = activeSection.value === "vendors" ? vendorsList.value : customersList.value;
  if (!searchQuery.value) return baseList;
  const q = searchQuery.value.toLowerCase();
  return baseList.filter(p =>
    (p.name && p.name.toLowerCase().includes(q)) ||
    (p.mobile && p.mobile.includes(q))
  );
});

async function fetchParties() {
  loading.value = true;
  try {
    const res = await axios.get("/api/reports/parties");
    const data = res.data?.data || {};
    vendorsList.value = data.vendors || [];
    customersList.value = data.customers || [];
    totals.value = data.totals || { totalSupplierDue: 0, totalCustomerDue: 0 };
  } catch (err) {
    console.error("Failed to load parties report:", err);
  } finally {
    loading.value = false;
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
  const list = currentList.value;
  if (!list.length) return;
  const isVendor = activeSection.value === "vendors";
  const headers = isVendor
    ? ["নাম", "ধরন", "মোবাইল", "চালান সংখ্যা", "মোট ক্রয় মূল্য", "পরিশোধিত", "বকেয়া দেনা"]
    : ["নাম", "মোবাইল", "চালান সংখ্যা", "মোট বিক্রয় মূল্য", "পরিশোধিত", "বকেয়া বাকি"];

  const rows = list.map(p => {
    if (isVendor) {
      return [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.type || ''}"`,
        `"${p.mobile || ''}"`,
        p.invoiceCount || 0,
        p.totalPurchases || 0,
        p.totalPaid || 0,
        p.totalDue || 0
      ];
    } else {
      return [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.mobile || ''}"`,
        p.invoiceCount || 0,
        p.totalSales || 0,
        p.totalPaid || 0,
        p.totalDue || 0
      ];
    }
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${isVendor ? 'Vendors_Due' : 'Customers_Due'}_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

onMounted(() => {
  fetchParties();
});
</script>

<style scoped>
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
</style>
