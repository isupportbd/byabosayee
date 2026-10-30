<template>
  <div class="purchases-page">
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

    <!-- Header Actions & Tabs -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div class="d-flex align-items-center gap-2">
        <div class="purchase-header-icon bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
          <i class="bi bi-cart-check fs-5"></i>
        </div>
        <div>
          <h5 class="m-0 fw-bold">ক্রয় ব্যবস্থাপনা</h5>
        </div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button
          v-if="activeView === 'details' && selectedPurchase"
          type="button"
          class="btn btn-sm btn-outline-warning"
          @click="editPurchase(selectedPurchase)">
          <i class="bi bi-pencil-square me-1"></i>চালান এডিট
        </button>
        <button
          v-if="activeView === 'details'"
          type="button"
          class="btn btn-sm btn-outline-primary"
          @click="printChallan">
          <i class="bi bi-printer me-1"></i>প্রিন্ট চালান
        </button>
        <button
          v-if="activeView !== 'form'"
          type="button"
          class="btn btn-sm btn-primary"
          @click="openNewPurchaseForm">
          <i class="bi bi-cart-plus me-1"></i>নতুন ক্রয় চালান
        </button>
        <button
          v-if="activeView === 'form'"
          type="button"
          class="btn btn-sm btn-primary text-white shadow-sm d-inline-flex align-items-center gap-1.5 px-3"
          @click="switchView('list')">
          <i class="bi bi-card-list"></i>
          <span>ক্রয় তালিকা</span>
        </button>
      </div>
    </div>

    <!-- VIEW 1: নতুন ক্রয় চালান ফর্ম -->
    <div v-show="activeView === 'form'" class="card border shadow-sm mb-4 purchase-form-card">
      <div class="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between py-2.5">
        <div class="d-flex align-items-center gap-2">
          <i :class="editingPurchaseId ? 'bi bi-pencil-square text-warning fs-5' : 'bi bi-file-earmark-plus text-primary fs-5'"></i>
          <h6 class="m-0 fw-bold">
            {{ editingPurchaseId ? `ক্রয় চালান সম্পাদন (চালান নং: ${form.challanNumber || '-'})` : 'নতুন ক্রয় চালান ফরম' }}
          </h6>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-light text-dark border">
            <i class="bi bi-calendar-check me-1 text-primary"></i>এন্ট্রি তারিখ: <strong>{{ todayFormatted }}</strong>
          </span>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 py-1 px-3 shadow-sm fw-medium ms-2"
            @click="switchView('list')">
            <i class="bi bi-card-list"></i>
            <span>ক্রয় তালিকা</span>
          </button>
        </div>
      </div>

      <div class="card-body p-3">
        <form @submit.prevent="submitPurchase">
          <!-- সেকশন ১: চালানের সাধারণ তথ্য -->
          <div class="p-3 bg-light rounded border mb-3">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="badge bg-primary rounded-pill">১</span>
              <h6 class="m-0 fw-semibold text-primary">চালানের প্রাথমিক তথ্য</h6>
            </div>
            <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-2">
              <!-- ১. চালানের ধরন -->
              <div class="col">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block">
                  চালানের ধরন <span class="text-danger">*</span>
                </label>
                <select
                  v-model="form.challanTypeId"
                  class="form-select form-select-sm"
                  required>
                  <option value="" disabled>চালানের ধরন নির্বাচন করুন</option>
                  <option v-for="ct in challanTypesList" :key="ct.id" :value="ct.id">
                    {{ ct.name }}
                  </option>
                </select>
              </div>

              <!-- ২. চালান নং -->
              <div class="col">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block">
                  চালান নং <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.challanNumber"
                  type="text"
                  class="form-control form-select-sm"
                  placeholder="যেমন: CH-2026-001"
                  required />
              </div>

              <!-- ৩. চালানের তারিখ -->
              <div class="col">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block">
                  চালানের তারিখ <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.challanDate"
                  type="date"
                  class="form-control form-select-sm"
                  required />
              </div>

              <!-- ৪. সরবরাহকারীর ধরন ড্রপডাউন (সুপারএডমিন সেটিংস হতে ড্রপ ডাউন) -->
              <div class="col">
                <div class="d-flex align-items-center justify-content-between mb-1">
                  <label class="form-label small fw-semibold mb-0 text-truncate">
                    সরবরাহকারীর ধরন <span class="text-danger">*</span>
                  </label>
                  <span
                    v-if="isBillOfEntry"
                    class="badge bg-secondary-subtle text-secondary border px-1 py-0 font-monospace"
                    style="font-size: 0.65rem;"
                    title="বিল অব এন্ট্রি চালানে সরবরাহকারী অটোমেটিক রপ্তানিকারক ও ফ্রিজ">
                    <i class="bi bi-lock-fill me-0.5"></i>লকড
                  </span>
                </div>
                <select
                  v-model="vendorType"
                  class="form-select form-select-sm"
                  :disabled="isBillOfEntry"
                  :class="{ 'bg-light text-muted border-secondary-subtle': isBillOfEntry }"
                  :title="isBillOfEntry ? 'বিল অব এন্ট্রি চালানে সরবরাহকারী অটোমেটিক রপ্তানিকারক ও লকড থাকে' : ''"
                  required
                  @change="onVendorTypeChange">
                  <option v-for="vt in activeVendorTypes" :key="vt.id" :value="vt.code || vt.name">
                    {{ vt.name }}
                  </option>
                  <option v-if="isBillOfEntry && !hasExporterInVendorTypes" value="রপ্তানিকারক">
                    রপ্তানিকারক
                  </option>
                </select>
              </div>

              <!-- ৫. প্রতিষ্ঠানের নাম ড্রপডাউন (নির্বাচিত ধরনের সাথে সম্পূর্ণ ডায়নামিক) -->
              <div class="col">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block">
                  {{ selectedVendorTypeName }} <span class="text-danger">*</span>
                </label>
                <div class="position-relative">
                  <select
                    v-model="selectedPartnerId"
                    class="form-select form-select-sm"
                    :title="selectedPartnerName || `${selectedVendorTypeName} নির্বাচন করুন`"
                    required
                    @change="onPartnerChange">
                    <option value="" disabled>{{ selectedVendorTypeName }} নির্বাচন করুন</option>
                    <option
                      v-for="v in filteredVendorsBySelectedType"
                      :key="`${v.source}-${v.id}`"
                      :value="`${v.source}:${v.id}`">
                      {{ v.name }}{{ v.address ? `, ${v.address}` : '' }}
                    </option>
                  </select>
                  <div
                    v-if="selectedPartnerId && selectedPartnerName"
                    class="selected-item-clean-display position-absolute top-0 start-0 d-flex align-items-center px-2 text-truncate"
                    :title="selectedPartnerName">
                    {{ selectedPartnerName }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- সেকশন ২: পণ্যের তথ্য ইনপুট কার্ড (মোবাইল ফ্রেন্ডলি সাধারণ ফিল্ড) -->
          <div class="p-3 bg-white rounded border mb-3 shadow-sm">
            <div class="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom flex-wrap gap-2">
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-primary rounded-pill">২</span>
                <h6 class="m-0 fw-semibold text-primary">
                  {{ editingIndex !== null ? 'পণ্য সংশোধন করুন' : 'পণ্য যোগ করুন' }}
                </h6>
                <span v-if="editingIndex !== null" class="badge bg-warning text-dark small">
                  #{{ toBengaliNumber(editingIndex + 1) }} নং পণ্য সম্পাদনাধীন
                </span>
              </div>

              <!-- ভ্যাট সহ / ভ্যাট ছাড়া ডায়নামিক রেডিও বাটন (সরাসরি ইনলাইন ও পারফেক্ট অ্যালাইনমেন্ট) -->
              <div class="d-flex align-items-center gap-3">
                <span class="small fw-semibold text-secondary d-inline-flex align-items-center">
                  <i class="bi bi-calculator text-primary me-1"></i>মূল্যের ধরন:
                </span>
                <label class="d-inline-flex align-items-center gap-1 small fw-semibold text-dark cursor-pointer m-0 user-select-none">
                  <input
                    id="vatModeExcl"
                    v-model="vatMode"
                    class="form-check-input m-0 cursor-pointer"
                    type="radio"
                    name="vatPricingMode"
                    value="excl" />
                  <span>ভ্যাট ছাড়া</span>
                </label>
                <label class="d-inline-flex align-items-center gap-1 small fw-semibold text-dark cursor-pointer m-0 user-select-none">
                  <input
                    id="vatModeIncl"
                    v-model="vatMode"
                    class="form-check-input m-0 cursor-pointer"
                    type="radio"
                    name="vatPricingMode"
                    value="incl" />
                  <span>ভ্যাট সহ</span>
                </label>
              </div>
            </div>

            <!-- পণ্যের ফিল্ড সারি: বিষয়বস্তু অনুযায়ী আনুপাতিক সাইজ সহ ১টি রো-তে বিন্যস্ত -->
            <div class="product-single-row d-flex align-items-end gap-1 flex-wrap flex-xl-nowrap pb-1">
              <!-- ১. পণ্যের নাম -->
              <div class="col-item-name">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="পণ্যের নাম">
                  পণ্যের নাম <span class="text-danger">*</span>
                </label>
                <div class="position-relative">
                  <select
                    v-model="currentItem.itemId"
                    class="form-select form-select-sm"
                    :title="cleanItemName(currentItem.name) || 'পণ্য নির্বাচন করুন'"
                    @change="onCurrentItemSelect">
                    <option value="" disabled>পণ্য নির্বাচন করুন</option>
                    <option v-for="it in itemsList" :key="it.id" :value="it.id">
                      {{ it.name }}
                    </option>
                  </select>
                  <div
                    v-if="currentItem.itemId && currentItem.name"
                    class="selected-item-clean-display position-absolute top-0 start-0 d-flex align-items-center px-2 text-truncate"
                    :title="cleanItemName(currentItem.name)">
                    {{ cleanItemName(currentItem.name) }}
                  </div>
                </div>
              </div>

              <!-- ২. ব্র্যান্ড -->
              <div class="col-item-brand">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="ব্র্যান্ড">
                  ব্র্যান্ড <span class="text-danger">*</span>
                </label>
                <select
                  v-model="currentItem.brandId"
                  class="form-select form-select-sm px-1.5"
                  required
                  @change="onCurrentItemBrandChange">
                  <option value="" disabled>ব্র্যান্ড নির্বাচন করুন *</option>
                  <option v-for="b in filteredBrandsList" :key="b.id" :value="b.id">
                    {{ b.name }}
                  </option>
                </select>
              </div>

              <!-- ৩. সাইজ -->
              <div class="col-item-size">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="সাইজ">
                  সাইজ <span class="text-danger">*</span>
                </label>
                <select
                  v-model="currentItem.sizeId"
                  class="form-select form-select-sm px-1.5 fw-bold"
                  @change="onCurrentItemSizeChange">
                  <option value="" disabled>-</option>
                  <option v-for="s in filteredSizesList" :key="s.id" :value="s.id">
                    {{ s.name }}
                  </option>
                </select>
              </div>

              <!-- ৪. কালার -->
              <div class="col-item-color">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="কালার">কালার</label>
                <select v-model="currentItem.colorId" class="form-select form-select-sm px-1.5">
                  <option value="">(ঐচ্ছিক)</option>
                  <option v-for="c in colorsList" :key="c.id" :value="c.id">
                    {{ c.name }}
                  </option>
                </select>
              </div>

              <!-- ৫. পরিমাণ -->
              <div class="col-item-qty">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="পরিমাণ">
                  পরিমাণ <span class="text-danger">*</span>
                </label>
                <input
                  v-model.number="currentItem.quantity"
                  type="number"
                  min="1"
                  class="form-control form-control-sm fw-semibold px-1.5"
                  placeholder="0" />
              </div>

              <!-- ৬. একক -->
              <div class="col-item-unit">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="একক">
                  একক <span class="text-danger">*</span>
                </label>
                <select v-model="currentItem.unitId" class="form-select form-select-sm px-1.5">
                  <option value="" disabled>-</option>
                  <option v-for="u in filteredUnitsList" :key="u.id" :value="u.id">
                    {{ u.name }}
                  </option>
                </select>
              </div>

              <!-- ৭. একক মূল্য -->
              <div class="col-item-unit-price">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block" :title="vatMode === 'incl' ? 'একক মূল্য (ভ্যাট সহ)' : 'একক মূল্য (ভ্যাট ছাড়া)'">
                  একক মূল্য ({{ vatMode === 'incl' ? 'ভ্যাট সহ' : 'ভ্যাট ছাড়া' }}) <span class="text-danger">*</span>
                </label>
                <input
                  v-model.number="currentItem.unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-control form-control-sm fw-semibold px-1.5"
                  placeholder="0.00" />
              </div>

              <!-- ৮. MRP -->
              <div class="col-item-mrp">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="MRP / বিক্রয়মূল্য (৳)">
                  MRP (৳) <span class="text-danger">*</span>
                </label>
                <input
                  v-model.number="currentItem.sellingPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-control form-control-sm fw-semibold px-1.5"
                  placeholder="0.00" />
              </div>

              <!-- ৯. ভ্যাট -->
              <div class="col-item-vat">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block" title="ভ্যাট (%)">
                  ভ্যাট (%) <span class="text-danger">*</span>
                </label>
                <input
                  v-model.number="currentItem.vatRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  class="form-control form-control-sm px-1.5"
                  placeholder="0" />
              </div>

              <!-- ১২. অ্যাকশন বাটনদ্বয় (রিসেট ও যোগ) -->
              <div class="col-item-action">
                <div class="d-flex align-items-center gap-1">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center flex-shrink-0"
                    style="height: 31px; width: 32px;"
                    title="রিসেট"
                    @click="resetCurrentItem">
                    <i class="bi bi-arrow-counterclockwise fs-6"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-primary d-inline-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                    style="height: 31px; width: 34px;"
                    :title="editingIndex !== null ? 'আপডেট করুন' : 'তালিকায় যোগ করুন'"
                    @click="addItemToList">
                    <i :class="editingIndex !== null ? 'bi bi-check-circle-fill' : 'bi bi-plus-circle-fill'" class="fs-5"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 🧪 টেস্ট ও ক্যালকুলেশন যাচাই কার্ড (টেম্পোরারি - পরে মুছে দেওয়া যাবে) -->
          <div class="card mb-3 border border-info border-opacity-50 shadow-sm bg-info-subtle bg-opacity-10">
            <div class="card-header bg-white border-bottom py-2 d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-calculator-fill text-info fs-5"></i>
                <h6 class="m-0 fw-bold text-dark">ক্যালকুলেশন টেস্ট ও যাচাই প্যানেল (রিয়েলটাইম লাইভ)</h6>
              </div>
              <span class="badge bg-info-subtle text-info border border-info-subtle font-monospace">
                টেস্টিং কার্ড
              </span>
            </div>
            <div class="card-body p-3">
              <div class="row g-2 text-dark" style="font-size: 0.85rem;">
                <!-- ০. মোড ও নির্বাচিত পণ্য -->
                <div class="col-12 col-md-4 col-lg-3">
                  <div class="p-2 bg-white rounded border h-100">
                    <span class="text-muted small d-block">পণ্য ও মোড:</span>
                    <strong class="text-primary text-truncate d-block">
                      {{ cleanItemName(currentItem.name) || '(পণ্য নির্বাচন করুন)' }}
                    </strong>
                    <div class="d-flex align-items-center gap-1 mt-1 flex-wrap">
                      <span class="badge border" :class="vatMode === 'incl' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'">
                        মোড: {{ vatMode === 'incl' ? 'ভ্যাট সহ' : 'ভ্যাট ছাড়া' }}
                      </span>
                      <span class="badge bg-light text-dark border">
                        {{ getSizeName(currentItem.sizeId) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- ২. পরিমাণ ও একক -->
                <div class="col-6 col-md-2 col-lg-2">
                  <div class="p-2 bg-white rounded border h-100">
                    <span class="text-muted small d-block">পরিমাণ:</span>
                    <strong class="fs-6 text-dark d-block">
                      {{ toBengaliNumber(currentItem.quantity || 0) }} {{ getUnitName(currentItem.unitId) || 'পিস' }}
                    </strong>
                    <span class="text-muted d-block" style="font-size: 0.72rem;">একক: {{ getUnitName(currentItem.unitId) || '-' }}</span>
                  </div>
                </div>

                <!-- ৩. একক ক্রয়মূল্য (ভ্যাট ছাড়া) -->
                <div class="col-6 col-md-3 col-lg-2">
                  <div class="p-2 bg-white rounded border h-100">
                    <span class="text-muted small d-block">একক মূল্য (ভ্যাট ছাড়া):</span>
                    <strong class="fs-6 text-dark d-block">
                      ৳ {{ toBengaliNumber(currentItemUnitCostExclVat.toFixed(2)) }}
                    </strong>
                    <span v-if="vatMode === 'incl'" class="text-info d-block" style="font-size: 0.72rem;">(ভ্যাট বাদ দিয়ে রিয়েল রেট)</span>
                  </div>
                </div>

                <!-- ৪. মোট মূল্য (ভ্যাট ছাড়া) -->
                <div class="col-6 col-md-3 col-lg-2">
                  <div class="p-2 bg-white rounded border h-100">
                    <span class="text-muted small d-block">মোট মূল্য (ভ্যাট ছাড়া):</span>
                    <strong class="fs-6 text-dark d-block">
                      ৳ {{ toBengaliNumber(currentItemTotalExclVat.toFixed(2)) }}
                    </strong>
                    <span class="text-muted d-block" style="font-size: 0.72rem;">(পরিমাণ × ভ্যাট ছাড়া একক)</span>
                  </div>
                </div>

                <!-- ৫. ভ্যাট ও ভ্যাটের টাকা -->
                <div class="col-6 col-md-3 col-lg-3">
                  <div class="p-2 bg-white rounded border h-100">
                    <span class="text-muted small d-block">ভ্যাট ({{ toBengaliNumber(currentItem.vatRate || 0) }}%):</span>
                    <strong class="fs-6 text-danger d-block">
                      + ৳ {{ toBengaliNumber(currentItemVatAmount.toFixed(2)) }}
                    </strong>
                    <span class="text-muted d-block" style="font-size: 0.72rem;">ভ্যাট সহ মোট: ৳ {{ toBengaliNumber(currentItemPriceWithVat) }}</span>
                  </div>
                </div>

                <!-- ৬. ভ্যাট সহ একক মূল্য -->
                <div class="col-6 col-md-3 col-lg-3">
                  <div class="p-2 bg-white rounded border h-100">
                    <span class="text-muted small d-block">ভ্যাট সহ একক মূল্য:</span>
                    <strong class="fs-6 text-primary d-block">
                      ৳ {{ toBengaliNumber(currentItemUnitCost) }}
                    </strong>
                    <span class="text-muted d-block" style="font-size: 0.72rem;">(ভ্যাট সহ মোট ÷ পরিমাণ)</span>
                  </div>
                </div>

                <!-- ৭. MRP (বিক্রয়মূল্য) -->
                <div class="col-6 col-md-3 col-lg-3">
                  <div class="p-2 bg-white rounded border h-100">
                    <span class="text-muted small d-block">MRP / বিক্রয়মূল্য:</span>
                    <strong class="fs-6 text-success d-block">
                      ৳ {{ toBengaliNumber(Number(currentItem.sellingPrice || 0).toFixed(2)) }}
                    </strong>
                  </div>
                </div>

                <!-- ৮. সম্ভাব্য একক লাভ / মার্জিন -->
                <div class="col-6 col-md-3 col-lg-3">
                  <div class="p-2 bg-white rounded border h-100">
                    <span class="text-muted small d-block">সম্ভাব্য একক মার্জিন:</span>
                    <strong
                      class="fs-6 d-block"
                      :class="(Number(currentItem.sellingPrice || 0) - parseFloat(currentItemUnitCost)) >= 0 ? 'text-success' : 'text-danger'">
                      ৳ {{ toBengaliNumber((Number(currentItem.sellingPrice || 0) - parseFloat(currentItemUnitCost)).toFixed(2)) }}
                    </strong>
                    <span class="text-muted d-block" style="font-size: 0.72rem;">(MRP - ভ্যাটসহ একক ক্রয়দর)</span>
                  </div>
                </div>

                <!-- ৯. বারকোড (অটো জেনারেট প্রিভিউ) -->
                <div class="col-6 col-md-3 col-lg-3">
                  <div class="p-2 bg-white rounded border h-100">
                    <span class="text-muted small d-block">১৪-ডিজিট বারকোড:</span>
                    <strong class="font-monospace text-dark d-block text-truncate">
                      {{ currentItem.code || '(সেভ করার সময় অটো তৈরি হবে)' }}
                    </strong>
                  </div>
                </div>
              </div>

              <!-- ⚡ খরচ ও সমন্বয় পরবর্তী রিয়েলটাইম লাইভ প্রভাব (Landed Cost Breakdown) -->
              <div class="mt-3 pt-2.5 border-top">
                <div class="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-1">
                  <div class="d-flex align-items-center gap-1.5">
                    <i class="bi bi-diagram-3-fill text-warning fs-6"></i>
                    <strong class="text-dark" style="font-size: 0.85rem;">
                      খরচ ও ডিসকাউন্ট সমন্বয় পরবর্তী অবস্থা (Landed Cost &amp; প্রকৃত মুনাফা):
                    </strong>
                  </div>
                  <span v-if="(Number(form.otherExpenses) || 0) > 0 || (Number(form.discountAmount) || 0) > 0" class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle font-monospace">
                    বিবিধ খরচ: +৳{{ toBengaliNumber((form.otherExpenses || 0).toFixed(2)) }} | ডিসকাউন্ট: -৳{{ toBengaliNumber((form.discountAmount || 0).toFixed(2)) }}
                  </span>
                  <span v-else class="badge bg-secondary-subtle text-secondary border font-monospace">
                    কোনো খরচ বা ডিসকাউন্ট ইনপুট দেওয়া হয়নি (০.০০)
                  </span>
                </div>

                <div class="row g-2 text-dark" style="font-size: 0.85rem;">
                  <!-- ১০. প্রতি পিসে খরচ সমন্বয় (+/-) -->
                  <div class="col-6 col-md-3 col-lg-3">
                    <div class="p-2 rounded border h-100" :class="testItemExpenseAdjustment.perUnit >= 0 ? 'bg-danger-subtle bg-opacity-25 border-danger-subtle' : 'bg-success-subtle bg-opacity-25 border-success-subtle'">
                      <span class="text-muted small d-block">খরচ সমন্বয় (প্রতি পিস):</span>
                      <strong class="fs-6 d-block" :class="testItemExpenseAdjustment.perUnit >= 0 ? 'text-danger' : 'text-success'">
                        {{ testItemExpenseAdjustment.perUnit >= 0 ? '+' : '' }} ৳ {{ toBengaliNumber(testItemExpenseAdjustment.perUnit.toFixed(2)) }}
                      </strong>
                      <span class="text-muted d-block" style="font-size: 0.72rem;">
                        নিট সমন্বয়: {{ testItemExpenseAdjustment.netExtra >= 0 ? '+' : '' }}৳ {{ toBengaliNumber(testItemExpenseAdjustment.total.toFixed(2)) }}
                      </span>
                    </div>
                  </div>

                  <!-- ১১. খরচ সমন্বয়ের পর প্রকৃত একক ক্রয়দর -->
                  <div class="col-6 col-md-3 col-lg-3">
                    <div class="p-2 bg-primary-subtle bg-opacity-30 rounded border border-primary-subtle h-100">
                      <span class="text-muted small d-block">প্রকৃত একক ক্রয়দর (Landed):</span>
                      <strong class="fs-6 text-primary d-block">
                        ৳ {{ toBengaliNumber(testItemLandedUnitCost.toFixed(2)) }}
                      </strong>
                      <span class="text-muted d-block" style="font-size: 0.72rem;">
                        (ভ্যাটসহ {{ toBengaliNumber(activeTestItem ? activeTestItem.unitWithVat.toFixed(2) : '0') }} {{ testItemExpenseAdjustment.perUnit >= 0 ? '+' : '' }} {{ toBengaliNumber(testItemExpenseAdjustment.perUnit.toFixed(2)) }})
                      </span>
                    </div>
                  </div>

                  <!-- ১২. খরচ সমন্বয়ের পর মোট ক্রয় খরচ -->
                  <div class="col-6 col-md-3 col-lg-3">
                    <div class="p-2 bg-white rounded border h-100">
                      <span class="text-muted small d-block">সমন্বয়ের পর মোট খরচ:</span>
                      <strong class="fs-6 text-dark d-block">
                        ৳ {{ toBengaliNumber(testItemLandedTotalCost.toFixed(2)) }}
                      </strong>
                      <span class="text-muted d-block" style="font-size: 0.72rem;">(চালানের এই পণ্যের প্রকৃত ব্যয়)</span>
                    </div>
                  </div>

                  <!-- ১৩. সমন্বয়ের পর প্রকৃত বাস্তব মার্জিন (লাভ) -->
                  <div class="col-6 col-md-3 col-lg-3">
                    <div class="p-2 rounded border h-100" :class="testItemActualMargin >= 0 ? 'bg-success-subtle bg-opacity-30 border-success-subtle' : 'bg-danger-subtle bg-opacity-30 border-danger-subtle'">
                      <span class="text-muted small d-block">প্রকৃত বাস্তব মার্জিন (লাভ):</span>
                      <strong class="fs-6 d-block" :class="testItemActualMargin >= 0 ? 'text-success' : 'text-danger'">
                        ৳ {{ toBengaliNumber(testItemActualMargin.toFixed(2)) }}
                      </strong>
                      <span class="text-muted d-block" style="font-size: 0.72rem;">(MRP - প্রকৃত ক্রয়দর {{ toBengaliNumber(testItemLandedUnitCost.toFixed(2)) }})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- সেকশন ৩: তিনটি কার্ড (১. পণ্যের সংক্ষিপ্ত বিবরণ, ২. খরচ ও সমন্বয়, ৩. চূড়ান্ত হিসাব) -->
          <div class="row g-3 mb-3">
            <!-- কার্ড ১: পণ্যের সংক্ষিপ্ত বিবরণ (টেম্পেরেরি জমা হবে, এডিট/ডিলেট করা যাবে) -->
            <div class="col-12 col-lg-6">
              <div class="card h-100 border shadow-sm">
                <div class="card-header bg-white border-bottom py-2 d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-card-checklist text-primary fs-5"></i>
                    <h6 class="m-0 fw-bold">পণ্যের সংক্ষিপ্ত বিবরণ</h6>
                  </div>
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace">
                    {{ toBengaliNumber(form.items.length) }} টি পণ্য
                  </span>
                </div>
                <div class="card-body p-0 d-flex flex-column justify-content-between">
                  <!-- খালি থাকলে মেসেজ -->
                  <div v-if="form.items.length === 0" class="text-center text-muted p-4 my-auto">
                    <i class="bi bi-cart-x fs-1 d-block mb-2 text-secondary opacity-50"></i>
                    <span class="fw-semibold">এখনও কোনো পণ্য যোগ করা হয়নি</span>
                    <p class="small text-muted mb-0 mt-1">
                      উপরের ফর্মটি পূরণ করে <strong class="text-primary">"তালিকায় যুক্ত করুন"</strong> বোতামে ক্লিক করুন।
                    </p>
                  </div>

                  <!-- পণ্যের তালিকা টেবিল -->
                  <div v-else class="table-responsive flex-grow-1" style="max-height: 360px; overflow-y: auto;">
                    <table class="table table-sm table-hover align-middle mb-0" style="font-size: 0.83rem;">
                      <thead class="table-light sticky-top">
                        <tr class="text-nowrap text-secondary">
                          <th style="width: 30px;" class="text-center">#</th>
                          <th>পণ্যের বিবরণ</th>
                          <th class="text-end text-nowrap">একক | মোট মূল্য</th>
                          <th class="text-end text-nowrap" title="খরচ ও ডিসকাউন্ট সমন্বয় করে প্রতিটি আইটেমের প্রকৃত গড় একক ও মোট খরচ">প্রকৃত একক | মোট মূল্য</th>
                          <th style="width: 60px;" class="text-center">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(it, idx) in form.items"
                          :key="idx"
                          :class="{ 'table-warning': editingIndex === idx }">
                          <td class="text-center text-muted small">{{ toBengaliNumber(idx + 1) }}</td>
                          <td>
                            <div class="fw-semibold text-truncate" style="max-width: 200px;" :title="it.name">
                              {{ it.name }}
                            </div>
                            <div class="d-flex align-items-center gap-1.5 mt-0.5" style="font-size: 0.82rem;">
                              <span class="fw-bold text-dark">
                                {{ getSizeName(it.sizeId) }}
                              </span>
                              <span class="text-secondary fw-bold px-1">|</span>
                              <span class="fw-bold text-dark">
                                {{ toBengaliNumber(it.quantity) }} {{ getUnitName(it.unitId) }}
                              </span>
                            </div>
                          </td>
                          <td class="text-end text-nowrap">
                            <span class="text-secondary fw-semibold">
                              {{ toBengaliNumber(getItemUnitPrice(it)) }}
                            </span>
                            <span class="text-secondary fw-bold px-1">|</span>
                            <span class="fw-bold text-dark">
                              {{ toBengaliNumber(getItemTotalPrice(it)) }}
                            </span>
                          </td>
                          <td class="text-end text-nowrap" title="খরচ ও ডিসকাউন্ট সমন্বয়ের পর প্রকৃত গড় একক ও মোট খরচ">
                            <span class="text-primary fw-semibold">
                              {{ toBengaliNumber(getItemEffectiveCosts(it).unit) }}
                            </span>
                            <span class="text-secondary fw-bold px-1">|</span>
                            <span class="fw-bold text-primary">
                              {{ toBengaliNumber(getItemEffectiveCosts(it).total) }}
                            </span>
                          </td>
                          <td class="text-center text-nowrap">
                            <button
                              type="button"
                              class="btn btn-sm btn-link text-primary p-0 me-2"
                              title="সম্পাদনা করুন"
                              @click="editItem(idx)">
                              <i class="bi bi-pencil-square fs-6"></i>
                            </button>
                            <button
                              type="button"
                              class="btn btn-sm btn-link text-danger p-0"
                              title="তালিকা থেকে মুছুন"
                              @click="deleteItem(idx)">
                              <i class="bi bi-trash fs-6"></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- কার্ড ফুটার সামারি -->
                  <div class="card-footer bg-light py-2 px-3 border-top d-flex justify-content-between align-items-center">
                    <span class="small text-muted">
                      মোট আইটেম: <strong>{{ toBengaliNumber(form.items.length) }}</strong> টি |
                      পরিমাণ: <strong>{{ toBengaliNumber(totalQuantity) }}</strong>
                    </span>
                    <strong class="text-primary small">
                      উপমোট: ৳ {{ toBengaliNumber(itemsSubtotal.toFixed(2)) }}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- কার্ড ২: খরচ ও সমন্বয় -->
            <div class="col-12 col-lg-2">
              <div class="card h-100 border shadow-sm">
                <div class="card-header bg-white border-bottom py-2 d-flex align-items-center gap-2">
                  <i class="bi bi-sliders text-warning fs-5"></i>
                  <h6 class="m-0 fw-bold">খরচ ও সমন্বয়</h6>
                </div>
                <div class="card-body p-2 d-flex flex-column justify-content-between">
                  <div>
                    <!-- বিবিধ খরচ -->
                    <div class="mb-2">
                      <label class="form-label small fw-semibold mb-1">
                        বিবিধ খরচ (৳)
                      </label>
                      <input
                        v-model.number="form.otherExpenses"
                        type="number"
                        min="0"
                        step="0.01"
                        class="form-control form-control-sm"
                        placeholder="0.00" />
                    </div>

                    <!-- চালান ডিসকাউন্ট -->
                    <div class="mb-2">
                      <label class="form-label small fw-semibold mb-1">
                        চালান ডিসকাউন্ট (৳)
                      </label>
                      <input
                        v-model.number="form.discountAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        class="form-control form-control-sm"
                        placeholder="0.00" />
                    </div>

                    <!-- মাধ্যম (সুপারএডমিন সেটিংস থেকে ড্রপডাউন) -->
                    <div class="mb-2">
                      <label class="form-label small fw-semibold mb-1">
                        মাধ্যম <span v-if="Number(form.paidAmount) > 0" class="text-danger">*</span>
                      </label>
                      <select
                        v-model="form.paymentMethod"
                        class="form-select form-select-sm"
                        :disabled="!Number(form.paidAmount) || Number(form.paidAmount) <= 0"
                        :required="Number(form.paidAmount) > 0">
                        <option v-if="!Number(form.paidAmount) || Number(form.paidAmount) <= 0" value="">
                          প্রযোজ্য নয় (বকেয়া)
                        </option>
                        <option
                          v-for="pm in activePaymentMethods"
                          :key="pm.id"
                          :value="pm.code || pm.name">
                          {{ formatPaymentMethodName(pm) }}
                        </option>
                      </select>
                    </div>

                    <!-- পরিশোধিত টাকা -->
                    <div class="mb-2">
                      <label class="form-label small fw-semibold mb-1">
                        পরিশোধিত টাকা (৳) <span class="text-danger">*</span>
                      </label>
                      <input
                        v-model.number="form.paidAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        class="form-control form-control-sm fw-semibold text-success"
                        placeholder="0.00"
                        required
                        @input="onPaidAmountInput" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- কার্ড ৩: চূড়ান্ত হিসাব -->
            <div class="col-12 col-lg-4">
              <div class="card h-100 border shadow-sm">
                <div class="card-header bg-white border-bottom py-2 d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-calculator text-success fs-5"></i>
                    <h6 class="m-0 fw-bold">চূড়ান্ত হিসাব</h6>
                  </div>
                  <span class="badge bg-success-subtle text-success border">অটো হিসাব</span>
                </div>
                <div class="card-body p-3 d-flex flex-column justify-content-between">
                  <div>
                    <div class="d-flex justify-content-between align-items-center py-1 border-bottom">
                      <span class="text-muted small">পণ্যের উপমোট মূল্য:</span>
                      <strong class="text-dark">৳ {{ toBengaliNumber(itemsSubtotal.toFixed(2)) }}</strong>
                    </div>

                    <div class="d-flex justify-content-between align-items-center py-1 border-bottom">
                      <span class="text-muted small">মোট পণ্যের পরিমাণ:</span>
                      <span class="fw-semibold text-dark">{{ toBengaliNumber(totalQuantity) }} টি</span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center py-1 border-bottom">
                      <span class="text-muted small">(+) অন্যান্য খরচ:</span>
                      <span class="text-danger fw-semibold">+ ৳ {{ toBengaliNumber((form.otherExpenses || 0).toFixed(2)) }}</span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center py-1 border-bottom">
                      <span class="text-muted small">(-) চালান ডিসকাউন্ট / ছাড়:</span>
                      <span class="text-success fw-semibold">- ৳ {{ toBengaliNumber((form.discountAmount || 0).toFixed(2)) }}</span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center py-2 border-bottom bg-light px-2 rounded mt-2">
                      <span class="fw-bold text-dark">সর্বমোট প্রদেয় মূল্য:</span>
                      <span class="fw-bold fs-5 text-primary">৳ {{ toBengaliNumber(finalTotalAmount.toFixed(2)) }}</span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center py-1 mt-2">
                      <span class="text-muted small">পরিশোধিত টাকা:</span>
                      <span class="text-success fw-bold">৳ {{ toBengaliNumber((form.paidAmount || 0).toFixed(2)) }}</span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center py-1">
                      <span class="text-muted small">বকেয়া টাকা (Due):</span>
                      <span
                        class="fw-bold"
                        :class="dueAmount > 0 ? 'text-danger' : 'text-muted'">
                        ৳ {{ toBengaliNumber(dueAmount.toFixed(2)) }}
                        <span v-if="dueAmount <= 0 && finalTotalAmount > 0" class="badge bg-success-subtle text-success ms-1 py-0 px-1 small">পরিশোধিত</span>
                      </span>
                    </div>
                  </div>

                  <!-- ফর্ম একশন বাটনদ্বয় -->
                  <div class="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary"
                      @click="resetForm">
                      <i class="bi bi-arrow-counterclockwise me-1"></i>রিসেট
                    </button>
                    <button
                      type="submit"
                      class="btn btn-sm btn-primary px-4 fw-semibold shadow-sm"
                      :disabled="submitting || form.items.length === 0">
                      <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                      <i v-else :class="editingPurchaseId ? 'bi bi-check2-square me-1' : 'bi bi-check2-circle me-1'"></i>
                      {{ editingPurchaseId ? 'ক্রয় চালান আপডেট করুন' : 'ক্রয় চালান সংরক্ষণ করুন' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- VIEW 2: পূর্ববর্তী ক্রয় চালানের তালিকা -->
    <div v-show="activeView === 'list'" class="card border shadow-sm">
      <div class="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between py-2 flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-receipt text-primary fs-5"></i>
          <h6 class="m-0 fw-bold">ক্রয় তালিকা</h6>
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle small">
            {{ toBengaliNumber(purchasesList.length) }} টি রেকর্ড
          </span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control form-control-sm"
            placeholder="চালান নং বা সাপ্লায়ার খুঁজুন..."
            style="width: 220px;" />
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            title="রিফ্রেশ"
            @click="fetchPurchases">
            <i class="bi bi-arrow-repeat"></i>
          </button>
        </div>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive purchases-list-table-responsive">
          <table class="table table-hover align-middle mb-0 text-nowrap">
            <thead class="table-light">
              <tr class="small">
                <th style="width: 40px;" class="text-center">#</th>
                <th>চালানের ধরন</th>
                <th>চালান নং</th>
                <th>চালান তারিখ</th>
                <th>সাপ্লায়ার / প্রস্তুতকারী</th>
                <th>ব্র্যান্ড</th>
                <th class="text-center">পণ্যের সংখ্যা</th>
                <th class="text-end">মোট ক্রয়মূল্য (৳)</th>
                <th class="text-end">পরিশোধিত</th>
                <th class="text-end">বকেয়া</th>
                <th class="text-center">পেমেন্ট মেথড</th>
                <th class="text-center">স্টেটাস</th>
                <th class="text-center" style="width: 60px;">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loadingPurchases">
                <td colspan="13" class="text-center py-4 text-muted">
                  <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                  ক্রয় চালান তালিকা লোড হচ্ছে...
                </td>
              </tr>
              <tr v-else-if="filteredPurchases.length === 0">
                <td colspan="13" class="text-center py-4 text-muted">
                  <i class="bi bi-inbox fs-4 d-block mb-1"></i>
                  কোনো ক্রয় চালানের তথ্য পাওয়া যায়নি
                </td>
              </tr>
              <tr
                v-for="(p, index) in filteredPurchases"
                :key="p.id"
                class="purchase-table-row"
                :class="{ 'table-primary': openActionMenuId === p.id }"
                style="cursor: pointer;"
                title="অ্যাকশন মেনু দেখতে ক্লিক করুন"
                @click="toggleActionMenu(p.id, $event)">
                <td class="text-center small text-muted">{{ toBengaliNumber(index + 1) }}</td>
                <td>
                  <span class="badge bg-secondary-subtle text-secondary border">
                    {{ p.challanType?.name || 'সাধারণ চালান' }}
                  </span>
                </td>
                <td class="fw-semibold text-primary">{{ p.challanNumber || '-' }}</td>
                <td class="small text-muted">{{ formatDate(p.challanDate) }}</td>
                <td>
                  <div class="d-flex align-items-center gap-1">
                    <i
                      class="bi"
                      :class="p.supplier ? 'bi-shop text-primary' : 'bi-buildings text-warning'"></i>
                    <span class="fw-medium">
                      {{ p.supplier?.name || p.manufacturer?.name || '-' }}
                    </span>
                  </div>
                </td>
                <td>
                  <span class="badge bg-light text-dark border fw-medium">
                    {{ getPurchaseBrandNames(p) }}
                  </span>
                </td>
                <td class="text-center">
                  <span class="badge bg-light text-dark border">
                    {{ toBengaliNumber(p.items?.length || 0) }} টি
                  </span>
                </td>
                <td class="text-end fw-bold text-dark">
                  ৳ {{ toBengaliNumber(Number(p.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })) }}
                </td>
                <td class="text-end text-success fw-medium">
                  ৳ {{ toBengaliNumber(Number(p.paidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })) }}
                </td>
                <td class="text-end">
                  <span
                    class="fw-semibold"
                    :class="Number(p.dueAmount || 0) > 0 ? 'text-danger' : 'text-muted'">
                    ৳ {{ toBengaliNumber(Number(p.dueAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })) }}
                  </span>
                </td>
                <td class="text-center small">
                  <span
                    v-if="Number(p.paidAmount || 0) > 0 && p.paymentMethod"
                    class="badge bg-light text-dark border">
                    {{ formatPaymentMethod(p.paymentMethod) }}
                  </span>
                  <span v-else class="text-muted small">—</span>
                </td>
                <td class="text-center">
                  <span
                    class="badge"
                    :class="Number(p.dueAmount || 0) <= 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'">
                    {{ Number(p.dueAmount || 0) <= 0 ? 'পরিশোধিত' : 'বকেয়া' }}
                  </span>
                </td>
                <td class="text-center position-relative" @click.stop>
                  <div class="dropdown d-inline-block">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary py-0 px-2"
                      title="অ্যাকশন মেনু"
                      @click.stop="toggleActionMenu(p.id)">
                      <i class="bi bi-three-dots"></i>
                    </button>
                    <ul
                      v-if="openActionMenuId === p.id"
                      class="dropdown-menu dropdown-menu-end show shadow-sm py-1 border position-absolute"
                      style="min-width: 140px; z-index: 1050; right: 4px; top: 100%;">
                      <li>
                        <button
                          type="button"
                          class="dropdown-item py-1.5 px-3 small d-flex align-items-center gap-2"
                          @click.stop="openDetailsModal(p); openActionMenuId = null">
                          <i class="bi bi-eye text-primary"></i>
                          <span>বিস্তারিত</span>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          class="dropdown-item py-1.5 px-3 small d-flex align-items-center gap-2"
                          @click.stop="openAttachmentModal(p); openActionMenuId = null">
                          <i class="bi bi-images text-info"></i>
                          <span>ছবি যুক্ত / পরিবর্তন</span>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          class="dropdown-item py-1.5 px-3 small d-flex align-items-center gap-2"
                          @click.stop="editPurchase(p); openActionMenuId = null">
                          <i class="bi bi-pencil-square text-warning"></i>
                          <span>এডিট</span>
                        </button>
                      </li>
                      <li><hr class="dropdown-divider my-1"></li>
                      <li>
                        <button
                          type="button"
                          class="dropdown-item py-1.5 px-3 small d-flex align-items-center gap-2 text-danger"
                          @click.stop="confirmDeletePurchase(p); openActionMenuId = null">
                          <i class="bi bi-trash"></i>
                          <span>মুছে ফেলুন</span>
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
    </div>

    <!-- VIEW 3: চালানের বিস্তারিত ও পণ্যের বারকোড লিস্ট (পপ আপ ছাড়া সরাসরি ফুল পেইজ ভিউ) -->
    <div v-show="activeView === 'details' && selectedPurchase" class="card border shadow-sm mb-4">
      <div class="card-header bg-white border-bottom py-2.5 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-receipt-cutoff text-primary fs-5"></i>
          <h6 class="m-0 fw-bold">
            চালানের বিস্তারিত ও পণ্যের বারকোড লিস্ট (চালান নং: {{ selectedPurchase?.challanNumber || '-' }})
          </h6>
        </div>
      </div>

      <div class="card-body p-3">
        <!-- চালান তথ্য সামারি হেডার -->
        <div class="row g-2 mb-3 bg-light p-2.5 rounded border small">
          <div class="col-6 col-md-3">
            <span class="text-muted d-block">চালানের ধরন:</span>
            <strong>{{ selectedPurchase?.challanType?.name || 'সাধারণ চালান' }}</strong>
          </div>
          <div class="col-6 col-md-3">
            <span class="text-muted d-block">সাপ্লায়ার / প্রস্তুতকারী:</span>
            <strong>{{ selectedPurchase?.supplier?.name || selectedPurchase?.manufacturer?.name || '-' }}</strong>
          </div>
          <div class="col-6 col-md-3">
            <span class="text-muted d-block">চালান তারিখ:</span>
            <strong>{{ formatDate(selectedPurchase?.challanDate) }}</strong>
          </div>
          <div class="col-6 col-md-3">
            <span class="text-muted d-block">ব্র্যান্ড:</span>
            <strong>{{ getPurchaseBrandNames(selectedPurchase) }}</strong>
          </div>

          <div class="col-6 col-md-3 mt-2">
            <span class="text-muted d-block">পণ্যের মূল মূল্য (Subtotal):</span>
            <strong>৳ {{ toBengaliNumber(Number(selectedPurchase?.itemsAmount || 0).toFixed(2)) }}</strong>
          </div>
          <div class="col-6 col-md-3 mt-2">
            <span class="text-muted d-block">অন্যান্য খরচ / ডিসকাউন্ট:</span>
            <span>+৳ {{ toBengaliNumber(Number(selectedPurchase?.otherExpenses || 0).toFixed(2)) }} / -৳ {{ toBengaliNumber(Number(selectedPurchase?.discountAmount || 0).toFixed(2)) }}</span>
          </div>
          <div class="col-6 col-md-3 mt-2">
            <span class="text-muted d-block">সর্বমোট ক্রয়মূল্য:</span>
            <strong class="text-primary fs-6">৳ {{ toBengaliNumber(Number(selectedPurchase?.totalAmount || 0).toFixed(2)) }}</strong>
          </div>
          <div class="col-6 col-md-3 mt-2">
            <span class="text-muted d-block">পরিশোধিত / বকেয়া:</span>
            <span class="text-success fw-bold">৳ {{ toBengaliNumber(Number(selectedPurchase?.paidAmount || 0).toFixed(2)) }}</span> /
            <span class="text-danger fw-bold">৳ {{ toBengaliNumber(Number(selectedPurchase?.dueAmount || 0).toFixed(2)) }}</span>
          </div>

          <div v-if="selectedPurchase?.documentUrl" class="col-12 mt-2 pt-2 border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
            <span class="text-muted d-flex align-items-center gap-1.5 small">
              <i class="bi bi-paperclip text-primary fs-6"></i>
              <strong>সংযুক্ত চালান / ভাউচার কপি:</strong>
            </span>
            <div class="d-flex align-items-center gap-2">
              <img
                :src="resolveImageUrl(selectedPurchase.documentUrl)"
                alt="Challan Doc"
                class="rounded border cursor-pointer"
                style="width: 32px; height: 32px; object-fit: cover;"
                @click="previewFullImage(selectedPurchase.documentUrl)" />
              <button
                type="button"
                class="btn btn-xs btn-outline-primary d-inline-flex align-items-center gap-1"
                @click="previewFullImage(selectedPurchase.documentUrl)">
                <i class="bi bi-eye"></i>
                <span>চালান কপি দেখুন</span>
              </button>
            </div>
          </div>
        </div>

        <!-- পণ্যের তালিকা ও ১৪ ডিজিটের বারকোড -->
        <h6 class="fw-bold mb-2 text-dark d-flex align-items-center justify-content-between">
          <span>
            <i class="bi bi-upc-scan text-primary me-1"></i>
            পণ্যসমূহ ও অটো জেনারেটেড ১৪ ডিজিটের বারকোড (Pure Numeric)
          </span>
          <span class="badge bg-secondary small">
            মোট আইটেম {{ toBengaliNumber(selectedPurchase?.items?.length || 0) }} টি
          </span>
        </h6>

        <div class="table-responsive">
          <table class="table table-sm table-bordered align-middle mb-0">
            <thead class="table-light small text-nowrap">
              <tr>
                <th class="text-center" style="width: 35px;">#</th>
                <th>১৪-ডিজিট বারকোড</th>
                <th>পণ্যের নাম</th>
                <th>ব্র্যান্ড</th>
                <th>সাইজ / কালার</th>
                <th class="text-center">পরিমাণ</th>
                <th class="text-end">ভ্যাট ছাড়া একক (৳)</th>
                <th class="text-center">ভ্যাট (%)</th>
                <th class="text-end bg-primary-subtle text-primary fw-bold">প্রকৃত ক্রয়দর (৳)</th>
                <th class="text-end text-success fw-bold">MRP (৳)</th>
                <th class="text-end">লাইন মোট (৳)</th>
              </tr>
            </thead>
            <tbody class="small">
              <tr v-for="(it, i) in selectedPurchase?.items || []" :key="it.id || i">
                <td class="text-center text-muted">{{ toBengaliNumber(Number(i) + 1) }}</td>
                <!-- ১. বারকোডে আইকন/ব্যাজ ছাড়া রেগুলার ফন্ট -->
                <td>
                  <span class="text-dark">{{ it.code || '-' }}</span>
                </td>
                <!-- ২. পণ্যের নামে ক্যাটাগরি ছাড়া শুধু পণ্যের নাম -->
                <td>
                  <span class="fw-semibold text-dark">{{ it.name }}</span>
                </td>
                <!-- ৩. ব্র্যান্ড কলাম (নামের পরে) -->
                <td>
                  <span class="text-dark">{{ getItemBrandName(it) }}</span>
                </td>
                <!-- ৪. সাইজ/কালার কোনো ব্যাজ ছাড়া নরমাল ফন্টে -->
                <td>
                  <span>{{ it.size?.name || '-' }}</span>
                  <span v-if="it.color?.name" class="text-muted ms-1">/ {{ it.color.name }}</span>
                </td>
                <td class="text-center fw-bold">{{ toBengaliNumber(it.quantity) }} {{ it.unit?.name || '' }}</td>
                <!-- ৪. ভ্যাট ছাড়া একক মূল্য -->
                <td class="text-end">৳ {{ toBengaliNumber(getItemUnitPriceExclVat(it).toFixed(2)) }}</td>
                <td class="text-center">{{ toBengaliNumber(Number(it.vatRate || 0)) }}%</td>
                <td class="text-end bg-primary-subtle text-primary fw-bold">
                  ৳ {{ toBengaliNumber(Number(it.unitCost || 0).toFixed(2)) }}
                </td>
                <td class="text-end text-success fw-bold">
                  ৳ {{ toBengaliNumber(Number(it.sellingPrice || 0).toFixed(2)) }}
                </td>
                <td class="text-end fw-bold">৳ {{ toBengaliNumber(Number(it.totalPrice || 0).toFixed(2)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ==================================================== -->
    <!-- ছবি ও ডকুমেন্টস সংযুক্তি মোডাল (Attachment Modal) -->
    <!-- ==================================================== -->
    <div
      v-if="showAttachmentModal && selectedAttachmentPurchase"
      class="modal fade show d-block"
      style="background: rgba(0, 0, 0, 0.55); z-index: 1060;"
      tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg">
          <!-- Modal Header -->
          <div class="modal-header border-bottom py-2.5 px-3">
            <div class="d-flex align-items-center gap-2">
              <div class="bg-primary-subtle text-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                <i class="bi bi-images fs-5"></i>
              </div>
              <div>
                <h6 class="modal-title fw-bold mb-0">
                  চালানের ছবি ও ডকুমেন্টস সংযুক্তি
                </h6>
                <small class="text-muted">
                  চালান নং: <strong>#{{ selectedAttachmentPurchase.challanNumber || selectedAttachmentPurchase.id }}</strong>
                  <span class="mx-1">|</span>
                  সাপ্লায়ার: {{ selectedAttachmentPurchase.supplier?.name || selectedAttachmentPurchase.manufacturer?.name || '-' }}
                </small>
              </div>
            </div>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="closeAttachmentModal"></button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body p-3">
            <!-- Superadmin Policy Indicator Banner -->
            <div class="d-flex align-items-center justify-content-between p-2 mb-3 bg-light border rounded small">
              <span class="text-muted">
                <i class="bi bi-shield-check text-primary me-1"></i>
                সুপারএডমিন নির্ধারিত মোড:
                <strong class="text-dark">
                  {{
                    mediaUploadMode === 'direct_upload'
                      ? 'শুধুমাত্র সরাসরি ফাইল আপলোড'
                      : mediaUploadMode === 'google_drive'
                        ? 'শুধুমাত্র গুগল ড্রাইভ ও ওয়েব লিঙ্ক'
                        : 'উভয় পদ্ধতি (হাইব্রিড - ফাইল আপলোড ও গুগল ড্রাইভ)'
                  }}
                </strong>
              </span>
              <span v-if="mediaUploadMode !== 'google_drive'" class="badge bg-secondary-subtle text-secondary border">
                সর্বোচ্চ: {{ mediaMaxSizeMb }}MB
              </span>
            </div>

            <!-- ১. চালান কপি / মেমো রসিদের ছবি -->
            <div class="card border mb-3 shadow-none">
              <div class="card-header bg-transparent border-bottom py-2 d-flex align-items-center justify-content-between">
                <span class="fw-bold small d-flex align-items-center gap-1.5">
                  <i class="bi bi-file-earmark-medical text-primary"></i>
                  ১. চালান / বিল ভাউচার কপি (অডিট ও ভেরিফিকেশনের জন্য)
                </span>
                <span v-if="attachmentDocumentUrl" class="badge bg-success-subtle text-success border border-success-subtle small">
                  <i class="bi bi-check2 me-1"></i>সংযুক্ত রয়েছে
                </span>
                <span v-else class="text-muted small">ঐচ্ছিক</span>
              </div>
              <div class="card-body p-3">
                <div class="row g-3 align-items-center">
                  <!-- Inputs Col -->
                  <div class="col-12 col-md-8">
                    <!-- If superadmin setting allows BOTH: provide tab switcher -->
                    <div v-if="mediaUploadMode === 'both'" class="mb-2.5 d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div class="btn-group btn-group-sm p-0.5 rounded border" style="background-color: var(--bs-tertiary-bg, #f8f9fa);">
                        <button
                          type="button"
                          class="btn btn-xs fw-semibold px-2.5 py-1 rounded"
                          :class="attachmentDocTab === 'file' ? 'btn-primary text-white shadow-sm' : 'btn-link text-muted text-decoration-none'"
                          @click="attachmentDocTab = 'file'">
                          <i class="bi bi-cloud-arrow-up-fill me-1"></i>সরাসরি ফাইল আপলোড
                        </button>
                        <button
                          type="button"
                          class="btn btn-xs fw-semibold px-2.5 py-1 rounded"
                          :class="attachmentDocTab === 'link' ? 'btn-primary text-white shadow-sm' : 'btn-link text-muted text-decoration-none'"
                          @click="attachmentDocTab = 'link'">
                          <i class="bi bi-link-45deg me-1"></i>গুগল ড্রাইভ লিংক
                        </button>
                      </div>
                      <small v-if="attachmentDocTab === 'link' && isGoogleDriveLink(attachmentDocumentUrl)" class="text-success fw-bold">
                        <i class="bi bi-check-circle-fill me-1"></i>গুগল ড্রাইভ লিংক সক্রিয়
                      </small>
                    </div>

                    <!-- Direct File Upload Block (when active) -->
                    <div v-if="mediaUploadMode === 'direct_upload' || (mediaUploadMode === 'both' && attachmentDocTab === 'file')" class="py-1">
                      <label class="form-label small fw-semibold mb-1 d-block">ডিভাইস থেকে ফাইল নির্বাচন করুন:</label>
                      <div class="d-flex align-items-center flex-wrap gap-2">
                        <label class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2 cursor-pointer shadow-sm mb-0">
                          <span v-if="uploadingDoc" class="spinner-border spinner-border-sm" role="status"></span>
                          <i v-else class="bi bi-cloud-arrow-up-fill"></i>
                          <span>{{ attachmentDocumentUrl ? 'নতুন ফাইল নির্বাচন করুন' : 'ডিভাইস থেকে ছবি নির্বাচন করুন' }}</span>
                          <input type="file" accept="image/*" class="d-none" :disabled="uploadingDoc" @change="handleFileUpload($event, 'document')" />
                        </label>
                        <span v-if="attachmentDocumentUrl && !isGoogleDriveLink(attachmentDocumentUrl)" class="badge bg-success-subtle text-success border px-2 py-1.5 font-monospace">
                          <i class="bi bi-check-circle-fill me-1"></i>ফাইল সংরক্ষিত আছে
                        </span>
                      </div>
                      <small class="text-muted d-block mt-1">সর্বোচ্চ {{ mediaMaxSizeMb }}MB সাইজের JPG, PNG বা WEBP ছবি নির্বাচন করুন।</small>
                    </div>

                    <!-- Google Drive / Web Link Block (when active) -->
                    <div v-if="mediaUploadMode === 'google_drive' || (mediaUploadMode === 'both' && attachmentDocTab === 'link')" class="py-1">
                      <label class="form-label small fw-semibold mb-1 d-flex justify-content-between">
                        <span>গুগল ড্রাইভ বা ইমেজ লিংক:</span>
                        <small v-if="isGoogleDriveLink(attachmentDocumentUrl)" class="text-success fw-bold">
                          <i class="bi bi-google me-1"></i>গুগল ড্রাইভ লিংক সক্রিয়
                        </small>
                      </label>
                      <div class="input-group input-group-sm">
                        <span class="input-group-text bg-light text-muted">
                          <i class="bi bi-link-45deg fs-6"></i>
                        </span>
                        <input
                          v-model.trim="attachmentDocumentUrl"
                          type="text"
                          class="form-control form-control-sm font-monospace"
                          placeholder="https://drive.google.com/file/d/... অথবা ইমেজ লিংক পেস্ট করুন" />
                        <button
                          v-if="attachmentDocumentUrl"
                          type="button"
                          class="btn btn-outline-secondary"
                          title="মুছুন"
                          @click="attachmentDocumentUrl = ''">
                          <i class="bi bi-x-lg"></i>
                        </button>
                      </div>
                      <small class="text-muted d-block mt-1">গুগল ড্রাইভের শেয়ার লিংক পেস্ট করলে সিস্টেম স্বয়ংক্রিয়ভাবে সরাসরি প্রিভিউ দেখাবে।</small>
                    </div>
                  </div>

                  <!-- Preview Col -->
                  <div class="col-12 col-md-4 text-center">
                    <div
                      class="border rounded p-1 bg-light d-flex align-items-center justify-content-center mx-auto position-relative"
                      style="width: 130px; height: 130px; overflow: hidden;">
                      <template v-if="attachmentDocumentUrl">
                        <img
                          :src="resolveImageUrl(attachmentDocumentUrl)"
                          alt="Challan Copy"
                          class="w-100 h-100 object-fit-cover rounded cursor-pointer"
                          @click="previewFullImage(attachmentDocumentUrl)" />
                        <button
                          type="button"
                          class="btn btn-danger btn-xs position-absolute top-0 end-0 m-1 rounded-circle p-1"
                          style="line-height: 1;"
                          title="ছবি মুছুন"
                          @click="attachmentDocumentUrl = ''">
                          <i class="bi bi-trash" style="font-size: 11px;"></i>
                        </button>
                      </template>
                      <div v-else class="text-muted small p-2">
                        <i class="bi bi-card-image fs-1 d-block text-secondary opacity-50"></i>
                        <span>কপি নেই</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ২. চালানের অন্তর্গত পণ্যসমূহের ছবি -->
            <div class="card border shadow-none">
              <div class="card-header bg-transparent border-bottom py-2 d-flex align-items-center justify-content-between">
                <span class="fw-bold small d-flex align-items-center gap-1.5">
                  <i class="bi bi-box-seam text-primary"></i>
                  ২. এই চালানের পণ্যগুলোর ছবি (POS ও ক্যাটালগে প্রদর্শিত হবে)
                </span>
                <span class="badge bg-secondary-subtle text-secondary border small">
                  {{ attachmentItems.length }} টি পণ্য
                </span>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive" style="max-height: 280px; overflow-y: auto;">
                  <table class="table table-hover align-middle mb-0 small">
                    <thead class="bg-light text-muted sticky-top">
                      <tr>
                        <th style="width: 60px;" class="text-center">ছবি</th>
                        <th style="min-width: 140px;">পণ্যের নাম</th>
                        <th style="width: 100px;">ব্র্যান্ড/সাইজ</th>
                        <th style="min-width: 260px;">
                          {{ mediaUploadMode === 'google_drive' ? 'গুগল ড্রাইভ লিংক' : (mediaUploadMode === 'direct_upload' ? 'ছবি আপলোড' : 'ছবি আপলোড / ড্রাইভ লিংক') }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(it, idx) in attachmentItems" :key="idx">
                        <!-- Thumbnail -->
                        <td class="text-center">
                          <div
                            class="border rounded bg-light d-flex align-items-center justify-content-center mx-auto position-relative"
                            style="width: 48px; height: 48px; overflow: hidden;">
                            <img
                              v-if="it.imageUrl"
                              :src="resolveImageUrl(it.imageUrl)"
                              alt="Item"
                              class="w-100 h-100 object-fit-cover rounded cursor-pointer"
                              @click="previewFullImage(it.imageUrl)" />
                            <i v-else class="bi bi-image text-muted fs-5"></i>
                          </div>
                        </td>

                        <!-- Name -->
                        <td>
                          <div class="fw-semibold text-dark">{{ it.name }}</div>
                          <small v-if="it.code" class="text-muted font-monospace">{{ it.code }}</small>
                        </td>

                        <!-- Brand / Size -->
                        <td>
                          <div>{{ it.brandName || '-' }}</div>
                          <small class="text-muted">{{ it.sizeName || '' }} {{ it.colorName ? `(${it.colorName})` : '' }}</small>
                        </td>

                        <!-- Upload or Link Input based on Superadmin mode -->
                        <td>
                          <!-- Case A: Only Google Drive Mode -->
                          <div v-if="mediaUploadMode === 'google_drive'">
                            <div class="input-group input-group-sm">
                              <span class="input-group-text bg-light text-muted">
                                <i class="bi bi-google"></i>
                              </span>
                              <input
                                v-model.trim="it.imageUrl"
                                type="text"
                                class="form-control form-control-sm font-monospace"
                                placeholder="গুগল ড্রাইভ লিংক পেস্ট করুন..." />
                              <button
                                v-if="it.imageUrl"
                                type="button"
                                class="btn btn-outline-secondary"
                                title="মুছুন"
                                @click="it.imageUrl = ''">
                                <i class="bi bi-x-lg"></i>
                              </button>
                            </div>
                            <small v-if="isGoogleDriveLink(it.imageUrl)" class="text-success fw-bold d-block mt-0.5" style="font-size: 0.68rem;">
                              <i class="bi bi-check-circle-fill me-1"></i>ড্রাইভ লিংক সংযুক্ত
                            </small>
                          </div>

                          <!-- Case B: Only Direct File Upload Mode -->
                          <div v-else-if="mediaUploadMode === 'direct_upload'" class="d-flex align-items-center gap-2">
                            <label
                              class="btn btn-outline-primary btn-xs mb-0 d-inline-flex align-items-center gap-1.5 cursor-pointer"
                              :class="{ 'disabled': it.uploading }">
                              <span v-if="it.uploading" class="spinner-border spinner-border-sm" role="status"></span>
                              <i v-else class="bi bi-cloud-arrow-up-fill"></i>
                              <span>{{ it.imageUrl ? 'ছবি পরিবর্তন' : 'ফাইল আপলোড' }}</span>
                              <input
                                type="file"
                                accept="image/*"
                                class="d-none"
                                :disabled="it.uploading"
                                @change="handleItemFileUpload($event, it)" />
                            </label>
                            <span v-if="it.imageUrl" class="badge bg-success-subtle text-success border font-monospace" style="font-size: 0.7rem;">
                              আপলোড সম্পন্ন
                            </span>
                            <button
                              v-if="it.imageUrl"
                              type="button"
                              class="btn btn-xs btn-outline-danger"
                              title="ছবি মুছুন"
                              @click="it.imageUrl = ''">
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>

                          <!-- Case C: Both Modes (Hybrid) -->
                          <div v-else>
                            <div class="input-group input-group-sm">
                              <input
                                v-model.trim="it.imageUrl"
                                type="text"
                                class="form-control form-control-sm font-monospace"
                                placeholder="ড্রাইভ লিংক পেস্ট করুন..." />
                              <label
                                class="btn btn-outline-primary d-inline-flex align-items-center gap-1 cursor-pointer mb-0"
                                :class="{ 'disabled': it.uploading }"
                                title="ডিভাইস থেকে ফাইল নির্বাচন করুন">
                                <span v-if="it.uploading" class="spinner-border spinner-border-sm" role="status"></span>
                                <i v-else class="bi bi-upload"></i>
                                <span class="d-none d-sm-inline">ফাইল</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  class="d-none"
                                  :disabled="it.uploading"
                                  @change="handleItemFileUpload($event, it)" />
                              </label>
                              <button
                                v-if="it.imageUrl"
                                type="button"
                                class="btn btn-outline-danger"
                                title="ছবি মুছুন"
                                @click="it.imageUrl = ''">
                                <i class="bi bi-x"></i>
                              </button>
                            </div>
                            <small v-if="isGoogleDriveLink(it.imageUrl)" class="text-success fw-bold d-block mt-0.5" style="font-size: 0.68rem;">
                              <i class="bi bi-google me-1"></i>গুগল ড্রাইভ লিংক সংযুক্ত
                            </small>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer border-top py-2 px-3 d-flex justify-content-between">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              @click="closeAttachmentModal">
              বন্ধ করুন
            </button>

            <button
              type="button"
              class="btn btn-sm btn-primary px-3 d-inline-flex align-items-center gap-1 shadow-sm"
              :disabled="savingAttachments"
              @click="saveAttachments">
              <span v-if="savingAttachments" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i v-else class="bi bi-check2-circle"></i>
              <span>সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ফুল স্ক্রিন ইমেজ প্রিভিউ মোডাল -->
    <div
      v-if="fullImageUrl"
      class="modal fade show d-block"
      style="background: rgba(0, 0, 0, 0.85); z-index: 1090;"
      tabindex="-1"
      @click="fullImageUrl = ''">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content bg-transparent border-0 text-center">
          <div class="position-relative d-inline-block mx-auto">
            <button
              type="button"
              class="btn btn-close btn-close-white position-absolute top-0 end-0 m-2"
              @click="fullImageUrl = ''"></button>
            <img :src="resolveImageUrl(fullImageUrl)" alt="Full Preview" class="img-fluid rounded shadow-lg" style="max-height: 85vh;" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { computed, inject, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

// Breadcrumb & Page Title injection
const setBreadcrumbs = inject<((crumbs: any[] | null) => void) | null>("setBreadcrumbs", null);
const setPageTitle = inject<((t: string) => void) | null>("setPageTitle", null);

// Master Catalog Data
const categoriesList = ref<any[]>([]);
const subCategoriesList = ref<any[]>([]);
const brandsList = ref<any[]>([]);
const sizesList = ref<any[]>([]);
const colorsList = ref<any[]>([]);
const unitsList = ref<any[]>([]);
const challanTypesList = ref<any[]>([]);
const vendorTypesList = ref<any[]>([]);
const paymentMethodsList = ref<any[]>([]);
const suppliersList = ref<any[]>([]);
const manufacturersList = ref<any[]>([]);
const purchasesList = ref<any[]>([]);
const itemsList = ref<any[]>([]);

// View State & Component Data
const activeView = ref<"form" | "list" | "details">(route?.query?.view === "form" ? "form" : "list");
const selectedPurchase = ref<any>(null);
const editingPurchaseId = ref<number | null>(null);
const submitting = ref(false);
const loadingPurchases = ref(false);
const searchQuery = ref("");
const openActionMenuId = ref<number | null>(null);

function toggleActionMenu(id: number, event?: Event) {
  if (event) {
    event.stopPropagation();
  }
  openActionMenuId.value = openActionMenuId.value === id ? null : id;
}

function handleGlobalClick() {
  openActionMenuId.value = null;
}

function switchView(view: "form" | "list" | "details") {
  activeView.value = view;
  if (view !== "details" && router) {
    router.replace({ query: { ...route.query, view } });
  }
}

function openNewPurchaseForm() {
  editingPurchaseId.value = null;
  resetForm();
  switchView("form");
}

function updateBreadcrumb() {
  if (activeView.value === "list") {
    if (setBreadcrumbs) {
      setBreadcrumbs([{ label: "ক্রয় তালিকা" }]);
    } else if (setPageTitle) {
      setPageTitle("ক্রয় তালিকা");
    }
  } else if (activeView.value === "form") {
    if (editingPurchaseId.value) {
      const editLabel = form.challanNumber ? `চালান এডিট (${form.challanNumber})` : "চালান এডিট";
      if (setBreadcrumbs) {
        setBreadcrumbs([
          {
            label: "ক্রয় তালিকা",
            onClick: () => switchView("list")
          },
          {
            label: editLabel
          }
        ]);
      } else if (setPageTitle) {
        setPageTitle(editLabel);
      }
    } else {
      if (setBreadcrumbs) {
        setBreadcrumbs([{ label: "নতুন ক্রয়" }]);
      } else if (setPageTitle) {
        setPageTitle("নতুন ক্রয়");
      }
    }
  } else if (activeView.value === "details") {
    const challanNo = selectedPurchase.value?.challanNumber;
    const detailsLabel = challanNo ? `চালানের বিস্তারিত (নং: ${challanNo})` : "চালানের বিস্তারিত";
    if (setBreadcrumbs) {
      setBreadcrumbs([
        {
          label: "ক্রয় তালিকা",
          onClick: () => switchView("list")
        },
        {
          label: detailsLabel
        }
      ]);
    } else if (setPageTitle) {
      setPageTitle(detailsLabel);
    }
  }
}

watch(
  () => route?.query?.view,
  (newView) => {
    if (newView === "form") {
      activeView.value = "form";
    } else if (newView === "list" || !newView) {
      activeView.value = "list";
    }
  },
  { immediate: true }
);

watch(
  [activeView, selectedPurchase, editingPurchaseId],
  () => {
    updateBreadcrumb();
  },
  { immediate: true }
);

// Toast Notification
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
  }, 4000);
}

// Bengali Number Converter
function toBengaliNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return "০";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/[0-9]/g, (w) => bengaliDigits[+w]);
}

// Payment method display name (ইংরেজি থাকবে, কিন্তু ডাবল হবে না)
function formatPaymentMethodName(pm: any): string {
  if (!pm) return "";
  const name = typeof pm === "string" ? pm : (pm.name || "");
  const code = typeof pm === "object" ? (pm.code || "") : "";
  // যদি নামের মধ্যেই ইতিমধ্যে ইংরেজি থাকে (যেমন: "নগদ / ক্যাশ (Cash)"), তবে নতুন করে কোড ডাবল হবে না
  if (/[a-zA-Z]/.test(name)) {
    return name;
  }
  // অন্যথায় যদি কোড থাকে, তবে একবার যুক্ত হবে
  if (code) {
    return `${name} (${code})`;
  }
  return name;
}

// পণ্যের নাম থেকে সাইজের অংশ বাদ দেওয়ার ফাংশন (যেহেতু পাশে আলাদা সাইজ ফিল্ড রয়েছে)
function cleanItemName(name: string): string {
  if (!name) return "";
  return name
    .replace(/\s*\(\s*(?:সাইজ|size)[\s\-:—].*?\)/i, "")
    .replace(/\s*(?:সাইজ|size)[\s\-:—].*$/i, "")
    .replace(/\s*(?:সাইজ|size)\s*[-:—]?\s*.*$/i, "")
    .replace(/_[^_]+$/, "")
    .trim();
}

// Today date strings (Format: DD/MM/YYYY)
const now = new Date();
const todayISO = now.toISOString().split("T")[0];
const day = String(now.getDate()).padStart(2, "0");
const month = String(now.getMonth() + 1).padStart(2, "0");
const year = now.getFullYear();
const todayFormatted = `${day}/${month}/${year}`;

// Form state
interface PurchaseItemRow {
  itemId: number | "";
  categoryId: number | "";
  subCategoryId: number | "";
  brandId: number | "";
  sizeId: number | "";
  colorId: number | "";
  unitId: number | "";
  name: string;
  code: string;
  isCodeCustomized?: boolean;
  quantity: number | "";
  unitPrice: number | "";
  totalPrice: number;
  sellingPrice?: number | "";
  vatRate?: number | "";
  priceExclVat?: number;
  unitPriceExclVat?: number;
}

const editingIndex = ref<number | null>(null);

const currentItem = reactive<PurchaseItemRow & { vatRate: number | "" }>({
  itemId: "",
  categoryId: "",
  subCategoryId: "",
  brandId: "",
  sizeId: "",
  colorId: "",
  unitId: "",
  name: "",
  code: "",
  isCodeCustomized: false,
  quantity: "" as any,
  unitPrice: "" as any,
  totalPrice: 0,
  sellingPrice: "" as any,
  vatRate: "" as any,
  priceExclVat: 0,
  unitPriceExclVat: 0
});

// ভ্যাট মোড (ভ্যাট ছাড়া vs ভ্যাট সহ)
const vatMode = ref<"excl" | "incl">("excl");

// ভ্যাট ছাড়া প্রতি পিসের একক মূল্য
const currentItemUnitCostExclVat = computed(() => {
  const unit = Number(currentItem.unitPrice) || 0;
  const vat = Number(currentItem.vatRate) || 0;
  if (vatMode.value === "excl") {
    return unit;
  } else {
    // ভ্যাট সহ ইনপুট হলে, ভ্যাট ছাড়া একক দর = unit / (1 + vat / 100)
    return vat > 0 ? Number((unit / (1 + vat / 100)).toFixed(2)) : unit;
  }
});

// ভ্যাট ছাড়া পণ্যের মূল মোট মূল্য: quantity * currentItemUnitCostExclVat
const currentItemTotalExclVat = computed(() => {
  const qty = Number(currentItem.quantity) || 0;
  const unitExcl = currentItemUnitCostExclVat.value;
  return Number((qty * unitExcl).toFixed(2));
});

// ভ্যাট সহ প্রতি পিসের একক মূল্য
const currentItemUnitCost = computed(() => {
  const unit = Number(currentItem.unitPrice) || 0;
  const vat = Number(currentItem.vatRate) || 0;
  if (vatMode.value === "incl") {
    return unit.toFixed(2);
  } else {
    // ভ্যাট ছাড়া ইনপুট হলে, ভ্যাট সহ একক দর = unit * (1 + vat / 100)
    const withVat = unit * (1 + vat / 100);
    return withVat.toFixed(2);
  }
});

// ভ্যাট সহ পণ্যের মোট মূল্য: quantity * currentItemUnitCost
const currentItemPriceWithVat = computed(() => {
  const qty = Number(currentItem.quantity) || 0;
  const unitIncl = parseFloat(currentItemUnitCost.value) || 0;
  return (qty * unitIncl).toFixed(2);
});

// ভ্যাটের মোট টাকা
const currentItemVatAmount = computed(() => {
  const totalIncl = parseFloat(currentItemPriceWithVat.value) || 0;
  const totalExcl = currentItemTotalExclVat.value;
  return Math.max(0, totalIncl - totalExcl);
});

// ব্যাকওয়ার্ড কম্প্যাটিবিলিটি এলিয়াস
const currentItemPriceExclVat = currentItemPriceWithVat;

// নির্বাচিত পণ্যের সাব-ক্যাটাগরি বা ক্যাটাগরি অনুযায়ী ফিল্টার করা ব্র্যান্ড তালিকা
const filteredBrandsList = computed(() => {
  const subCatId = currentItem.subCategoryId;
  const catId = currentItem.categoryId;

  if (subCatId) {
    const matched = brandsList.value.filter(
      (b: any) =>
        String(b.subCategoryId ?? b.sub_category_id ?? b.subCategory?.id ?? "") === String(subCatId)
    );
    if (matched.length > 0) {
      if (currentItem.brandId && !matched.some((b: any) => Number(b.id) === Number(currentItem.brandId))) {
        const sel = brandsList.value.find((b: any) => Number(b.id) === Number(currentItem.brandId));
        if (sel) return [sel, ...matched];
      }
      return matched;
    }
  }

  if (catId) {
    const matched = brandsList.value.filter(
      (b: any) =>
        String(b.categoryId ?? b.category_id ?? b.category?.id ?? "") === String(catId)
    );
    if (matched.length > 0) {
      if (currentItem.brandId && !matched.some((b: any) => Number(b.id) === Number(currentItem.brandId))) {
        const sel = brandsList.value.find((b: any) => Number(b.id) === Number(currentItem.brandId));
        if (sel) return [sel, ...matched];
      }
      return matched;
    }
  }

  return brandsList.value;
});

// নির্বাচিত পণ্যের সাব-ক্যাটাগরি বা ক্যাটাগরি অনুযায়ী ফিল্টার করা সাইজ তালিকা
const filteredSizesList = computed(() => {
  const subCatId = currentItem.subCategoryId;
  const catId = currentItem.categoryId;

  if (subCatId) {
    const matched = sizesList.value.filter(
      (s: any) => String(s.subCategoryId ?? s.sub_category_id ?? "") === String(subCatId)
    );
    if (matched.length > 0) {
      if (currentItem.sizeId && !matched.some((s: any) => Number(s.id) === Number(currentItem.sizeId))) {
        const sel = sizesList.value.find((s: any) => Number(s.id) === Number(currentItem.sizeId));
        if (sel) return [sel, ...matched];
      }
      return matched;
    }
  }

  if (catId) {
    const matched = sizesList.value.filter(
      (s: any) => String(s.categoryId ?? s.category_id ?? "") === String(catId)
    );
    if (matched.length > 0) {
      if (currentItem.sizeId && !matched.some((s: any) => Number(s.id) === Number(currentItem.sizeId))) {
        const sel = sizesList.value.find((s: any) => Number(s.id) === Number(currentItem.sizeId));
        if (sel) return [sel, ...matched];
      }
      return matched;
    }
  }

  return sizesList.value;
});

// নির্বাচিত পণ্যের সাব-ক্যাটাগরি বা ক্যাটাগরি অনুযায়ী ফিল্টার করা একক তালিকা
const filteredUnitsList = computed(() => {
  const subCatId = currentItem.subCategoryId;
  const catId = currentItem.categoryId;

  if (subCatId) {
    const matched = unitsList.value.filter(
      (u: any) => String(u.subCategoryId ?? u.sub_category_id ?? "") === String(subCatId)
    );
    if (matched.length > 0) {
      if (currentItem.unitId && !matched.some((u: any) => Number(u.id) === Number(currentItem.unitId))) {
        const sel = unitsList.value.find((u: any) => Number(u.id) === Number(currentItem.unitId));
        if (sel) return [sel, ...matched];
      }
      return matched;
    }
  }

  if (catId) {
    const matched = unitsList.value.filter(
      (u: any) => String(u.categoryId ?? u.category_id ?? "") === String(catId)
    );
    if (matched.length > 0) {
      if (currentItem.unitId && !matched.some((u: any) => Number(u.id) === Number(currentItem.unitId))) {
        const sel = unitsList.value.find((u: any) => Number(u.id) === Number(currentItem.unitId));
        if (sel) return [sel, ...matched];
      }
      return matched;
    }
  }

  return unitsList.value;
});

const form = reactive({
  challanTypeId: "" as number | "",
  challanNumber: "",
  challanDate: todayISO,
  supplierId: "" as number | "",
  manufacturerId: "" as number | "",
  paymentMethod: "cash",
  otherExpenses: 0,
  discountAmount: 0,
  paidAmount: "" as number | "",
  notes: "",
  items: [] as PurchaseItemRow[]
});

// Active Payment Methods from SuperAdmin Settings
const activePaymentMethods = computed(() => {
  return paymentMethodsList.value.filter((pm) => pm.isActive);
});

// Vendor toggle & dynamic master list
const vendorType = ref<string>("supplier");

const activeVendorTypes = computed(() => {
  return vendorTypesList.value.filter((vt) => vt.isActive);
});

// Challan Type & Bill of Entry check
const selectedChallanType = computed(() => {
  if (!form.challanTypeId) return null;
  return challanTypesList.value.find((ct) => String(ct.id) === String(form.challanTypeId)) || null;
});

const isBillOfEntry = computed(() => {
  const ct = selectedChallanType.value;
  if (!ct) return false;
  const name = (ct.name || "").toLowerCase().trim();
  const code = (ct.code || "").toLowerCase().trim();
  return (
    name.includes("বিল অব এন্ট্রি") ||
    name.includes("বিল অফ এন্ট্রি") ||
    name.includes("bill of entry") ||
    code === "bill_of_entry" ||
    code.includes("entry")
  );
});

const exporterVendorType = computed(() => {
  return (
    activeVendorTypes.value.find((vt) => {
      const name = (vt.name || "").toLowerCase().trim();
      const code = (vt.code || "").toLowerCase().trim();
      return name.includes("রপ্তানি") || code.includes("export");
    }) || null
  );
});

const hasExporterInVendorTypes = computed(() => !!exporterVendorType.value);

const previousVendorTypeBeforeFreeze = ref<string>("");

const selectedVendorTypeName = computed(() => {
  const current = (vendorType.value || "").trim().toLowerCase();
  const selectedVt = activeVendorTypes.value.find(
    (vt) => (vt.code || "").toLowerCase() === current || vt.name.toLowerCase() === current || String(vt.id) === current
  );
  if (selectedVt) return selectedVt.name;
  if (current === "manufacturer" || current.includes("প্রস্তুত")) return "প্রস্তুতকারী";
  if (current === "exporter" || current.includes("রপ্তানি")) return "রপ্তানিকারক";
  return vendorType.value || "সাপ্লায়ার";
});

const isManufacturerVendor = computed(() => {
  const selectedVt = activeVendorTypes.value.find(
    (vt) => vt.code === vendorType.value || vt.name === vendorType.value || String(vt.id) === String(vendorType.value)
  );
  if (selectedVt) {
    return (selectedVt.code || "").toLowerCase() === "manufacturer" || selectedVt.name.includes("প্রস্তুতকারী") || selectedVt.name.includes("প্রস্তুতকারক");
  }
  return vendorType.value === "manufacturer" || vendorType.value === "প্রস্তুতকারী" || vendorType.value === "প্রস্তুতকারক";
});

const selectedPartnerId = ref<string>("");

function onPartnerChange() {
  if (!selectedPartnerId.value) {
    form.supplierId = "";
    form.manufacturerId = "";
    return;
  }
  const [source, idStr] = String(selectedPartnerId.value).split(":");
  const id = Number(idStr);
  if (source === "manufacturer") {
    form.manufacturerId = id;
    form.supplierId = "";
  } else {
    form.supplierId = id;
    form.manufacturerId = "";
  }
}

function onVendorTypeChange() {
  selectedPartnerId.value = "";
  form.supplierId = "";
  form.manufacturerId = "";
}

// Watch for changes in Challan Type: if Bill of Entry, auto-set to exporter & freeze
watch(
  () => isBillOfEntry.value,
  (isBOE, oldBOE) => {
    if (isBOE) {
      if (!oldBOE) {
        previousVendorTypeBeforeFreeze.value = vendorType.value;
      }
      const exporterVal = exporterVendorType.value
        ? exporterVendorType.value.code || exporterVendorType.value.name
        : "রপ্তানিকারক";
      vendorType.value = exporterVal;
      onVendorTypeChange();
    } else if (oldBOE) {
      // Switched away from Bill of Entry -> unfreeze and restore previous or fallback
      if (previousVendorTypeBeforeFreeze.value) {
        vendorType.value = previousVendorTypeBeforeFreeze.value;
      } else if (activeVendorTypes.value.length > 0) {
        vendorType.value = activeVendorTypes.value[0].code || activeVendorTypes.value[0].name;
      } else {
        vendorType.value = "supplier";
      }
      onVendorTypeChange();
    }
  }
);

// If active vendor types load and isBillOfEntry is already true, ensure vendorType points to exporter
watch(
  exporterVendorType,
  (exp) => {
    if (isBillOfEntry.value && exp) {
      vendorType.value = exp.code || exp.name;
    }
  }
);

const filteredVendorsBySelectedType = computed(() => {
  const currentType = (vendorType.value || "").trim().toLowerCase();
  const currentTypeName = (selectedVendorTypeName.value || "").trim().toLowerCase();

  // If manufacturer
  if (isManufacturerVendor.value) {
    return manufacturersList.value.map((m) => ({
      id: m.id,
      name: m.name,
      mobile: m.mobile,
      address: m.factoryAddress || m.address || "",
      source: "manufacturer" as const
    }));
  }

  // Filter from suppliersList & manufacturersList matching this vendorType
  const isExporterMode = currentType.includes("export") || currentTypeName.includes("রপ্তানি");

  const matchedFromSuppliers = suppliersList.value.filter((s) => {
    const sVt = (s.vendorType || "supplier").trim().toLowerCase();
    if (isExporterMode) {
      return sVt.includes("export") || sVt.includes("রপ্তানি") || sVt === currentType;
    }
    if (currentType === "supplier" || currentTypeName === "সাপ্লায়ার") {
      return !s.vendorType || sVt === "supplier" || sVt === "সাপ্লায়ার";
    }
    return sVt === currentType || sVt === currentTypeName;
  }).map((s) => ({
    id: s.id,
    name: s.name,
    mobile: s.mobile,
    address: s.address || "",
    source: "supplier" as const
  }));

  const matchedFromManufacturers = manufacturersList.value.filter((m) => {
    if (!m.vendorType) return false;
    const mVt = m.vendorType.trim().toLowerCase();
    if (isExporterMode) {
      return mVt.includes("export") || mVt.includes("রপ্তানি") || mVt === currentType;
    }
    return mVt === currentType || mVt === currentTypeName;
  }).map((m) => ({
    id: m.id,
    name: m.name,
    mobile: m.mobile,
    address: m.factoryAddress || m.address || "",
    source: "manufacturer" as const
  }));

  const combined = [...matchedFromSuppliers, ...matchedFromManufacturers];

  // If no specific partner is registered under this custom type yet, fallback to all suppliers so dropdown is not empty
  if (combined.length === 0 && currentType !== "supplier" && currentTypeName !== "সাপ্লায়ার") {
    return suppliersList.value.map((s) => ({
      id: s.id,
      name: s.name,
      mobile: s.mobile,
      address: s.address || "",
      source: "supplier" as const
    }));
  }

  return combined;
});

const selectedPartner = computed(() => {
  if (!selectedPartnerId.value) return null;
  return (
    filteredVendorsBySelectedType.value.find(
      (v) => `${v.source}:${v.id}` === selectedPartnerId.value
    ) || null
  );
});

const selectedPartnerName = computed(() => {
  return selectedPartner.value?.name || "";
});

function generateCurrentItemBarcode(force: boolean = false) {
  if (!force && currentItem.isCodeCustomized && currentItem.code) {
    return;
  }
  // Formula: Category(2) + SubCategory(2) + Brand(2) + Size(2) + YYMM(4) + Batch(2) = 14 digits
  const cat = String(currentItem.categoryId || 0).padStart(2, "0").slice(-2);
  const sub = String(currentItem.subCategoryId || 0).padStart(2, "0").slice(-2);
  const brand = String(currentItem.brandId || 0).padStart(2, "0").slice(-2);
  const size = String(currentItem.sizeId || 0).padStart(2, "0").slice(-2);

  let d = form.challanDate ? new Date(form.challanDate) : new Date();
  if (isNaN(d.getTime())) d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yymm = `${yy}${mm}`;
  const batch = "01";

  currentItem.code = `${cat}${sub}${brand}${size}${yymm}${batch}`;
}

function onCurrentItemBrandChange() {
  generateCurrentItemBarcode(true);
}

function onCurrentItemSizeChange() {
  generateCurrentItemBarcode(false);
}

function onCurrentItemSelect() {
  const selected = itemsList.value.find((it) => it.id === Number(currentItem.itemId));
  if (selected) {
    currentItem.name = cleanItemName(selected.name);
    currentItem.categoryId = selected.categoryId || (selected.category?.id ?? "");
    currentItem.subCategoryId = selected.subCategoryId || (selected.subCategory?.id ?? "");
    if (selected.brandId) currentItem.brandId = selected.brandId;
    if (selected.sizeId) currentItem.sizeId = selected.sizeId;
    if (selected.colorId) currentItem.colorId = selected.colorId;
    if (selected.unitId) currentItem.unitId = selected.unitId;
    if (Number(selected.purchasePrice) > 0) {
      currentItem.unitPrice = Number(selected.purchasePrice);
    }
    if (selected.sellingPrice) {
      currentItem.sellingPrice = Number(selected.sellingPrice) || 0;
    }
    generateCurrentItemBarcode(false);
  }
}

function addItemToList() {
  if (!currentItem.itemId && !currentItem.name.trim()) {
    showToast("অনুগ্রহ করে একটি পণ্য নির্বাচন করুন", "warning");
    return;
  }
  if (!currentItem.brandId) {
    showToast("অনুগ্রহ করে পণ্যের ব্র্যান্ড নির্বাচন করুন (ব্র্যান্ড বাধ্যতামূলক)", "warning");
    return;
  }
  if (!currentItem.sizeId) {
    showToast("অনুগ্রহ করে পণ্যের সাইজ নির্বাচন করুন", "warning");
    return;
  }
  if (!currentItem.unitId) {
    showToast("অনুগ্রহ করে পণ্যের একক নির্বাচন করুন", "warning");
    return;
  }
  if (currentItem.quantity === "" || currentItem.quantity === null || (Number(currentItem.quantity) || 0) <= 0) {
    showToast("অনুগ্রহ করে পণ্যের পরিমাণ উল্লেখ করুন (কমপক্ষে ১)", "warning");
    return;
  }
  if (currentItem.unitPrice === "" || currentItem.unitPrice === null || (Number(currentItem.unitPrice) || 0) <= 0) {
    showToast("অনুগ্রহ করে একক ক্রয়মূল্য উল্লেখ করুন", "warning");
    return;
  }
  if (currentItem.sellingPrice !== "" && currentItem.sellingPrice !== null && (isNaN(Number(currentItem.sellingPrice)) || Number(currentItem.sellingPrice) < 0)) {
    showToast("অনুগ্রহ করে সঠিক MRP (একক বিক্রয়মূল্য) উল্লেখ করুন (না থাকলে ০ লিখুন)", "warning");
    return;
  }
  const mrpVal = currentItem.sellingPrice !== "" && currentItem.sellingPrice !== null && !isNaN(Number(currentItem.sellingPrice))
    ? Math.max(0, Number(currentItem.sellingPrice))
    : 0;

  if (currentItem.vatRate === "" || currentItem.vatRate === null || isNaN(Number(currentItem.vatRate)) || Number(currentItem.vatRate) < 0) {
    showToast("অনুগ্রহ করে ভ্যাট (%) উল্লেখ করুন (ভ্যাট না থাকলে ০ লিখুন)", "warning");
    return;
  }

  const p = getItemPricing(currentItem);

  const rowData: PurchaseItemRow = {
    itemId: currentItem.itemId,
    categoryId: currentItem.categoryId,
    subCategoryId: currentItem.subCategoryId,
    brandId: currentItem.brandId,
    sizeId: currentItem.sizeId,
    colorId: currentItem.colorId,
    unitId: currentItem.unitId,
    name: cleanItemName(currentItem.name).trim(),
    code: currentItem.code?.trim() || "",
    isCodeCustomized: currentItem.isCodeCustomized,
    quantity: Number(currentItem.quantity) || 1,
    unitPrice: Number(currentItem.unitPrice) || 0,
    totalPrice: p.totalWithVat,
    sellingPrice: mrpVal,
    vatRate: Number(currentItem.vatRate) || 0,
    priceExclVat: p.totalExclVat,
    unitPriceExclVat: p.unitExclVat
  };

  if (editingIndex.value !== null && editingIndex.value >= 0) {
    form.items[editingIndex.value] = rowData;
    showToast("পণ্য সফলভাবে আপডেট করা হয়েছে", "success");
    editingIndex.value = null;
  } else {
    form.items.push(rowData);
    showToast("পণ্য তালিকায় যুক্ত করা হয়েছে", "success");
  }

  resetCurrentItem();
}

function resetCurrentItem() {
  editingIndex.value = null;
  currentItem.itemId = "";
  currentItem.categoryId = "";
  currentItem.subCategoryId = "";
  currentItem.brandId = "";
  currentItem.sizeId = "";
  currentItem.colorId = "";
  currentItem.unitId = "";
  currentItem.name = "";
  currentItem.code = "";
  currentItem.isCodeCustomized = false;
  currentItem.quantity = "" as any;
  currentItem.unitPrice = "" as any;
  currentItem.totalPrice = 0;
  currentItem.sellingPrice = "" as any;
  currentItem.vatRate = "" as any;
}

function editItem(index: number) {
  const it = form.items[index];
  if (!it) return;
  editingIndex.value = index;
  currentItem.itemId = it.itemId;
  currentItem.categoryId = it.categoryId;
  currentItem.subCategoryId = it.subCategoryId;
  currentItem.brandId = it.brandId;
  currentItem.sizeId = it.sizeId;
  currentItem.colorId = it.colorId;
  currentItem.unitId = it.unitId;
  currentItem.name = cleanItemName(it.name);
  currentItem.code = it.code || "";
  currentItem.isCodeCustomized = it.isCodeCustomized || false;
  currentItem.quantity = it.quantity;
  const qty = Number(it.quantity) || 1;
  currentItem.unitPrice = it.unitPrice !== undefined && it.unitPrice !== "" ? it.unitPrice : (qty > 0 ? Number((it.totalPrice / qty).toFixed(2)) : 0);
  currentItem.totalPrice = it.priceExclVat !== undefined ? it.priceExclVat : it.totalPrice;
  currentItem.sellingPrice = it.sellingPrice !== undefined && it.sellingPrice !== "" ? it.sellingPrice : 0;
  currentItem.vatRate = it.vatRate !== undefined && it.vatRate !== "" ? it.vatRate : 0;
}

function deleteItem(index: number) {
  if (editingIndex.value === index) {
    resetCurrentItem();
  } else if (editingIndex.value !== null && editingIndex.value > index) {
    editingIndex.value -= 1;
  }
  form.items.splice(index, 1);
  showToast("পণ্য তালিকা থেকে বাদ দেওয়া হয়েছে", "info");
}

function handleCalculate() {
  // ক্যালকুলেট বাটনের পরবর্তী কাজের জন্য প্রস্তুত
}

function getSizeName(sizeId: number | ""): string {
  if (!sizeId) return "-";
  const s = sizesList.value.find((sz) => sz.id === Number(sizeId));
  return s ? s.name : "-";
}

function getUnitName(unitId: number | ""): string {
  if (!unitId) return "";
  const u = unitsList.value.find((un) => un.id === Number(unitId));
  return u ? u.name : "";
}

function getBrandName(brandId: number | ""): string {
  if (!brandId) return "-";
  const b = brandsList.value.find((br) => br.id === Number(brandId));
  return b ? b.name : "-";
}

function getItemCategorySubtitle(itemId: number | ""): string {
  if (!itemId) return "";
  const it = itemsList.value.find((item) => item.id === Number(itemId));
  if (!it) return "";
  const parts = [];
  if (it.category?.name) parts.push(it.category.name);
  if (it.subCategory?.name) parts.push(it.subCategory.name);
  return parts.join(" > ");
}

// Landed Cost calculations
// আইটেমের ডাইনামিক ভ্যাট ও লাইন ক্যালকুলেশন (vatMode এর সাথে সম্পূর্ণ রিঅ্যাক্টিভ)
function getItemPricing(it: PurchaseItemRow | any) {
  const qty = Math.max(1, Number(it.quantity) || 1);
  const unit = Number(it.unitPrice) || 0;
  const vat = Math.max(0, Number(it.vatRate) || 0);

  if (vatMode.value === "incl") {
    // ইউজার ইনপুটকৃত একক মূল্যটি ভ্যাট সহ
    const unitWithVat = unit;
    const totalWithVat = Number((qty * unitWithVat).toFixed(2));
    const unitExclVat = vat > 0 ? Number((unit / (1 + vat / 100)).toFixed(2)) : unit;
    const totalExclVat = Number((qty * unitExclVat).toFixed(2));
    const vatAmount = Number((totalWithVat - totalExclVat).toFixed(2));
    return {
      unitExclVat,
      totalExclVat,
      unitWithVat,
      totalWithVat,
      vatAmount
    };
  } else {
    // ইউজার ইনপুটকৃত একক মূল্যটি ভ্যাট ছাড়া
    const unitExclVat = unit;
    const totalExclVat = Number((qty * unitExclVat).toFixed(2));
    const unitWithVat = Number((unit * (1 + vat / 100)).toFixed(2));
    const totalWithVat = Number((qty * unitWithVat).toFixed(2));
    const vatAmount = Number((totalWithVat - totalExclVat).toFixed(2));
    return {
      unitExclVat,
      totalExclVat,
      unitWithVat,
      totalWithVat,
      vatAmount
    };
  }
}

// Landed Cost calculations
const totalQuantity = computed(() => {
  return form.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
});

const itemsSubtotal = computed(() => {
  return form.items.reduce((sum, item) => sum + getItemPricing(item).totalWithVat, 0);
});

const finalTotalAmount = computed(() => {
  const sub = itemsSubtotal.value;
  const extra = Number(form.otherExpenses) || 0;
  const disc = Number(form.discountAmount) || 0;
  return Math.max(0, sub + extra - disc);
});

const dueAmount = computed(() => {
  const total = finalTotalAmount.value;
  const paid = Number(form.paidAmount) || 0;
  return Math.max(0, total - paid);
});

// ফরম্যাটিং হেল্পার (পূর্ণসংখ্যা হলে দশমিক ছাড়া, অন্যথায় ২ দশমিক)
function formatMoneyDisplay(val: number): string {
  const num = Number(val) || 0;
  return Number(num.toFixed(2)) % 1 === 0 ? String(Math.round(num)) : num.toFixed(2);
}

// মূল একক ক্রয়মূল্য (ইনপুটকৃত দর)
function getItemUnitPrice(it: PurchaseItemRow): string {
  const unit = it.unitPrice !== undefined && it.unitPrice !== null ? Number(it.unitPrice) : 0;
  return formatMoneyDisplay(unit);
}

// মূল মোট ক্রয়মূল্য (ভ্যাট সহ লাইন টোটাল, vatMode অনুযায়ী সম্পূর্ণ ডাইনামিক)
function getItemTotalPrice(it: PurchaseItemRow): string {
  const p = getItemPricing(it);
  return formatMoneyDisplay(p.totalWithVat);
}

// প্রকৃত একক ও মোট ক্রয়মূল্য (খরচ ও ডিসকাউন্ট সমন্বয়ের পর, vatMode অনুযায়ী সম্পূর্ণ ডাইনামিক)
function getItemEffectiveCosts(it: PurchaseItemRow): { unit: string; total: string } {
  const qty = Math.max(1, Number(it.quantity) || 1);
  const p = getItemPricing(it);
  const lineTotal = p.totalWithVat;
  const sub = itemsSubtotal.value;
  const netExtra = (Number(form.otherExpenses) || 0) - (Number(form.discountAmount) || 0);
  const itemExtra = sub > 0 ? (lineTotal / sub) * netExtra : 0;
  const finalLineCost = Math.max(0, lineTotal + itemExtra);
  const unitCost = finalLineCost / qty;
  return {
    unit: formatMoneyDisplay(unitCost),
    total: formatMoneyDisplay(finalLineCost)
  };
}

// চালানের নিট অতিরিক্ত খরচ (বিবিধ খরচ - ডিসকাউন্ট)
const netExtraExpenses = computed(() => {
  return (Number(form.otherExpenses) || 0) - (Number(form.discountAmount) || 0);
});

// টেস্ট আইটেমের রেফারেন্স (যদি currentItem এ তথ্য থাকে, নয়তো তালিকার প্রথম পণ্য)
const activeTestItem = computed(() => {
  if (Number(currentItem.quantity) > 0 && (Number(currentItem.unitPrice) > 0 || currentItem.name.trim())) {
    const p = getItemPricing(currentItem);
    return {
      name: currentItem.name.trim() || "বর্তমান পণ্য",
      quantity: Number(currentItem.quantity) || 1,
      totalWithVat: p.totalWithVat,
      unitWithVat: p.unitWithVat,
      sellingPrice: Number(currentItem.sellingPrice) || 0
    };
  }
  if (form.items.length > 0) {
    const first = form.items[0];
    const qty = Math.max(1, Number(first.quantity) || 1);
    const p = getItemPricing(first);
    return {
      name: first.name,
      quantity: qty,
      totalWithVat: p.totalWithVat,
      unitWithVat: p.unitWithVat,
      sellingPrice: Number(first.sellingPrice) || 0
    };
  }
  return null;
});

// টেস্ট আইটেমে খরচ ও ছাড় সমন্বয় (Cost Allocation)
const testItemExpenseAdjustment = computed(() => {
  const item = activeTestItem.value;
  if (!item || item.quantity <= 0) {
    return { perUnit: 0, total: 0, netExtra: 0 };
  }
  const netExtra = netExtraExpenses.value;
  if (netExtra === 0) {
    return { perUnit: 0, total: 0, netExtra: 0 };
  }

  const sub = itemsSubtotal.value;
  let allocatedTotal = 0;
  if (sub > 0) {
    allocatedTotal = (item.totalWithVat / sub) * netExtra;
  } else {
    allocatedTotal = netExtra;
  }

  const perUnit = allocatedTotal / item.quantity;
  return {
    perUnit: Number(perUnit.toFixed(2)),
    total: Number(allocatedTotal.toFixed(2)),
    netExtra
  };
});

// খরচ সমন্বয়ের পর প্রকৃত একক ক্রয়দর
const testItemLandedUnitCost = computed(() => {
  const item = activeTestItem.value;
  if (!item) return 0;
  const landed = item.unitWithVat + testItemExpenseAdjustment.value.perUnit;
  return Math.max(0, Number(landed.toFixed(2)));
});

// খরচ সমন্বয়ের পর টেস্ট আইটেমের মোট ক্রয় খরচ
const testItemLandedTotalCost = computed(() => {
  const item = activeTestItem.value;
  if (!item) return 0;
  const landedTotal = item.totalWithVat + testItemExpenseAdjustment.value.total;
  return Math.max(0, Number(landedTotal.toFixed(2)));
});

// খরচ সমন্বয়ের পর প্রকৃত মার্জিন (MRP - Landed Cost)
const testItemActualMargin = computed(() => {
  const item = activeTestItem.value;
  if (!item) return 0;
  const mrp = item.sellingPrice || 0;
  const landed = testItemLandedUnitCost.value;
  return Number((mrp - landed).toFixed(2));
});

// Filtered purchases
const filteredPurchases = computed(() => {
  if (!searchQuery.value.trim()) return purchasesList.value;
  const q = searchQuery.value.toLowerCase().trim();
  return purchasesList.value.filter((p) => {
    return (
      (p.challanNumber && p.challanNumber.toLowerCase().includes(q)) ||
      (p.supplier?.name && p.supplier.name.toLowerCase().includes(q)) ||
      (p.manufacturer?.name && p.manufacturer.name.toLowerCase().includes(q)) ||
      (p.challanType?.name && p.challanType.name.toLowerCase().includes(q))
    );
  });
});

function formatPaymentMethod(m: string | null | undefined): string {
  if (!m) return "—";
  const found = paymentMethodsList.value.find(
    (pm) =>
      (pm.code && String(pm.code).trim().toLowerCase() === String(m).trim().toLowerCase()) ||
      (pm.name && String(pm.name).trim().toLowerCase() === String(m).trim().toLowerCase())
  );
  if (found) {
    return formatPaymentMethodName(found);
  }
  const map: Record<string, string> = {
    cash: "ক্যাশ (Cash)",
    bkash: "বিকাশ",
    nagad: "নগদ (মোবাইল)",
    bank: "ব্যাংক"
  };
  return map[m] || m;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return String(iso);
  }
}

function getItemBrandName(it: any): string {
  if (!it) return "-";
  return (
    it.brand?.name ||
    brandsList.value.find((b: any) => String(b.id) === String(it.brandId))?.name ||
    it.item?.brand?.name ||
    "-"
  );
}

function getPurchaseBrandNames(purchase: any): string {
  if (!purchase?.items?.length) return "-";
  const brandNames = purchase.items
    .map((it: any) => getItemBrandName(it))
    .filter((name: string) => name && name !== "-");
  const unique = Array.from(new Set(brandNames));
  return unique.length > 0 ? unique.join(", ") : "-";
}

function getItemUnitPriceExclVat(it: any): number {
  if (!it) return 0;
  const direct = Number(it.unitPriceExclVat || 0);
  if (direct > 0) return direct;
  const withVat = Number(it.unitPriceWithVat || it.unitCost || 0);
  const rate = Number(it.vatRate || 0);
  if (withVat > 0) {
    return rate > 0 ? Number((withVat / (1 + rate / 100)).toFixed(2)) : withVat;
  }
  const qty = Math.max(1, Number(it.quantity) || 1);
  const total = Number(it.totalPrice) || 0;
  const unitTotal = total / qty;
  return rate > 0 ? Number((unitTotal / (1 + rate / 100)).toFixed(2)) : Number(unitTotal.toFixed(2));
}

function openDetailsModal(p: any) {
  selectedPurchase.value = p;
  activeView.value = "details";
}

function printChallan() {
  window.print();
}

function onPaidAmountInput() {
  if (Number(form.paidAmount) > 0 && !form.paymentMethod && activePaymentMethods.value.length > 0) {
    form.paymentMethod = activePaymentMethods.value[0].code || activePaymentMethods.value[0].name;
  }
}

function editPurchase(p: any) {
  if (!p) return;
  editingPurchaseId.value = p.id;

  // Set partner / vendor
  if (p.manufacturerId) {
    vendorType.value = "manufacturer";
    selectedPartnerId.value = `manufacturer:${p.manufacturerId}`;
    form.manufacturerId = p.manufacturerId;
    form.supplierId = "";
  } else if (p.supplierId) {
    const s = suppliersList.value.find((item: any) => item.id === p.supplierId);
    if (s && s.vendorType) {
      vendorType.value = s.vendorType;
    } else {
      vendorType.value = "supplier";
    }
    selectedPartnerId.value = `supplier:${p.supplierId}`;
    form.supplierId = p.supplierId;
    form.manufacturerId = "";
  }

  form.challanTypeId = p.challanTypeId || "";
  form.challanNumber = p.challanNumber || "";
  form.challanDate = p.challanDate ? p.challanDate.split("T")[0] : todayISO;
  vatMode.value = (p.vatMode || "excl") as "excl" | "incl";
  form.paymentMethod = p.paymentMethod || "cash";
  form.otherExpenses = Number(p.otherExpenses) || 0;
  form.discountAmount = Number(p.discountAmount) || 0;
  form.paidAmount = p.paidAmount !== undefined && p.paidAmount !== null ? Number(p.paidAmount) : "";
  form.notes = p.notes || "";

  // Populate items
  form.items = (p.items || []).map((it: any) => {
    const unitPrice = Number(it.unitPriceExclVat || it.unitPrice || it.unitPriceWithVat || it.unitCost || 0);
    return {
      itemId: it.itemId || "",
      categoryId: it.categoryId || "",
      subCategoryId: it.subCategoryId || "",
      brandId: it.brandId || "",
      sizeId: it.sizeId || "",
      colorId: it.colorId || "",
      unitId: it.unitId || "",
      name: it.name || "",
      code: it.code || "",
      quantity: Number(it.quantity) || 1,
      unitPrice,
      totalPrice: Number(it.totalPrice) || 0,
      sellingPrice: it.sellingPrice !== undefined && it.sellingPrice !== null ? Number(it.sellingPrice) : "",
      vatRate: Number(it.vatRate) || 0,
      unitPriceExclVat: Number(it.unitPriceExclVat) || 0
    };
  });

  resetCurrentItem();
  switchView("form");
}

async function confirmDeletePurchase(p: any) {
  if (!p) return;
  const challanTitle = p.challanNumber ? `চালান নং "${p.challanNumber}"` : "এই ক্রয় চালানটি";
  if (!confirm(`আপনি কি নিশ্চিতভাবে ${challanTitle} মুছে ফেলতে চান?\nএতে পণ্যের স্টক স্বয়ংক্রিয়ভাবে সমন্বয় করা হবে।`)) {
    return;
  }

  try {
    const res = await axios.delete(`/api/inventory/purchases/${p.id}`);
    showToast(res.data?.message || "ক্রয় চালান সফলভাবে মুছে ফেলা হয়েছে", "success");
    if (selectedPurchase.value?.id === p.id) {
      selectedPurchase.value = null;
    }
    await fetchPurchases();
    if (activeView.value === "details") {
      switchView("list");
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || "ক্রয় চালান মুছতে ব্যর্থ হয়েছে", "danger");
  }
}

// Reset form
function resetForm() {
  editingPurchaseId.value = null;
  selectedPartnerId.value = "";
  form.challanNumber = "";
  form.challanDate = todayISO;
  form.supplierId = "";
  form.manufacturerId = "";
  form.paymentMethod = "cash";
  form.otherExpenses = 0;
  form.discountAmount = 0;
  form.paidAmount = "";
  form.notes = "";
  form.items = [];
  resetCurrentItem();
}

// API Calls
async function fetchCatalogData() {
  try {
    const [catRes, brandRes, supRes, mfgRes, itemsRes] = await Promise.all([
      axios.get("/api/catalog/master"),
      axios.get("/api/inventory/brands"),
      axios.get("/api/inventory/suppliers"),
      axios.get("/api/inventory/manufacturers"),
      axios.get("/api/inventory/items")
    ]);

    const master = catRes.data?.data || {};
    categoriesList.value = master.categories || [];
    subCategoriesList.value = master.subCategories || [];
    sizesList.value = master.sizes || [];
    colorsList.value = master.colors || [];
    unitsList.value = master.units || [];
    challanTypesList.value = master.challanTypes || [];
    vendorTypesList.value = master.vendorTypes || [];
    paymentMethodsList.value = master.paymentMethods || [];

    // Auto-select payment method if not selected or invalid
    if (activePaymentMethods.value.length > 0) {
      const currentPmExists = activePaymentMethods.value.some(
        (pm) => (pm.code || pm.name) === form.paymentMethod
      );
      if (!currentPmExists) {
        form.paymentMethod = activePaymentMethods.value[0].code || activePaymentMethods.value[0].name;
      }
    }

    // Auto-select first challan type if available
    if (challanTypesList.value.length > 0 && !form.challanTypeId) {
      form.challanTypeId = challanTypesList.value[0].id;
    }

    // Auto-select vendor type: if Bill of Entry, auto-select exporter; otherwise first active
    if (isBillOfEntry.value) {
      const exporterVal = exporterVendorType.value
        ? exporterVendorType.value.code || exporterVendorType.value.name
        : "রপ্তানিকারক";
      vendorType.value = exporterVal;
    } else if (activeVendorTypes.value.length > 0) {
      const currentExists = activeVendorTypes.value.some(
        (vt) => (vt.code || vt.name) === vendorType.value
      );
      if (!currentExists) {
        vendorType.value = activeVendorTypes.value[0].code || activeVendorTypes.value[0].name;
      }
    }

    brandsList.value = brandRes.data?.data || [];
    suppliersList.value = supRes.data?.data || [];
    manufacturersList.value = mfgRes.data?.data || [];
    itemsList.value = itemsRes.data?.data || [];
  } catch (err) {
    console.error("Error loading master catalog for purchases:", err);
  }
}

async function fetchPurchases() {
  loadingPurchases.value = true;
  try {
    const res = await axios.get("/api/inventory/purchases");
    purchasesList.value = res.data?.data || [];
  } catch (err: any) {
    showToast(err.response?.data?.message || "ক্রয় তালিকা লোড করা যায়নি", "danger");
  } finally {
    loadingPurchases.value = false;
  }
}

async function submitPurchase() {
  // Validate vendor
  if (!form.supplierId && !form.manufacturerId) {
    showToast(`দয়া করে ${selectedVendorTypeName.value} নির্বাচন করুন`, "warning");
    return;
  }

  // Validate line items
  if (form.items.length === 0) {
    showToast("অনুগ্রহ করে চালানে অন্তত একটি পণ্য যোগ করুন", "warning");
    return;
  }

  // Validate paid amount (mandatory)
  if (form.paidAmount === "" || form.paidAmount === null || form.paidAmount === undefined || isNaN(Number(form.paidAmount))) {
    showToast("অনুগ্রহ করে পরিশোধিত টাকার পরিমাণ উল্লেখ করুন", "warning");
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      challanTypeId: form.challanTypeId || null,
      challanNumber: form.challanNumber,
      challanDate: form.challanDate,
      vatMode: vatMode.value,
      supplierId: !isManufacturerVendor.value ? form.supplierId : null,
      manufacturerId: isManufacturerVendor.value ? form.manufacturerId : null,
      paymentMethod: Number(form.paidAmount) > 0 ? form.paymentMethod : null,
      otherExpenses: form.otherExpenses,
      discountAmount: form.discountAmount,
      paidAmount: form.paidAmount,
      notes: form.notes,
      items: form.items.map((row) => {
        const p = getItemPricing(row);
        return {
          itemId: row.itemId ? Number(row.itemId) : null,
          categoryId: row.categoryId ? Number(row.categoryId) : null,
          subCategoryId: row.subCategoryId ? Number(row.subCategoryId) : null,
          brandId: row.brandId || null,
          sizeId: row.sizeId,
          colorId: row.colorId || null,
          unitId: row.unitId || null,
          name: row.name.trim(),
          code: row.code?.trim() || null,
          quantity: row.quantity,
          unitPrice: Number(row.unitPrice) || 0,
          unitPriceExclVat: p.unitExclVat,
          unitPriceWithVat: p.unitWithVat,
          totalPrice: p.totalWithVat,
          sellingPrice: Number(row.sellingPrice) || 0,
          vatRate: Number(row.vatRate) || 0
        };
      })
    };

    if (editingPurchaseId.value) {
      const res = await axios.put(`/api/inventory/purchases/${editingPurchaseId.value}`, payload);
      showToast(res.data?.message || "ক্রয় চালান সফলভাবে আপডেট করা হয়েছে!", "success");
    } else {
      const res = await axios.post("/api/inventory/purchases", payload);
      showToast(res.data?.message || "নতুন ক্রয় চালান সফলভাবে সংরক্ষিত হয়েছে!", "success");
    }
    resetForm();
    await fetchPurchases();
    switchView("list");
  } catch (err: any) {
    showToast(err.response?.data?.message || "ক্রয় চালান সংরক্ষণ করতে ব্যর্থ হয়েছে", "danger");
  } finally {
    submitting.value = false;
  }
}

// ==========================================
// ছবি ও ডকুমেন্টস সংযুক্তি লজিক (Attachment Logic)
// ==========================================
const showAttachmentModal = ref(false);
const selectedAttachmentPurchase = ref<any>(null);
const attachmentDocumentUrl = ref("");
const attachmentItems = ref<any[]>([]);
const uploadingDoc = ref(false);
const savingAttachments = ref(false);
const fullImageUrl = ref("");

// সুপারএডমিন মিডিয়া পলিসি
const mediaUploadMode = ref<"both" | "direct_upload" | "google_drive">("both");
const mediaMaxSizeMb = ref(2);
const attachmentDocTab = ref<"file" | "link">("file");

async function loadMediaConfig() {
  try {
    const res = await axios.get("/api/inventory/media-config");
    const cfg = res.data?.data;
    if (cfg?.uploadMode) {
      mediaUploadMode.value = cfg.uploadMode;
    }
    if (cfg?.maxSizeMb) {
      mediaMaxSizeMb.value = Number(cfg.maxSizeMb) || 2;
    }
  } catch (e) {
    // default both
  }
}

async function openAttachmentModal(p: any) {
  selectedAttachmentPurchase.value = p;
  attachmentDocumentUrl.value = p.documentUrl || "";
  attachmentItems.value = (p.items || []).map((it: any) => ({
    purchaseItemId: it.id,
    itemId: it.itemId || it.item?.id,
    name: it.name,
    code: it.code || it.item?.code || "",
    brandName: it.brand?.name || it.brandName || "",
    sizeName: it.size?.name || it.sizeName || "",
    colorName: it.color?.name || it.colorName || "",
    quantity: it.quantity,
    imageUrl: it.item?.imageUrl || it.imageUrl || "",
    uploading: false
  }));
  showAttachmentModal.value = true;
  await loadMediaConfig();
  if (mediaUploadMode.value === "google_drive") {
    attachmentDocTab.value = "link";
  } else if (mediaUploadMode.value === "direct_upload") {
    attachmentDocTab.value = "file";
  } else {
    attachmentDocTab.value = isGoogleDriveLink(attachmentDocumentUrl.value) ? "link" : "file";
  }
}

function closeAttachmentModal() {
  showAttachmentModal.value = false;
  selectedAttachmentPurchase.value = null;
  attachmentDocumentUrl.value = "";
  attachmentItems.value = [];
}

function isGoogleDriveLink(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes("drive.google.com") || url.includes("docs.google.com");
}

function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (isGoogleDriveLink(trimmed)) {
    const matchId = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (matchId && matchId[1]) {
      return `https://lh3.googleusercontent.com/d/${matchId[1]}`;
    }
  }
  return trimmed;
}

