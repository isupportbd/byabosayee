<template>
  <div class="barcode-page">
    <!-- Toast Notification -->
    <Toast ref="toastRef" />

    <!-- ১. উপরের সম্পূর্ণ অংশ (Full Width): পণ্যের তালিকা হতে নির্দিষ্ট স্টিকার নির্বাচন -->
    <div class="card border shadow-sm mb-3 no-print">
      <div class="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2 py-2">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-card-checklist text-primary"></i>
          <h6 class="m-0 fw-bold">পণ্যের তালিকা হতে নির্দিষ্ট স্টিকার নির্বাচন</h6>
          <span class="badge bg-secondary-subtle text-secondary border">
            {{ toBengaliNumber(filteredItemsList.length) }} টি পণ্য
          </span>
        </div>

        <!-- সার্চ ও ক্যাটাগরি ফিল্টার -->
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <!-- ক্যাটাগরি ফিল্টার -->
          <div class="position-relative" style="min-width: 160px;">
            <select
              v-model="categoryFilter"
              class="form-select form-select-sm cursor-pointer"
              style="padding-right: 28px !important;">
              <option value="all">সকল ক্যাটাগরি</option>
              <option v-for="cat in categoriesList" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
            <i class="bi bi-chevron-down position-absolute top-50 end-0 translate-middle-y me-2 text-muted small pe-none"></i>
          </div>

          <!-- সার্চ বক্স -->
          <div class="position-relative" style="min-width: 200px;">
            <input
              v-model.trim="searchQuery"
              type="text"
              class="form-control form-control-sm ps-4"
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
        </div>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive" style="max-height: 420px; overflow-y: auto;">
          <table class="table table-hover align-middle mb-0 small">
            <thead class="bg-light text-muted sticky-top">
              <tr class="text-nowrap">
                <th style="width: 45px;" class="text-center">
                  <input
                    type="checkbox"
                    class="form-check-input cursor-pointer"
                    :checked="isAllSelected"
                    :indeterminate="isIndeterminate"
                    @change="toggleSelectAll" />
                </th>
                <th style="width: 55px;" class="text-center">ক্রমিক</th>
                <th style="width: 135px;" class="text-start">আইটেম কোড</th>
                <th style="min-width: 180px;" class="text-start">আইটেমের নাম</th>
                <th style="width: 85px;" class="text-center">সাইজ</th>
                <th style="width: 110px;" class="text-center">ব্রান্ড</th>
                <th style="width: 145px;" class="text-center">বারকোড</th>
                <th style="width: 110px;" class="text-end">বিক্রয় দর (৳)</th>
                <th style="width: 110px;" class="text-end">এমআরপি (৳)</th>
                <th style="width: 90px;" class="text-center">স্টক</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredItemsList.length === 0">
                <td colspan="10" class="text-center py-4 text-muted">
                  কোনো পণ্য পাওয়া যায়নি
                </td>
              </tr>
              <tr
                v-for="(it, idx) in paginatedItemsList"
                :key="it.id">
                <!-- ১. চেকবক্স -->
                <td class="text-center">
                  <input
                    type="checkbox"
                    class="form-check-input cursor-pointer"
                    :value="it.id"
                    :checked="selectedItemIds.includes(Number(it.id))"
                    @change="toggleItemSelection(it.id)" />
                </td>

                <!-- ২. ক্রমিক -->
                <td class="text-center text-muted">
                  {{ toBengaliNumber((currentPage - 1) * perPage + idx + 1) }}
                </td>

                <!-- ৩. আইটেম কোড -->
                <td class="text-start">
                  <span v-if="it.code" class="font-monospace fw-semibold">{{ it.code }}</span>
                  <span v-else class="text-muted small">-</span>
                </td>

                <!-- ৪. আইটেমের নাম -->
                <td class="text-start">
                  <div class="fw-semibold">{{ cleanItemName(it.name, it) }}</div>
                  <small v-if="it.category?.name" class="text-muted">{{ it.category.name }}</small>
                </td>

                <!-- ৫. সাইজ -->
                <td class="text-center">
                  <span>{{ it.size?.name || '-' }}</span>
                  <span v-if="it.color?.name" class="text-muted ms-1">({{ it.color.name }})</span>
                </td>

                <!-- ৬. ব্রান্ড -->
                <td class="text-center">
                  <span class="badge bg-light border">
                    {{ it.brand?.name || '-' }}
                  </span>
                </td>

                <!-- ৭. বারকোড -->
                <td class="text-center">
                  <div v-if="it.barcode" class="d-flex flex-column align-items-center justify-content-center py-1">
                    <div class="table-mini-barcode" v-html="generateCode128Svg(it.barcode, { height: 20, moduleWidth: 1.05, quietZone: 3 })"></div>
                    <span class="font-monospace text-muted mt-0.5" style="font-size: 0.70rem;">{{ it.barcode }}</span>
                  </div>
                  <span v-else class="badge bg-secondary-subtle text-secondary border">ক্রয় বাকি</span>
                </td>

                <!-- ৮. বিক্রয় দর -->
                <td class="text-end font-monospace fw-bold text-success">
                  ৳ {{ toBengaliNumber(Number(it.sellingPrice || 0).toFixed(2)) }}
                </td>

                <!-- ৯. এমআরপি -->
                <td class="text-end font-monospace fw-bold text-primary">
                  ৳ {{ toBengaliNumber(Number(it.mrp || it.sellingPrice || 0).toFixed(2)) }}
                </td>

                <!-- ১০. স্টক -->
                <td class="text-center">
                  <span
                    class="badge"
                    :class="(it.stockQuantity || 0) > 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'">
                    {{ toBengaliNumber(it.stockQuantity || 0) }} টি
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- পেজিনেশন অংশ (১০ টির বেশি পণ্য হলে প্রদর্শিত হবে) -->
      <div v-if="filteredItemsList.length > perPage" class="card-footer bg-transparent border-top py-2 px-3 no-print">
        <Pagination :data="paginationData" variant="primary" />
      </div>
    </div>

    <!-- ২. দ্বিতীয় কার্ড: বার কোড জেনারেশন ও স্টিকার প্রিন্ট (ফুল উইডথ কনফিগারেশন কার্ড) -->
    <div class="card border shadow-sm mb-3 barcode-control-card no-print">
      <div class="card-header bg-transparent border-bottom d-flex align-items-center gap-2 py-2.5">
        <div class="bg-primary-subtle text-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
          <i class="bi bi-upc-scan fs-5"></i>
        </div>
        <div>
          <h6 class="m-0 fw-bold">বার কোড জেনারেশন ও স্টিকার প্রিন্ট</h6>
          <small class="text-muted">Code-128 বারকোড স্টিকার প্রিন্ট ও কনফিগারেশন</small>
        </div>
      </div>

      <div class="card-body py-2.5 px-3">
        <!-- এক সারিতে: স্টিকারে প্রদর্শিত তথ্য:, ৪টি চেকবক্স, প্রতিটির কপি, পেপার সাইজ ও রিসেট বাটন -->
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <!-- বামপাশে: স্টিকারে প্রদর্শিত তথ্য: ও ৪টি চেকবক্স -->
          <div class="d-flex align-items-center gap-3 flex-wrap">
            <span class="fw-bold small text-nowrap d-inline-flex align-items-center m-0 me-1">
              <i class="bi bi-sliders text-primary" style="margin-right: 8px !important;"></i>স্টিকারে প্রদর্শিত তথ্য:
            </span>

            <!-- ১. দোকানের নাম -->
            <label class="d-inline-flex align-items-center cursor-pointer m-0 user-select-none small fw-medium" style="gap: 8px;">
              <input
                id="showStoreName"
                v-model="showStoreName"
                type="checkbox"
                class="form-check-input cursor-pointer flex-shrink-0"
                style="margin: 0 !important; width: 1.1rem; height: 1.1rem;" />
              <span>দোকানের নাম</span>
            </label>

            <!-- ২. পণ্যের নাম -->
            <label class="d-inline-flex align-items-center cursor-pointer m-0 user-select-none small fw-medium" style="gap: 8px;">
              <input
                id="showItemName"
                v-model="showItemName"
                type="checkbox"
                class="form-check-input cursor-pointer flex-shrink-0"
                style="margin: 0 !important; width: 1.1rem; height: 1.1rem;" />
              <span>পণ্যের নাম</span>
            </label>

            <!-- ৩. ব্র্যান্ড ও সাইজ -->
            <label class="d-inline-flex align-items-center cursor-pointer m-0 user-select-none small fw-medium" style="gap: 8px;">
              <input
                id="showBrandAndSize"
                v-model="showBrandAndSize"
                type="checkbox"
                class="form-check-input cursor-pointer flex-shrink-0"
                style="margin: 0 !important; width: 1.1rem; height: 1.1rem;" />
              <span>ব্র্যান্ড ও সাইজ</span>
            </label>

            <!-- ৪. বিক্রয়মূল্য -->
            <label class="d-inline-flex align-items-center cursor-pointer m-0 user-select-none small fw-medium" style="gap: 8px;">
              <input
                id="showPrice"
                v-model="showPrice"
                type="checkbox"
                class="form-check-input cursor-pointer flex-shrink-0"
                style="margin: 0 !important; width: 1.1rem; height: 1.1rem;" />
              <span>বিক্রয়মূল্য</span>
            </label>
          </div>

          <!-- ডানপাশে: প্রতিটির কপি, পেপার সাইজ ও রিসেট বাটন -->
          <div class="d-flex align-items-center gap-3 flex-wrap">
            <!-- প্রতিটির কপি -->
            <div class="d-flex align-items-center gap-2">
              <label class="small fw-semibold text-nowrap m-0">প্রতিটির কপি</label>
              <input
                v-model.number="globalCopies"
                type="number"
                min="1"
                max="100"
                class="form-control form-control-sm text-end fw-semibold font-monospace"
                style="width: 70px; height: 32px;"
                placeholder="1"
                @change="applyGlobalCopies(globalCopies)" />
            </div>

            <!-- পেপার সাইজ -->
            <div class="d-flex align-items-center gap-2">
              <label class="small fw-semibold text-nowrap m-0">পেপার সাইজ</label>
              <div class="position-relative" style="min-width: 180px;">
                <select
                  v-model="paperSize"
                  class="form-select form-select-sm cursor-pointer"
                  style="height: 32px; padding-right: 26px !important;">
                  <option value="thermal_50x25">থার্মাল রোল (50×25mm)</option>
                  <option value="thermal_38x25">থার্মাল রোল (38×25mm)</option>
                  <option value="a4_grid">A4 শিট (মাল্টিপল গ্রিড)</option>
                </select>
                <i class="bi bi-chevron-down position-absolute top-50 end-0 translate-middle-y me-2 text-muted small pe-none"></i>
              </div>
            </div>

            <!-- রিসেট বাটন -->
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-1 px-3"
              style="height: 32px;"
              @click="resetConfig">
              <i class="bi bi-arrow-counterclockwise"></i>
              <span>রিসেট</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ৩. তৃতীয় কার্ড: লাইভ স্টিকার প্রিভিউ (ফুল উইডথ কার্ড) -->
    <div class="card border shadow-sm barcode-preview-card">
      <div class="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2 py-2.5 no-print">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-eye-fill text-primary"></i>
          <h6 class="m-0 fw-bold">লাইভ স্টিকার প্রিভিউ</h6>
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle">
            মোট স্টিকার: {{ toBengaliNumber(totalStickerCount) }} টি
          </span>
        </div>

        <button
          type="button"
          class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
          :disabled="stickersToPrint.length === 0"
          @click="triggerPrint">
          <i class="bi bi-printer"></i>
          <span>প্রিন্ট প্রিভিউ</span>
        </button>
      </div>

      <div class="card-body p-3">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <p class="text-muted small mt-2 mb-0">পণ্য ও বারকোড লোড করা হচ্ছে...</p>
        </div>

        <div v-else-if="stickersToPrint.length === 0" class="text-center py-5">
          <i class="bi bi-upc-scan fs-1 text-muted opacity-50 d-block mb-2"></i>
          <h6 class="text-muted fw-semibold">কোনো পণ্য নির্বাচিত নেই</h6>
          <p class="text-secondary small mb-0">উপরের তালিকা থেকে পণ্য নির্বাচন করুন।</p>
        </div>

        <!-- ১. স্ক্রিন প্রিভিউ: পেজিনেটেড (সর্বোচ্চ ৫ রো = ২০টি স্টিকার প্রতি পেজে) -->
        <div
          v-else
          class="printable-barcode-area d-print-none"
          :class="`paper-${paperSize}`">
          
          <div
            v-for="(st, idx) in paginatedStickersToPreview"
            :key="`preview-${st.item.id}-${st.copyIndex}-${idx}`"
            class="barcode-sticker-card"
            :class="`sticker-${paperSize}`">
            
            <!-- শোরুমের নাম -->
            <div v-if="showStoreName" class="sticker-header text-uppercase fw-bold text-truncate">
              {{ storeName || 'FASHION' }}
            </div>

            <!-- পণ্যের নাম -->
            <div v-if="showItemName" class="sticker-title text-truncate fw-semibold" :title="st.item.name">
              {{ cleanItemName(st.item.name, st.item) }}
            </div>

            <!-- ব্র্যান্ড ও সাইজ -->
            <div v-if="showBrandAndSize" class="sticker-meta text-truncate text-muted">
              <span v-if="st.item.brand?.name" class="me-1">[{{ st.item.brand.name }}]</span>
              <span>সাইজ: {{ st.item.size?.name || '-' }}</span>
            </div>

            <!-- আসল স্ক্যানযোগ্য Code 128 বারকোড SVG (নাম্বারসহ এবং বারের সমান বিস্তৃত) -->
            <div
              v-if="st.item.barcode"
              class="sticker-barcode-wrap"
              v-html="generateCode128Svg(st.item.barcode, { height: 28, moduleWidth: 1.4, quietZone: 5, showText: true, fontSize: 11, textMargin: 1 })"></div>
            <div v-else class="text-muted small py-2">
              (বারকোড নেই - ক্রয় বাকি)
            </div>

            <!-- বিক্রয়মূল্য (MRP) -->
            <div v-if="showPrice" class="sticker-price fw-bold">
              মূল্য: ৳ {{ toBengaliNumber(Number(st.item.sellingPrice || st.item.purchasePrice || 0).toFixed(2)) }}
            </div>
          </div>
        </div>

        <!-- ২. প্রিন্ট এরিয়া: সকল নির্বাচিত স্টিকার (প্রিন্টের সময় ব্রাউজারে স্বয়ংক্রিয়ভাবে সক্রিয় হবে) -->
        <div
          v-if="stickersToPrint.length > 0"
          id="printable-barcode-area"
          class="printable-barcode-area d-none d-print-flex"
          :class="`paper-${paperSize}`">
          
          <div
            v-for="(st, idx) in stickersToPrint"
            :key="`print-${st.item.id}-${st.copyIndex}-${idx}`"
            class="barcode-sticker-card"
            :class="`sticker-${paperSize}`">
            
            <!-- শোরুমের নাম -->
            <div v-if="showStoreName" class="sticker-header text-uppercase fw-bold text-truncate">
              {{ storeName || 'FASHION' }}
            </div>

            <!-- পণ্যের নাম -->
            <div v-if="showItemName" class="sticker-title text-truncate fw-semibold" :title="st.item.name">
              {{ cleanItemName(st.item.name, st.item) }}
            </div>

            <!-- ব্র্যান্ড ও সাইজ -->
            <div v-if="showBrandAndSize" class="sticker-meta text-truncate text-muted">
              <span v-if="st.item.brand?.name" class="me-1">[{{ st.item.brand.name }}]</span>
              <span>সাইজ: {{ st.item.size?.name || '-' }}</span>
            </div>

            <!-- আসল স্ক্যানযোগ্য Code 128 বারকোড SVG (নাম্বারসহ এবং বারের সমান বিস্তৃত) -->
            <div
              v-if="st.item.barcode"
              class="sticker-barcode-wrap"
              v-html="generateCode128Svg(st.item.barcode, { height: 28, moduleWidth: 1.4, quietZone: 5, showText: true, fontSize: 11, textMargin: 1 })"></div>
            <div v-else class="text-muted small py-2">
              (বারকোড নেই - ক্রয় বাকি)
            </div>

            <!-- বিক্রয়মূল্য (MRP) -->
            <div v-if="showPrice" class="sticker-price fw-bold">
              মূল্য: ৳ {{ toBengaliNumber(Number(st.item.sellingPrice || st.item.purchasePrice || 0).toFixed(2)) }}
            </div>
          </div>
        </div>
      </div>

      <!-- ৩. স্টিকার পেজিনেশন (৫ রো বা ২০টির বেশি স্টিকার হলে স্ক্রলবারের বদলে পেজিনেশন আসবে) -->
      <div
        v-if="stickersToPrint.length > stickersPerPage"
        class="card-footer bg-transparent border-top py-2 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2 no-print">
        <div class="small text-muted">
          মোট <span class="fw-bold text-dark">{{ toBengaliNumber(totalStickerCount) }}</span> টি স্টিকারের মধ্যে
          <span class="fw-bold text-dark">{{ toBengaliNumber((stickerCurrentPage - 1) * stickersPerPage + 1) }}</span> হতে
          <span class="fw-bold text-dark">{{ toBengaliNumber(Math.min(stickerCurrentPage * stickersPerPage, totalStickerCount)) }}</span> নম্বর স্টিকার প্রদর্শিত হচ্ছে
        </div>

        <div class="d-flex align-items-center gap-1.5">
          <!-- First Page -->
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary px-2"
            :disabled="stickerCurrentPage <= 1"
            title="প্রথম পৃষ্ঠা"
            @click="stickerCurrentPage = 1">
            <i class="bi bi-chevron-double-left"></i>
          </button>

          <!-- Prev Page -->
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 px-2.5"
            :disabled="stickerCurrentPage <= 1"
            @click="stickerCurrentPage--">
            <i class="bi bi-chevron-left"></i>
            <span>পূর্ববর্তী</span>
          </button>

          <!-- Current / Total -->
          <span class="px-2 small fw-bold text-primary">
            পৃষ্ঠা {{ toBengaliNumber(stickerCurrentPage) }} / {{ toBengaliNumber(Math.max(1, Math.ceil(totalStickerCount / stickersPerPage))) }}
          </span>

          <!-- Next Page -->
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 px-2.5"
            :disabled="stickerCurrentPage >= Math.ceil(totalStickerCount / stickersPerPage)"
            @click="stickerCurrentPage++">
            <span>পরবর্তী</span>
            <i class="bi bi-chevron-right"></i>
          </button>

          <!-- Last Page -->
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary px-2"
            :disabled="stickerCurrentPage >= Math.ceil(totalStickerCount / stickersPerPage)"
            title="শেষ পৃষ্ঠা"
            @click="stickerCurrentPage = Math.ceil(totalStickerCount / stickersPerPage)">
            <i class="bi bi-chevron-double-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { computed, inject, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Toast from "@/components/Toast.vue";
