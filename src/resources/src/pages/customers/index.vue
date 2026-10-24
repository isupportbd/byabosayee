<template>
  <div class="customers-page">
    <!-- Toast Notification -->
    <Toast ref="toastRef" />

    <!-- Customer Entry / Edit Form (Always directly open on page) -->
    <div
      class="card border shadow-sm mb-4 customer-form-card"
      :class="{ 'customer-form-edit-mode': isEditing }">
      <div class="card-header bg-transparent border-bottom py-2 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <h6
          class="m-0 fw-bold d-flex align-items-center gap-2"
          :class="isEditing ? 'text-primary' : 'text-teal'">
          <i :class="isEditing ? 'bi bi-pencil-square' : 'bi bi-person-plus-fill'"></i>
          <span>{{ isEditing ? 'কাস্টমারের তথ্য সম্পাদন' : 'নতুন কাস্টমার' }}</span>
        </h6>
        <span
          v-if="isEditing"
          class="badge bg-primary-subtle text-primary border border-primary-subtle py-1 px-2 small">
          <i class="bi bi-lock-fill me-1"></i>কাস্টমারের নাম অপরিবর্তনীয়
        </span>
      </div>

      <div class="card-body">
        <form @submit.prevent="submitCustomerForm">
          <!-- Row 1: প্রাথমিক তথ্য (4 Equal Columns) -->
          <div class="row g-2 mb-2 align-items-start">
            <!-- 1. Customer Type Dropdown -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" for="customerTypeSelect" title="কাস্টমারের ধরন">
                কাস্টমারের ধরন <span class="text-danger">*</span>
              </label>
              <select
                id="customerTypeSelect"
                v-model="form.customerType"
                class="form-select form-select-sm text-truncate"
                required>
                <option value="retail">খুচরা কাস্টমার (Retail)</option>
                <option value="wholesale">পাইকারি কাস্টমার (Wholesale)</option>
                <option value="corporate">কর্পোরেট কাস্টমার (Corporate)</option>
                <option value="other">অন্যান্য (Other)</option>
              </select>
            </div>

            <!-- 2. Customer Name (Immutable on Edit) -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="কাস্টমারের নাম">
                কাস্টমারের নাম <span class="text-danger">*</span>
              </label>
              <div class="position-relative">
                <input
                  v-model.trim="form.name"
                  type="text"
                  class="form-control form-control-sm single-row-input"
                  :class="{ 'locked-input pe-4': isEditing }"
                  :disabled="isEditing"
                  :readonly="isEditing"
                  placeholder="কাস্টমারের পূর্ণ নাম"
                  :title="isEditing ? 'এডিটে কাস্টমারের নাম পরিবর্তন করা যাবে না' : (form.name || '')"
                  required />
                <span
                  v-if="isEditing"
                  class="position-absolute end-0 top-50 translate-middle-y me-2 text-muted small pe-none"
                  title="কাস্টমারের নাম অপরিবর্তনীয়">
                  <i class="bi bi-lock-fill"></i>
                </span>
              </div>
              <div
                v-if="isEditing"
                class="text-muted small mt-1"
                style="font-size: 0.70rem;">
                <i class="bi bi-info-circle me-1"></i>এডিটে কাস্টমারের নাম পরিবর্তন করা যাবে না
              </div>
            </div>

            <!-- 3. Primary Mobile -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="মোবাইল নম্বর">
                মোবাইল নম্বর <span class="text-danger">*</span>
              </label>
              <div class="position-relative">
                <input
                  v-model.trim="form.mobile"
                  type="tel"
                  maxlength="11"
                  class="form-control form-control-sm pe-4 single-row-input"
                  :class="{
                    'mobile-valid': isPrimaryMobileValid,
                    'mobile-invalid': (primaryMobileTouched || form.mobile.length === 11) && form.mobile && !isPrimaryMobileValid
                  }"
                  placeholder="01XXXXXXXXX"
                  @input="onPrimaryMobileInput"
                  @blur="primaryMobileTouched = true"
                  required />
                <span
                  v-if="isPrimaryMobileValid"
                  class="mobile-check-icon"
                  title="সঠিক মোবাইল নম্বর">
                  <i class="bi bi-check-circle-fill"></i>
                </span>
              </div>
              <div
                v-if="(primaryMobileTouched || form.mobile.length === 11) && form.mobile && !isPrimaryMobileValid"
                class="text-danger small mt-1"
                style="font-size: 0.70rem;">
                সঠিক ১১ ডিজিটের মোবাইল দিন
              </div>
            </div>

            <!-- 4. Address -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="ঠিকানা">
                ঠিকানা
              </label>
              <input
                v-model.trim="form.address"
                type="text"
                class="form-control form-control-sm single-row-input"
                :title="form.address || ''"
                placeholder="ঠিকানা বা অবস্থান" />
            </div>
          </div>

          <!-- Row 2: বিকল্প মোবাইল, ইমেইল ও নোট -->
          <div class="row g-2 mb-3 align-items-start">
            <!-- 5. Alternative Mobile -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="বিকল্প মোবাইল">
                বিকল্প মোবাইল
              </label>
              <div class="position-relative">
                <input
                  v-model.trim="form.altMobile"
                  type="tel"
                  maxlength="11"
                  class="form-control form-control-sm pe-4 single-row-input"
                  :class="{
                    'mobile-valid': isAltMobileValid,
                    'mobile-invalid': (altMobileTouched || form.altMobile.length === 11) && form.altMobile && !isAltMobileValid
                  }"
                  placeholder="01XXXXXXXXX"
                  @input="onAltMobileInput"
                  @blur="altMobileTouched = true" />
                <span
                  v-if="isAltMobileValid"
                  class="mobile-check-icon"
                  title="সঠিক বিকল্প মোবাইল নম্বর">
                  <i class="bi bi-check-circle-fill"></i>
                </span>
              </div>
              <div
                v-if="(altMobileTouched || form.altMobile.length === 11) && form.altMobile && !isAltMobileValid"
                class="text-danger small mt-1"
                style="font-size: 0.70rem;">
                সঠিক ১১ ডিজিটের মোবাইল দিন
              </div>
            </div>

            <!-- 6. Email -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="ইমেইল">
                ইমেইল
              </label>
              <input
                v-model.trim="form.email"
                type="email"
                class="form-control form-control-sm single-row-input"
                placeholder="customer@example.com"
                :title="form.email || ''" />
            </div>

            <!-- 7. Notes / Remarks -->
            <div class="col-12 col-sm-12 col-lg-6">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="নোট / মন্তব্য">
                নোট / মন্তব্য
              </label>
              <input
                v-model.trim="form.notes"
                type="text"
                class="form-control form-control-sm single-row-input"
                placeholder="কাস্টমার সম্পর্কে কোনো বিশেষ বিবরণ বা নোট..."
                :title="form.notes || ''" />
            </div>
          </div>

          <!-- Form Submit Actions -->
          <div class="d-flex align-items-center justify-content-end gap-2 pt-2 border-top">
            <button
              v-if="isEditing"
              type="button"
              class="btn btn-sm btn-outline-secondary px-3"
              @click="cancelEdit">
              <i class="bi bi-x-circle me-1"></i>
              বাতিল
            </button>
            <button
              v-else
              type="button"
              class="btn btn-sm btn-outline-secondary px-3"
              @click="resetForm">
              রিসেট
            </button>
            <button
              type="submit"
              class="btn btn-sm px-3 d-inline-flex align-items-center gap-1 shadow-sm"
              :class="isEditing ? 'btn-primary' : 'btn-teal'"
              :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i v-else :class="isEditing ? 'bi bi-arrow-repeat' : 'bi bi-check-circle'"></i>
              <span>{{ isEditing ? 'আপডেট করুন' : 'সংরক্ষণ করুন' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Customer List Section -->
    <div class="card border shadow-sm">
      <div class="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2 py-2">
        <div class="d-flex align-items-center gap-2">
          <h6 class="m-0 fw-bold">সকল কাস্টমারের তালিকা</h6>
          <span class="badge bg-secondary-subtle text-secondary border">
            {{ toBengaliNumber(filteredCustomers.length) }} টি
          </span>
        </div>

        <div class="d-flex align-items-center gap-2 flex-wrap">
          <!-- Filter Tabs (Unified Segmented Control) -->
          <div class="filter-tabs-wrapper">
            <button
              type="button"
              class="filter-tab-btn"
              :class="{ active: activeFilter === 'all' }"
              @click="activeFilter = 'all'">
              সকল ({{ toBengaliNumber(customersList.length) }})
            </button>
            <button
              type="button"
              class="filter-tab-btn"
              :class="{ active: activeFilter === 'retail' }"
              @click="activeFilter = 'retail'">
              খুচরা ({{ toBengaliNumber(retailCount) }})
            </button>
            <button
              type="button"
              class="filter-tab-btn"
              :class="{ active: activeFilter === 'wholesale' }"
              @click="activeFilter = 'wholesale'">
              পাইকারি ({{ toBengaliNumber(wholesaleCount) }})
            </button>
            <button
              type="button"
              class="filter-tab-btn"
              :class="{ active: activeFilter === 'corporate' }"
              @click="activeFilter = 'corporate'">
              কর্পোরেট ({{ toBengaliNumber(corporateCount) }})
            </button>
          </div>

          <!-- Search Box (Same height, border-radius, and border-color) -->
          <div class="position-relative" style="min-width: 220px;">
            <input
              v-model.trim="searchQuery"
              type="text"
              class="form-control form-control-sm ps-4 search-input-unified"
              placeholder="নাম, মোবাইল বা ঠিকানা খুঁজুন..." />
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
          <div class="spinner-border text-teal" role="status">
            <span class="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <div class="text-muted small mt-2">কাস্টমারদের তথ্য লোড হচ্ছে...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredCustomers.length === 0" class="text-center py-5">
          <i class="bi bi-people text-muted fs-1 mb-2 d-block"></i>
          <p class="text-muted mb-0">
            {{ searchQuery ? 'অনুসন্ধানের সাথে কোনো কাস্টমার মেলেনি।' : 'এখনো কোনো কাস্টমার যোগ করা হয়নি।' }}
          </p>
        </div>

        <!-- Table View with 4 Main Columns + Status + Action -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="customer-table-header">
              <tr class="small">
                <th style="width: 45px;" class="text-center">#</th>
                <th style="width: 24%;">কাস্টমারের নাম ও মোবাইল</th>
                <th style="width: 22%;">ধরন ও ঠিকানা</th>
                <th style="width: 22%;">বিকল্প মোবাইল ও ইমেইল</th>
                <th style="width: 20%;">নোট / মন্তব্য</th>
                <th style="width: 95px;" class="text-center">স্টেটাস</th>
                <th style="width: 90px;" class="text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(c, index) in filteredCustomers"
                :key="c.id"
                :class="{ 'customer-row-inactive': !c.isActive }">
                <td class="text-center customer-index-cell small">{{ index + 1 }}</td>

                <!-- ১. কাস্টমারের নাম ও মোবাইল -->
                <td>
                  <div class="fw-bold fs-6 customer-name-cell">{{ c.name }}</div>
                  <div v-if="c.mobile" class="d-flex align-items-center gap-1 font-monospace customer-mobile-cell small mt-1">
                    <i class="bi bi-telephone-fill opacity-75" style="font-size: 0.75rem;"></i>
                    <span>{{ c.mobile }}</span>
                  </div>
                  <span v-else class="customer-empty-cell small">-</span>
                </td>

                <!-- ২. ধরন ও ঠিকানা -->
                <td>
                  <span
                    class="badge"
                    :class="getCustomerTypeBadgeClass(c.customerType)"
                    style="font-size: 0.70rem;">
                    <i class="bi me-1" :class="getCustomerTypeIcon(c.customerType)"></i>
                    {{ getCustomerTypeLabel(c.customerType) }}
                  </span>
                  <div v-if="c.address" class="small customer-address-cell text-truncate mt-1" style="max-width: 230px;" :title="c.address">
                    <i class="bi bi-geo-alt opacity-75 me-1"></i>{{ c.address }}
                  </div>
                  <div v-else class="customer-empty-cell small mt-1">-</div>
                </td>

                <!-- ৩. বিকল্প মোবাইল ও ইমেইল -->
                <td>
                  <div v-if="c.altMobile" class="d-flex align-items-center gap-1 font-monospace customer-mobile-cell small">
                    <i class="bi bi-phone opacity-75" style="font-size: 0.75rem;"></i>
                    <span>{{ c.altMobile }}</span>
                  </div>
                  <div v-if="c.email" class="d-flex align-items-center gap-1 customer-email-cell small mt-0.5 text-truncate" style="max-width: 200px;" :title="c.email">
                    <i class="bi bi-envelope opacity-75" style="font-size: 0.75rem;"></i>
                    <span>{{ c.email }}</span>
                  </div>
                  <span v-if="!c.altMobile && !c.email" class="customer-empty-cell small">-</span>
                </td>

                <!-- ৪. নোট / মন্তব্য -->
                <td>
                  <div v-if="c.notes" class="small customer-notes-cell text-truncate" style="max-width: 220px;" :title="c.notes">
                    {{ c.notes }}
                  </div>
                  <span v-else class="customer-empty-cell small">-</span>
                </td>

                <!-- স্টেটাস টগল (কোনো টেক্সট ছাড়া) -->
                <td class="text-center">
                  <div class="form-check form-switch d-inline-flex justify-content-center m-0 align-middle">
                    <input
                      class="form-check-input my-0"
                      type="checkbox"
                      role="switch"
                      :checked="c.isActive"
                      :disabled="togglingStatusId === c.id"
                      :title="c.isActive ? 'নিষ্ক্রিয় করতে টগল করুন' : 'সক্রিয় করতে টগল করুন'"
                      @change="toggleStatus(c)"
                      style="cursor: pointer; width: 2.1rem; height: 1.15rem;" />
                  </div>
                </td>

                <!-- অ্যাকশন (ভিউ ও এডিট বাটন, ডিলেট নেই) -->
                <td class="text-center">
                  <div class="d-inline-flex align-items-center gap-1">
                    <!-- View Button -->
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-info p-1 px-2 d-inline-flex align-items-center justify-content-center shadow-none action-btn"
                      title="বিস্তারিত তথ্য দেখুন"
                      @click="openViewModal(c)">
                      <i class="bi bi-eye"></i>
                    </button>

                    <!-- Edit Button -->
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary p-1 px-2 d-inline-flex align-items-center justify-content-center shadow-none action-btn"
                      title="তথ্য সম্পাদন করুন"
                      @click="startEdit(c)">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- View Customer Details Modal -->
    <div
      v-if="showModal && selectedCustomer"
      class="modal fade show d-block customer-details-modal-backdrop"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      @click.self="closeViewModal">
      <div class="modal-dialog modal-dialog-centered modal-md">
        <div class="modal-content shadow border-0 customer-modal-content">
          <div class="modal-header border-bottom py-2 customer-modal-header">
            <h6 class="modal-title fw-bold d-flex align-items-center gap-2 m-0 customer-modal-title">
              <i class="bi bi-info-circle-fill text-info"></i>
              <span>কাস্টমারের সম্পূর্ণ তথ্য</span>
            </h6>
            <button type="button" class="btn-close btn-sm customer-modal-close" aria-label="Close" @click="closeViewModal"></button>
          </div>
          <div class="modal-body p-3 customer-modal-body">
            <div class="d-flex align-items-center justify-content-between p-2 mb-3 rounded border customer-modal-summary">
              <div>
                <div class="fw-bold fs-6 customer-modal-name">{{ selectedCustomer.name }}</div>
                <div class="small customer-modal-subtle">আইডি: #{{ selectedCustomer.id }}</div>
              </div>
              <div class="text-end">
                <span
                  class="badge mb-1"
                  :class="getCustomerTypeBadgeClass(selectedCustomer.customerType)">
                  {{ getCustomerTypeLabel(selectedCustomer.customerType) }}
                </span>
                <div>
                  <span
                    class="badge rounded-pill"
                    :class="selectedCustomer.isActive ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary border'">
                    {{ selectedCustomer.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="list-group list-group-flush border rounded small customer-modal-list">
              <!-- Mobile -->
              <div class="list-group-item d-flex justify-content-between align-items-center py-2">
                <span class="customer-modal-label"><i class="bi bi-telephone-fill me-2 text-teal"></i>মোবাইল নম্বর:</span>
                <span class="fw-bold font-monospace customer-modal-val">{{ selectedCustomer.mobile || '-' }}</span>
              </div>

              <!-- Alt Mobile -->
              <div class="list-group-item d-flex justify-content-between align-items-center py-2">
                <span class="customer-modal-label"><i class="bi bi-phone me-2 text-primary"></i>বিকল্প মোবাইল:</span>
                <span class="fw-bold font-monospace customer-modal-val">{{ selectedCustomer.altMobile || '-' }}</span>
              </div>

              <!-- Email -->
              <div class="list-group-item d-flex justify-content-between align-items-center py-2">
                <span class="customer-modal-label"><i class="bi bi-envelope me-2 text-info"></i>ইমেইল:</span>
                <span class="fw-semibold customer-modal-val">{{ selectedCustomer.email || '-' }}</span>
              </div>

              <!-- Address -->
              <div class="list-group-item d-flex justify-content-between align-items-center py-2">
                <span class="customer-modal-label"><i class="bi bi-geo-alt-fill me-2 text-danger"></i>ঠিকানা:</span>
                <span class="fw-semibold customer-modal-val text-end" style="max-width: 60%;">{{ selectedCustomer.address || '-' }}</span>
              </div>

              <!-- Notes -->
              <div class="list-group-item d-flex justify-content-between align-items-start py-2">
                <span class="customer-modal-label"><i class="bi bi-card-text me-2 text-warning"></i>মন্তব্য / নোট:</span>
                <span class="fw-normal customer-modal-val text-end" style="max-width: 65%;">{{ selectedCustomer.notes || '-' }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer border-top py-2 d-flex justify-content-between customer-modal-footer">
            <button
              type="button"
              class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
              @click="closeViewModal(); startEdit(selectedCustomer);">
              <i class="bi bi-pencil-square"></i>
              <span>সম্পাদন করুন</span>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary customer-modal-cancel-btn" @click="closeViewModal">
              বন্ধ করুন
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
import Toast from "@/components/Toast.vue";

const toastRef = ref<any>(null);

function showToast(message: string, type: "success" | "danger" | "warning" = "success") {
  toastRef.value?.toastme(message, type);
}

const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
function toBengaliNumber(n: number | string) {
  return String(n).replace(/[0-9]/g, (d) => bengaliDigits[Number(d)]);
}

// Mobile format validation helpers (Bangladeshi 11 digits: 013-019)
function normalizeBengaliDigits(val: string): string {
  if (!val) return "";
  let digits = String(val)
    .replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)))
    .replace(/[^\d]/g, "");
  if (digits.startsWith("8801")) {
    digits = digits.slice(2);
  }
  return digits;
}

function isValidBdMobile(mobile: string): boolean {
  if (!mobile) return false;
  const digits = normalizeBengaliDigits(mobile);
  return /^01[3-9]\d{8}$/.test(digits);
}

// Mobile Validations
const primaryMobileTouched = ref(false);
const altMobileTouched = ref(false);

const isPrimaryMobileValid = computed(() => {
  return isValidBdMobile(form.mobile);
});

const isAltMobileValid = computed(() => {
  if (!form.altMobile) return false;
  return isValidBdMobile(form.altMobile);
});

function onPrimaryMobileInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const clean = normalizeBengaliDigits(target.value).slice(0, 11);
  form.mobile = clean;
  target.value = clean;
}

function onAltMobileInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const clean = normalizeBengaliDigits(target.value).slice(0, 11);
  form.altMobile = clean;
  target.value = clean;
}

