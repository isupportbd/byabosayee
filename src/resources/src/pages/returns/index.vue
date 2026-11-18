<template>
  <div class="returns-page pb-4">
    <!-- Header Actions & Navigation (Strict Nexgen Framework Convention) -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <!-- Left: Page Icon & Title -->
      <div class="d-flex align-items-center gap-2">
        <div class="returns-header-icon bg-danger text-white rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" style="width: 38px; height: 38px;">
          <i class="bi bi-arrow-left-right fs-5"></i>
        </div>
        <div>
          <h5 class="m-0 fw-bold">পণ্য ফেরত ও রিটার্ন পলিসি</h5>
        </div>
      </div>

      <!-- Right: Action Buttons -->
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <router-link
          to="/sales"
          class="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1.5 px-3 py-1.5 shadow-sm fw-medium">
          <i class="bi bi-receipt"></i>
          <span>বিক্রয় তালিকা হতে ফেরত</span>
        </router-link>
        <router-link
          to="/purchases"
          class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 shadow-sm fw-medium">
          <i class="bi bi-truck"></i>
          <span>ক্রয় চালান হতে ফেরত</span>
        </router-link>
        <button
          type="button"
          class="btn btn-sm btn-white border shadow-sm d-inline-flex align-items-center gap-1.5 px-3 py-1.5 text-secondary"
          @click="fetchReturns">
          <i class="bi bi-arrow-clockwise text-primary" :class="{ 'spin-anim': loading }"></i>
          <span class="d-none d-sm-inline">রিফ্রেশ</span>
        </button>
      </div>
    </div>

    <!-- Navigation Pills / Tabs -->
    <ul class="nav nav-pills return-nav-pills gap-1.5 mb-3 flex-nowrap overflow-auto py-1" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          type="button"
          class="nav-link text-nowrap d-flex align-items-center gap-2 py-2 px-3 small fw-medium"
          :class="{ active: activeTab === 'sales_return' }"
          @click="activeTab = 'sales_return'">
          <i class="bi bi-arrow-return-left text-success"></i>
          <span>বিক্রয় ফেরত (Sales Return / Exchange)</span>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          type="button"
          class="nav-link text-nowrap d-flex align-items-center gap-2 py-2 px-3 small fw-medium"
          :class="{ active: activeTab === 'purchase_return' }"
          @click="activeTab = 'purchase_return'">
          <i class="bi bi-box-arrow-left text-primary"></i>
          <span>ক্রয় ফেরত (Purchase Return / Debit Note)</span>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          type="button"
          class="nav-link text-nowrap d-flex align-items-center gap-2 py-2 px-3 small fw-medium"
          :class="{ active: activeTab === 'policy' }"
          @click="activeTab = 'policy'">
          <i class="bi bi-shield-check text-warning"></i>
          <span>দোকানের রিটার্ন ও এক্সচেঞ্জ পলিসি</span>
        </button>
      </li>
    </ul>

    <!-- Tab 1: বিক্রয় ফেরত (Sales Return & Exchange) -->
    <div v-show="activeTab === 'sales_return'">
      <!-- Quick Process Guide Card -->
      <div class="card border shadow-sm mb-3">
        <div class="card-body p-3">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="d-flex align-items-center gap-3">
              <div class="card-icon-box text-success bg-success-subtle p-2 rounded">
                <i class="bi bi-info-circle-fill fs-5"></i>
              </div>
              <div>
                <h6 class="fw-bold mb-1">কাস্টমার বিক্রয় ফেরত ও এক্সচেঞ্জ প্রক্রিয়া</h6>
                <small class="text-muted">
                  যেকোনো বিক্রয় চালানের পণ্য ফেরত বা সাইজ/কালার বদল করতে সংশ্লিষ্ট বিক্রয় চালানে গিয়ে <strong>"এডিট"</strong> করুন। সিস্টেম স্বয়ংক্রিয়ভাবে ফেরত পণ্য স্টকে জমা করবে এবং বিল সমন্বয় করবে।
                </small>
              </div>
            </div>
            <router-link
              to="/sales"
              class="btn btn-sm btn-success text-white d-inline-flex align-items-center gap-1.5 px-3 py-1.5 shadow-sm">
              <i class="bi bi-cart-check"></i>
              <span>বিক্রয় চালানে যান</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Sales Return History / Invoices Table Card -->
      <div class="card border shadow-sm">
        <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-clock-history text-danger fs-5"></i>
            <h6 class="m-0 fw-bold">সাম্প্রতিক বিক্রয় ও ফেরত সমন্বিত তালিকা</h6>
            <span class="badge bg-danger-subtle text-danger border border-danger-subtle small">
              মোট {{ toBengaliNumber(salesList.length) }} টি চালান
            </span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <input
              v-model.trim="searchQuery"
              type="text"
              class="form-control form-control-sm"
              placeholder="ইনভয়েস বা কাস্টমার খুঁজুন..."
              style="min-width: 200px;" />
          </div>
        </div>

        <div class="card-body p-0">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <div class="text-muted small mt-2">তথ্য লোড হচ্ছে...</div>
          </div>
          <div v-else-if="filteredSales.length === 0" class="text-center py-5 text-muted small">
            <i class="bi bi-inbox fs-3 d-block mb-1"></i>
            কোনো বিক্রয় রেকর্ড পাওয়া যায়নি।
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0 small">
              <thead class="table-light">
                <tr>
                  <th class="ps-3 text-center" style="width: 50px;">#</th>
                  <th>ইনভয়েস নং ও তারিখ</th>
                  <th>গ্রাহক (Customer)</th>
                  <th class="text-center">আইটেম সংখ্যা</th>
                  <th class="text-end">চালান মূল্য</th>
                  <th class="text-end">আদায়কৃত</th>
                  <th class="text-center">অবস্থা</th>
                  <th class="text-end pe-3">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(sale, idx) in filteredSales" :key="sale.id">
                  <td class="ps-3 text-center text-muted">{{ toBengaliNumber(idx + 1) }}</td>
                  <td>
                    <div class="font-monospace fw-bold text-primary">{{ sale.invoiceNumber || sale.invoiceNo || `INV-${sale.id}` }}</div>
                    <small class="text-muted">{{ formatDate(sale.saleDate || sale.createdAt) }}</small>
                  </td>
                  <td>
                    <div class="fw-semibold">{{ sale.customerName || sale.customer?.name || 'সাধারণ খদ্দের (Cash)' }}</div>
                    <small class="text-muted font-monospace">{{ sale.customerPhone || sale.customer?.phone || '-' }}</small>
                  </td>
                  <td class="text-center">
                    <span class="badge bg-light text-dark border">
                      {{ toBengaliNumber(sale.items?.length || sale.itemCount || 1) }} টি আইটেম
                    </span>
                  </td>
                  <td class="text-end fw-bold">৳ {{ toBengaliNumber(formatAmount(sale.totalAmount || sale.grandTotal)) }}</td>
                  <td class="text-end text-success fw-medium">৳ {{ toBengaliNumber(formatAmount(sale.paidAmount)) }}</td>
                  <td class="text-center">
                    <span class="badge bg-success-subtle text-success border border-success-subtle">
                      সম্পন্ন
                    </span>
                  </td>
                  <td class="text-end pe-3">
                    <router-link
                      to="/sales"
                      class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 py-1 px-2.5 small"
                      title="এই চালানের পণ্য ফেরত বা এক্সচেঞ্জ করুন">
                      <i class="bi bi-arrow-return-left"></i>
                      <span>ফেরত / এডিট</span>
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2: ক্রয় ফেরত (Purchase Return / Debit Note) -->
    <div v-show="activeTab === 'purchase_return'">
      <!-- Purchase Return Guide Card -->
      <div class="card border shadow-sm mb-3">
        <div class="card-body p-3">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="d-flex align-items-center gap-3">
              <div class="card-icon-box text-primary bg-primary-subtle p-2 rounded">
                <i class="bi bi-truck fs-5"></i>
              </div>
              <div>
                <h6 class="fw-bold mb-1">সরবরাহকারী / কারখানা ক্রয় ফেরত ও ডেবিট সমন্বয়</h6>
                <small class="text-muted">
                  নষ্ট বা ত্রুটিযুক্ত মাল সাপ্লায়ারকে ফেরত দিতে <strong>"ক্রয় চালান"</strong> পেজে গিয়ে চালানটি এডিট করে পণ্য বাদ দিন। সাপ্লায়ারের বকেয়া ও স্টক স্বয়ংক্রিয়ভাবে কমে যাবে।
                </small>
              </div>
            </div>
            <router-link
              to="/purchases"
              class="btn btn-sm btn-primary text-white d-inline-flex align-items-center gap-1.5 px-3 py-1.5 shadow-sm">
              <i class="bi bi-box-arrow-left"></i>
              <span>ক্রয় চালানে যান</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Purchases List for Return Table Card -->
      <div class="card border shadow-sm">
        <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-truck text-primary fs-5"></i>
            <h6 class="m-0 fw-bold">ক্রয় চালান ও সরবরাহকারী ফেরত তালিকা</h6>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle small">
              মোট {{ toBengaliNumber(purchasesList.length) }} টি ক্রয় চালান
            </span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <input
              v-model.trim="purchaseSearchQuery"
              type="text"
              class="form-control form-control-sm"
              placeholder="চালান নং বা সাপ্লায়ার খুঁজুন..."
              style="min-width: 200px;" />
          </div>
        </div>

        <div class="card-body p-0">
          <div v-if="loadingPurchases" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <div class="text-muted small mt-2">ক্রয় তথ্য লোড হচ্ছে...</div>
          </div>
          <div v-else-if="filteredPurchases.length === 0" class="text-center py-5 text-muted small">
            <i class="bi bi-inbox fs-3 d-block mb-1"></i>
            কোনো ক্রয় চালান পাওয়া যায়নি।
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0 small">
              <thead class="table-light">
                <tr>
                  <th class="ps-3 text-center" style="width: 50px;">#</th>
                  <th>চালান নং ও তারিখ</th>
                  <th>সরবরাহকারী (Supplier)</th>
                  <th class="text-end">মোট মূল্য</th>
                  <th class="text-end">পরিশোধিত</th>
                  <th class="text-end">বকেয়া দেনা</th>
                  <th class="text-end pe-3">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(pur, idx) in filteredPurchases" :key="pur.id">
                  <td class="ps-3 text-center text-muted">{{ toBengaliNumber(idx + 1) }}</td>
                  <td>
                    <div class="font-monospace fw-bold text-primary">{{ pur.challanNumber || `PUR-${pur.id}` }}</div>
                    <small class="text-muted">{{ formatDate(pur.purchaseDate || pur.createdAt) }}</small>
                  </td>
                  <td>
                    <div class="fw-semibold">{{ pur.supplierName || pur.supplier?.name || 'সাধারণ সরবরাহকারী' }}</div>
                  </td>
                  <td class="text-end fw-bold">৳ {{ toBengaliNumber(formatAmount(pur.totalAmount)) }}</td>
                  <td class="text-end text-success fw-medium">৳ {{ toBengaliNumber(formatAmount(pur.paidAmount)) }}</td>
                  <td class="text-end text-danger fw-medium">৳ {{ toBengaliNumber(formatAmount(pur.dueAmount)) }}</td>
                  <td class="text-end pe-3">
                    <router-link
                      to="/purchases"
                      class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 py-1 px-2.5 small"
                      title="এই চালানের মাল সাপ্লায়ারকে ফেরত দিন">
                      <i class="bi bi-arrow-return-left"></i>
                      <span>মাল ফেরত দিন</span>
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 3: দোকানের রিটার্ন ও এক্সচেঞ্জ পলিসি কনফিগারেশন -->
    <div v-show="activeTab === 'policy'">
      <div class="row g-3">
        <!-- পলিসি সেটিংস ফর্ম কার্ড -->
        <div class="col-12 col-lg-7">
          <div class="card border shadow-sm h-100">
            <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-shield-check text-warning fs-5"></i>
                <h6 class="m-0 fw-bold">দোকানের রিটার্ন ও এক্সচেঞ্জ নীতিমালা কনফিগারেশন</h6>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-warning fw-semibold px-3 py-1 shadow-sm"
                :disabled="savingPolicy"
                @click="savePolicy">
                <i class="bi bi-check2 me-1"></i>
                <span>{{ savingPolicy ? 'সংরক্ষণ হচ্ছে...' : 'পলিসি সংরক্ষণ করুন' }}</span>
              </button>
            </div>

            <div class="card-body p-3 p-md-4">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-semibold">পণ্য পরিবর্তনের সময়সীমা (Exchange Window)</label>
                  <div class="input-group input-group-sm">
                    <input
                      v-model.number="policyForm.returnDays"
                      type="number"
                      class="form-control"
                      placeholder="৭" />
                    <span class="input-group-text">দিন পর্যন্ত</span>
                  </div>
                  <small class="text-muted">ক্রয়ের কত দিনের মধ্যে কাস্টমার সাইজ বা পণ্য পরিবর্তন করতে পারবে।</small>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label small fw-semibold">টাকা রিফান্ড পলিসি (Refund Policy)</label>
                  <select v-model="policyForm.refundType" class="form-select form-select-sm">
                    <option value="exchange_only">শুধুমাত্র পণ্য পরিবর্তন (Exchange Only)</option>
                    <option value="cash_refund">নগদ টাকা ফেরত ও পরিবর্তন (Cash Refund & Exchange)</option>
                    <option value="store_credit">স্টোর ক্রেডিট / ব্যালেন্স হিসেবে জমা</option>
                  </select>
                  <small class="text-muted">ফেরতের ক্ষেত্রে দোকান নগদ টাকা দেবে নাকি শুধু অন্য পণ্য দেবে।</small>
                </div>

                <div class="col-12">
                  <div class="form-check form-switch mt-2">
                    <input
                      v-model="policyForm.requireMemo"
                      class="form-check-input"
                      type="checkbox"
                      id="memoCheck" />
                    <label class="form-check-label small fw-semibold" for="memoCheck">
                      ক্যাশ মেমো / ইনভয়েস স্লিপ প্রদর্শন বাধ্যতামূলক
                    </label>
                  </div>
                  <div class="form-check form-switch mt-2">
                    <input
                      v-model="policyForm.requireTag"
                      class="form-check-input"
                      type="checkbox"
                      id="tagCheck" />
                    <label class="form-check-label small fw-semibold" for="tagCheck">
                      পণ্যের মূল্য ট্যাগ ও বারকোড অবিকৃত থাকতে হবে
                    </label>
                  </div>
                  <div class="form-check form-switch mt-2">
                    <input
                      v-model="policyForm.allowDiscountReturn"
                      class="form-check-input"
                      type="checkbox"
                      id="discCheck" />
                    <label class="form-check-label small fw-semibold" for="discCheck">
                      অফার বা ডিসকাউন্টে বিক্রিত পণ্য পরিবর্তনযোগ্য
                    </label>
                  </div>
                </div>

                <div class="col-12">
                  <label class="form-label small fw-semibold">ইনভয়েসে প্রিন্ট হওয়ার জন্য রিটার্ন শর্তাবলী (Invoice Footer Note)</label>
                  <textarea
                    v-model="policyForm.memoTerms"
                    rows="4"
                    class="form-control form-control-sm"
                    placeholder="যেমন: বিক্রিত পণ্য ৭ দিনের মধ্যে ক্যাশ মেমোসহ পরিবর্তনযোগ্য। ব্যবহৃত বা ধোয়া পণ্য ফেরত নেওয়া হয় না।"></textarea>
                  <small class="text-muted">এই শর্তাবলী কাস্টমার ইনভয়েস ও মেমোর ফুটারে স্বয়ংক্রিয়ভাবে প্রিন্ট হবে।</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- প্রিভিউ কার্ড -->
        <div class="col-12 col-lg-5">
          <div class="card border shadow-sm h-100">
            <div class="card-header bg-transparent border-bottom py-2.5">
              <h6 class="m-0 fw-bold">কাস্টমার ইনভয়েসে যেমন দেখাবে (Live Preview)</h6>
            </div>
            <div class="card-body p-3">
              <div class="p-3 border rounded bg-light font-monospace small">
                <div class="text-center fw-bold border-bottom pb-2 mb-2">
                  Fashion Retail Store
                </div>
                <div class="text-muted small mb-2 text-center">ক্যাশ মেমো / বিক্রয় চালান</div>
                <div class="border-top border-bottom py-2 my-2 text-center">
                  ................................
                </div>
                <div class="fw-bold text-dark mb-1">
                  <i class="bi bi-info-circle me-1 text-primary"></i>রিটার্ন ও এক্সচেঞ্জ পলিসি:
                </div>
                <ul class="ps-3 mb-2 text-muted small">
                  <li>পণ্য পরিবর্তনের সময়সীমা: <strong>{{ toBengaliNumber(policyForm.returnDays) }} দিন</strong></li>
                  <li>রিফান্ড সুবিধা: <strong>{{ policyForm.refundType === 'exchange_only' ? 'শুধুমাত্র পণ্য বদল' : policyForm.refundType === 'cash_refund' ? 'নগদ টাকা ফেরত প্রযোজ্য' : 'স্টোর ক্রেডিট' }}</strong></li>
                  <li v-if="policyForm.requireMemo">ক্যাশ মেমো প্রদর্শন আবশ্যক</li>
                  <li v-if="policyForm.requireTag">মূল্য ট্যাগ অক্ষত থাকতে হবে</li>
                  <li>{{ policyForm.allowDiscountReturn ? 'অফারের পণ্য পরিবর্তনযোগ্য' : 'ডিসকাউন্ট পণ্য পরিবর্তনযোগ্য নহে' }}</li>
                </ul>
                <div v-if="policyForm.memoTerms" class="p-2 border rounded bg-white small text-secondary mt-2">
                  "{{ policyForm.memoTerms }}"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import axios from "axios";

