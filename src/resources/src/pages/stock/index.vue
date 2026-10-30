<template>
  <div class="stock-page">
    <!-- Top 4 Summary Cards -->
    <div class="row g-3 mb-3">
      <!-- ১. মোট বর্তমান মজুদ -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 stock-kpi-card card-bar-info">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted small fw-medium">মোট বর্তমান মজুদ</span>
              <div class="card-icon-box text-info">
                <i class="bi bi-boxes"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-4 fw-bold text-info me-1">{{ toBengaliNumber(totalStockQty) }}</span>
              <span class="text-muted small">পিস</span>
            </div>
            <p class="text-muted small mb-0 mt-1 text-truncate">
              সকল অ্যাক্টিভ পণ্যের মোট মজুদ
            </p>
          </div>
        </div>
      </div>

      <!-- ২. ক্রয়মূল্য অনুযায়ী স্টক ভ্যালু -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 stock-kpi-card card-bar-primary">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted small fw-medium">ক্রয়মূল্য অনুযায়ী মোট মূল্য</span>
              <div class="card-icon-box text-primary">
                <i class="bi bi-cash-stack"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-4 fw-bold text-primary me-1">৳ {{ toBengaliNumber(formatAmount(totalPurchaseValue)) }}</span>
            </div>
            <p class="text-muted small mb-0 mt-1 text-truncate">
              কেনা দরের ভিত্তিতে ইনভেন্টরি সম্পদ
            </p>
          </div>
        </div>
      </div>

      <!-- ৩. বিক্রয়মূল্য অনুযায়ী সম্ভাব্য মূল্য -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 stock-kpi-card card-bar-success">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted small fw-medium">সম্ভাব্য বিক্রয়মূল্য</span>
              <div class="card-icon-box text-success">
                <i class="bi bi-graph-up-arrow"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-4 fw-bold text-success me-1">৳ {{ toBengaliNumber(formatAmount(totalRetailValue)) }}</span>
            </div>
            <p class="text-muted small mb-0 mt-1 text-truncate">
              বর্তমান রিটেইল প্রাইস অনুযায়ী
            </p>
          </div>
        </div>
      </div>

      <!-- ৪. নিবন্ধিত আইটেম ও স্টক সতর্কতা -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 stock-kpi-card" :class="lowStockCount > 0 ? 'card-bar-danger' : 'card-bar-secondary'">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted small fw-medium">আইটেম ও সতর্কতা</span>
              <div class="card-icon-box" :class="lowStockCount > 0 ? 'text-danger' : 'text-secondary'">
                <i :class="lowStockCount > 0 ? 'bi bi-exclamation-triangle-fill' : 'bi bi-check-circle-fill'"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-4 fw-bold me-1" :class="lowStockCount > 0 ? 'text-danger' : 'text-dark'">{{ toBengaliNumber(itemsList.length) }}</span>
              <span class="text-muted small">টি পণ্যের ধরণ</span>
            </div>
            <p class="small mb-0 mt-1 text-truncate" :class="lowStockCount > 0 ? 'text-danger fw-semibold' : 'text-muted'">
              <template v-if="lowStockCount > 0">
                {{ toBengaliNumber(lowStockCount) }} টি পণ্যের স্টক কম / শেষ
              </template>
              <template v-else>
                সকল পণ্যের স্টক সন্তোষজনক
              </template>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Stock Table Card -->
    <div class="card border shadow-sm">
      <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-box-seam text-info fs-5"></i>
          <h6 class="m-0 fw-bold">মজুদ পণ্যের বিস্তারিত তালিকা</h6>
          <span class="badge bg-info-subtle text-info border border-info-subtle small">
            মোট {{ toBengaliNumber(filteredItems.length) }} টি পণ্য
          </span>
        </div>

        <!-- Filter & Search Controls -->
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <!-- ১. ক্যাটাগরি ফিল্টার -->
          <div style="min-width: 140px;">
            <select v-model="categoryFilter" class="form-select form-select-sm" @change="currentPage = 1">
              <option value="all">সকল ক্যাটাগরি</option>
              <option v-for="cat in categoriesList" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <!-- ২. ব্র্যান্ড ফিল্টার -->
          <div style="min-width: 130px;">
            <select v-model="brandFilter" class="form-select form-select-sm" @change="currentPage = 1">
              <option value="all">সকল ব্র্যান্ড</option>
              <option v-for="b in brandsList" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </div>

          <!-- ৩. স্টক স্টেটাস ফিল্টার -->
          <div style="min-width: 130px;">
            <select v-model="stockStatusFilter" class="form-select form-select-sm" @change="currentPage = 1">
              <option value="all">সকল স্টক</option>
              <option value="in_stock">ইন-স্টক (পর্যাপ্ত)</option>
              <option value="low_stock">লো-স্টক (সতর্কতা)</option>
              <option value="out_of_stock">স্টক শেষ (০ পিস)</option>
            </select>
          </div>

          <!-- ৪. সার্চ বক্স -->
          <div class="position-relative" style="min-width: 160px;">
            <input
              v-model.trim="searchQuery"
              type="text"
              class="form-control form-control-sm ps-4"
              placeholder="পণ্য বা কোড খুঁজুন..."
              @input="currentPage = 1" />
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted small pe-none"></i>
            <button
              v-if="searchQuery"
              type="button"
              class="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-2"
              @click="searchQuery = ''; currentPage = 1">
              <i class="bi bi-x"></i>
            </button>
          </div>

          <!-- ৫. রিফ্রেশ বাটন -->
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center"
            title="রিফ্রেশ করুন"
            :disabled="loading"
            @click="fetchItems">
            <i class="bi bi-arrow-clockwise" :class="{ 'spin-anim': loading }"></i>
          </button>
        </div>
      </div>

      <div class="card-body p-0">
        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-info" role="status">
            <span class="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <div class="text-muted small mt-2">স্টক বিবরণ লোড হচ্ছে...</div>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredItems.length === 0" class="text-center py-5">
          <i class="bi bi-inbox text-muted fs-1 mb-2 d-block"></i>
          <p class="text-muted mb-0">কোনো পণ্যের স্টক তথ্য পাওয়া যায়নি।</p>
        </div>

        <!-- Table -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0 stock-table">
            <thead class="table-light">
              <tr class="small text-muted text-uppercase">
                <th style="width: 45px;" class="text-center">#</th>
                <th style="width: 21%;">পণ্য ও কোড</th>
                <th style="width: 16%;">ক্যাটাগরি ও ব্র্যান্ড</th>
                <th style="width: 12%;" class="text-nowrap">সাইজ ও রং</th>
                <th style="width: 10%;" class="text-end text-nowrap">ক্রয়মূল্য</th>
                <th style="width: 11%;" class="text-end text-nowrap">বিক্রয়মূল্য</th>
                <th style="width: 10%;" class="text-center text-nowrap">বর্তমান মজুদ</th>
                <th style="width: 12%;" class="text-end text-nowrap">মোট স্টক মূল্য</th>
                <th style="width: 85px;" class="text-center text-nowrap">অবস্থা</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in paginatedItems" :key="item.id">
                <td class="text-center text-muted small">
                  {{ toBengaliNumber((currentPage - 1) * perPage + idx + 1) }}
                </td>

                <!-- পণ্যের নাম ও আইটেম কোড (সাইজ ছাড়া, নিচে নিচে এক কলাম) -->
                <td>
                  <div class="fw-semibold text-truncate" :title="displayName(item)">
                    {{ displayName(item) }}
                  </div>
                  <div class="d-flex align-items-center gap-1 mt-1 flex-wrap">
                    <span class="badge bg-light text-dark border font-monospace px-1.5 py-0.5" style="font-size: 11px;">
                      {{ item.code || '-' }}
                    </span>
                    <small v-if="item.productType?.name" class="text-muted">
                      ({{ item.productType.name }})
                    </small>
                  </div>
                </td>

                <!-- ক্যাটাগরি ও ব্র্যান্ড (এক কলামে নিচে নিচে) -->
                <td>
                  <div class="fw-semibold text-dark text-truncate" :title="item.category?.name || '-'">
                    {{ item.category?.name || '-' }}
                  </div>
                  <small class="text-muted d-block text-truncate">
                    <span v-if="item.brand?.name" class="fw-medium text-secondary" :title="item.brand.name">
                      {{ item.brand.name }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </small>
                </td>

                <!-- সাইজ ও রং (নিচে নিচে: সাইজ: ..., রং: ...) -->
                <td class="small">
                  <div class="d-flex align-items-center gap-1 text-nowrap">
                    <span class="text-muted">সাইজ:</span>
                    <span class="fw-semibold text-dark">{{ item.size?.name || '-' }}</span>
                  </div>
                  <div class="d-flex align-items-center gap-1 text-nowrap mt-0.5">
                    <span class="text-muted">রং:</span>
                    <span class="fw-medium text-secondary">{{ item.color?.name || '-' }}</span>
                  </div>
                </td>

                <!-- ক্রয়মূল্য -->
                <td class="text-end text-muted font-monospace text-nowrap">
                  ৳ {{ toBengaliNumber(formatAmount(Number(item.purchasePrice || 0))) }}
                </td>

                <!-- বিক্রয়মূল্য -->
                <td class="text-end fw-semibold text-dark font-monospace text-nowrap">
                  ৳ {{ toBengaliNumber(formatAmount(Number(item.sellingPrice || 0))) }}
                </td>

                <!-- বর্তমান মজুদ -->
                <td class="text-center text-nowrap">
                  <span
                    class="badge px-2.5 py-1 fs-7 fw-bold"
                    :class="{
                      'bg-danger text-white': Number(item.stockQuantity || 0) <= 0,
                      'bg-warning-subtle text-warning-emphasis border border-warning-subtle': Number(item.stockQuantity || 0) > 0 && Number(item.stockQuantity || 0) <= Number(item.alertQuantity || 5),
                      'bg-success-subtle text-success border border-success-subtle': Number(item.stockQuantity || 0) > Number(item.alertQuantity || 5)
                    }">
                    {{ toBengaliNumber(item.stockQuantity || 0) }} {{ item.unit?.shortName || item.unit?.name || 'পিস' }}
                  </span>
                </td>

                <!-- মোট স্টক মূল্য -->
                <td class="text-end fw-bold font-monospace text-primary text-nowrap">
                  ৳ {{ toBengaliNumber(formatAmount(Number(item.stockQuantity || 0) * Number(item.purchasePrice || 0))) }}
                </td>

                <!-- অবস্থা / স্টেটাস -->
                <td class="text-center">
                  <span
                    v-if="Number(item.stockQuantity || 0) <= 0"
                    class="badge bg-danger-subtle text-danger border border-danger-subtle small">
                    স্টক শেষ
                  </span>
                  <span
                    v-else-if="Number(item.stockQuantity || 0) <= Number(item.alertQuantity || 5)"
                    class="badge bg-warning-subtle text-warning border border-warning-subtle small">
                    লো-স্টক
                  </span>
                  <span
                    v-else
                    class="badge bg-success-subtle text-success border border-success-subtle small">
                    মজুদ আছে
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
          দেখাচ্ছে {{ toBengaliNumber((currentPage - 1) * perPage + 1) }} থেকে {{ toBengaliNumber(Math.min(currentPage * perPage, filteredItems.length)) }} (মোট {{ toBengaliNumber(filteredItems.length) }} টি)
        </div>
        <Pagination :data="paginationData" variant="info" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useHead } from "@vueuse/head";
