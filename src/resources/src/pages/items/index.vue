<template>
  <div class="items-page">
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

    <!-- Top Card: আইটেম এন্ট্রি ফর্ম (সাব-ক্যাটাগরি ও সাইজ দিলে অটো আইটেম তৈরি হবে) -->
    <div
      class="card border shadow-sm mb-3 item-form-card"
      :class="{ 'item-form-edit-mode': isEditing }">
      <div class="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between py-2">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-tag-fill text-warning fs-5"></i>
          <h6 class="m-0 fw-bold">
            {{ isEditing ? 'পণ্য তথ্য সম্পাদনা' : 'নতুন পণ্য তৈরি করুন' }}
          </h6>
          <span
            v-if="isEditing"
            class="badge bg-primary-subtle text-primary border border-primary-subtle small">
            এডিটিং মোড
          </span>
        </div>
      </div>

      <div class="card-body p-3">
        <form @submit.prevent="submitForm">
          <!-- ৭ কলামে মূল ফিল্ডগুলো: ১. ক্যাটাগরি, ২. সাব-ক্যাটাগরি, ৩. সাইজ, ৪. পণ্যের নাম, ৫. পণ্য কোড, ৬. একক, ৭. প্রারম্ভিক স্টক -->
          <div class="row g-2 mb-3 align-items-start item-create-row">
            <!-- ১. ক্যাটাগরি -->
            <div class="col-12 col-sm-6 col-md-4 col-item-cat">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="ক্যাটাগরি">
                ক্যাটাগরি <span class="text-danger">*</span>
              </label>
              <Select
                v-model="form.categoryId"
                :options="categoriesList"
                placeholder="ক্যাটাগরি নির্বাচন করুন"
                :searchable="true"
                @change="onCategoryChange" />
            </div>

            <!-- ২. সাব-ক্যাটাগরি -->
            <div class="col-12 col-sm-6 col-md-4 col-item-subcat">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="সাব-ক্যাটাগরি">
                সাব-ক্যাটাগরি <span class="text-danger">*</span>
              </label>
              <Select
                v-model="form.subCategoryId"
                :options="filteredSubCategories"
                :disabled="!form.categoryId"
                :placeholder="form.categoryId ? 'সাব-ক্যাটাগরি নির্বাচন করুন' : 'আগে ক্যাটাগরি দিন'"
                :searchable="true"
                @change="onSubCategoryChange" />
            </div>

            <!-- ৩. ধরন (সাব-ক্যাটাগরির পরে, ক্যাটাগরি ও সাব-ক্যাটাগরির উপর নির্ভরশীল) -->
            <div class="col-6 col-sm-6 col-md-4 col-item-type">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="ধরন">
                ধরন
              </label>
              <Select
                v-model="form.productTypeId"
                :options="filteredProductTypesList"
                :disabled="!form.subCategoryId"
                :placeholder="!form.categoryId ? 'আগে ক্যাটাগরি দিন' : !form.subCategoryId ? 'আগে সাব-ক্যাটাগরি দিন' : filteredProductTypesList.length === 0 ? 'ধরন নেই' : 'ধরন নির্বাচন করুন'"
                :searchable="true"
                @change="onProductTypeChange" />
            </div>

            <!-- ৪. সাইজ (ধরনের পরে) -->
            <div class="col-6 col-sm-6 col-md-4 col-item-size">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="সাইজ">
                সাইজ <span class="text-danger">*</span>
              </label>
              <Select
                v-model="form.sizeId"
                :options="filteredSizesList"
                :disabled="!form.subCategoryId"
                :placeholder="form.subCategoryId ? 'সাইজ নির্বাচন করুন' : 'আগে সাব-ক্যাটাগরি দিন'"
                :searchable="true"
                @change="onSizeChange" />
            </div>

            <!-- ৫. ব্র্যান্ড (সাইজের পরে) -->
            <div class="col-6 col-sm-6 col-md-4 col-item-brand">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="ব্র্যান্ড">
                ব্র্যান্ড <span class="text-danger">*</span>
              </label>
              <Select
                v-model="form.brandId"
                :options="brandsList"
                :disabled="!form.subCategoryId"
                :placeholder="form.subCategoryId ? 'ব্র্যান্ড নির্বাচন করুন' : 'আগে সাব-ক্যাটাগরি দিন'"
                :searchable="true"
                @change="onBrandChange" />
            </div>

            <!-- ৬. পণ্যের নাম -->
            <div class="col-12 col-sm-12 col-md-8 col-item-name">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="পণ্যের নাম">
                পণ্যের নাম <span class="text-danger">*</span>
              </label>
              <input
                v-model.trim="form.name"
                type="text"
                class="form-control form-control-sm single-row-input"
                :class="{ 'frozen-input': !form.categoryId }"
                :placeholder="!form.categoryId ? 'আগে ক্যাটাগরি দিন' : !form.subCategoryId ? 'আগে সাব-ক্যাটাগরি দিন' : 'পণ্যের নাম দিন'"
                required />
            </div>

            <!-- ৭. পণ্য কোড -->
            <div class="col-6 col-sm-6 col-md-4 col-item-code">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="কোম্পানীর অভ্যন্তরীণ পণ্য কোড">
                পণ্য কোড <span class="text-danger">*</span>
              </label>
              <input
                v-model.trim="form.code"
                type="text"
                class="form-control form-control-sm single-row-input font-monospace frozen-input"
                readonly
                tabindex="-1"
                placeholder="পণ্য কোড"
                required />
            </div>

            <!-- ৮. পরিমাপের একক -->
            <div class="col-6 col-sm-6 col-md-4 col-item-unit">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="একক (Unit)">
                একক (Unit) <span class="text-danger">*</span>
              </label>
              <Select
                v-model="form.unitId"
                :options="filteredUnitsList"
                :disabled="!form.categoryId || !form.subCategoryId"
                :placeholder="!form.categoryId ? 'আগে ক্যাটাগরি দিন' : !form.subCategoryId ? 'আগে সাব-ক্যাটাগরি দিন' : filteredUnitsList.length === 0 ? 'একক নেই' : 'একক নির্বাচন করুন'"
                :searchable="true">
                <template #option="option">
                  <span>{{ option.name }} {{ option.shortName ? `(${option.shortName})` : '' }}</span>
                </template>
                <template #selected-option="option">
                  <span>{{ option.name }} {{ option.shortName ? `(${option.shortName})` : '' }}</span>
                </template>
              </Select>
            </div>

            <!-- ৯. ডিজাইন কোড (একই পণ্যের প্রতি ডিজাইনে DGN কোড স্থির থাকবে, "নতুন?" চেক করলে নতুন কোড হবে) -->
            <div class="col-6 col-sm-6 col-md-4 col-item-design-code">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <label class="form-label small fw-semibold mb-0 text-truncate" title="ডিজাইন কোড">
                  ডিজাইন কোড <span class="text-danger">*</span>
                </label>
                <label v-if="!isEditing" class="small text-primary fw-semibold m-0 cursor-pointer d-flex align-items-center gap-1" title="টিক দিলে পরবর্তী নতুন ডিজাইন কোড তৈরি হবে" style="font-size: 0.72rem;">
                  <input
                    type="checkbox"
                    v-model="isNewDesign"
                    class="form-check-input m-0 cursor-pointer"
                    style="width: 13px; height: 13px;"
                    @change="onNewDesignToggle" />
                  <span>নতুন?</span>
                </label>
              </div>
              <input
                v-model.trim="form.designCode"
                list="existingDesignCodesList"
                type="text"
                class="form-control form-control-sm single-row-input font-monospace fw-bold text-primary"
                placeholder="DGN001"
                @input="onDesignCodeInput"
                required />
              <datalist id="existingDesignCodesList">
                <option v-for="dCode in availableDesignCodes" :key="dCode" :value="dCode" />
              </datalist>
            </div>

            <!-- ১০. প্রারম্ভিক স্টক -->
            <div class="col-6 col-sm-6 col-md-4 col-item-stock">
              <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="প্রারম্ভিক স্টক">
                প্রারম্ভিক স্টক
              </label>
              <input
                v-model.number="form.stockQuantity"
                type="number"
                min="0"
                class="form-control form-control-sm single-row-input text-end"
                placeholder="0" />
            </div>

            <!-- ৮. ছবি সংযুক্তি (সুপারএডমিন পলিসি অনুযায়ী) -->
            <div class="col-12 col-sm-12 col-md-4 col-item-image">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <label class="form-label small fw-semibold mb-0 text-truncate" title="পণ্যের ছবি">
                  ছবি <span class="text-muted fw-normal" style="font-size: 0.72rem;">({{ mediaConfig.uploadMode === 'google_drive' ? 'ড্রাইভ লিংক' : (mediaConfig.uploadMode === 'direct_upload' ? 'আপলোড' : 'আপলোড / লিংক') }})</span>
                </label>
                <div v-if="form.imageUrl" class="d-flex align-items-center gap-1">
                  <span class="badge bg-success-subtle text-success py-0 px-1 border" style="font-size: 0.65rem;">সংযুক্ত</span>
                  <button type="button" class="btn btn-link p-0 text-danger text-decoration-none" title="ছবি সরান" @click="form.imageUrl = ''" style="font-size: 0.7rem; line-height: 1;">
                    <i class="bi bi-x-circle-fill"></i>
                  </button>
                </div>
              </div>

              <!-- Option A: Direct upload only -->
              <div v-if="mediaConfig.uploadMode === 'direct_upload'" class="d-flex align-items-center gap-1">
                <label class="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center gap-1 flex-grow-1 single-row-input text-truncate mb-0 cursor-pointer shadow-none" :class="{ 'disabled': uploadingImage }">
                  <span v-if="uploadingImage" class="spinner-border spinner-border-sm" role="status"></span>
                  <i v-else class="bi bi-cloud-arrow-up"></i>
                  <span class="small">{{ uploadingImage ? 'আপলোড হচ্ছে...' : (form.imageUrl ? 'ছবি পরিবর্তন' : 'ছবি বেছে নিন') }}</span>
                  <input type="file" accept="image/*" class="d-none" :disabled="uploadingImage" @change="handleFileUpload" />
                </label>
              </div>

              <!-- Option B: Google drive / Web link only -->
              <div v-else-if="mediaConfig.uploadMode === 'google_drive'" class="input-group input-group-sm">
                <input
                  v-model.trim="form.imageUrl"
                  type="text"
                  class="form-control form-control-sm single-row-input font-monospace"
                  placeholder="গুগল ড্রাইভ বা ইমেজ লিংক পেস্ট করুন"
                  style="font-size: 0.78rem;" />
              </div>

              <!-- Option C: Both (Hybrid) -->
              <div v-else class="input-group input-group-sm">
                <input
                  v-model.trim="form.imageUrl"
                  type="text"
                  class="form-control form-control-sm single-row-input font-monospace"
                  placeholder="ড্রাইভ লিংক অথবা আপলোড করুন"
                  style="font-size: 0.78rem;" />
                <label class="btn btn-outline-secondary d-flex align-items-center px-2 single-row-input mb-0 cursor-pointer shadow-none" title="পিসি/মোবাইল থেকে সরাসরি আপলোড" :class="{ 'disabled': uploadingImage }">
                  <span v-if="uploadingImage" class="spinner-border spinner-border-sm" role="status"></span>
                  <i v-else class="bi bi-upload"></i>
                  <input type="file" accept="image/*" class="d-none" :disabled="uploadingImage" @change="handleFileUpload" />
                </label>
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
              class="btn btn-sm px-3 item-btn-reset"
              @click="resetForm">
              রিসেট
            </button>
            <button
              type="submit"
              class="btn btn-sm px-3 d-inline-flex align-items-center gap-1 shadow-sm item-btn-submit"
              :class="isEditing ? 'btn-primary' : ''"
              :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i v-else :class="isEditing ? 'bi bi-arrow-repeat' : 'bi bi-check-circle'"></i>
              <span>{{ isEditing ? 'আপডেট করুন' : 'সংরক্ষণ করুন' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Bottom Card: পণ্যের তালিকা (ফিল্টার + টেবিল) -->
    <div class="card border shadow-sm">
      <div class="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2 py-2">
        <div class="d-flex align-items-center gap-2">
          <h6 class="m-0 fw-bold">সকল পণ্যের তালিকা</h6>
          <span class="badge bg-secondary-subtle text-secondary border">
            {{ toBengaliNumber(filteredItems.length) }} টি
          </span>
        </div>

        <!-- ফিল্টার বার -->
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <!-- ১. ক্যাটাগরি ফিল্টার -->
          <div style="min-width: 140px;">
            <select
              v-model="categoryFilter"
              class="form-select form-select-sm search-input-unified"
              @change="onCategoryFilterChange">
              <option value="all">সকল ক্যাটাগরি</option>
              <option v-for="cat in categoriesList" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- ২. সাব-ক্যাটাগরি ফিল্টার -->
          <div style="min-width: 150px;">
            <select
              v-model="subCategoryFilter"
              class="form-select form-select-sm search-input-unified">
              <option value="all">সকল সাব-ক্যাটাগরি</option>
              <option v-for="sub in subCategoriesForFilter" :key="sub.id" :value="sub.id">
                {{ sub.name }}
              </option>
            </select>
          </div>

          <!-- ২.১ ধরন ফিল্টার -->
          <div style="min-width: 140px;">
            <select
              v-model="typeFilter"
              class="form-select form-select-sm search-input-unified">
              <option value="all">সকল ধরন</option>
              <option v-for="t in typesForFilter" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
            </select>
          </div>

          <!-- ৩. সাইজ ফিল্টার -->
          <div style="min-width: 120px;">
            <select
              v-model="sizeFilter"
              class="form-select form-select-sm search-input-unified">
              <option value="all">সকল সাইজ</option>
              <option v-for="s in uniqueSizesForFilter" :key="s" :value="s">
                {{ s }}
              </option>
            </select>
          </div>

          <!-- ৩.১ ব্র্যান্ড ফিল্টার -->
          <div style="min-width: 130px;">
            <select
              v-model="brandFilter"
              class="form-select form-select-sm search-input-unified">
              <option value="all">সকল ব্র্যান্ড</option>
              <option v-for="b in brandsList" :key="b.id" :value="b.id">
                {{ b.name }}
              </option>
            </select>
          </div>

          <!-- ৪. সার্চ বক্স -->
          <div class="position-relative" style="min-width: 170px;">
            <input
              v-model.trim="searchQuery"
              type="text"
              class="form-control form-control-sm ps-4 search-input-unified"
              placeholder="পণ্য খুঁজুন..." />
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted small pe-none"></i>
            <button
              v-if="searchQuery"
              type="button"
              class="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-2"
              @click="searchQuery = ''">
              <i class="bi bi-x"></i>
            </button>
          </div>

          <!-- ৫. ফিল্টার রিসেট বাটন (সংরক্ষণ বাটনের মতো সলিড সেকেন্ডারি ব্যাকগ্রাউন্ড ও সর্বদা সক্রিয় অবস্থা) -->
          <button
            type="button"
            class="btn btn-sm btn-secondary d-inline-flex align-items-center justify-content-center shadow-sm filter-reset-btn"
            title="সকল ফিল্টার রিসেট করুন"
            @click="resetAllFilters">
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
        </div>
      </div>

      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-secondary" role="status">
            <span class="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <div class="text-muted small mt-2">পণ্যের তালিকা লোড হচ্ছে...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredItems.length === 0" class="text-center py-5">
          <i class="bi bi-tag text-muted fs-1 mb-2 d-block"></i>
          <p class="text-muted mb-0">
            {{ isFiltered ? 'অনুসন্ধানের সাথে কোনো পণ্য মেলেনি।' : 'এখনো কোনো পণ্য তৈরি করা হয়নি।' }}
          </p>
        </div>

        <!-- Table View: #, ক্যাটাগরি, সাব-ক্যাটাগরি, পণ্যের নাম, কোড, সাইজ, একক, স্টেটাস, একশন -->
        <div v-else class="table-responsive items-table-container">
          <table class="table table-hover align-middle mb-0">
            <thead class="item-table-header">
              <tr class="small">
                <th style="width: 45px;" class="text-center">#</th>
                <th style="width: 9%;">ক্যাটাগরি</th>
                <th style="width: 9%;">সাব-ক্যাটাগরি</th>
                <th style="width: 8%;">ধরন</th>
                <th style="width: 9%;">ব্র্যান্ড</th>
                <th style="width: 17%;">পণ্যের নাম</th>
                <th style="width: 9%;">পণ্য কোড</th>
                <th style="width: 8%;" class="text-center">ডিজাইন কোড</th>
                <th style="width: 7%;">সাইজ</th>
                <th style="width: 7%;">একক</th>
                <th style="width: 7%;" class="text-end">স্টক</th>
                <th style="width: 75px;" class="text-center">স্টেটাস</th>
                <th style="width: 65px;" class="text-center">একশন</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in paginatedItems"
                :key="item.id"
                :class="{ 'item-row-inactive': !item.isActive }">
                <td class="text-center item-index-cell small">{{ (currentPage - 1) * perPage + index + 1 }}</td>

                <!-- ১. ক্যাটাগরি (রেগুলার ফন্ট) -->
                <td>
                  <span class="item-cell-text item-category-cell">
                    {{ item.category?.name || '-' }}
                  </span>
                </td>

                <!-- ২. সাব-ক্যাটাগরি (রেগুলার ফন্ট) -->
                <td>
                  <span class="item-cell-text item-subcategory-cell">
                    {{ item.subCategory?.name || '-' }}
                  </span>
                </td>

                <!-- ২.১ ধরন -->
                <td>
                  <span class="item-cell-text">
                    {{ item.productType?.name || '-' }}
                  </span>
                </td>

                <!-- ২.১ ব্র্যান্ড (রেগুলার ফন্ট) -->
                <td>
                  <span class="item-cell-text">
                    {{ item.brand?.name || '-' }}
                  </span>
                </td>

                <!-- ৩. পণ্যের নাম (রেগুলার ফন্ট) -->
                <td>
                  <span class="item-cell-text item-name-cell">
                    {{ item.name }}
                  </span>
                </td>

                <!-- ৪. কোড (আলাদা কলাম) -->
                <td>
                  <span class="item-cell-text font-monospace small">
                    {{ item.code || '-' }}
                  </span>
                </td>

                <!-- ৫. ডিজাইন কোড -->
                <td class="text-center">
                  <span class="badge bg-light text-primary border font-monospace small px-2 py-0.5">
                    {{ item.designCode || 'DGN001' }}
                  </span>
                </td>

                <!-- ৬. সাইজ (রেগুলার ফন্ট) -->
                <td>
                  <span class="item-cell-text">
                    {{ item.size?.name || '-' }}
                  </span>
                </td>

                <!-- ৬. একক (রেগুলার ফন্ট) -->
                <td>
                  <span class="item-cell-text">
                    {{ item.unit?.name || (item.unit?.shortName ? item.unit.shortName : '-') }}
                  </span>
                </td>

                <!-- ৭. স্টক -->
                <td class="text-end">
                  <span class="item-cell-text fw-medium">
                    {{ toBengaliNumber(item.stockQuantity ?? item.stock_quantity ?? 0) }}
                  </span>
                </td>

                <!-- ৮. স্টেটাস টগল (কোনো টেক্সট ছাড়া) -->
                <td class="text-center">
                  <div class="form-check form-switch d-inline-flex justify-content-center m-0 align-middle">
                    <input
                      class="form-check-input my-0"
                      type="checkbox"
                      role="switch"
                      :checked="item.isActive"
                      :disabled="togglingStatusId === item.id"
                      :title="item.isActive ? 'নিষ্ক্রিয় করতে টগল করুন' : 'সক্রিয় করতে টগল করুন'"
                      @change="toggleStatus(item)"
                      style="cursor: pointer; width: 2.1rem; height: 1.15rem;" />
                  </div>
                </td>

                <!-- একশন (... বাটনে এডিট ও ভিউ ইমেইজ) -->
                <td class="text-center position-relative" @click.stop>
                  <div class="dropdown d-inline-block">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary py-0 px-2 shadow-none action-dots-btn"
                      title="অ্যাকশন"
                      @click.stop="toggleActionMenu(item.id)">
                      <i class="bi bi-three-dots"></i>
                    </button>
                    <ul
                      v-if="openActionMenuId === item.id"
                      class="dropdown-menu dropdown-menu-end show shadow-sm py-1 border position-absolute"
                      :style="getDropdownStyle(index)">
                      <li>
                        <button
                          type="button"
                          class="dropdown-item py-1.5 px-3 small d-flex align-items-center gap-2"
                          @click.stop="startEdit(item); openActionMenuId = null">
                          <i class="bi bi-pencil text-primary"></i>
                          <span>এডিট পণ্য</span>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          class="dropdown-item py-1.5 px-3 small d-flex align-items-center gap-2"
                          @click.stop="openImageViewModal(item); openActionMenuId = null">
                          <i class="bi bi-eye text-info"></i>
                          <span>ভিউ ইমেজ</span>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          class="dropdown-item py-1.5 px-3 small d-flex align-items-center gap-2"
                          @click.stop="openImageEditModal(item); openActionMenuId = null">
                          <i class="bi bi-camera text-success"></i>
                          <span>এডিট ইমেজ</span>
                        </button>
                      </li>
                      <!-- ৪. ডিলেট পণ্য (শুধুমাত্র ক্রয় না হওয়া পণ্যের ক্ষেত্রে) -->
                      <li v-if="!item.hasPurchases && (!item.totalPurchased || Number(item.totalPurchased) <= 0)">
                        <hr class="dropdown-divider my-1" />
                        <button
                          type="button"
                          class="dropdown-item py-1.5 px-3 small d-flex align-items-center gap-2 text-danger"
                          @click.stop="confirmDeleteItem(item); openActionMenuId = null">
                          <i class="bi bi-trash"></i>
                          <span>পণ্য ডিলেট</span>
                        </button>
                      </li>
                    </ul>
                  </div>
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
        <Pagination :data="paginationData" variant="secondary" :hide-details="true" @change="(p) => currentPage = p" />
      </div>
    </div>
    <!-- ভিউ ইমেইজ পপআপ মডাল -->
    <div
      v-if="showImageModal && imageModalItem"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.65); z-index: 1060;"
      @click.self="closeImageViewModal">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow-lg border-0 overflow-hidden">
          <div class="modal-header py-2 px-3 border-bottom bg-light">
            <h6 class="modal-title fw-bold d-flex align-items-center gap-2 mb-0">
              <i class="bi bi-image-fill text-primary"></i>
              <span>{{ imageModalItem.name }} ({{ imageModalItem.designCode || 'DGN001' }})</span>
            </h6>
            <button
              type="button"
              class="btn-close shadow-none"
              aria-label="Close"
              @click="closeImageViewModal"></button>
          </div>
          <div class="modal-body p-3 text-center bg-body-tertiary">
            <img
              :src="imageModalItem.imageUrl"
              :alt="imageModalItem.name"
              class="img-fluid rounded border shadow-sm mx-auto d-block"
              style="max-height: 65vh; max-width: 100%; object-fit: contain; background: #fff;" />
          </div>
          <div class="modal-footer py-2 px-3 border-top d-flex justify-content-between align-items-center bg-light">
            <div class="d-flex align-items-center gap-2">
              <a
                v-if="imageModalItem.imageUrl"
                :href="imageModalItem.imageUrl"
                target="_blank"
                class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 shadow-none">
                <i class="bi bi-box-arrow-up-right"></i>
                <span>আসল লিংকে দেখুন</span>
              </a>
              <button
                type="button"
                class="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 shadow-none"
                @click="openImageEditModal(imageModalItem)">
                <i class="bi bi-camera"></i>
                <span>ছবি এডিট করুন</span>
              </button>
            </div>
            <button
              type="button"
              class="btn btn-sm btn-secondary shadow-none px-3"
              @click="closeImageViewModal">
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- এডিট ইমেইজ মডাল -->
    <div
      v-if="showEditImageModal && editImageItem"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.65); z-index: 1065;"
      @click.self="closeImageEditModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header py-2.5 px-3 border-bottom bg-light">
            <h6 class="modal-title fw-bold d-flex align-items-center gap-2 mb-0">
              <i class="bi bi-camera-fill text-primary"></i>
              <span>ছবি সম্পাদনা / পরিবর্তন</span>
            </h6>
            <button
              type="button"
              class="btn-close shadow-none"
              aria-label="Close"
              @click="closeImageEditModal"></button>
          </div>
          <div class="modal-body p-3">
            <div class="mb-3">
              <div class="fw-semibold small text-dark mb-1">
                {{ editImageItem.name }}
              </div>
              <div class="text-muted small">
                পণ্য কোড: <span class="font-monospace fw-bold">{{ editImageItem.code || '-' }}</span> |
                ডিজাইন কোড: <span class="badge bg-light text-primary border font-monospace">{{ editImageItem.designCode || 'DGN001' }}</span>
              </div>
            </div>

            <!-- বর্তমান ছবি প্রিভিউ -->
            <div class="text-center p-3 mb-3 bg-light rounded border position-relative">
              <div v-if="editImageUrl" class="position-relative d-inline-block">
                <img
                  :src="editImageUrl"
                  alt="প্রিভিউ"
                  class="img-fluid rounded border shadow-sm"
                  style="max-height: 180px; max-width: 100%; object-fit: contain; background: #fff;" />
                <button
                  type="button"
                  class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm"
                  style="width: 24px; height: 24px;"
                  title="ছবি মুছুন"
                  @click="editImageUrl = ''">
                  <i class="bi bi-x fs-6"></i>
                </button>
              </div>
              <div v-else class="text-muted py-3">
                <i class="bi bi-image text-secondary fs-1 d-block mb-1"></i>
                <span class="small">
                  {{ mediaConfig.uploadMode === 'google_drive' ? 'কোনো ছবি নেই। নিচে গুগল ড্রাইভ বা ইমেজ লিংক দিন।' : (mediaConfig.uploadMode === 'direct_upload' ? 'কোনো ছবি নেই। নিচে ডিভাইস থেকে ছবি আপলোড করুন।' : 'কোনো ছবি নেই। নিচের অপশন থেকে ছবি আপলোড বা লিংক দিন।') }}
                </span>
              </div>
            </div>

            <!-- সুপার এডমিন পলিসি অনুযায়ী অপশন প্রদর্শন -->
            <!-- কেস ১: শুধুমাত্র সরাসরি ফাইল আপলোড (direct_upload) -->
            <div v-if="mediaConfig.uploadMode === 'direct_upload'">
              <label class="form-label small fw-semibold mb-1 d-flex align-items-center justify-content-between">
                <span>ডিভাইস থেকে ছবি আপলোড করুন</span>
                <span class="text-muted small">(সর্বোচ্চ {{ mediaConfig.maxFileSizeMb }}MB)</span>
              </label>
              <div class="input-group input-group-sm">
                <input
                  type="file"
                  accept="image/*"
                  class="form-control"
                  :disabled="uploadingModalImage || savingImage"
                  @change="handleModalFileUpload" />
                <span v-if="uploadingModalImage" class="input-group-text bg-white">
                  <span class="spinner-border spinner-border-sm text-primary" role="status"></span>
                </span>
              </div>
            </div>

            <!-- কেস ২: শুধুমাত্র গুগল ড্রাইভ বা ইমেজ লিংক (google_drive) -->
            <div v-else-if="mediaConfig.uploadMode === 'google_drive'">
              <label class="form-label small fw-semibold mb-1">
                গুগল ড্রাইভ বা ইমেজ লিংক পেস্ট করুন
              </label>
              <input
                v-model.trim="editImageUrl"
                type="text"
                class="form-control form-control-sm font-monospace"
                placeholder="গুগল ড্রাইভ বা ইমেজ লিংক পেস্ট করুন"
                :disabled="savingImage" />
            </div>

            <!-- কেস ৩: উভয় অপশন অনুমোদিত (both) -->
            <div v-else>
              <div class="mb-3">
                <label class="form-label small fw-semibold mb-1 d-flex align-items-center justify-content-between">
                  <span>১. ডিভাইস থেকে ছবি আপলোড করুন</span>
                  <span class="text-muted small">(সর্বোচ্চ {{ mediaConfig.maxFileSizeMb }}MB)</span>
                </label>
                <div class="input-group input-group-sm">
                  <input
                    type="file"
                    accept="image/*"
                    class="form-control"
                    :disabled="uploadingModalImage || savingImage"
                    @change="handleModalFileUpload" />
                  <span v-if="uploadingModalImage" class="input-group-text bg-white">
                    <span class="spinner-border spinner-border-sm text-primary" role="status"></span>
                  </span>
                </div>
              </div>

              <div class="text-center text-muted small my-2 fw-semibold">অথবা</div>

              <div>
                <label class="form-label small fw-semibold mb-1">
                  ২. গুগল ড্রাইভ বা সরাসরি ইমেজ লিংক পেস্ট করুন
                </label>
                <input
                  v-model.trim="editImageUrl"
                  type="text"
                  class="form-control form-control-sm font-monospace"
                  placeholder="https://drive.google.com/... বা ছবির সরাসরি লিংক"
                  :disabled="savingImage" />
              </div>
            </div>
          </div>
          <div class="modal-footer py-2 px-3 border-top d-flex justify-content-between align-items-center bg-light">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary px-3"
              :disabled="savingImage"
              @click="closeImageEditModal">
              বাতিল
            </button>
            <button
              type="button"
              class="btn btn-sm btn-primary px-3 d-inline-flex align-items-center gap-1 shadow-sm"
              :disabled="savingImage || uploadingModalImage"
              @click="saveItemImage">
              <span v-if="savingImage" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i v-else class="bi bi-check-circle"></i>
              <span>সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