const activeTab = ref<"sales_return" | "purchase_return" | "policy">("sales_return");

const loading = ref(false);
const salesList = ref<any[]>([]);
const searchQuery = ref("");

const loadingPurchases = ref(false);
const purchasesList = ref<any[]>([]);
const purchaseSearchQuery = ref("");

const savingPolicy = ref(false);
const policyForm = ref({
  returnDays: 7,
  refundType: "exchange_only",
  requireMemo: true,
  requireTag: true,
  allowDiscountReturn: false,
  memoTerms: "বিক্রিত পণ্য ৭ দিনের মধ্যে ক্যাশ মেমোসহ পরিবর্তনযোগ্য। ব্যবহৃত বা ধোয়া পণ্য ফেরত নেওয়া হয় না।"
});

function toBengaliNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === "") return "০";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(val).replace(/[0-9]/g, (w) => bengaliDigits[+w]);
}

function formatAmount(val: number | string | undefined | null): string {
  const num = Number(val) || 0;
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d: string | undefined): string {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return d;
  }
}

const filteredSales = computed(() => {
  if (!searchQuery.value) return salesList.value;
  const q = searchQuery.value.toLowerCase();
  return salesList.value.filter((s: any) => {
    const inv = (s.invoiceNumber || s.invoiceNo || "").toLowerCase();
    const cust = (s.customerName || s.customer?.name || "").toLowerCase();
    const phone = (s.customerPhone || s.customer?.phone || "").toLowerCase();
    return inv.includes(q) || cust.includes(q) || phone.includes(q);
  });
});