function previewFullImage(url: string | null | undefined) {
  if (!url) return;
  fullImageUrl.value = url;
}

async function handleFileUpload(e: Event, target: "document") {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  uploadingDoc.value = true;
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post("/api/inventory/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    if (res.data?.data?.url) {
      attachmentDocumentUrl.value = res.data.data.url;
      showToast("চালান কপি ফাইল সফলভাবে আপলোড হয়েছে", "success");
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || "ফাইল আপলোড ব্যর্থ হয়েছে", "danger");
  } finally {
    uploadingDoc.value = false;
    input.value = "";
  }
}

async function handleItemFileUpload(e: Event, it: any) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  it.uploading = true;
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post("/api/inventory/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    if (res.data?.data?.url) {
      it.imageUrl = res.data.data.url;
      showToast("পণ্যের ছবি সফলভাবে আপলোড হয়েছে", "success");
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || "ছবি আপলোড ব্যর্থ হয়েছে", "danger");
  } finally {
    it.uploading = false;
    input.value = "";
  }
}

async function saveAttachments() {
  if (!selectedAttachmentPurchase.value) return;
  savingAttachments.value = true;
  try {
    const pId = selectedAttachmentPurchase.value.id;
    await axios.put(`/api/inventory/purchases/${pId}/attachments`, {
      documentUrl: attachmentDocumentUrl.value,
      itemImages: attachmentItems.value.map((it: any) => ({
        itemId: it.itemId,
        imageUrl: it.imageUrl
      }))
    });

    // Update in local state
    selectedAttachmentPurchase.value.documentUrl = attachmentDocumentUrl.value;
    const found = purchasesList.value.find((p) => p.id === pId);
    if (found) {
      found.documentUrl = attachmentDocumentUrl.value;
      if (Array.isArray(found.items)) {
        for (const fItem of found.items) {
          const match = attachmentItems.value.find((a: any) => a.itemId === (fItem.itemId || fItem.item?.id));
          if (match && fItem.item) {
            fItem.item.imageUrl = match.imageUrl;
          }
        }
      }
    }

    showToast("ছবি ও ডকুমেন্টস সফলভাবে সংযুক্ত হয়েছে", "success");
    closeAttachmentModal();
    fetchPurchases();
  } catch (err: any) {
    showToast(err.response?.data?.message || "সংযুক্তি সংরক্ষণ করতে ব্যর্থ হয়েছে", "danger");
  } finally {
    savingAttachments.value = false;
  }
}