import Pagination from "@/components/datatable/Pagination.vue";
import { authUser } from "@/composables/useAuth";
import { generateCode128Svg } from "@/utils/barcode128";

const route = useRoute();
const setBreadcrumbs = inject<(crumbs: any[] | null) => void>("setBreadcrumbs");

// Toast Ref
const toastRef = ref<any>(null);
function showToast(msg: string, type: "success" | "danger" | "warning" = "success") {
  toastRef.value?.showToast(msg, type);
}

// State
const loading = ref(false);
const itemsList = ref<any[]>([]);
const categoriesList = ref<any[]>([]);

// Settings
const defaultStoreName = ref(authUser.value?.name || "Mijan Fashion");
const storeName = ref(authUser.value?.name || "Mijan Fashion");
const itemNameLabel = ref("");
const brandSizeLabel = ref("");
const pricePrefix = ref("মূল্য: ৳");
const globalCopies = ref(1);
const paperSize = ref<"thermal_50x25" | "thermal_38x25" | "a4_grid">("thermal_50x25");
const selectedProductFilter = ref<"all" | "selected" | "with_stock">("all");
const categoryFilter = ref("all");
const searchQuery = ref("");

// Visibility Toggles
const showStoreName = ref(true);
const showItemName = ref(true);
const showBrandAndSize = ref(true);
const showPrice = ref(true);