// Badge and label helper functions
function getCustomerTypeLabel(type: string): string {
  switch (type) {
    case "retail":
      return "খুচরা";
    case "wholesale":
      return "পাইকারি";
    case "corporate":
      return "কর্পোরেট";
    default:
      return "অন্যান্য";
  }
}

function getCustomerTypeIcon(type: string): string {
  switch (type) {
    case "retail":
      return "bi-person";
    case "wholesale":
      return "bi-shop";
    case "corporate":
      return "bi-briefcase";
    default:
      return "bi-people";
  }
}

function getCustomerTypeBadgeClass(type: string): string {
  switch (type) {
    case "retail":
      return "customer-badge-retail";
    case "wholesale":
      return "customer-badge-wholesale";
    case "corporate":
      return "customer-badge-corporate";
    default:
      return "customer-badge-other";
  }
}

// State
const loading = ref(false);
const submitting = ref(false);
const togglingStatusId = ref<number | null>(null);
const activeFilter = ref<"all" | "retail" | "wholesale" | "corporate">("all");
const searchQuery = ref("");

// Edit Mode State
const isEditing = ref(false);
const editingCustomer = ref<any>(null);

// Modal View State
const showModal = ref(false);
const selectedCustomer = ref<any>(null);

function openViewModal(c: any) {
  selectedCustomer.value = c;
  showModal.value = true;
}