const filteredPurchases = computed(() => {
  if (!purchaseSearchQuery.value) return purchasesList.value;
  const q = purchaseSearchQuery.value.toLowerCase();
  return purchasesList.value.filter((p: any) => {
    const ch = (p.challanNumber || "").toLowerCase();
    const supp = (p.supplierName || p.supplier?.name || "").toLowerCase();
    return ch.includes(q) || supp.includes(q);
  });
});

async function fetchReturns() {
  loading.value = true;
  try {
    const res = await axios.get("/api/inventory/sales");
    salesList.value = res.data?.data || [];
  } catch (err) {
    console.error("Sales fetch error:", err);
  } finally {
    loading.value = false;
  }
}

async function fetchPurchases() {
  loadingPurchases.value = true;
  try {
    const res = await axios.get("/api/inventory/purchases");
    purchasesList.value = res.data?.data || [];
  } catch (err) {
    console.error("Purchases fetch error:", err);
  } finally {
    loadingPurchases.value = false;
  }
}

async function fetchPolicy() {
  try {
    const res = await axios.get("/api/settings/public");
    const data = res.data?.data || [];
    const policySetting = data.find((s: any) => s.key === "store_return_policy");
    if (policySetting?.value) {
      policyForm.value = JSON.parse(policySetting.value);
    }
  } catch {
    /* fallback to default */
  }
}