function resetConfig() {
  showStoreName.value = true;
  showItemName.value = true;
  showBrandAndSize.value = true;
  showPrice.value = true;
  storeName.value = defaultStoreName.value || "Mijan Fashion";
  itemNameLabel.value = "";
  brandSizeLabel.value = "";
  pricePrefix.value = "মূল্য: ৳";
  globalCopies.value = 1;
  applyGlobalCopies(1);
  paperSize.value = "thermal_50x25";
}

// Selected Items & Copies Mapping
const selectedItemIds = ref<number[]>([]);
const itemCopiesMap = reactive<Record<number, number>>({});

// Helpers
function toBengaliNumber(val: number | string): string {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(val).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
}

function cleanItemName(name: string | null | undefined, item?: any): string {
  if (!name) return "";
  let n = String(name).trim();

  // ১. পণ্যের সাথে সাইজ অবজেক্ট থাকলে নামের শেষ থেকে হুবহু সেই সাইজটি বাদ দেওয়া
  const sizeName = item?.size?.name;
  if (sizeName) {
    const esc = String(sizeName).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    n = n.replace(new RegExp(`[_\\-\\s]+${esc}$`, "i"), "");
  }

  // ২. নামের মধ্যে সাধারণ ব্র্যাকেট বা সাইজ টেক্সট থাকলে বাদ দেওয়া (যেমন: (সাইজ: S) বা Size: 38)
  n = n
    .replace(/\s*\(\s*(?:সাইজ|size)[\s\-:-].*?\)/i, "")
    .replace(/\s*(?:সাইজ|size)[\s\-:-].*$/i, "");

  // ৩. নামের শেষে আন্ডারস্কোর যুক্ত সাইজ সাফিক্স থাকলে বাদ দেওয়া (যেমন: _S, _M, _L, _XL, _38, _40 ইত্যাদি)
  n = n.replace(/_[A-Za-z0-9]+$/, "");

  // ৪. শুরুর বা শেষের অতিরিক্ত আন্ডারস্কোর/হাইফেন/স্পেস ট্রিম করা
  return n.replace(/^[_\\-\\s]+|[_\\-\\s]+$/g, "").trim();
}