function closeViewModal() {
  showModal.value = false;
  selectedCustomer.value = null;
}

const customersList = ref<any[]>([]);

// Form State
const form = reactive({
  customerType: "retail",
  name: "",
  mobile: "",
  altMobile: "",
  email: "",
  address: "",
  notes: ""
});

function resetForm() {
  form.customerType = "retail";
  form.name = "";
  form.mobile = "";
  form.altMobile = "";
  form.email = "";
  form.address = "";
  form.notes = "";
  primaryMobileTouched.value = false;
  altMobileTouched.value = false;
}

function startEdit(c: any) {
  isEditing.value = true;
  editingCustomer.value = c;
  form.customerType = c.customerType || "retail";
  form.name = c.name;
  form.mobile = c.mobile || "";
  form.altMobile = c.altMobile || "";
  form.email = c.email || "";
  form.address = c.address || "";
  form.notes = c.notes || "";

  primaryMobileTouched.value = false;
  altMobileTouched.value = false;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
  isEditing.value = false;
  editingCustomer.value = null;
  resetForm();
}

// Fetch Customers
async function fetchCustomers() {
  loading.value = true;
  try {
    const res = await axios.get("/api/inventory/customers");
    const rawList = res.data?.data || [];
    customersList.value = rawList.map((c: any) => ({
      ...c,
      isActive: c.isActive !== false && c.is_active !== false,
      altMobile: c.altMobile || c.alt_mobile || "",
      customerType: c.customerType || c.customer_type || "retail"
    }));
  } catch (err: any) {
    showToast(err.response?.data?.message || "কাস্টমার লোড করতে ব্যর্থ হয়েছে", "danger");
    customersList.value = [];
  } finally {
    loading.value = false;
  }
}