import Select from "@/components/Select.vue";
import Pagination from "@/components/datatable/Pagination.vue";
import { notifyCatalogUpdated, onCatalogUpdated } from "@/helpers/catalog-sync";

// Bengali Number Formatter
function toBengaliNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined || num === "") return "০";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/[0-9]/g, (w) => bengaliDigits[+w]);
}

// Toast
const toast = reactive({
  show: false,
  message: "",
  type: "success" as "success" | "danger" | "warning" | "info"
});

function showToast(message: string, type: "success" | "danger" | "warning" | "info" = "success") {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 3500);
}

// State
const loading = ref(false);
const submitting = ref(false);
const togglingStatusId = ref<number | null>(null);

// Catalog Lists
const categoriesList = ref<any[]>([]);
const allSubCategoriesList = ref<any[]>([]);
const allProductTypesList = ref<any[]>([]);
const allSizesList = ref<any[]>([]);
const colorsList = ref<any[]>([]);
const unitsList = ref<any[]>([]);
const brandsList = ref<any[]>([]);
const itemsList = ref<any[]>([]);

// Edit State
const isEditing = ref(false);
const editingItem = ref<any>(null);

// Form
const form = reactive({
  categoryId: "" as string | number,
  subCategoryId: "" as string | number,
  productTypeId: "" as string | number,
  sizeId: "" as string | number,
  brandId: "" as string | number,
  name: "",
  code: "",
  designCode: "DGN001",
  imageUrl: "",
  unitId: "" as string | number,
  stockQuantity: 0
});