onMounted(async () => {
  window.addEventListener("click", handleGlobalClick);
  loadMediaConfig();
  await Promise.all([fetchCatalogData(), fetchPurchases()]);
});

onBeforeUnmount(() => {
  window.removeEventListener("click", handleGlobalClick);
});
</script>

<style scoped>
.purchases-page {
  font-family: inherit;
}

.purchase-table-row {
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.purchase-table-row:hover {
  background-color: rgba(13, 110, 253, 0.05) !important;
}

.purchases-list-table-responsive {
  min-height: 250px;
}

.purchase-form-card {
  border-top: 3px solid #0d6efd !important;
}

.line-items-table th {
  font-weight: 600;
  vertical-align: middle;
}

.frozen-input {
  background-color: var(--app-hover, #f8f9fa) !important;
  color: var(--app-text-muted, #6c757d) !important;
  opacity: 0.85;
  cursor: not-allowed;
}

.summary-line {
  font-size: 0.88rem;
}

/* Product 1-Row layout */
.product-single-row {
  width: 100%;
}

.product-single-row .form-label {
  font-size: 0.76rem;
  margin-bottom: 2px;
}

.product-single-row .form-control,
.product-single-row .form-select {
  font-size: 0.82rem;
  height: 31px;
}

.col-item-name {
  flex: 2 1 140px;
  min-width: 120px;
}

.col-item-brand {
  flex: 1.6 1 110px;
  min-width: 95px;
}

.col-item-size {
  flex: 0.9 1 60px;
  min-width: 50px;
}

.col-item-color {
  flex: 1 1 70px;
  min-width: 65px;
}

.col-item-qty {
  flex: 0.9 1 60px;
  min-width: 50px;
}

.col-item-unit {
  flex: 0.9 1 60px;
  min-width: 55px;
}

.col-item-unit-price {
  flex: 1.2 1 85px;
  min-width: 75px;
}

.col-item-mrp {
  flex: 1.2 1 85px;
  min-width: 75px;
}

.col-item-vat {
  flex: 0.8 1 55px;
  min-width: 45px;
}

.col-item-action {
  flex: 0 0 auto;
  min-width: 70px;
}

.selected-item-clean-display {
  pointer-events: none;
  background-color: var(--bs-body-bg, #ffffff);
  color: var(--bs-body-color, #212529);
  border-radius: 0.25rem;
  font-size: 0.82rem;
  padding-left: 0.4rem;
  padding-right: 0.4rem;
  margin: 1px;
  width: calc(100% - 2px) !important;
  height: calc(100% - 2px) !important;
  z-index: 2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Remove all arrow buttons inside fields */
select,
.form-select {
  background-image: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
  padding-right: 0.5rem !important;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
  margin: 0 !important;
}

input[type="number"] {
  -moz-appearance: textfield !important;
  appearance: textfield !important;
}

@media print {
  .purchases-page > .d-flex.mb-3,
  .toast-container,
  .purchase-form-card,
  .card-footer,
  .btn {
    display: none !important;
  }
  .card {
    border: none !important;
    box-shadow: none !important;
  }
}
</style>