// Filter Counts
const retailCount = computed(() => customersList.value.filter((c) => c.customerType === "retail").length);
const wholesaleCount = computed(() => customersList.value.filter((c) => c.customerType === "wholesale").length);
const corporateCount = computed(() => customersList.value.filter((c) => c.customerType === "corporate").length);

const filteredCustomers = computed(() => {
  let list = customersList.value;

  if (activeFilter.value !== "all") {
    list = list.filter((c) => c.customerType === activeFilter.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter((c) => {
      const matchName = c.name?.toLowerCase().includes(q);
      const matchMobile = c.mobile?.includes(q);
      const matchAltMobile = c.altMobile?.includes(q);
      const matchAddress = c.address?.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchNotes = c.notes?.toLowerCase().includes(q);
      return matchName || matchMobile || matchAltMobile || matchAddress || matchEmail || matchNotes;
    });
  }

  return list;
});

// Toggle Status Function
async function toggleStatus(c: any) {
  const newStatus = !c.isActive;
  togglingStatusId.value = c.id;
  try {
    await axios.put(`/api/inventory/customers/${c.id}`, { isActive: newStatus });
    c.isActive = newStatus;
    showToast(`কাস্টমার সফলভাবে ${newStatus ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`, "success");
  } catch (err: any) {
    showToast(err.response?.data?.message || "স্টেটাস পরিবর্তন ব্যর্থ হয়েছে", "danger");
  } finally {
    togglingStatusId.value = null;
  }
}

// Submit Customer Form (Create or Update)
async function submitCustomerForm() {
  if (!form.name || !form.name.trim()) {
    showToast("কাস্টমারের নাম আবশ্যক", "danger");
    return;
  }

  if (!isPrimaryMobileValid.value) {
    primaryMobileTouched.value = true;
    showToast("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন", "danger");
    return;
  }

  if (form.altMobile && !isAltMobileValid.value) {
    altMobileTouched.value = true;
    showToast("সঠিক ১১ ডিজিটের বিকল্প মোবাইল নম্বর দিন", "danger");
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      name: form.name.trim(),
      customerType: form.customerType,
      mobile: form.mobile.trim(),
      altMobile: form.altMobile.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null
    };

    if (isEditing.value && editingCustomer.value) {
      const res = await axios.put(`/api/inventory/customers/${editingCustomer.value.id}`, payload);
      showToast(res.data?.message || "কাস্টমারের তথ্য সফলভাবে আপডেট করা হয়েছে", "success");
      cancelEdit();
      await fetchCustomers();
    } else {
      const res = await axios.post("/api/inventory/customers", payload);
      showToast(res.data?.message || "কাস্টমার সফলভাবে সংরক্ষণ করা হয়েছে", "success");
      resetForm();
      await fetchCustomers();
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || "সংরক্ষণ করতে সমস্যা হয়েছে", "danger");
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  fetchCustomers();
});
</script>