async function savePolicy() {
  savingPolicy.value = true;
  try {
    await axios.post("/api/settings", {
      key: "store_return_policy",
      value: JSON.stringify(policyForm.value)
    });
    alert("রিটার্ন ও এক্সচেঞ্জ পলিসি সফলভাবে সংরক্ষিত হয়েছে!");
  } catch {
    alert("পলিসি সংরক্ষণ করা যায়নি।");
  } finally {
    savingPolicy.value = false;
  }
}

onMounted(() => {
  fetchReturns();
  fetchPurchases();
  fetchPolicy();
});
</script>

<style scoped>
.returns-header-icon {
  width: 38px;
  height: 38px;
}
.return-nav-pills .nav-link {
  color: var(--bs-secondary-color, #4b5563);
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}
.return-nav-pills .nav-link:hover {
  background-color: rgba(0, 0, 0, 0.08);
}
.return-nav-pills .nav-link.active {
  background-color: #dc3545;
  color: #ffffff !important;
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.25);
}
.spin-anim {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

/* Dark mode scoped adaptions */
:global([data-bs-theme="dark"]) .return-nav-pills .nav-link,
:global(.theme-dark) .return-nav-pills .nav-link {
  background-color: #24252a !important;
  color: #9aa0a6 !important;
}
:global([data-bs-theme="dark"]) .return-nav-pills .nav-link.active,
:global(.theme-dark) .return-nav-pills .nav-link.active {
  background-color: #dc3545 !important;
  color: #ffffff !important;
}
</style>