function applyGlobalCopies(count: number) {
  const safeCount = Math.max(1, count || 1);
  globalCopies.value = safeCount;
  for (const it of itemsList.value) {
    itemCopiesMap[it.id] = safeCount;
  }
}

function setItemCopies(id: number, count: number) {
  itemCopiesMap[id] = Math.max(1, count || 1);
}

// Pagination State (১০ টির পর পেজিনেশন)
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

watch([searchQuery, categoryFilter], () => {
  currentPage.value = 1;
});

// Filtering
const filteredItemsList = computed(() => {
  let list = itemsList.value;

  if (categoryFilter.value !== "all") {
    const catId = Number(categoryFilter.value);
    list = list.filter((it) => it.categoryId === catId || it.category?.id === catId);
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (it) =>
        (it.name && it.name.toLowerCase().includes(q)) ||
        (it.code && it.code.toLowerCase().includes(q)) ||
        (it.brand?.name && it.brand.name.toLowerCase().includes(q))
    );
  }

  return list;
});

// Paginated items slice (১০টি পণ্য প্রতি পেজে)
const paginatedItemsList = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredItemsList.value.slice(start, start + perPage.value);
});

// Pagination Computation
const paginationData = computed(() => {
  const total = filteredItemsList.value.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage.value));
  return {
    current_page: currentPage.value,
    last_page: lastPage,
    per_page: perPage.value,
    total: total,
    path: route.path
  };
});