// New Design State
const isNewDesign = ref(false);

// Media & Storage Settings from Super Admin Policy
const mediaConfig = ref<{
  uploadMode: "both" | "direct_upload" | "google_drive";
  maxFileSizeMb: number;
  allowedExtensions: string;
}>({
  uploadMode: "both",
  maxFileSizeMb: 5,
  allowedExtensions: "jpg, jpeg, png, webp, gif"
});

const uploadingImage = ref(false);

// Action Menu State (Three dots dropdown)
const openActionMenuId = ref<number | null>(null);

function toggleActionMenu(id: number) {
  openActionMenuId.value = openActionMenuId.value === id ? null : id;
}

function closeActionMenu() {
  openActionMenuId.value = null;
}

function getDropdownStyle(index: number) {
  // If there are at least 4 items and this item is near the bottom, open upwards
  const openUp = paginatedItems.value.length >= 4 && index >= paginatedItems.value.length - 2;
  if (openUp) {
    return "min-width: 145px; z-index: 1060; right: 4px; bottom: 100%; margin-bottom: 4px;";
  }
  return "min-width: 145px; z-index: 1060; right: 4px; top: 100%; margin-top: 4px;";
}

// Image View Modal State
const showImageModal = ref(false);
const imageModalItem = ref<any>(null);