<style scoped>
.customers-page {
  font-family: inherit;
}

.text-teal {
  color: #20c997 !important;
}

.btn-teal {
  background-color: #20c997;
  border-color: #20c997;
  color: #000000 !important;
  font-weight: 600;
}
.btn-teal i,
.btn-teal span {
  color: #000000 !important;
}
.btn-teal:hover {
  background-color: #1aa179;
  border-color: #1aa179;
  color: #000000 !important;
}

.customer-form-card {
  border-top: 3px solid #20c997 !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.customer-form-edit-mode {
  border-top: 3px solid #0d6efd !important;
  border-color: rgba(13, 110, 253, 0.45) !important;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.08) !important;
}

/* Single row inputs */
.single-row-input {
  height: 31px;
  line-height: 1.2;
}

/* Locked / Readonly input state in edit mode */
.locked-input {
  background-color: #f8f9fa !important;
  border-color: #dee2e6 !important;
  color: #6c757d !important;
  cursor: not-allowed;
  user-select: none;
}

/* Mobile input validation states */
.mobile-valid {
  border-color: #198754 !important;
}
.mobile-valid:focus {
  border-color: #198754 !important;
  box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.25) !important;
}
.mobile-invalid {
  border-color: #dc3545 !important;
}
.mobile-invalid:focus {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}
.mobile-check-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #198754;
  font-size: 0.85rem;
  pointer-events: none;
}