// Selection Logic (বর্তমান পেজের আইটেম নির্বাচন)
const isAllSelected = computed(() => {
  return (
    paginatedItemsList.value.length > 0 &&
    paginatedItemsList.value.every((it) => selectedItemIds.value.includes(Number(it.id)))
  );
});

const isIndeterminate = computed(() => {
  const count = paginatedItemsList.value.filter((it) => selectedItemIds.value.includes(Number(it.id))).length;
  return count > 0 && count < paginatedItemsList.value.length;
});

function toggleSelectAll() {
  const targetIds = paginatedItemsList.value.map((it) => Number(it.id));
  if (isAllSelected.value) {
    const toRemove = new Set(targetIds);
    selectedItemIds.value = selectedItemIds.value.filter((id) => !toRemove.has(id));
  } else {
    const combined = new Set([...selectedItemIds.value, ...targetIds]);
    selectedItemIds.value = Array.from(combined);
  }
}

function toggleItemSelection(id: number) {
  const numId = Number(id);
  const idx = selectedItemIds.value.indexOf(numId);
  if (idx > -1) {
    selectedItemIds.value.splice(idx, 1);
  } else {
    selectedItemIds.value.push(numId);
  }
}

function onProductFilterChange() {
  if (selectedProductFilter.value === "all") {
    selectedItemIds.value = itemsList.value.map((it) => Number(it.id));
  } else if (selectedProductFilter.value === "with_stock") {
    selectedItemIds.value = itemsList.value
      .filter((it) => (it.stockQuantity || 0) > 0)
      .map((it) => Number(it.id));
  }
}