function openImageViewModal(item: any) {
  if (!item.imageUrl) {
    showToast("এই পণ্যে ছবি নেই, এখান থেকেই ছবি যুক্ত করুন", "info");
    openImageEditModal(item);
    return;
  }
  imageModalItem.value = item;
  showImageModal.value = true;
}

function closeImageViewModal() {
  showImageModal.value = false;
  imageModalItem.value = null;
}

// Edit Image Modal State
const showEditImageModal = ref(false);
const editImageItem = ref<any>(null);
const editImageUrl = ref("");
const uploadingModalImage = ref(false);
const savingImage = ref(false);

function openImageEditModal(item: any) {
  if (showImageModal.value) showImageModal.value = false;
  editImageItem.value = item;
  editImageUrl.value = item.imageUrl || "";
  showEditImageModal.value = true;
}

function closeImageEditModal() {
  showEditImageModal.value = false;
  editImageItem.value = null;
  editImageUrl.value = "";
}

async function handleModalFileUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const maxBytes = (mediaConfig.value.maxFileSizeMb || 5) * 1024 * 1024;
  if (file.size > maxBytes) {
    showToast(`ফাইলের আকার সর্বোচ্চ ${mediaConfig.value.maxFileSizeMb}MB হতে পারবে`, "warning");
    return;
  }

  uploadingModalImage.value = true;
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post("/api/inventory/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    if (res.data?.url) {
      editImageUrl.value = res.data.url;
      showToast("ছবি আপলোড হয়েছে, সংরক্ষণে ক্লিক করুন", "success");
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || "ছবি আপলোড ব্যর্থ হয়েছে", "danger");
  } finally {
    uploadingModalImage.value = false;
    input.value = "";
  }
}

async function saveItemImage() {
  if (!editImageItem.value) return;
  savingImage.value = true;
  try {
    const url = editImageUrl.value?.trim() || null;
    await axios.put(`/api/inventory/items/${editImageItem.value.id}`, {
      imageUrl: url
    });
    editImageItem.value.imageUrl = url;
    const found = itemsList.value.find((it: any) => it.id === editImageItem.value.id);
    if (found) found.imageUrl = url;
    showToast("পণ্যের ছবি সফলভাবে আপডেট করা হয়েছে", "success");
    closeImageEditModal();
    notifyCatalogUpdated("item");
  } catch (err: any) {
    showToast(err.response?.data?.message || "ছবি সংরক্ষণ ব্যর্থ হয়েছে", "danger");
  } finally {
    savingImage.value = false;
  }
}

/**
 * পণ্যের ডিজাইন কোড লজিক:
 * - ডিফল্টভাবে একই সাব-ক্যাটাগরি, ব্র্যান্ড ও ধরনের সর্বশেষ ব্যবহৃত ডিজাইন কোড বহাল থাকবে।
 * - ইউজার "নতুন?" অপশনে টিক দিলে তবেই পরবর্তী নতুন ইউনিক ডিজাইন কোড (DGN...) তৈরি হবে।
 */