import axios from "axios";
import Pagination from "@/components/datatable/Pagination.vue";

useHead({ title: "স্টক বিবরণ" });

// Bengali Number Formatter
function toBengaliNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined || num === "") return "০";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/[0-9]/g, (w) => bengaliDigits[+w]);
}

function formatAmount(val: number): string {
  return Number(val || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Display Product Name without Size suffix
function displayName(item: any): string {
  if (!item?.name) return "-";
  let name = item.name;
  if (item.size?.name) {
    const sName = String(item.size.name).trim();
    // Strip trailing _size or -size
    if (name.toLowerCase().endsWith("_" + sName.toLowerCase())) {
      name = name.slice(0, -(sName.length + 1));
    } else if (name.toLowerCase().endsWith("-" + sName.toLowerCase())) {
      name = name.slice(0, -(sName.length + 1));
    } else if (name.toLowerCase().endsWith(" " + sName.toLowerCase())) {
      name = name.slice(0, -(sName.length + 1));
    }
  }
  return name.trim() || item.name;
}

// State
const loading = ref(false);
const itemsList = ref<any[]>([]);
const categoriesList = ref<any[]>([]);
const brandsList = ref<any[]>([]);

// Filters
const categoryFilter = ref("all");
const brandFilter = ref("all");
const stockStatusFilter = ref("all");
const searchQuery = ref("");

// Pagination
const currentPage = ref(1);
const perPage = ref(15);

// Computed Totals
const totalStockQty = computed(() => {
  return itemsList.value.reduce((sum, item) => sum + (Number(item.stockQuantity) || 0), 0);
});

const totalPurchaseValue = computed(() => {
  return itemsList.value.reduce((sum, item) => {
    const qty = Number(item.stockQuantity) || 0;
    const price = Number(item.purchasePrice) || 0;
    return sum + (qty * price);
  }, 0);
});

const totalRetailValue = computed(() => {
  return itemsList.value.reduce((sum, item) => {
    const qty = Number(item.stockQuantity) || 0;
    const price = Number(item.sellingPrice) || 0;
    return sum + (qty * price);
  }, 0);
});

const lowStockCount = computed(() => {
  return itemsList.value.filter((item) => {
    const qty = Number(item.stockQuantity) || 0;
    const alert = Number(item.alertQuantity) || 5;
    return qty <= alert;
  }).length;
});

// Filtered Items
const filteredItems = computed(() => {
  let list = itemsList.value;

  if (categoryFilter.value !== "all") {
    list = list.filter(
      (item) => String(item.categoryId) === String(categoryFilter.value) || String(item.category?.id) === String(categoryFilter.value)
    );
  }

  if (brandFilter.value !== "all") {
    list = list.filter(
      (item) => String(item.brandId) === String(brandFilter.value) || String(item.brand?.id) === String(brandFilter.value)
    );
  }

  if (stockStatusFilter.value === "in_stock") {
    list = list.filter((item) => {
      const qty = Number(item.stockQuantity) || 0;
      const alert = Number(item.alertQuantity) || 5;
      return qty > alert;
    });
  } else if (stockStatusFilter.value === "low_stock") {
    list = list.filter((item) => {
      const qty = Number(item.stockQuantity) || 0;
      const alert = Number(item.alertQuantity) || 5;
      return qty > 0 && qty <= alert;
    });
  } else if (stockStatusFilter.value === "out_of_stock") {
    list = list.filter((item) => Number(item.stockQuantity || 0) <= 0);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter((item) => {
      const matchName = item.name?.toLowerCase().includes(q);
      const matchCode = item.code?.toLowerCase().includes(q);
      const matchBrand = item.brand?.name?.toLowerCase().includes(q);
      const matchCat = item.category?.name?.toLowerCase().includes(q);
      return matchName || matchCode || matchBrand || matchCat;
    });
  }

  return list;
});

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredItems.value.slice(start, start + perPage.value);
});