// Computed list of items that will be printed (directly tracks checked items in table)
const itemsToPrint = computed(() => {
  return itemsList.value.filter((it) => selectedItemIds.value.includes(Number(it.id)));
});

// Final expanded array of stickers (each item multiplied by its copy count)
interface PrintableSticker {
  item: any;
  copyIndex: number;
}

const stickersToPrint = computed<PrintableSticker[]>(() => {
  const stickers: PrintableSticker[] = [];
  for (const it of itemsToPrint.value) {
    const count = itemCopiesMap[it.id] || globalCopies.value || 1;
    for (let c = 1; c <= count; c++) {
      stickers.push({
        item: it,
        copyIndex: c
      });
    }
  }
  return stickers;
});

const totalStickerCount = computed(() => stickersToPrint.value.length);

// Live Sticker Preview Pagination (৫ রো = ২০টি স্টিকার প্রতি পেজে)
const stickerCurrentPage = ref(1);
const stickersPerPage = ref(20);

// Watch stickersToPrint to keep stickerCurrentPage in valid range
watch(stickersToPrint, () => {
  const maxPage = Math.max(1, Math.ceil(stickersToPrint.value.length / stickersPerPage.value));
  if (stickerCurrentPage.value > maxPage) {
    stickerCurrentPage.value = maxPage;
  }
});