function getMatchingProductItems(subCatId?: string | number, productTypeId?: string | number, brandId?: string | number): any[] {
  if (!subCatId) return [];
  return itemsList.value.filter((it: any) => {
    const itSub = it.subCategoryId || it.subCategory?.id;
    if (!itSub || String(itSub) !== String(subCatId)) {
      return false;
    }
    if (productTypeId) {
      const itType = it.productTypeId || it.productType?.id;
      if (!itType || String(itType) !== String(productTypeId)) {
        return false;
      }
    }
    if (brandId) {
      const itBrand = it.brandId || it.brand?.id;
      if (!itBrand || String(itBrand) !== String(brandId)) {
        return false;
      }
    }
    return true;
  });
}

function getExistingDesignCodes(subCatId?: string | number, productTypeId?: string | number, brandId?: string | number): string[] {
  const matching = getMatchingProductItems(subCatId, productTypeId, brandId);
  const codesSet = new Set<string>();
  for (const it of matching) {
    const code = (it.designCode || "").trim().toUpperCase();
    if (code) codesSet.add(code);
  }
  return Array.from(codesSet).sort();
}

function getLatestDesignCode(subCatId?: string | number, productTypeId?: string | number, brandId?: string | number): string {
  const matching = getMatchingProductItems(subCatId, productTypeId, brandId);
  if (matching.length === 0) return "DGN001";

  let maxSeq = 0;
  for (const it of matching) {
    const code = it.designCode || "";
    const m = code.match(/DGN(\d+)/i) || (it.name ? it.name.match(/DGN(\d+)/i) : null);
    if (m) {
      const num = parseInt(m[1], 10);
      if (num > maxSeq) maxSeq = num;
    }
  }
  if (maxSeq === 0) return "DGN001";
  return `DGN${String(maxSeq).padStart(3, "0")}`;
}

function computeNextDesignCode(subCatId?: string | number, productTypeId?: string | number, brandId?: string | number): string {
  if (!subCatId) return "DGN001";
  const matching = getMatchingProductItems(subCatId, productTypeId, brandId);
  if (matching.length === 0) return "DGN001";

  let maxSeq = 0;
  for (const it of matching) {
    const code = it.designCode || "";
    const m = code.match(/DGN(\d+)/i) || (it.name ? it.name.match(/DGN(\d+)/i) : null);
    if (m) {
      const num = parseInt(m[1], 10);
      if (num > maxSeq) maxSeq = num;
    } else {
      maxSeq++;
    }
  }

  const nextSeq = Math.max(maxSeq + 1, matching.length + 1);
  return `DGN${String(nextSeq).padStart(3, "0")}`;
}

const availableDesignCodes = computed(() => {
  if (!form.subCategoryId) return [];
  return getExistingDesignCodes(form.subCategoryId, form.productTypeId, form.brandId);
});

function onNewDesignToggle() {
  if (isNewDesign.value) {
    form.designCode = computeNextDesignCode(form.subCategoryId, form.productTypeId, form.brandId);
  } else {
    form.designCode = getLatestDesignCode(form.subCategoryId, form.productTypeId, form.brandId);
  }
  updateAutoItemName();
}

function onDesignCodeInput() {
  if (isEditing.value) return;
  const subCat = allSubCategoriesList.value.find(
    (s: any) => String(s.id) === String(form.subCategoryId)
  );
  const typeObj = allProductTypesList.value.find(
    (t: any) => String(t.id) === String(form.productTypeId)
  );
  const brandObj = brandsList.value.find(
    (b: any) => String(b.id) === String(form.brandId)
  );
  if (!subCat) return;

  const activeDesignCode = (form.designCode || "DGN001").trim();
  const parts = [subCat.name.trim()];
  if (typeObj?.name && typeObj.name.trim()) {
    parts.push(typeObj.name.trim());
  }
  if (brandObj?.name && brandObj.name.trim()) {
    parts.push(brandObj.name.trim());
  }
  parts.push(activeDesignCode);
  form.name = parts.join("_");
}

async function confirmDeleteItem(item: any) {
  if (!item || !item.id) return;
  const itemName = item.name || "এই পণ্যটি";
  if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${itemName}" মুছে ফেলতে চান?\n(যেহেতু পণ্যটি এখনও ক্রয় করা হয়নি, তাই এটি সম্পূর্ণ মুছে ফেলা সম্ভব)`)) {
    return;
  }
  try {
    const res = await axios.delete(`/api/inventory/items/${item.id}`);
    showToast(res.data?.message || "পণ্য সফলভাবে মুছে ফেলা হয়েছে", "success");
    notifyCatalogUpdated("item");
    await fetchItems();
  } catch (err: any) {
    showToast(err.response?.data?.message || "পণ্য মুছে ফেলতে ব্যর্থ হয়েছে", "danger");
  }
}

async function fetchMediaConfig() {
  try {
    const res = await axios.get("/api/inventory/media-config");
    if (res.data?.data) {
      mediaConfig.value = {
        uploadMode: res.data.data.uploadMode || "both",
        maxFileSizeMb: res.data.data.maxFileSizeMb || 5,
        allowedExtensions: res.data.data.allowedExtensions || "jpg, jpeg, png, webp, gif"
      };
    }
  } catch {
    // default to both
  }
}

async function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const maxBytes = (mediaConfig.value.maxFileSizeMb || 5) * 1024 * 1024;
  if (file.size > maxBytes) {
    showToast(`ফাইলের আকার সর্বোচ্চ ${mediaConfig.value.maxFileSizeMb}MB হতে পারবে`, "warning");
    return;
  }

  uploadingImage.value = true;
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post("/api/inventory/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    if (res.data?.url) {
      form.imageUrl = res.data.url;
      showToast("ছবি সফলভাবে আপলোড হয়েছে", "success");
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || "ছবি আপলোড ব্যর্থ হয়েছে", "danger");
  } finally {
    uploadingImage.value = false;
    input.value = "";
  }
}

// Flag to indicate if name was auto-generated
const isAutoGenerated = ref(false);

// Filtered Subcategories based on selected category (in Form)
const filteredSubCategories = computed(() => {
  if (!form.categoryId) return [];
  return allSubCategoriesList.value.filter(
    (s: any) => String(s.categoryId) === String(form.categoryId)
  );
});

// Filtered Product Types ("ধরন") based on category and subcategory (in Form)
const filteredProductTypesList = computed(() => {
  if (!form.subCategoryId) return [];
  return allProductTypesList.value.filter(
    (pt: any) =>
      (!form.categoryId || String(pt.categoryId) === String(form.categoryId)) &&
      String(pt.subCategoryId) === String(form.subCategoryId) &&
      (pt.isActive ?? true)
  );
});

// Filtered Sizes based on selected category / subcategory or all sizes
const filteredSizesList = computed(() => {
  if (form.subCategoryId) {
    const matched = allSizesList.value.filter(
      (s: any) => String(s.subCategoryId) === String(form.subCategoryId)
    );
    if (matched.length > 0) return matched;
  }
  if (form.categoryId) {
    const matched = allSizesList.value.filter(
      (s: any) => String(s.categoryId) === String(form.categoryId)
    );
    if (matched.length > 0) return matched;
  }
  return allSizesList.value;
});