/* Badges for customer types */
.customer-badge-retail {
  background-color: #e6f7ff;
  color: #0070ba;
  border: 1px solid #91d5ff;
}

.customer-badge-wholesale {
  background-color: #f6ffed;
  color: #389e0d;
  border: 1px solid #b7eb8f;
}

.customer-badge-corporate {
  background-color: #f9f0ff;
  color: #722ed1;
  border: 1px solid #d3adf7;
}

.customer-badge-other {
  background-color: #f5f5f5;
  color: #595959;
  border: 1px solid #d9d9d9;
}

/* Inactive Row Styling */
.customer-row-inactive {
  opacity: 0.52;
  background-color: rgba(0, 0, 0, 0.02) !important;
  transition: opacity 0.2s ease;
}
.customer-row-inactive:hover {
  opacity: 0.85;
}

/* Action Buttons */
.action-btn {
  font-size: 0.82rem;
  border-radius: 4px;
  transition: all 0.15s ease;
}

/* Filter Tabs & Unified Search */
.filter-tabs-wrapper {
  display: inline-flex;
  align-items: center;
  background-color: #f1f3f5;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
}

.filter-tab-btn {
  border: none;
  background: transparent;
  font-size: 0.78rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 4px;
  color: #495057;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.filter-tab-btn:hover {
  color: #20c997;
  background-color: rgba(32, 201, 151, 0.08);
}