const paginatedStickersToPreview = computed(() => {
  const start = (stickerCurrentPage.value - 1) * stickersPerPage.value;
  return stickersToPrint.value.slice(start, start + stickersPerPage.value);
});

// Print Action
function triggerPrint() {
  if (stickersToPrint.value.length === 0) {
    showToast("প্রিন্ট করার মতো কোনো স্টিকার নেই!", "warning");
    return;
  }
  window.print();
}

// Fetch API Data
async function fetchItems() {
  loading.value = true;
  try {
    const [itemsRes, catsRes, compRes] = await Promise.all([
      axios.get("/api/inventory/items"),
      axios.get("/api/catalog/categories").catch(() => ({ data: { data: [] } })),
      axios.get("/api/company/profile").catch(() => ({ data: { data: null } }))
    ]);
    itemsList.value = itemsRes.data?.data || [];
    categoriesList.value = catsRes.data?.data || [];
    if (compRes.data?.data?.companyName) {
      defaultStoreName.value = compRes.data.data.companyName;
      storeName.value = compRes.data.data.companyName;
    }

    // Initialize copies map
    for (const it of itemsList.value) {
      if (!itemCopiesMap[it.id]) {
        itemCopiesMap[it.id] = 1;
      }
    }
    // Default select all
    if (selectedItemIds.value.length === 0) {
      selectedItemIds.value = itemsList.value.map((it) => Number(it.id));
    }
  } catch (err: any) {
    showToast("পণ্য তালিকা লোড করতে ব্যর্থ হয়েছে", "danger");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (setBreadcrumbs) {
    setBreadcrumbs([
      { label: "বারকোড জেনারেশন ও স্টিকার প্রিন্ট" }
    ]);
  }
  fetchItems();
});
</script>

<style scoped>
.single-row-input {
  height: 31px;
  line-height: 1.2;
}