// Filtered Units based on selected category & subcategory (or general units if none assigned)
const filteredUnitsList = computed(() => {
  let list: any[] = [];

  if (form.subCategoryId) {
    const matched = unitsList.value.filter(
      (u: any) => String(u.subCategoryId) === String(form.subCategoryId) && (u.isActive ?? true)
    );
    if (matched.length > 0) list = matched;
  }

  if (list.length === 0 && form.categoryId) {
    const matched = unitsList.value.filter(
      (u: any) => String(u.categoryId) === String(form.categoryId) && (u.isActive ?? true)
    );
    if (matched.length > 0) list = matched;
  }

  if (list.length === 0) {
    const unassigned = unitsList.value.filter(
      (u: any) => !u.categoryId && !u.subCategoryId && (u.isActive ?? true)
    );
    list = unassigned.length > 0 ? unassigned : unitsList.value.filter((u: any) => u.isActive ?? true);
  }

  // Deduplicate by name & shortName to guarantee no duplicate unit options appear in dropdown
  const seen = new Set<string>();
  return list.filter((u: any) => {
    const key = `${(u.name || "").trim().toLowerCase()}_${(u.shortName || "").trim().toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
});

/**
 * অটো আইটেম তৈরির লজিক:
 * পণ্যের নাম তৈরি হওয়ার সময় ডিজাইন কোড যুক্ত হবে: "[সাব-ক্যাটাগরি] [ডিজাইন কোড] সাইজ-[সাইজ]"
 * যেমন: "এপ্রোন DGN001 সাইজ-ফ্রি", "ক্যাপ DGN001 সাইজ-ফ্রি", "টি-শার্ট DGN002 সাইজ-L" ইত্যাদি
 */
/**
 * অটো আইটেম তৈরির লজিক:
 * পণ্যের নাম: সাবক্যাটাগরি_ব্রান্ড_ডিজাইন কোড যা সম্পূর্ণ ইউনিক হবে।
 * উদাহরণ: "এপ্রোন_বাটা_DGN001", "টি-শার্ট_ইজি_DGN002"
 */
function updateAutoItemName() {
  if (isEditing.value) return;

  const subCat = allSubCategoriesList.value.find(
    (s: any) => String(s.id) === String(form.subCategoryId)
  );
  const typeObj = allProductTypesList.value.find(
    (t: any) => String(t.id) === String(form.productTypeId)
  );
  const brandObj = brandsList.value.find(
    (b: any) => String(b.id) === String(form.brandId)
  );

  if (!subCat) return;

  if (isNewDesign.value) {
    form.designCode = computeNextDesignCode(form.subCategoryId, form.productTypeId, form.brandId);
  } else if (!form.designCode || form.designCode === "DGN001") {
    form.designCode = getLatestDesignCode(form.subCategoryId, form.productTypeId, form.brandId);
  }

  const activeDesignCode = (form.designCode || "DGN001").trim();

  // Format: [সাব-ক্যাটাগরি]_[ধরন]_[ব্র্যান্ড]_[ডিজাইন কোড]
  // উদাহরণ: "পোলো শার্ট (কলার)_লাকস্ট_সি জি ফ্যাশন_DGN001"
  const parts = [subCat.name.trim()];
  if (typeObj?.name && typeObj.name.trim()) {
    parts.push(typeObj.name.trim());
  }
  if (brandObj?.name && brandObj.name.trim()) {
    parts.push(brandObj.name.trim());
  }
  parts.push(activeDesignCode);

  form.name = parts.join("_");
  isAutoGenerated.value = true;
}

function onCategoryChange() {
  form.subCategoryId = "";
  form.productTypeId = "";
  form.sizeId = "";
  form.name = "";
  isNewDesign.value = false;
  form.designCode = "DGN001";
  form.unitId = "";
  if (!form.code) {
    form.code = generateNextProductCode();
  }
  isAutoGenerated.value = false;
}

function onSubCategoryChange() {
  form.productTypeId = "";
  form.sizeId = "";
  if (!form.code) {
    form.code = generateNextProductCode();
  }
  if (isNewDesign.value) {
    form.designCode = computeNextDesignCode(form.subCategoryId, form.productTypeId, form.brandId);
  } else {
    form.designCode = getLatestDesignCode(form.subCategoryId, form.productTypeId, form.brandId);
  }
  updateAutoItemName();
  if (filteredUnitsList.value.length === 1 && !form.unitId) {
    form.unitId = filteredUnitsList.value[0].id;
  }
}

function onProductTypeChange() {
  if (isNewDesign.value) {
    form.designCode = computeNextDesignCode(form.subCategoryId, form.productTypeId, form.brandId);
  } else {
    form.designCode = getLatestDesignCode(form.subCategoryId, form.productTypeId, form.brandId);
  }
  updateAutoItemName();
}

function onSizeChange() {
  if (!form.code) {
    form.code = generateNextProductCode();
  }
  // Auto-select unit if exactly 1 matching unit exists for this subcategory/category and unit isn't selected
  if (filteredUnitsList.value.length === 1 && !form.unitId) {
    form.unitId = filteredUnitsList.value[0].id;
  }
}

function onBrandChange() {
  if (isNewDesign.value) {
    form.designCode = computeNextDesignCode(form.subCategoryId, form.productTypeId, form.brandId);
  } else {
    form.designCode = getLatestDesignCode(form.subCategoryId, form.productTypeId, form.brandId);
  }
  updateAutoItemName();
}

watch(
  () => [form.subCategoryId, form.productTypeId, form.brandId],
  () => {
    if (!isEditing.value && form.subCategoryId) {
      updateAutoItemName();
    }
  }
);

function resetForm() {
  form.categoryId = "";
  form.subCategoryId = "";
  form.productTypeId = "";
  form.sizeId = "";
  form.brandId = "";
  form.name = "";
  form.code = generateNextProductCode();
  isNewDesign.value = false;
  form.designCode = "DGN001";
  form.imageUrl = "";
  form.unitId = "";
  form.stockQuantity = 0;
  isAutoGenerated.value = false;
}

function startEdit(item: any) {
  isEditing.value = true;
  editingItem.value = item;
  isNewDesign.value = false;
  form.categoryId = item.categoryId || (item.category ? item.category.id : "");
  form.subCategoryId = item.subCategoryId || (item.subCategory ? item.subCategory.id : "");
  form.productTypeId = item.productTypeId || (item.productType ? item.productType.id : "");
  form.sizeId = item.sizeId || (item.size ? item.size.id : "");
  form.brandId = item.brandId || (item.brand ? item.brand.id : "");
  form.name = item.name || "";
  form.code = item.code || "";
  form.designCode = item.designCode || "DGN001";
  form.imageUrl = item.imageUrl || "";
  form.unitId = item.unitId || (item.unit ? item.unit.id : "");
  form.stockQuantity = Number(item.stockQuantity || item.stock_quantity || 0);
  isAutoGenerated.value = false;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
  isEditing.value = false;
  editingItem.value = null;
  resetForm();
}

// Filters State
const categoryFilter = ref("all");
const subCategoryFilter = ref("all");
const typeFilter = ref("all");
const sizeFilter = ref("all");
const brandFilter = ref("all");
const searchQuery = ref("");

const isFiltered = computed(() => {
  return (
    categoryFilter.value !== "all" ||
    subCategoryFilter.value !== "all" ||
    typeFilter.value !== "all" ||
    sizeFilter.value !== "all" ||
    brandFilter.value !== "all" ||
    searchQuery.value.trim().length > 0
  );
});

const subCategoriesForFilter = computed(() => {
  if (categoryFilter.value === "all") return allSubCategoriesList.value;
  return allSubCategoriesList.value.filter(
    (s: any) => String(s.categoryId) === String(categoryFilter.value)
  );
});

const typesForFilter = computed(() => {
  let list = allProductTypesList.value;
  if (categoryFilter.value !== "all") {
    list = list.filter((t: any) => String(t.categoryId) === String(categoryFilter.value));
  }
  if (subCategoryFilter.value !== "all") {
    list = list.filter((t: any) => String(t.subCategoryId) === String(subCategoryFilter.value));
  }
  return list;
});

const uniqueSizesForFilter = computed(() => {
  const set = new Set<string>();
  itemsList.value.forEach((item) => {
    if (item.size?.name) set.add(item.size.name);
  });
  return Array.from(set);
});

function onCategoryFilterChange() {
  subCategoryFilter.value = "all";
  typeFilter.value = "all";
}

function resetAllFilters() {
  categoryFilter.value = "all";
  subCategoryFilter.value = "all";
  typeFilter.value = "all";
  sizeFilter.value = "all";
  brandFilter.value = "all";
  searchQuery.value = "";
}

// Filtered Items
const filteredItems = computed(() => {
  let list = itemsList.value;

  // 1. Category Filter
  if (categoryFilter.value !== "all") {
    list = list.filter(
      (item) =>
        String(item.categoryId) === String(categoryFilter.value) ||
        String(item.category?.id) === String(categoryFilter.value)
    );
  }

  // 2. Sub-category Filter
  if (subCategoryFilter.value !== "all") {
    list = list.filter(
      (item) =>
        String(item.subCategoryId) === String(subCategoryFilter.value) ||
        String(item.subCategory?.id) === String(subCategoryFilter.value)
    );
  }

  // 2.1 Product Type Filter (ধরন)
  if (typeFilter.value !== "all") {
    list = list.filter(
      (item) =>
        String(item.productTypeId) === String(typeFilter.value) ||
        String(item.productType?.id) === String(typeFilter.value)
    );
  }

  // 3. Size Filter
  if (sizeFilter.value !== "all") {
    list = list.filter((item) => item.size?.name === sizeFilter.value);
  }

  // 3.1 Brand Filter
  if (brandFilter.value !== "all") {
    list = list.filter(
      (item) =>
        String(item.brandId) === String(brandFilter.value) ||
        String(item.brand?.id) === String(brandFilter.value)
    );
  }

  // 4. Search Query Filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter((item) => {
      const matchName = item.name?.toLowerCase().includes(q);
      const matchCode = item.code?.toLowerCase().includes(q);
      const matchCat = item.category?.name?.toLowerCase().includes(q);
      const matchSub = item.subCategory?.name?.toLowerCase().includes(q);
      const matchType = item.productType?.name?.toLowerCase().includes(q);
      const matchBrand = item.brand?.name?.toLowerCase().includes(q);
      return matchName || matchCode || matchCat || matchSub || matchType || matchBrand;
    });
  }

  return list;
});

// Pagination State (স্ক্রলবার পরিহার করতে প্রতি পেজে নির্দিষ্ট সংখ্যক আইটেম)
const perPage = ref(7);
const currentPage = ref(1);

// ফিল্টার বা সার্চ পরিবর্তন হলে প্রথম পেজে ফেরত যাওয়া
watch([categoryFilter, subCategoryFilter, typeFilter, sizeFilter, brandFilter, searchQuery], () => {
  currentPage.value = 1;
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
    onPageChange: (p: number) => {
      currentPage.value = p;
    },
    links: [
      {
        url: currentPage.value > 1 ? `#page-${currentPage.value - 1}` : null,
        page: Math.max(1, currentPage.value - 1),
        label: "&laquo; পূর্ববর্তী",
        active: false,
        onClick: () => {
          if (currentPage.value > 1) currentPage.value--;
        }
      },
      ...Array.from({ length: lastPage }, (_, i) => ({
        url: `#page-${i + 1}`,
        page: i + 1,
        label: toBengaliNumber(i + 1),
        active: currentPage.value === i + 1,
        onClick: () => {
          currentPage.value = i + 1;
        }
      })),
      {
        url: currentPage.value < lastPage ? `#page-${currentPage.value + 1}` : null,
        page: Math.min(lastPage, currentPage.value + 1),
        label: "পরবর্তী &raquo;",
        active: false,
        onClick: () => {
          if (currentPage.value < lastPage) currentPage.value++;
        }
      }
    ]
  };
});