.filter-tab-btn.active {
  background-color: #20c997;
  color: #000000 !important;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-input-unified {
  height: 31px;
  font-size: 0.82rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-input-unified:focus {
  border-color: #20c997;
  box-shadow: 0 0 0 0.15rem rgba(32, 201, 151, 0.2);
}

/* Customer Details Modal Backdrop */
.customer-details-modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1055;
}
</style>

<!-- Unscoped Dark Theme Styles for Pure Neutral Black / Charcoal (Zero Blue) -->
<style lang="scss">
.theme-dark,
[data-bs-theme="dark"] {
  .customers-page {
    /* Top Form Card */
    .customer-form-card {
      background-color: #1b1b1f !important;
      border-color: #2e2e2e !important;
      border-top: 3px solid #20c997 !important;
      color: #f0f0f0 !important;

      .card-header {
        background-color: #171719 !important;
        border-bottom-color: #262626 !important;
      }
    }

    .customer-form-edit-mode {
      border-top: 3px solid #0d6efd !important;
      border-color: rgba(13, 110, 253, 0.55) !important;
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.12) !important;
    }

    /* Form Inputs - Strict Neutral Dark */
    .form-control,
    .form-select {
      background-color: #121212 !important;
      border-color: #333333 !important;
      color: #f0f0f0 !important;

      &:focus {
        background-color: #121212 !important;
        border-color: #20c997 !important;
        box-shadow: 0 0 0 0.2rem rgba(32, 201, 151, 0.25) !important;
        color: #ffffff !important;
      }

      &::placeholder {
        color: #737373 !important;
      }
    }

    .form-select option {
      background-color: #1b1b1f !important;
      color: #f0f0f0 !important;
    }

    .locked-input {
      background-color: #181818 !important;
      border-color: #2a2a2a !important;
      color: #707070 !important;
    }

    .mobile-valid {
      border-color: #198754 !important;
      &:focus {
        box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.25) !important;
      }
    }
    .mobile-check-icon {
      color: #198754 !important;
    }

    /* Table Card */
    .card {
      background-color: #1b1b1f !important;
      border-color: #2e2e2e !important;
      color: #f0f0f0 !important;

      .card-header {
        background-color: #171719 !important;
        border-bottom-color: #262626 !important;
      }
    }

    /* Table Header */
    .customer-table-header th {
      background-color: #161618 !important;
      color: #a6a6a6 !important;
      border-bottom: 1px solid #2a2a2a !important;
    }

    /* Table Rows & Cells */
    .table > :not(caption) > * > * {
      background-color: transparent !important;
      border-bottom-color: #262626 !important;
      color: #e5e5e5 !important;
    }

    .table-hover > tbody > tr:hover > * {
      background-color: rgba(255, 255, 255, 0.035) !important;
    }

    .customer-name-cell {
      color: #ffffff !important;
    }

    .customer-mobile-cell {
      color: #cccccc !important;
    }

    .customer-email-cell {
      color: #a6a6a6 !important;
    }

    .customer-address-cell {
      color: #999999 !important;
    }

    .customer-notes-cell {
      color: #a0a0a0 !important;
    }

    .customer-index-cell {
      color: #888888 !important;
    }

    .customer-empty-cell {
      color: #666666 !important;
    }

    /* Inactive Row in Dark Mode */
    .customer-row-inactive {
      opacity: 0.42 !important;
      background-color: rgba(255, 255, 255, 0.015) !important;

      .customer-name-cell,
      .customer-mobile-cell {
        color: #666666 !important;
      }

      &:hover {
        opacity: 0.85 !important;
      }
    }

    /* Badges in Dark Mode */
    .customer-badge-retail {
      background-color: rgba(0, 112, 186, 0.2) !important;
      color: #69c0ff !important;
      border: 1px solid rgba(0, 112, 186, 0.4) !important;
    }

    .customer-badge-wholesale {
      background-color: rgba(56, 158, 13, 0.2) !important;
      color: #95de64 !important;
      border: 1px solid rgba(56, 158, 13, 0.4) !important;
    }

    .customer-badge-corporate {
      background-color: rgba(114, 46, 209, 0.2) !important;
      color: #b37feb !important;
      border: 1px solid rgba(114, 46, 209, 0.4) !important;
    }

    .customer-badge-other {
      background-color: rgba(255, 255, 255, 0.08) !important;
      color: #bfbfbf !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
    }

    /* Filter Tabs & Search Box - Neutral Dark */
    .filter-tabs-wrapper {
      background-color: #141416 !important;
      border-color: #2e2e2e !important;
    }

    .btn-teal {
      background-color: #20c997 !important;
      border-color: #20c997 !important;
      color: #000000 !important;
      font-weight: 700 !important;

      i,
      span {
        color: #000000 !important;
      }

      &:hover {
        background-color: #1aa179 !important;
        border-color: #1aa179 !important;
        color: #000000 !important;
      }
    }

    .filter-tab-btn {
      color: #999999 !important;

      &:hover {
        color: #20c997 !important;
        background-color: rgba(32, 201, 151, 0.12) !important;
      }

      &.active {
        color: #000000 !important;
        background-color: #20c997 !important;
        font-weight: 700 !important;
      }
    }

    .search-input-unified {
      background-color: #121212 !important;
      border-color: #333333 !important;
      color: #f0f0f0 !important;

      &:focus {
        background-color: #121212 !important;
        border-color: #20c997 !important;
        box-shadow: 0 0 0 0.15rem rgba(32, 201, 151, 0.25) !important;
      }

      &::placeholder {
        color: #808080 !important;
      }
    }
  }

  /* ========================================================
     MODAL DARK THEME - Neutral Dark (Zero Blue)
     ======================================================== */
  .customer-details-modal-backdrop {
    .customer-modal-content {
      background-color: #1b1b1f !important;
      color: #f0f0f0 !important;
      border: 1px solid #2e2e2e !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8) !important;
    }

    .customer-modal-header {
      background-color: #151517 !important;
      border-bottom: 1px solid #262626 !important;

      .customer-modal-title {
        color: #ffffff !important;
      }

      .btn-close {
        filter: invert(1) grayscale(100%) brightness(200%) !important;
        opacity: 0.75;
        &:hover {
          opacity: 1;
        }
      }
    }

    .customer-modal-body {
      background-color: #1b1b1f !important;
    }

    /* Modal Top Summary Card */
    .customer-modal-summary {
      background-color: #141416 !important;
      border: 1px solid #262626 !important;

      .customer-modal-name {
        color: #ffffff !important;
      }
      .customer-modal-subtle {
        color: #909090 !important;
      }
    }

    /* Modal List Items */
    .customer-modal-list {
      border: 1px solid #262626 !important;

      .list-group-item {
        background-color: #151517 !important;
        border-color: #222222 !important;
        color: #f0f0f0 !important;

        /* Left labels */
        .customer-modal-label {
          color: #999999 !important;
        }

        /* Right values (Bright White & Clear) */
        .customer-modal-val {
          color: #ffffff !important;
        }
      }
    }

    /* Modal Footer */
    .customer-modal-footer {
      background-color: #151517 !important;
      border-top: 1px solid #262626 !important;

      .customer-modal-cancel-btn {
        color: #cccccc !important;
        border-color: #383838 !important;

        &:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
          color: #ffffff !important;
        }
      }
    }
  }
}
</style>