.table-mini-barcode {
  background-color: #ffffff !important;
  padding: 3px 6px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.table-mini-barcode :deep(svg) {
  display: block;
  max-width: 130px;
  height: auto;
  margin: 0 auto;
}

.table > tbody > tr.table-active > * {
  background-color: transparent !important;
}

/* ============================================================ */
/* Barcode Sticker Preview & Layout Styles                      */
/* ============================================================ */
.printable-barcode-area {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 14px;
  background-color: var(--app-bg, #f8f9fa);
  border-radius: 8px;
  border: 1px solid var(--app-border, #e2e8f0);
}

.barcode-sticker-card {
  background: #ffffff !important;
  color: #000000 !important;
  border: 1px dashed #ced4da !important;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12) !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  page-break-inside: avoid;
  box-sizing: border-box;
}

/* Paper / Label Variations */
.sticker-thermal_50x25 {
  width: 190px;
  min-height: 125px;
  padding: 6px 8px;
}

.sticker-thermal_38x25 {
  width: 165px;
  min-height: 115px;
  padding: 4px 6px;
}

.sticker-a4_grid {
  width: 180px;
  min-height: 120px;
  padding: 6px 8px;
}

/* Sticker Elements Typography - Force Print Sharpness */
.barcode-sticker-card .sticker-header {
  font-size: 0.75rem;
  letter-spacing: 0.8px;
  color: #111827 !important;
  line-height: 1.1;
  max-width: 100%;
}

.barcode-sticker-card .sticker-title {
  font-size: 0.8rem;
  color: #111827 !important;
  line-height: 1.2;
  margin: 2px 0;
  max-width: 100%;
}

.barcode-sticker-card .sticker-meta,
.barcode-sticker-card .text-muted {
  font-size: 0.68rem;
  line-height: 1;
  margin-bottom: 2px;
  color: #4b5563 !important;
}

.sticker-barcode-wrap {
  width: 100%;
  max-width: 168px;
  margin: 2px 0 1px 0;
  display: flex;
  justify-content: center;
}

.sticker-barcode-wrap :deep(svg) {
  width: 100% !important;
  height: auto !important;
  display: block;
}

.barcode-sticker-card .sticker-code {
  font-size: 0.72rem;
  letter-spacing: 1.5px;
  color: #000000 !important;
  line-height: 1.1;
  margin-top: 1px;
}

.barcode-sticker-card .sticker-price {
  font-size: 0.82rem;
  color: #000000 !important;
  line-height: 1.2;
  margin-top: 2px;
}

/* ============================================================ */
/* Print-Specific Styles (@media print)                         */
/* ============================================================ */
@media print {
  /* Hide all dashboard/page navigation and UI buttons */
  .no-print,
  .main > .content-wrapper > header,
  .pagebar-container,
  .card-header,
  nav,
  footer {
    display: none !important;
  }

  body,
  .main,
  .content,
  .content-wrapper,
  .barcode-page,
  .barcode-preview-card,
  .card-body {
    background: #ffffff !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }

  .printable-barcode-area {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 3mm !important;
    margin: 0 !important;
    padding: 0 !important;
    justify-content: flex-start !important;
    align-items: flex-start !important;
  }

  /* Paper specific adjustments when printing (একাধিক বারকোড একই পৃষ্ঠায় ক্রমান্বয়ে আসার জন্য) */
  .paper-thermal_50x25 .barcode-sticker-card {
    width: 50mm !important;
    min-height: 25mm !important;
    border: 1px dashed #777777 !important;
    margin: 0 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    page-break-after: auto !important;
    break-after: auto !important;
  }

  .paper-thermal_38x25 .barcode-sticker-card {
    width: 38mm !important;
    min-height: 25mm !important;
    border: 1px dashed #777777 !important;
    margin: 0 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    page-break-after: auto !important;
    break-after: auto !important;
  }

  .paper-a4_grid .barcode-sticker-card {
    width: 48mm !important;
    min-height: 25mm !important;
    border: 1px dashed #777777 !important;
    margin: 0 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    page-break-after: auto !important;
    break-after: auto !important;
  }
}
</style>

<!-- Global Print Style to completely hide header/breadcrumb from layout outside scoped component -->
<style>
@media print {
  header,
  nav,
  footer,
  .app-header,
  .pagebar-container,
  .breadcrumb,
  .no-print,
  .card-header,
  .barcode-control-card {
    display: none !important;
  }

  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
  }

  .main,
  .content,
  .content-wrapper,
  .container,
  .container-xxl,
  .barcode-page,
  .barcode-preview-card,
  .barcode-preview-card > .card-body {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
  }
}
</style>