// Toggle Status
async function toggleStatus(item: any) {
  togglingStatusId.value = item.id;
  const newStatus = !item.isActive;
  try {
    const res = await axios.put(`/api/inventory/items/${item.id}`, {
      isActive: newStatus
    });
    item.isActive = newStatus;
    showToast(
      res.data?.message || (newStatus ? "পণ্য সক্রিয় করা হয়েছে" : "পণ্য নিষ্ক্রিয় করা হয়েছে"),
      "success"
    );
  } catch (err: any) {
    showToast(err.response?.data?.message || "স্টেটাস পরিবর্তন ব্যর্থ হয়েছে", "danger");
  } finally {
    togglingStatusId.value = null;
  }
}

// Submit Form (Create or Update)
async function submitForm() {
  if (!form.categoryId) {
    showToast("ক্যাটাগরি নির্বাচন করা আবশ্যক", "warning");
    return;
  }
  if (!form.subCategoryId) {
    showToast("সাব-ক্যাটাগরি নির্বাচন করা আবশ্যক", "warning");
    return;
  }
  if (!form.sizeId) {
    showToast("সাইজ নির্বাচন করা আবশ্যক", "warning");
    return;
  }
  if (!form.name.trim()) {
    showToast("পণ্যের নাম আবশ্যক", "warning");
    return;
  }
  if (!form.code.trim()) {
    showToast("পণ্য কোড / বারকোড আবশ্যক", "warning");
    return;
  }
  if (!form.unitId) {
    showToast("পরিমাপের একক নির্বাচন করা আবশ্যক (ক্রয়, বিক্রয় ও স্টক ব্যবস্থাপনার ভিত্তি)", "warning");
    return;
  }

  // Duplicate Check: একই সাব-ক্যাটাগরি, ব্র্যান্ড, ধরন, ডিজাইন কোড ও সাইজ ইতিমধ্যে আছে কিনা পরীক্ষা
  const currentDesignCode = (form.designCode || "DGN001").trim().toUpperCase();
  const duplicateItem = itemsList.value.find((it: any) => {
    if (isEditing.value && editingItem.value && Number(it.id) === Number(editingItem.value.id)) {
      return false;
    }
    const itSub = it.subCategoryId ?? it.subCategory?.id;
    if (!itSub || String(itSub) !== String(form.subCategoryId)) return false;

    const itBrand = it.brandId ?? it.brand?.id ?? "";
    if (String(itBrand) !== String(form.brandId || "")) return false;

    const itType = it.productTypeId ?? it.productType?.id ?? "";
    if (String(itType) !== String(form.productTypeId || "")) return false;

    const itSize = it.sizeId ?? it.size?.id;
    if (!itSize || String(itSize) !== String(form.sizeId)) return false;

    const itDgn = (it.designCode || "DGN001").trim().toUpperCase();
    return itDgn === currentDesignCode;
  });

  if (duplicateItem) {
    const sizeObj = allSizesList.value.find((s: any) => String(s.id) === String(form.sizeId));
    const sizeName = sizeObj ? sizeObj.name : "এই";
    showToast(`সতর্কতা: এই পণ্যের (${sizeName}) সাইজটি ইতিমধ্যে "${currentDesignCode}" ডিজাইন কোডে সংরক্ষিত আছে! একই পণ্য পুনরায় তৈরি করা যাবে না।`, "warning");
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      designCode: currentDesignCode,
      imageUrl: form.imageUrl?.trim() || null,
      categoryId: Number(form.categoryId),
      subCategoryId: Number(form.subCategoryId),
      productTypeId: form.productTypeId ? Number(form.productTypeId) : null,
      sizeId: Number(form.sizeId),
      brandId: form.brandId ? Number(form.brandId) : null,
      unitId: Number(form.unitId),
      stockQuantity: Number(form.stockQuantity || 0)
    };

    if (isEditing.value && editingItem.value) {
      const res = await axios.put(`/api/inventory/items/${editingItem.value.id}`, payload);
      showToast(res.data?.message || "পণ্য সফলভাবে আপডেট হয়েছে", "success");
      cancelEdit();
      notifyCatalogUpdated("item");
    } else {
      const res = await axios.post("/api/inventory/items", payload);
      const sizeObj = allSizesList.value.find((s: any) => String(s.id) === String(form.sizeId));
      const sizeName = sizeObj ? ` (${sizeObj.name} সাইজ)` : "";
      showToast(res.data?.message || `পণ্য সফলভাবে তৈরি হয়েছে${sizeName}`, "success");

      // পরবর্তী সাইজ দ্রুত যুক্ত করার সুবিধার্থে ক্যাটাগরি, সাব-ক্যাটাগরি, ব্র্যান্ড ও ডিজাইন কোড বহাল রাখা
      form.sizeId = "";
      form.code = generateNextProductCode();
      form.stockQuantity = 0;
      isNewDesign.value = false;
      updateAutoItemName();
      notifyCatalogUpdated("item");
    }
    await fetchItems();
  } catch (err: any) {
    showToast(err.response?.data?.message || "সংরক্ষণ ব্যর্থ হয়েছে", "danger");
  } finally {
    submitting.value = false;
  }
}

// Fetch Catalog Data (Categories, Sub-categories, Sizes, Colors, Units)
async function fetchCatalogData() {
  try {
    const masterRes = await axios.get("/api/catalog/master");
    const data = masterRes.data?.data || {};
    categoriesList.value = data.categories || [];
    allSubCategoriesList.value = data.subCategories || [];
    allProductTypesList.value = data.productTypes || [];
    allSizesList.value = data.sizes || [];
    colorsList.value = data.colors || [];
    unitsList.value = data.units || [];
  } catch {
    try {
      const [catRes, subRes, typeRes] = await Promise.all([
        axios.get("/api/catalog/categories"),
        axios.get("/api/catalog/sub-categories"),
        axios.get("/api/catalog/product-types")
      ]);
      categoriesList.value = catRes.data?.data || [];
      allSubCategoriesList.value = subRes.data?.data || [];
      allProductTypesList.value = typeRes.data?.data || [];
    } catch {
      // Fallback
    }
  }
}

// Fetch Brands
async function fetchBrands() {
  try {
    const res = await axios.get("/api/inventory/brands");
    brandsList.value = res.data?.data || [];
  } catch {
    brandsList.value = [];
  }
}

// Fetch Items
async function fetchItems() {
  loading.value = true;
  try {
    const res = await axios.get("/api/inventory/items");
    itemsList.value = res.data?.data || [];
  } catch (err: any) {
    showToast(err.response?.data?.message || "আইটেম তালিকা লোড করা যায়নি", "danger");
  } finally {
    loading.value = false;
  }
}

// Company Settings Prefix
const productPrefix = ref("PRD-");

function generateNextProductCode(): string {
  const nextNum = itemsList.value.length + 1;
  return `${productPrefix.value}${nextNum}`;
}

async function fetchCompanySettings() {
  try {
    const res = await axios.get("/api/company/profile");
    if (res.data?.data?.productPrefix) {
      productPrefix.value = res.data.data.productPrefix;
    }
  } catch {
    productPrefix.value = "PRD-";
  }
}

let cleanupCatalogSync: (() => void) | null = null;

