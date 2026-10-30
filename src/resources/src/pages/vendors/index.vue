<template>
  <div class="vendors-page">
    <!-- Toast Notification -->
    <Toast ref="toastRef" />

    <!-- Top Action / Navigation Bar -->
    <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-truck text-danger fs-4"></i>
        <div>
          <h5 class="m-0 fw-bold">বিক্রেতা ও পার্টনার ব্যবস্থাপনা</h5>
          <span class="text-muted small">
            {{ activeView === 'form' ? (isEditing ? 'বিক্রেতার তথ্য সম্পাদন ফরম' : 'নতুন বিক্রেতা / সাপ্লায়ার এন্ট্রি ফরম') : 'সকল বিক্রেতা ও সাপ্লায়ার তালিকা' }}
          </span>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button
          v-if="activeView === 'list'"
          type="button"
          class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5 shadow-sm"
          @click="openNewVendorForm">
          <i class="bi bi-plus-circle"></i>
          <span>নতুন বিক্রেতা যোগ করুন</span>
        </button>

        <button
          v-if="activeView === 'form'"
          type="button"
          class="btn btn-sm btn-primary text-white d-inline-flex align-items-center gap-1.5 shadow-sm px-3"
          @click="switchView('list')">
          <i class="bi bi-card-list"></i>
          <span>বিক্রেতা তালিকা</span>
        </button>
      </div>
    </div>

    <!-- Vendor Entry / Edit Form -->
    <div
      v-show="activeView === 'form'"
      class="card border shadow-sm mb-4 vendor-form-card"
      :class="{ 'vendor-form-edit-mode': isEditing }">
      <div class="card-header bg-transparent border-bottom py-2 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <h6
          class="m-0 fw-bold d-flex align-items-center gap-2"
          :class="isEditing ? 'text-primary' : 'text-danger'">
          <i :class="isEditing ? 'bi bi-pencil-square' : 'bi bi-person-plus-fill'"></i>
          <span>{{ isEditing ? 'বিক্রেতার তথ্য সম্পাদন' : 'নতুন বিক্রেতা' }}</span>
        </h6>
        <div class="d-flex align-items-center gap-2">
          <span
            v-if="isEditing"
            class="badge bg-primary-subtle text-primary border border-primary-subtle py-1 px-2 small">
            <i class="bi bi-lock-fill me-1"></i>প্রতিষ্ঠানের নাম অপরিবর্তনীয়
          </span>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 py-1 px-3 shadow-sm fw-medium"
            @click="switchView('list')">
            <i class="bi bi-card-list"></i>
            <span>বিক্রেতা তালিকা</span>
          </button>
        </div>
      </div>

      <div class="card-body">
        <form @submit.prevent="submitVendorForm">
          <!-- Row 1: প্রতিষ্ঠানের তথ্য (4 Equal Columns) -->
          <div class="row g-2 mb-2 align-items-start">
            <!-- 1. Vendor Type Selection Dropdown (Loaded dynamically from SuperAdmin Settings) -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" for="vendorTypeSelect" title="প্রতিষ্ঠানের ধরন">
                প্রতিষ্ঠানের ধরন <span class="text-danger">*</span>
              </label>
              <select
                id="vendorTypeSelect"
                v-model="form.type"
                class="form-select form-select-sm text-truncate"
                :disabled="isEditing"
                required>
                <option v-for="vt in activeVendorTypes" :key="vt.id" :value="vt.code || vt.name">
                  {{ vt.name }}
                </option>
                <option v-if="activeVendorTypes.length === 0" value="supplier">সাপ্লায়ার</option>
              </select>
            </div>

            <!-- 2. Organization Name (Immutable on Edit) -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="প্রতিষ্ঠানের নাম">
                প্রতিষ্ঠানের নাম <span class="text-danger">*</span>
              </label>
              <div class="position-relative">
                <input
                  v-model.trim="form.name"
                  type="text"
                  class="form-control form-control-sm single-row-input"
                  :class="{ 'locked-input pe-4': isEditing }"
                  :disabled="isEditing"
                  :readonly="isEditing"
                  placeholder="প্রতিষ্ঠানের নাম"
                  :title="isEditing ? 'এডিটে প্রতিষ্ঠানের নাম পরিবর্তন করা যাবে না' : (form.name || '')"
                  required />
                <span
                  v-if="isEditing"
                  class="position-absolute end-0 top-50 translate-middle-y me-2 text-muted small pe-none"
                  title="প্রতিষ্ঠানের নাম অপরিবর্তনীয়">
                  <i class="bi bi-lock-fill"></i>
                </span>
              </div>
              <div
                v-if="isEditing"
                class="text-muted small mt-1"
                style="font-size: 0.70rem;">
                <i class="bi bi-info-circle me-1"></i>এডিটে প্রতিষ্ঠানের নাম পরিবর্তন করা যাবে না
              </div>
            </div>

            <!-- 3. Organization Mobile -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="প্রতিষ্ঠানের মোবাইল">
                প্রতিষ্ঠানের মোবাইল <span class="text-danger">*</span>
              </label>
              <div class="position-relative">
                <input
                  v-model.trim="form.mobile"
                  type="tel"
                  maxlength="11"
                  class="form-control form-control-sm pe-4 single-row-input"
                  :class="{
                    'mobile-valid': isOrgMobileValid,
                    'mobile-invalid': (orgMobileTouched || form.mobile.length === 11) && form.mobile && !isOrgMobileValid
                  }"
                  placeholder="01XXXXXXXXX"
                  @input="onOrgMobileInput"
                  @blur="orgMobileTouched = true"
                  required />
                <span
                  v-if="isOrgMobileValid"
                  class="mobile-check-icon"
                  title="সঠিক মোবাইল নম্বর">
                  <i class="bi bi-check-circle-fill"></i>
                </span>
              </div>
              <div
                v-if="(orgMobileTouched || form.mobile.length === 11) && form.mobile && !isOrgMobileValid"
                class="text-danger small mt-1"
                style="font-size: 0.70rem;">
                সঠিক ১১ ডিজিটের মোবাইল দিন
              </div>
            </div>

            <!-- 4. Address (ঠিকানা) -->
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

          <!-- Row 2: মালিক ও ম্যানেজার/কর্মচারীর তথ্য (4 Equal Columns) -->
          <div class="row g-2 mb-3 align-items-start">
            <!-- 5. Owner Name -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="মালিকের নাম">
                মালিকের নাম
              </label>
              <input
                v-model.trim="form.ownerName"
                type="text"
                class="form-control form-control-sm single-row-input"
                placeholder="মালিকের নাম"
                :title="form.ownerName || ''" />
            </div>

            <!-- 6. Owner Mobile -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="মালিকের মোবাইল">
                মালিকের মোবাইল
              </label>
              <div class="position-relative">
                <input
                  v-model.trim="form.ownerMobile"
                  type="tel"
                  maxlength="11"
                  class="form-control form-control-sm pe-4 single-row-input"
                  :class="{
                    'mobile-valid': isOwnerMobileValid,
                    'mobile-invalid': (ownerMobileTouched || form.ownerMobile.length === 11) && form.ownerMobile && !isOwnerMobileValid
                  }"
                  placeholder="01XXXXXXXXX"
                  @input="onOwnerMobileInput"
                  @blur="ownerMobileTouched = true" />
                <span
                  v-if="isOwnerMobileValid"
                  class="mobile-check-icon"
                  title="সঠিক মোবাইল নম্বর">
                  <i class="bi bi-check-circle-fill"></i>
                </span>
              </div>
              <div
                v-if="(ownerMobileTouched || form.ownerMobile.length === 11) && form.ownerMobile && !isOwnerMobileValid"
                class="text-danger small mt-1"
                style="font-size: 0.70rem;">
                সঠিক ১১ ডিজিটের মোবাইল দিন
              </div>
            </div>

            <!-- 7. Manager Name -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="ম্যানেজার/কর্মচারীর নাম">
                ম্যানেজার/কর্মচারীর নাম
              </label>
              <input
                v-model.trim="form.managerName"
                type="text"
                class="form-control form-control-sm single-row-input"
                placeholder="ম্যানেজার বা কর্মচারীর নাম"
                :title="form.managerName || ''" />
            </div>

            <!-- 8. Manager Mobile -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="ম্যানেজার/কর্মচারীর মোবাইল">
                ম্যানেজার/কর্মচারীর মোবাইল
              </label>
              <div class="position-relative">
                <input
                  v-model.trim="form.managerMobile"
                  type="tel"
                  maxlength="11"
                  class="form-control form-control-sm pe-4 single-row-input"
                  :class="{
                    'mobile-valid': isManagerMobileValid,
                    'mobile-invalid': (managerMobileTouched || form.managerMobile.length === 11) && form.managerMobile && !isManagerMobileValid
                  }"
                  placeholder="01XXXXXXXXX"
                  @input="onManagerMobileInput"
                  @blur="managerMobileTouched = true" />
                <span
                  v-if="isManagerMobileValid"
                  class="mobile-check-icon"
                  title="সঠিক মোবাইল নম্বর">
                  <i class="bi bi-check-circle-fill"></i>
                </span>
              </div>
              <div
                v-if="(managerMobileTouched || form.managerMobile.length === 11) && form.managerMobile && !isManagerMobileValid"
                class="text-danger small mt-1"
                style="font-size: 0.70rem;">
                সঠিক ১১ ডিজিটের মোবাইল দিন
              </div>
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
              :class="isEditing ? 'btn-primary' : 'btn-danger'"
              :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i v-else :class="isEditing ? 'bi bi-arrow-repeat' : 'bi bi-check-circle'"></i>
              <span>{{ isEditing ? 'আপডেট করুন' : 'সংরক্ষণ করুন' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Vendor List Section -->
    <div v-show="activeView === 'list'" class="card border shadow-sm">
      <div class="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2 py-2">
        <div class="d-flex align-items-center gap-2">
          <h6 class="m-0 fw-bold">সকল বিক্রেতার তালিকা</h6>
          <span class="badge bg-secondary-subtle text-secondary border">
            {{ toBengaliNumber(filteredVendors.length) }} টি
          </span>
        </div>

        <div class="d-flex align-items-center gap-2 flex-wrap">
          <!-- Filter Tabs (Dynamic from SuperAdmin Settings) -->
          <div class="filter-tabs-wrapper">
            <button
              type="button"
              class="filter-tab-btn"
              :class="{ active: activeFilter === 'all' }"
              @click="activeFilter = 'all'">
              সকল ({{ toBengaliNumber(unifiedVendors.length) }})
            </button>
            <button
              v-for="vt in activeVendorTypes"
              :key="vt.id"
              type="button"
              class="filter-tab-btn"
              :class="{ active: activeFilter === (vt.code || vt.name) }"
              @click="activeFilter = (vt.code || vt.name)">
              {{ vt.name }} ({{ toBengaliNumber(getVendorCountByType(vt.code || vt.name)) }})
            </button>
          </div>

          <!-- Search Box (Same height, border-radius, and border-color) -->
          <div class="position-relative" style="min-width: 220px;">
            <input
              v-model.trim="searchQuery"
              type="text"
              class="form-control form-control-sm ps-4 search-input-unified"
              placeholder="নাম, মোবাইল বা পদবী খুঁজুন..." />
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
          <div class="text-muted small mt-2">বিক্রেতাদের তথ্য লোড হচ্ছে...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredVendors.length === 0" class="text-center py-5">
          <i class="bi bi-truck text-muted fs-1 mb-2 d-block"></i>
          <p class="text-muted mb-0">
            {{ searchQuery ? 'অনুসন্ধানের সাথে কোনো বিক্রেতা মেলেনি।' : 'এখনো কোনো বিক্রেতা বা সাপ্লায়ার যোগ করা হয়নি।' }}
          </p>
        </div>

        <!-- Table View with 4 Main Columns + Status + Action -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="vendor-table-header">
              <tr class="small">
                <th style="width: 45px;" class="text-center">#</th>
                <th style="width: 24%;">প্রতিষ্ঠানের নাম ও মোবাইল</th>
                <th style="width: 22%;">ধরন ও ঠিকানা</th>
                <th style="width: 20%;">মালিকের নাম ও মোবাইল</th>
                <th style="width: 20%;">ম্যানেজারের নাম ও মোবাইল</th>
                <th style="width: 95px;" class="text-center">স্টেটাস</th>
                <th style="width: 90px;" class="text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(v, index) in filteredVendors"
                :key="v.compositeId"
                :class="{ 'vendor-row-inactive': !v.isActive }">
                <td class="text-center vendor-index-cell small">{{ index + 1 }}</td>

                <!-- ১. প্রতিষ্ঠানের নাম ও মোবাইল -->
                <td>
                  <div class="fw-bold fs-6 vendor-name-cell">{{ v.name }}</div>
                  <div v-if="v.mobile" class="d-flex align-items-center gap-1 font-monospace vendor-mobile-cell small mt-1">
                    <i class="bi bi-telephone-fill opacity-75" style="font-size: 0.75rem;"></i>
                    <span>{{ v.mobile }}</span>
                  </div>
                  <span v-else class="vendor-empty-cell small">-</span>
                </td>

                <!-- ২. ধরন ও ঠিকানা -->
                <td>
                  <span
                    class="badge"
                    :class="isManufacturer(v.vendorType || v.type) ? 'vendor-badge-manufacturer' : 'vendor-badge-supplier'"
                    style="font-size: 0.70rem;">
                    <i class="bi me-1" :class="isManufacturer(v.vendorType || v.type) ? 'bi-gear-wide-connected' : 'bi-shop'"></i>
                    {{ getVendorTypeName(v.vendorType || v.type) }}
                  </span>
                  <div v-if="v.address" class="small vendor-address-cell text-truncate mt-1" style="max-width: 230px;" :title="v.address">
                    <i class="bi bi-geo-alt opacity-75 me-1"></i>{{ v.address }}
                  </div>
                  <div v-else class="vendor-empty-cell small mt-1">-</div>
                </td>

                <!-- ৩. মালিকের নাম ও মোবাইল -->
                <td>
                  <div v-if="v.ownerName" class="fw-semibold vendor-person-name small">{{ v.ownerName }}</div>
                  <div v-if="v.ownerMobile" class="d-flex align-items-center gap-1 font-monospace text-danger small mt-0.5">
                    <i class="bi bi-phone-fill text-danger" style="font-size: 0.75rem;"></i>
                    <span>{{ v.ownerMobile }}</span>
                  </div>
                  <span v-if="!v.ownerName && !v.ownerMobile" class="vendor-empty-cell small">-</span>
                </td>

                <!-- ৪. ম্যানেজারের নাম ও মোবাইল -->
                <td>
                  <div v-if="v.managerName" class="fw-semibold vendor-person-name small">{{ v.managerName }}</div>
                  <div v-if="v.managerMobile" class="d-flex align-items-center gap-1 font-monospace vendor-mobile-cell small mt-0.5">
                    <i class="bi bi-phone opacity-75" style="font-size: 0.75rem;"></i>
                    <span>{{ v.managerMobile }}</span>
                  </div>
                  <span v-if="!v.managerName && !v.managerMobile" class="vendor-empty-cell small">-</span>
                </td>

                <!-- স্টেটাস টগল (কোনো টেক্সট ছাড়া) -->
                <td class="text-center">
                  <div class="form-check form-switch d-inline-flex justify-content-center m-0 align-middle">
                    <input
                      class="form-check-input my-0"
                      type="checkbox"
                      role="switch"
                      :checked="v.isActive"
                      :disabled="togglingStatusId === v.compositeId"
                      :title="v.isActive ? 'নিষ্ক্রিয় করতে টগল করুন' : 'সক্রিয় করতে টগল করুন'"
                      @change="toggleStatus(v)"
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
                      @click="openViewModal(v)">
                      <i class="bi bi-eye"></i>
                    </button>

                    <!-- Edit Button -->
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary p-1 px-2 d-inline-flex align-items-center justify-content-center shadow-none action-btn"
                      title="তথ্য সম্পাদন করুন"
                      @click="startEdit(v)">
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

    <!-- View Vendor Details Modal -->
    <div
      v-if="showModal && selectedVendor"
      class="modal fade show d-block vendor-details-modal-backdrop"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      @click.self="closeViewModal">
      <div class="modal-dialog modal-dialog-centered modal-md">
        <div class="modal-content shadow border-0 vendor-modal-content">
          <div class="modal-header border-bottom py-2 vendor-modal-header">
            <h6 class="modal-title fw-bold d-flex align-items-center gap-2 m-0 vendor-modal-title">
              <i class="bi bi-info-circle-fill text-info"></i>
              <span>বিক্রেতার সম্পূর্ণ তথ্য</span>
            </h6>
            <button type="button" class="btn-close btn-sm vendor-modal-close" aria-label="Close" @click="closeViewModal"></button>
          </div>
          <div class="modal-body p-3 vendor-modal-body">
            <div class="d-flex align-items-center justify-content-between p-2 mb-3 rounded border vendor-modal-summary">
              <div>
                <div class="fw-bold fs-6 vendor-modal-vendor-name">{{ selectedVendor.name }}</div>
                <div class="small vendor-modal-subtle">আইডি: #{{ selectedVendor.id }}</div>
              </div>
              <div class="text-end">
                <span
                  class="badge mb-1"
                  :class="selectedVendor.type === 'supplier' ? 'vendor-badge-supplier' : 'vendor-badge-manufacturer'">
                  {{ selectedVendor.type === 'supplier' ? 'সাপ্লায়ার' : 'প্রস্তুতকারক' }}
                </span>
                <div>
                  <span
                    class="badge rounded-pill"
                    :class="selectedVendor.isActive ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary border'">
                    {{ selectedVendor.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="list-group list-group-flush border rounded small vendor-modal-list">
              <!-- Mobile -->
              <div class="list-group-item d-flex justify-content-between align-items-center py-2">
                <span class="vendor-modal-label"><i class="bi bi-telephone-fill me-2 text-primary"></i>প্রতিষ্ঠানের মোবাইল:</span>
                <span class="fw-bold font-monospace vendor-modal-val">{{ selectedVendor.mobile || '-' }}</span>
              </div>

              <!-- Address -->
              <div class="list-group-item d-flex justify-content-between align-items-center py-2">
                <span class="vendor-modal-label"><i class="bi bi-geo-alt-fill me-2 text-danger"></i>ঠিকানা:</span>
                <span class="fw-semibold vendor-modal-val text-end" style="max-width: 60%;">{{ selectedVendor.address || '-' }}</span>
              </div>

              <!-- Owner -->
              <div class="list-group-item d-flex justify-content-between align-items-center py-2">
                <span class="vendor-modal-label"><i class="bi bi-person-fill me-2 text-info"></i>মালিকের নাম:</span>
                <span class="fw-semibold vendor-modal-val">{{ selectedVendor.ownerName || '-' }}</span>
              </div>
              <div class="list-group-item d-flex justify-content-between align-items-center py-2">
                <span class="vendor-modal-label"><i class="bi bi-phone-fill me-2 text-info"></i>মালিকের মোবাইল:</span>
                <span class="fw-bold font-monospace text-danger">{{ selectedVendor.ownerMobile || '-' }}</span>
              </div>

              <!-- Manager -->
              <div class="list-group-item d-flex justify-content-between align-items-center py-2">
                <span class="vendor-modal-label"><i class="bi bi-person-badge-fill me-2 text-success"></i>ম্যানেজারের নাম:</span>
                <span class="fw-semibold vendor-modal-val">{{ selectedVendor.managerName || '-' }}</span>
              </div>
              <div class="list-group-item d-flex justify-content-between align-items-center py-2">
                <span class="vendor-modal-label"><i class="bi bi-phone me-2 text-success"></i>ম্যানেজারের মোবাইল:</span>
                <span class="fw-bold font-monospace vendor-modal-val">{{ selectedVendor.managerMobile || '-' }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer border-top py-2 d-flex justify-content-between vendor-modal-footer">
            <button
              type="button"
              class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
              @click="closeViewModal(); startEdit(selectedVendor);">
              <i class="bi bi-pencil-square"></i>
              <span>সম্পাদন করুন</span>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary vendor-modal-cancel-btn" @click="closeViewModal">
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
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Toast from "@/components/Toast.vue";

const route = useRoute();
const router = useRouter();

// View State: 'list' (default) vs 'form'
const activeView = ref<"list" | "form">(route.query.view === "form" ? "form" : "list");

watch(
  () => route.query.view,
  (view) => {
    if (view === "form") {
      activeView.value = "form";
    } else {
      activeView.value = "list";
    }
  },
  { immediate: true }
);

function switchView(view: "list" | "form") {
  activeView.value = view;
  if (router) {
    router.replace({ query: { ...route.query, view } });
  }
}

function openNewVendorForm() {
  resetForm();
  switchView("form");
}

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
const orgMobileTouched = ref(false);
const ownerMobileTouched = ref(false);
const managerMobileTouched = ref(false);

const isOrgMobileValid = computed(() => {
  return isValidBdMobile(form.mobile);
});

const isOwnerMobileValid = computed(() => {
  if (!form.ownerMobile) return false;
  return isValidBdMobile(form.ownerMobile);
});

const isManagerMobileValid = computed(() => {
  if (!form.managerMobile) return false;
  return isValidBdMobile(form.managerMobile);
});

function onOrgMobileInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const clean = normalizeBengaliDigits(target.value).slice(0, 11);
  form.mobile = clean;
  target.value = clean;
}

function onOwnerMobileInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const clean = normalizeBengaliDigits(target.value).slice(0, 11);
  form.ownerMobile = clean;
  target.value = clean;
}

function onManagerMobileInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const clean = normalizeBengaliDigits(target.value).slice(0, 11);
  form.managerMobile = clean;
  target.value = clean;
}

// State
const loading = ref(false);
const submitting = ref(false);
const togglingStatusId = ref<string | null>(null);
const activeFilter = ref<string>("all");
const searchQuery = ref("");

// Dynamic Vendor Types from SuperAdmin Settings
const vendorTypesList = ref<any[]>([]);

const activeVendorTypes = computed(() => {
  return vendorTypesList.value.filter((vt) => vt.isActive);
});

function getVendorTypeName(codeOrName: string) {
  if (!codeOrName) return "সাপ্লায়ার";
  const matched = activeVendorTypes.value.find(
    (vt) => vt.code === codeOrName || vt.name === codeOrName
  );
  if (matched) return matched.name;
  if (codeOrName === "supplier") return "সাপ্লায়ার";
  if (codeOrName === "manufacturer") return "প্রস্তুতকারক";
  return codeOrName;
}

function isManufacturer(typeVal: string): boolean {
  if (!typeVal) return false;
  const val = String(typeVal).toLowerCase().trim();
  if (val === "manufacturer" || val.includes("প্রস্তুতকারক") || val.includes("প্রস্তুতকারী")) {
    return true;
  }
  const matched = activeVendorTypes.value.find(
    (vt) => (vt.code || vt.name).toLowerCase() === val || vt.name.toLowerCase() === val
  );
  if (matched) {
    const mCode = (matched.code || "").toLowerCase();
    const mName = matched.name.toLowerCase();
    return mCode === "manufacturer" || mName.includes("প্রস্তুতকারক") || mName.includes("প্রস্তুতকারী");
  }
  return false;
}

function getVendorCountByType(typeVal: string) {
  return unifiedVendors.value.filter((v) => {
    const vt = v.vendorType || v.type;
    return vt === typeVal || (isManufacturer(typeVal) && isManufacturer(vt)) || (!isManufacturer(typeVal) && !isManufacturer(vt) && (typeVal === "supplier" || vt === "supplier"));
  }).length;
}

// Edit Mode State
const isEditing = ref(false);
const editingVendor = ref<any>(null);

// Modal View State
const showModal = ref(false);
const selectedVendor = ref<any>(null);

function openViewModal(v: any) {
  selectedVendor.value = v;
  showModal.value = true;
}

function closeViewModal() {
  showModal.value = false;
  selectedVendor.value = null;
}

const suppliersList = ref<any[]>([]);
const manufacturersList = ref<any[]>([]);

// Form State
const form = reactive({
  type: "supplier" as string,
  name: "",
  mobile: "",
  address: "",
  ownerName: "",
  ownerMobile: "",
  managerName: "",
  managerMobile: ""
});

function resetForm() {
  if (activeVendorTypes.value.length > 0) {
    form.type = activeVendorTypes.value[0].code || activeVendorTypes.value[0].name;
  } else {
    form.type = "supplier";
  }
  form.name = "";
  form.mobile = "";
  form.address = "";
  form.ownerName = "";
  form.ownerMobile = "";
  form.managerName = "";
  form.managerMobile = "";
  orgMobileTouched.value = false;
  ownerMobileTouched.value = false;
  managerMobileTouched.value = false;
}

function startEdit(v: any) {
  isEditing.value = true;
  editingVendor.value = v;
  form.type = v.vendorType || v.type;
  form.name = v.name;
  form.mobile = v.mobile || "";
  form.address = v.address || "";
  form.ownerName = v.ownerName || "";
  form.ownerMobile = v.ownerMobile || "";
  form.managerName = v.managerName || "";
  form.managerMobile = v.managerMobile || "";

  orgMobileTouched.value = false;
  ownerMobileTouched.value = false;
  managerMobileTouched.value = false;

  switchView("form");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
  isEditing.value = false;
  editingVendor.value = null;
  resetForm();
  switchView("list");
}

async function fetchSuppliers() {
  try {
    const res = await axios.get("/api/inventory/suppliers");
    suppliersList.value = res.data?.data || [];
  } catch {
    suppliersList.value = [];
  }
}

async function fetchManufacturers() {
  try {
    const res = await axios.get("/api/inventory/manufacturers");
    manufacturersList.value = res.data?.data || [];
  } catch {
    manufacturersList.value = [];
  }
}

async function fetchVendorTypes() {
  try {
    const res = await axios.get("/api/catalog/vendor-types");
    vendorTypesList.value = res.data?.data || [];
    if (activeVendorTypes.value.length > 0) {
      const match = activeVendorTypes.value.some((vt) => (vt.code || vt.name) === form.type);
      if (!match) {
        form.type = activeVendorTypes.value[0].code || activeVendorTypes.value[0].name;
      }
    }
  } catch {
    vendorTypesList.value = [];
  }
}

async function fetchAll() {
  loading.value = true;
  await Promise.all([fetchSuppliers(), fetchManufacturers(), fetchVendorTypes()]);
  loading.value = false;
}

// Unified Vendors
const unifiedVendors = computed(() => {
  const sups = suppliersList.value.map((s) => {
    const ownerFromContact = s.contacts?.find((c: any) => c.designation === "মালিক");
    const managerFromContact = s.contacts?.find((c: any) => c.designation?.includes("ম্যানেজার") || c.designation?.includes("কর্মচারী"));
    return {
      ...s,
      compositeId: `supplier_${s.id}`,
      type: "supplier",
      vendorType: s.vendorType || "supplier",
      isActive: s.isActive !== false && s.is_active !== false,
      mobile: s.mobile || "",
      address: s.address || "",
      ownerName: s.ownerName || s.owner_name || ownerFromContact?.name || s.contactPerson || s.contact_person || "",
      ownerMobile: s.ownerMobile || s.owner_mobile || ownerFromContact?.mobile || "",
      managerName: s.managerName || s.manager_name || managerFromContact?.name || (s.contacts && s.contacts[1]?.name) || "",
      managerMobile: s.managerMobile || s.manager_mobile || managerFromContact?.mobile || (s.contacts && s.contacts[1]?.mobile) || ""
    };
  });

  const manus = manufacturersList.value.map((m) => {
    const ownerFromContact = m.contacts?.find((c: any) => c.designation === "মালিক");
    const managerFromContact = m.contacts?.find((c: any) => c.designation?.includes("ম্যানেজার") || c.designation?.includes("কর্মচারী"));
    return {
      ...m,
      compositeId: `manufacturer_${m.id}`,
      type: "manufacturer",
      vendorType: m.vendorType || "manufacturer",
      isActive: m.isActive !== false && m.is_active !== false,
      mobile: m.mobile || "",
      address: m.factoryAddress || m.factory_address || m.country || "",
      ownerName: m.ownerName || m.owner_name || ownerFromContact?.name || m.contactPerson || m.contact_person || "",
      ownerMobile: m.ownerMobile || m.owner_mobile || ownerFromContact?.mobile || "",
      managerName: m.managerName || m.manager_name || managerFromContact?.name || (m.contacts && m.contacts[1]?.name) || "",
      managerMobile: m.managerMobile || m.manager_mobile || managerFromContact?.mobile || (m.contacts && m.contacts[1]?.mobile) || ""
    };
  });

  return [...sups, ...manus].sort((a, b) => b.id - a.id);
});

const supplierCount = computed(() => suppliersList.value.length);
const manufacturerCount = computed(() => manufacturersList.value.length);

const filteredVendors = computed(() => {
  let list = unifiedVendors.value;

  if (activeFilter.value !== "all") {
    list = list.filter((v) => {
      const vt = v.vendorType || v.type;
      return vt === activeFilter.value || (isManufacturer(activeFilter.value) && isManufacturer(vt)) || (!isManufacturer(activeFilter.value) && !isManufacturer(vt) && (activeFilter.value === "supplier" || vt === "supplier"));
    });
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter((v) => {
      const matchName = v.name?.toLowerCase().includes(q);
      const matchMobile = v.mobile?.includes(q);
      const matchOwner = v.ownerName?.toLowerCase().includes(q) || v.ownerMobile?.includes(q);
      const matchManager = v.managerName?.toLowerCase().includes(q) || v.managerMobile?.includes(q);
      const matchAddress = v.address?.toLowerCase().includes(q);
      return matchName || matchMobile || matchOwner || matchManager || matchAddress;
    });
  }

  return list;
});

// Toggle Status Function
async function toggleStatus(v: any) {
  const newStatus = !v.isActive;
  togglingStatusId.value = v.compositeId;
  try {
    if (v.type === "supplier") {
      await axios.put(`/api/inventory/suppliers/${v.id}`, { isActive: newStatus });
    } else {
      await axios.put(`/api/inventory/manufacturers/${v.id}`, { isActive: newStatus });
    }
    v.isActive = newStatus;
    showToast(`স্টেটাস সফলভাবে ${newStatus ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`, "success");
  } catch (err: any) {
    showToast(err.response?.data?.message || "স্টেটাস পরিবর্তন ব্যর্থ হয়েছে", "danger");
  } finally {
    togglingStatusId.value = null;
  }
}

// Submit Vendor (Create or Update)
async function submitVendorForm() {
  if (!form.name || !form.name.trim()) {
    showToast("প্রতিষ্ঠানের নাম আবশ্যক", "danger");
    return;
  }
  if (!isOrgMobileValid.value) {
    orgMobileTouched.value = true;
    showToast("প্রতিষ্ঠানের সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন", "danger");
    return;
  }
  if (form.ownerMobile && !isOwnerMobileValid.value) {
    ownerMobileTouched.value = true;
    showToast("মালিকের সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন", "danger");
    return;
  }
  if (form.managerMobile && !isManagerMobileValid.value) {
    managerMobileTouched.value = true;
    showToast("ম্যানেজার/কর্মচারীর সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন", "danger");
    return;
  }

  const contacts = [
    ...(form.ownerName || form.ownerMobile ? [{ name: form.ownerName.trim(), designation: "মালিক", mobile: form.ownerMobile.trim() }] : []),
    ...(form.managerName || form.managerMobile ? [{ name: form.managerName.trim(), designation: "ম্যানেজার/কর্মচারী", mobile: form.managerMobile.trim() }] : [])
  ];

  submitting.value = true;
  try {
    const payload = {
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      address: form.address.trim(),
      ownerName: form.ownerName.trim(),
      ownerMobile: form.ownerMobile.trim(),
      managerName: form.managerName.trim(),
      managerMobile: form.managerMobile.trim(),
      contactPerson: form.ownerName.trim() || form.managerName.trim() || "",
      vendorType: form.type,
      contacts
    };

    if (isEditing.value && editingVendor.value) {
      // Edit Mode (Organization name is unchanged on server)
      if (!isManufacturer(form.type)) {
        const res = await axios.put(`/api/inventory/suppliers/${editingVendor.value.id}`, payload);
        showToast(res.data?.message || "তথ্য সফলভাবে আপডেট করা হয়েছে", "success");
        await fetchSuppliers();
      } else {
        const res = await axios.put(`/api/inventory/manufacturers/${editingVendor.value.id}`, {
          ...payload,
          country: "বাংলাদেশ",
          factoryAddress: form.address.trim()
        });
        showToast(res.data?.message || "তথ্য সফলভাবে আপডেট করা হয়েছে", "success");
        await fetchManufacturers();
      }
      cancelEdit();
    } else {
      // Create Mode
      if (!isManufacturer(form.type)) {
        const res = await axios.post("/api/inventory/suppliers", payload);
        showToast(res.data?.message || `${getVendorTypeName(form.type)} সফলভাবে যোগ করা হয়েছে`, "success");
        await fetchSuppliers();
      } else {
        const res = await axios.post("/api/inventory/manufacturers", {
          ...payload,
          country: "বাংলাদেশ",
          factoryAddress: form.address.trim()
        });
        showToast(res.data?.message || `${getVendorTypeName(form.type)} সফলভাবে যোগ করা হয়েছে`, "success");
        await fetchManufacturers();
      }
      resetForm();
      switchView("list");
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || "কার্যক্রম সম্পন্ন করতে ব্যর্থ হয়েছে", "danger");
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  fetchAll();
});
</script>

<style scoped lang="scss">
.vendor-form-card {
  border-top: 3px solid #dc3545 !important;
  transition: border-color 0.2s ease;
}

.vendor-form-edit-mode {
  border-top: 3px solid #0d6efd !important;
}

.locked-input {
  background-color: var(--bs-tertiary-bg, #f8f9fa) !important;
  cursor: not-allowed;
  color: var(--bs-secondary-color, #6c757d) !important;
  border-style: dashed !important;
}

/* Mobile input validation tick mark */
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
  pointer-events: none;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  line-height: 1;
  animation: checkPop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes checkPop {
  0% {
    transform: translateY(-50%) scale(0.5);
    opacity: 0;
  }
  100% {
    transform: translateY(-50%) scale(1);
    opacity: 1;
  }
}

/* Ellipsis for auto-hiding long text */
.single-row-input {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

/* Table Header (Light mode default) */
.vendor-table-header th {
  background-color: var(--bs-tertiary-bg, #f8f9fa);
  color: var(--bs-secondary-color, #64748b);
  border-bottom: 1px solid var(--bs-border-color, #dee2e6);
  font-weight: 600;
  font-size: 0.8125rem;
}

/* Adaptive Cell Colors (Light mode default) */
.vendor-index-cell {
  color: #64748b;
}
.vendor-name-cell {
  color: #1e293b;
  letter-spacing: -0.01em;
}
.vendor-person-name {
  color: #1e293b;
}
.vendor-mobile-cell {
  color: #334155;
}
.vendor-address-cell {
  color: #64748b;
}
.vendor-empty-cell {
  color: #94a3b8;
}

/* Type Badges (Light mode default) */
.vendor-badge-supplier {
  background-color: #e0edff !important;
  color: #0d6efd !important;
  border: 1px solid #bdd7ff !important;
}
.vendor-badge-manufacturer {
  background-color: #fef3c7 !important;
  color: #92400e !important;
  border: 1px solid #fde68a !important;
}

/* Inactive Row (Light mode default) */
.vendor-row-inactive {
  opacity: 0.52;
  background-color: rgba(0, 0, 0, 0.02) !important;
  transition: opacity 0.2s ease, background-color 0.2s ease;
  &:hover {
    opacity: 0.85;
  }
  .vendor-name-cell,
  .vendor-person-name,
  .vendor-mobile-cell {
    color: #64748b !important;
  }
}

/* Action Buttons Styling */
.action-btn {
  border-radius: 0.25rem;
  transition: all 0.15s ease-in-out;
  line-height: 1.2;
  &:hover {
    transform: translateY(-1px);
  }
}

/* Modal Backdrop & Defaults (Light mode) */
.vendor-details-modal-backdrop {
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  z-index: 1055;
}

.vendor-modal-content {
  background-color: #ffffff;
  color: #1e293b;
}
.vendor-modal-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}
.vendor-modal-title {
  color: #1e293b;
}
.vendor-modal-summary {
  background-color: #f8f9fa;
  border: 1px solid #e2e8f0;
}
.vendor-modal-vendor-name {
  color: #0f172a;
}
.vendor-modal-subtle {
  color: #64748b;
}
.vendor-modal-list {
  border: 1px solid #e2e8f0;
  .list-group-item {
    background-color: #ffffff;
    border-color: #e2e8f0;
    color: #1e293b;
  }
}
.vendor-modal-label {
  color: #64748b;
}
.vendor-modal-val {
  color: #1e293b;
}
.vendor-modal-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

/* Balanced placeholder styling (Light mode) */
::placeholder,
.form-control::placeholder,
input::placeholder {
  color: #94a3b8 !important;
  opacity: 0.9 !important;
}

/* Unified Filter Tabs & Search Box Styling */
.filter-tabs-wrapper {
  display: inline-flex;
  align-items: center;
  background-color: var(--bs-tertiary-bg, rgba(0, 0, 0, 0.03));
  border: 1px solid var(--bs-border-color, #d9dee3);
  border-radius: 0.375rem;
  padding: 2px;
  height: 31px;
  box-sizing: border-box;
}

.filter-tab-btn {
  border: none;
  background: transparent;
  color: var(--bs-secondary-color, #6c757d);
  font-size: 0.78rem;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 0.25rem;
  transition: all 0.15s ease-in-out;
  line-height: 1.4;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  height: 25px;
  cursor: pointer;

  &:hover {
    color: #dc3545;
    background-color: rgba(220, 53, 69, 0.08);
  }

  &.active {
    background-color: #dc3545;
    color: #ffffff !important;
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(220, 53, 69, 0.25);
  }
}

.search-input-unified {
  height: 31px;
  border: 1px solid var(--bs-border-color, #d9dee3) !important;
  border-radius: 0.375rem !important;
  font-size: 0.8125rem;

  &:focus {
    border-color: #dc3545 !important;
    box-shadow: 0 0 0 0.15rem rgba(220, 53, 69, 0.2) !important;
  }
}
</style>

<!-- Unscoped SCSS for Dark Mode to guarantee 100% selector power over modals and body themes -->
<style lang="scss">
.theme-dark,
[data-bs-theme="dark"] {
  /* Vendors Page Cards */
  .vendors-page {
    .card {
      background-color: #1b1b1f !important;
      border-color: #2b2b2b !important;
      color: #e5e5e5 !important;
    }

    .card-header {
      border-color: #2b2b2b !important;
    }

    /* Form Inputs - Pure Neutral Dark (Zero Blue) */
    .form-control,
    .form-select {
      background-color: #121212 !important;
      border-color: #333333 !important;
      color: #f0f0f0 !important;

      &:hover {
        border-color: #484848 !important;
      }

      &:focus {
        background-color: #121212 !important;
        border-color: #dc3545 !important;
        box-shadow: 0 0 0 0.15rem rgba(220, 53, 69, 0.25) !important;
        color: #ffffff !important;
      }

      &::placeholder {
        color: #808080 !important;
        opacity: 0.9 !important;
      }
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

    /* Table Header */
    .vendor-table-header th {
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

    .vendor-name-cell {
      color: #ffffff !important;
    }

    .vendor-person-name {
      color: #f0f0f0 !important;
    }

    .vendor-mobile-cell {
      color: #cccccc !important;
    }

    .vendor-address-cell {
      color: #999999 !important;
    }

    .vendor-index-cell {
      color: #888888 !important;
    }

    .vendor-empty-cell {
      color: #666666 !important;
    }

    /* Inactive Row in Dark Mode */
    .vendor-row-inactive {
      opacity: 0.42 !important;
      background-color: rgba(255, 255, 255, 0.015) !important;

      .vendor-name-cell,
      .vendor-person-name,
      .vendor-mobile-cell {
        color: #666666 !important;
      }

      &:hover {
        opacity: 0.85 !important;
      }
    }

    /* Badges in Dark Mode */
    .vendor-badge-supplier {
      background-color: rgba(59, 142, 237, 0.2) !important;
      color: #70aaff !important;
      border: 1px solid rgba(59, 142, 237, 0.4) !important;
    }

    .vendor-badge-manufacturer {
      background-color: rgba(245, 158, 11, 0.2) !important;
      color: #fbbf24 !important;
      border: 1px solid rgba(245, 158, 11, 0.4) !important;
    }

    /* Filter Tabs & Search Box - Neutral Dark */
    .filter-tabs-wrapper {
      background-color: #141416 !important;
      border-color: #2e2e2e !important;
    }

    .filter-tab-btn {
      color: #999999 !important;

      &:hover {
        color: #dc3545 !important;
        background-color: rgba(220, 53, 69, 0.12) !important;
      }

      &.active {
        color: #ffffff !important;
        background-color: #dc3545 !important;
      }
    }

    .search-input-unified {
      background-color: #121212 !important;
      border-color: #333333 !important;
      color: #f0f0f0 !important;

      &:focus {
        background-color: #121212 !important;
        border-color: #dc3545 !important;
        box-shadow: 0 0 0 0.15rem rgba(220, 53, 69, 0.25) !important;
      }

      &::placeholder {
        color: #808080 !important;
      }
    }
  }

  /* ========================================================
     MODAL DARK THEME - Neutral Dark (Zero Blue)
     ======================================================== */
  .vendor-details-modal-backdrop {
    .vendor-modal-content {
      background-color: #1b1b1f !important;
      color: #f0f0f0 !important;
      border: 1px solid #2e2e2e !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8) !important;
    }

    .vendor-modal-header {
      background-color: #151517 !important;
      border-bottom: 1px solid #262626 !important;

      .vendor-modal-title {
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

    .vendor-modal-body {
      background-color: #1b1b1f !important;
    }

    /* Modal Top Summary Card */
    .vendor-modal-summary {
      background-color: #141416 !important;
      border: 1px solid #262626 !important;

      .vendor-modal-vendor-name {
        color: #ffffff !important;
      }
      .vendor-modal-subtle {
        color: #909090 !important;
      }
    }

    /* Modal List Items */
    .vendor-modal-list {
      border: 1px solid #262626 !important;

      .list-group-item {
        background-color: #151517 !important;
        border-color: #222222 !important;
        color: #f0f0f0 !important;

        /* Left labels */
        .vendor-modal-label {
          color: #999999 !important;
        }

        /* Right values (Bright White & Clear) */
        .vendor-modal-val {
          color: #ffffff !important;
        }

        .text-danger {
          color: #ff6b6b !important;
        }
      }
    }

    /* Modal Footer */
    .vendor-modal-footer {
      background-color: #151517 !important;
      border-top: 1px solid #262626 !important;

      .vendor-modal-cancel-btn {
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