const paginationData = computed(() => {
  const total = filteredItems.value.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage.value));
  return {
    current_page: currentPage.value,
    last_page: lastPage,
    per_page: perPage.value,
    total,
    from: total === 0 ? 0 : (currentPage.value - 1) * perPage.value + 1,
    to: Math.min(currentPage.value * perPage.value, total),
    links: [
      {
        url: currentPage.value > 1 ? `#page-${currentPage.value - 1}` : null,
        label: "&laquo; পূর্ববর্তী",
        active: false,
        onClick: () => {
          if (currentPage.value > 1) currentPage.value--;
        }
      },
      ...Array.from({ length: lastPage }, (_, i) => ({
        url: `#page-${i + 1}`,
        label: toBengaliNumber(i + 1),
        active: currentPage.value === i + 1,
        onClick: () => {
          currentPage.value = i + 1;
        }
      })),
      {
        url: currentPage.value < lastPage ? `#page-${currentPage.value + 1}` : null,
        label: "পরবর্তী &raquo;",
        active: false,
        onClick: () => {
          if (currentPage.value < lastPage) currentPage.value++;
        }
      }
    ]
  };
});

// Fetch Data
async function fetchItems() {
  loading.value = true;
  try {
    const res = await axios.get("/api/inventory/items");
    itemsList.value = res.data?.data || [];
  } catch (err) {
    console.error("Failed to fetch stock items:", err);
  } finally {
    loading.value = false;
  }
}

async function fetchCategories() {
  try {
    const res = await axios.get("/api/catalog/categories");
    categoriesList.value = res.data?.data || [];
  } catch {
    categoriesList.value = [];
  }
}

async function fetchBrands() {
  try {
    const res = await axios.get("/api/inventory/brands");
    brandsList.value = res.data?.data || [];
  } catch {
    brandsList.value = [];
  }
}

onMounted(() => {
  fetchItems();
  fetchCategories();
  fetchBrands();
});
</script>

<style scoped>
.stock-kpi-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.stock-kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
}

.card-bar-info { border-top: 3px solid #0dcaf0 !important; }
.card-bar-primary { border-top: 3px solid #0d6efd !important; }
.card-bar-success { border-top: 3px solid #198754 !important; }
.card-bar-danger { border-top: 3px solid #dc3545 !important; }
.card-bar-secondary { border-top: 3px solid #6c757d !important; }

.card-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: var(--app-hover, rgba(0, 0, 0, 0.04));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
}

.stock-table th,
.stock-table td {
  padding-left: 0.75rem !important;
  padding-right: 0.75rem !important;
  vertical-align: middle;
}

.spin-anim {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}
</style>