onMounted(async () => {
  await Promise.all([fetchCompanySettings(), fetchCatalogData(), fetchBrands(), fetchItems(), fetchMediaConfig()]);
  if (!isEditing.value) {
    form.code = generateNextProductCode();
  }

  window.addEventListener("click", closeActionMenu);

  cleanupCatalogSync = onCatalogUpdated(async () => {
    await Promise.all([fetchCatalogData(), fetchBrands()]);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("click", closeActionMenu);
  if (cleanupCatalogSync) {
    cleanupCatalogSync();
    cleanupCatalogSync = null;
  }
});
</script>

<style scoped>
.items-page {
  font-family: inherit;
}

.item-form-card {
  border-top: 3px solid #d97706 !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.text-warning {
  color: #b45309 !important;
}

.item-form-edit-mode {
  border-top: 3px solid #0d6efd !important;
  border-color: rgba(13, 110, 253, 0.45) !important;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.08) !important;
}

.single-row-input {
  height: 31px;
  line-height: 1.2;
}

/* Responsive layout for 11-column item creation row */
@media (min-width: 992px) {
  .item-create-row {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    margin-left: -0.25rem;
    margin-right: -0.25rem;
  }
  .item-create-row > [class*="col-"] {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }
  /* ১১-কলাম বিশিষ্ট এন্ট্রি রো (ডানের স্পেস অপটিমাইজড ও সাব-ক্যাটাগরি বর্ধিত) */
  .item-create-row .col-item-cat {
    flex: 0 0 8.5%;
    max-width: 8.5%;
  }
  .item-create-row .col-item-subcat {
    flex: 0 0 14%;
    max-width: 14%;
  }
  .item-create-row .col-item-type {
    flex: 0 0 8%;
    max-width: 8%;
  }
  .item-create-row .col-item-size {
    flex: 0 0 7%;
    max-width: 7%;
  }
  .item-create-row .col-item-brand {
    flex: 0 0 8%;
    max-width: 8%;
  }
  .item-create-row .col-item-name {
    flex: 0 0 10%;
    max-width: 10%;
  }
  .item-create-row .col-item-code {
    flex: 0 0 7.5%;
    max-width: 7.5%;
  }
  .item-create-row .col-item-unit {
    flex: 0 0 7%;
    max-width: 7%;
  }
  .item-create-row .col-item-design-code {
    flex: 0 0 8%;
    max-width: 8%;
  }
  .item-create-row .col-item-stock {
    flex: 0 0 6%;
    max-width: 6%;
  }
  .item-create-row .col-item-image {
    flex: 1 1 auto;
    max-width: none;
    min-width: 140px;
  }

  .item-create-row .col-item-size .form-select-sm,
  .item-create-row .col-item-unit .form-select-sm {
    padding-left: 0.45rem;
    padding-right: 1.5rem;
    font-size: 0.82rem;
  }
  .item-create-row .col-item-stock .form-control-sm {
    padding-left: 0.45rem;
    padding-right: 0.45rem;
    font-size: 0.82rem;
  }

  /* সাব-ক্যাটাগরি ও সিলেক্ট ড্রপডাউন মেনু স্পষ্ট প্রদর্শন (যাতে অপশনগুলো সংক্ষেপ/কেটে না যায়) */
  .item-create-row :deep(.vs__dropdown-menu) {
    min-width: 100% !important;
    width: max-content !important;
    max-width: 350px !important;
    white-space: nowrap !important;
    z-index: 1050 !important;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.15) !important;
  }
  .item-create-row .col-item-subcat :deep(.vs__dropdown-menu) {
    min-width: 220px !important;
  }
}

.frozen-input,
.form-select.frozen-input,
.form-control.frozen-input,
.form-select:disabled,
.form-control:disabled {
  background-color: #f1f3f5 !important;
  cursor: not-allowed !important;
  color: #6c757d !important;
  border-color: #ced4da !important;
  user-select: none !important;
}

/* Inactive Row Styling */
.item-row-inactive {
  opacity: 0.52;
  background-color: rgba(0, 0, 0, 0.02) !important;
  transition: opacity 0.2s ease;
}
.item-row-inactive:hover {
  opacity: 0.85;
}

/* Action Buttons */
.action-btn {
  font-size: 0.82rem;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.search-input-unified {
  height: 31px;
  font-size: 0.82rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-input-unified:focus {
  border-color: #6c757d;
  box-shadow: 0 0 0 0.15rem rgba(108, 117, 125, 0.2);
}

/* ৩টি বা সকল কলামের জন্য সমান ও রেগুলার ফন্ট সাইজ */
.item-cell-text {
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.4;
}

.item-category-cell {
  color: #374151;
}

.item-subcategory-cell {
  color: #4b5563;
}

.item-name-cell {
  color: #111827;
}

/* বাটনগুলো কার্ডের টপ বার কালারের (#d97706) সাথে হুবহু সামঞ্জস্যপূর্ণ */
.item-btn-submit {
  background-color: #d97706 !important;
  border-color: #d97706 !important;
  color: #ffffff !important;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
}

.item-btn-submit:hover,
.item-btn-submit:focus {
  background-color: #b45309 !important;
  border-color: #b45309 !important;
  color: #ffffff !important;
  box-shadow: 0 2px 6px rgba(217, 119, 6, 0.35) !important;
  transform: translateY(-1px);
}

.item-btn-submit:active {
  background-color: #92400e !important;
  border-color: #92400e !important;
  color: #ffffff !important;
  transform: translateY(0);
}

.item-btn-submit:disabled {
  background-color: #d97706 !important;
  border-color: #d97706 !important;
  opacity: 0.65;
  color: #ffffff !important;
}

.item-btn-reset {
  background-color: transparent !important;
  border: 1px solid #d97706 !important;
  color: #b45309 !important;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
}

.item-btn-reset:hover,
.item-btn-reset:focus {
  background-color: #fef3c7 !important;
  border-color: #b45309 !important;
  color: #92400e !important;
  transform: translateY(-1px);
}

.item-btn-reset:active {
  background-color: #fde68a !important;
  border-color: #92400e !important;
  color: #78350f !important;
  transform: translateY(0);
}

/* ফিল্টার রিসেট বাটন (বার কালার থিম) */
.filter-reset-btn {
  height: 31px;
  width: 32px;
  min-width: 32px;
  border-radius: 6px;
  padding: 0;
  font-size: 0.95rem;
  background-color: #d97706 !important;
  border-color: #d97706 !important;
  color: #ffffff !important;
  transition: all 0.15s ease;
}

.filter-reset-btn:hover {
  background-color: #b45309 !important;
  border-color: #b45309 !important;
  color: #ffffff !important;
  transform: translateY(-1px);
}

.filter-reset-btn:active {
  background-color: #92400e !important;
  border-color: #92400e !important;
  color: #ffffff !important;
}

.items-table-container {
  min-height: 240px;
}
@media (min-width: 992px) {
  .items-table-container {
    overflow: visible !important;
  }
}

</style>

<!-- Unscoped Dark Theme Styles for Pure Neutral Black / Charcoal (Zero Blue) -->
<style lang="scss">
.theme-dark,
[data-bs-theme="dark"] {
  .items-page {
    /* Top Form Card */
    .item-form-card {
      background-color: #1b1b1f !important;
      border-color: #2e2e2e !important;
      border-top: 3px solid #f59e0b !important;
      color: #f0f0f0 !important;

      .card-header {
        background-color: #171719 !important;
        border-bottom-color: #262626 !important;
      }
    }

    .item-form-edit-mode {
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
        border-color: #6c757d !important;
        box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.25) !important;
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

    .frozen-input,
    .form-select.frozen-input,
    .form-control.frozen-input,
    .form-select:disabled,
    .form-control:disabled {
      background-color: #17171a !important;
      border-color: #2b2b30 !important;
      color: #888888 !important;
      cursor: not-allowed !important;
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
    .item-table-header th {
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

    .item-cell-text {
      font-weight: 400 !important;
    }

    .item-name-cell {
      color: #ffffff !important;
      font-weight: 400 !important;
    }

    .item-category-cell {
      color: #d1d5db !important;
    }

    .item-subcategory-cell {
      color: #9ca3af !important;
    }

    .item-index-cell {
      color: #888888 !important;
    }

    /* Inactive Row in Dark Mode */
    .item-row-inactive {
      opacity: 0.42 !important;
      background-color: rgba(255, 255, 255, 0.015) !important;

      .item-name-cell,
      .item-category-cell,
      .item-subcategory-cell {
        color: #666666 !important;
      }

      &:hover {
        opacity: 0.85 !important;
      }
    }

    .search-input-unified {
      background-color: #121212 !important;
      border-color: #333333 !important;
      color: #f0f0f0 !important;

      &:focus {
        background-color: #121212 !important;
        border-color: #6c757d !important;
        box-shadow: 0 0 0 0.15rem rgba(108, 117, 125, 0.25) !important;
      }

      &::placeholder {
        color: #808080 !important;
      }
    }

    /* বাটনগুলো ডার্ক মোডে বার কালারের (#f59e0b) সাথে মেলানো */
    .item-btn-submit {
      background-color: #f59e0b !important;
      border-color: #f59e0b !important;
      color: #121212 !important;
      font-weight: 600 !important;

      &:hover,
      &:focus {
        background-color: #fbbf24 !important;
        border-color: #fbbf24 !important;
        color: #000000 !important;
        box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4) !important;
      }

      &:disabled {
        background-color: #f59e0b !important;
        border-color: #f59e0b !important;
        opacity: 0.6 !important;
        color: #121212 !important;
      }
    }

    .item-btn-reset {
      border: 1px solid #f59e0b !important;
      color: #fbbf24 !important;
      background-color: transparent !important;

      &:hover,
      &:focus {
        background-color: rgba(245, 158, 11, 0.16) !important;
        border-color: #fbbf24 !important;
        color: #fcd34d !important;
      }
    }

    .filter-reset-btn {
      background-color: #f59e0b !important;
      border-color: #f59e0b !important;
      color: #121212 !important;

      &:hover {
        background-color: #fbbf24 !important;
        border-color: #fbbf24 !important;
        color: #000000 !important;
      }
    }

    .text-warning {
      color: #fbbf24 !important;
    }
  }
}
</style>
