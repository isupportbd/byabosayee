<template>
  <div class="sales-page">
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

    <!-- Header Actions & Navigation Tabs -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div class="d-flex align-items-center gap-2">
        <div class="sales-header-icon bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" style="width: 38px; height: 38px;">
          <i class="bi" :class="activeView === 'pos' ? 'bi-cart-check fs-5' : 'bi-receipt-cutoff fs-5'"></i>
        </div>
        <div>
          <h5 class="m-0 fw-bold">{{ activeView === 'pos' ? 'পণ্য বিক্রয় ও পিওএস (POS)' : 'সকল বিক্রয় চালানের তালিকা' }}</h5>
        </div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <template v-if="activeView === 'list'">
          <button
            v-if="completedSalesList.length > 0"
            type="button"
            class="btn btn-sm btn-warning shadow-sm fw-semibold d-inline-flex align-items-center gap-1.5"
            title="সর্বশেষ সম্পন্ন বিক্রয়টি কার্টে নিয়ে এডিট করুন"
            @click="editLastSale">
            <i class="bi bi-pencil-square"></i>
            <span>লাস্ট বিক্রয় এডিট</span>
          </button>
          <button
            type="button"
            class="btn btn-sm btn-success text-white shadow-sm d-inline-flex align-items-center gap-1.5"
            @click="switchView('pos')">
            <i class="bi bi-upc-scan"></i>
            <span>নতুন বিক্রয় (POS)</span>
          </button>
        </template>
        <button
          v-if="activeView === 'pos'"
          type="button"
          class="btn btn-sm btn-outline-success shadow-sm fw-medium d-inline-flex align-items-center gap-1.5"
          @click="switchView('list')">
          <i class="bi bi-card-list"></i>
          <span>বিক্রয় তালিকা ({{ completedSalesList.length }})</span>
        </button>
      </div>
    </div>

    <!-- VIEW 1: POS / নতুন পণ্য বিক্রয় কাউন্টার ও ড্রাফট তালিকা -->
    <div v-if="activeView === 'pos'">
      <div class="pos-layout-container d-flex flex-column flex-xl-row gap-3 align-items-stretch">
      <!-- বাম পাশ: গ্রাহক তথ্য, বারকোড স্ক্যানার এবং কার্ট টেবিল -->
      <div class="pos-form-col flex-grow-1 d-flex flex-column" style="min-width: 0;">
        <div class="card border shadow-sm sales-form-card h-100 d-flex flex-column">
          <!-- কার্ড হেডার: ইনভয়েস নং, তারিখ ও ক্যাশিয়ার তথ্য -->
          <div class="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2 py-2 flex-shrink-0">
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <span v-if="editingSaleId" class="badge bg-warning text-dark border border-warning font-monospace px-2 py-1">
                <i class="bi bi-pencil-square me-1"></i>এডিট মোড: {{ editingInvoiceNumber }}
              </span>
              <span v-else class="badge bg-success-subtle text-success border border-success-subtle font-monospace px-2 py-1">
                ইনভয়েস: {{ generatedInvoiceNumber }}
              </span>
              <span class="badge bg-light text-dark border">
                <i class="bi bi-calendar-date me-1 text-muted"></i>{{ todayFormatted }}
              </span>
              <button
                v-if="editingSaleId"
                type="button"
                class="btn btn-xs btn-outline-danger py-0 px-2"
                title="এডিট মোড বন্ধ করে নতুন বিক্রয় শুরু করুন"
                @click="cancelEditSale">
                <i class="bi bi-x-circle me-1"></i>এডিট বাতিল
              </button>
            </div>
            <!-- ক্যাশিয়ার / ডাটা এন্ট্রি কারী তথ্য -->
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1" title="ডাটা এন্ট্রি করছেন">
                <i class="bi bi-person-badge me-1"></i>বিক্রেতা/ক্যাশিয়ার: <strong>{{ cashierDisplayName }}</strong>
              </span>
            </div>
          </div>

          <div class="card-body p-3 d-flex flex-column h-100" style="min-height: 0;">
            <!-- গ্রাহক নির্বাচন ও তথ্য ব্লক (৪টি ফিল্ড: ধরন, নাম, মোবাইল ও ঠিকানা) -->
            <div class="row g-2 align-items-center mb-2 flex-shrink-0">
              <!-- ১. গ্রাহকের ধরন -->
              <div class="col-12 col-sm-6 col-lg-3">
                <label class="form-label small fw-semibold mb-1 d-flex justify-content-between">
                  <span>গ্রাহকের ধরন</span>
                  <button
                    type="button"
                    class="btn btn-link btn-xs p-0 text-success text-decoration-none"
                    @click="resetToDefaultCustomer">
                    <i class="bi bi-arrow-counterclockwise"></i> ডিফল্ট ওয়াক-ইন
                  </button>
                </label>
                <Select
                  v-model="form.customerType"
                  :options="customerTypeOptions"
                  label="label"
                  :reduce="(opt: any) => opt.value"
                  placeholder="গ্রাহকের ধরন নির্বাচন করুন"
                  :searchable="false"
                  :clearable="false"
                  @change="onCustomerTypeChange" />
              </div>

              <!-- ২. গ্রাহকের নাম -->
              <div class="col-12 col-sm-6 col-lg-3">
                <label class="form-label small fw-semibold mb-1">
                  গ্রাহকের নাম
                  <span v-if="isCustomerMandatory" class="text-danger">*</span>
                </label>
                <Select
                  v-model="form.customerName"
                  :options="filteredCustomerOptions"
                  label="name"
                  :reduce="(opt: any) => opt.name"
                  :searchable="true"
                  :taggable="true"
                  :create-option="createCustomerOption"
                  :placeholder="isCustomerMandatory ? 'গ্রাহকের নাম আবশ্যক...' : 'গ্রাহকের নাম নির্বাচন বা টাইপ করুন...'"
                  :clearable="true"
                  @change="onCustomerNameSelect"
                  @search="onCustomerSearch">
                  <template #option="opt">
                    <div class="d-flex flex-column py-0.5">
                      <span class="fw-semibold text-dark">{{ opt.name }}</span>
                      <small v-if="opt.mobile" class="text-muted font-monospace" style="font-size: 0.72rem;">
                        <i class="bi bi-telephone me-1"></i>{{ opt.mobile }}
                      </small>
                    </div>
                  </template>
                </Select>
              </div>

              <!-- ৩. মোবাইল নম্বর -->
              <div class="col-12 col-sm-6 col-lg-3">
                <label class="form-label small fw-semibold mb-1">
                  মোবাইল নম্বর
                  <span v-if="isCustomerMandatory" class="text-danger">*</span>
                </label>
                <input
                  ref="customerMobileInputRef"
                  v-model.trim="form.customerMobile"
                  type="text"
                  class="form-control form-control-sm font-monospace"
                  :class="{ 'border-danger': isCustomerMandatory && !form.customerMobile }"
                  placeholder="০১XXXXXXXXX"
                  @input="onCustomerMobileInput" />
              </div>

              <!-- ৪. ঠিকানা -->
              <div class="col-12 col-sm-6 col-lg-3">
                <label class="form-label small fw-semibold mb-1">
                  ঠিকানা
                </label>
                <input
                  v-model.trim="form.customerAddress"
                  type="text"
                  class="form-control form-control-sm"
                  placeholder="গ্রাহকের ঠিকানা..." />
              </div>
            </div>

            <!-- গ্রাহক তথ্য ও পণ্য স্ক্যানারের মধ্যবর্তী বিভাজক লাইন -->
            <hr class="colorful-divider my-2 flex-shrink-0" />

            <!-- ফাস্ট বারকোড স্ক্যানার, সাব-ক্যাটাগরি ফিল্টার ও সার্চেবল পণ্য নির্বাচন -->
            <div class="row g-2 align-items-center mb-2 flex-shrink-0">
              <!-- কম্প্যাক্ট বারকোড ইনপুট -->
              <div class="col-12 col-md-3">
                <div class="position-relative">
                  <input
                    ref="barcodeInputRef"
                    v-model="scannerQuery"
                    type="text"
                    class="form-control form-control-sm ps-4 search-input-unified"
                    placeholder="বারকোড স্ক্যান..."
                    autofocus
                    @keydown.enter.prevent="handleBarcodeScan" />
                  <i class="bi bi-upc-scan position-absolute top-50 start-0 translate-middle-y ms-2 text-muted fs-6 pe-none"></i>
                  <button
                    v-if="scannerQuery"
                    type="button"
                    class="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-2"
                    @click="scannerQuery = ''; focusBarcodeInput()">
                    <i class="bi bi-x-circle"></i>
                  </button>
                </div>
              </div>

              <!-- সাব-ক্যাটাগরি ফিল্টার -->
              <div class="col-12 col-md-3">
                <Select
                  v-model="selectedSubCategoryId"
                  :options="subCategoryFilterOptions"
                  placeholder="সকল সাব-ক্যাটাগরি"
                  size="sm"
                  :clearable="true"
                  :searchable="true"
                  value-key="id"
                  label="name"
                  parentclass="mb-0"
                  no-options-text="কোনো সাব-ক্যাটাগরি নেই" />
              </div>

              <!-- টাইপেবল / সার্চেবল পণ্য ড্রপডাউন কম্পোনেন্ট -->
              <div class="col-12 col-md-6">
                <Select
                  v-model="selectedDropdownItem"
                  :options="posItemOptions"
                  :filter-by="filterPosItem"
                  :reset-key="selectResetKey"
                  placeholder="পণ্য খুঁজুন বা তালিকা থেকে নির্বাচন করুন..."
                  size="sm"
                  :clearable="true"
                  :searchable="true"
                  label="displayName"
                  parentclass="mb-0 pos-product-select"
                  no-options-text="কোনো পণ্য পাওয়া যায়নি"
                  @update:model-value="handleDropdownProductSelect">
                  <template #option="option">
                    <div class="d-flex flex-column w-100 py-1" style="white-space: normal; line-height: 1.35;">
                      <!-- উপরের রো: সম্পূর্ণ আলাদাভাবে শুধু পণ্যের নাম -->
                      <div class="d-flex align-items-center w-100 mb-1" style="white-space: normal; word-break: break-word;">
                        <span class="text-primary me-2 flex-shrink-0" style="font-size: 0.75rem;">●</span>
                        <span class="fw-semibold text-dark">{{ option.cleanName || cleanItemName(option.name) }}</span>
                      </div>

                      <!-- নিচের রো: সুন্দর দূরত্বসহ কালার, সাইজ ও স্টক -->
                      <div class="d-flex align-items-center justify-content-between w-100 mt-0.5 ps-3">
                        <div class="d-flex align-items-center gap-2 flex-wrap">
                          <span v-if="option.colorName" class="badge bg-white text-dark border px-2 py-0.5 d-inline-flex align-items-center shadow-xs" style="font-size: 0.72rem;">
                            <span v-if="option.colorCode" class="d-inline-block rounded-circle border flex-shrink-0" :style="{ backgroundColor: option.colorCode, width: '9px', height: '9px', marginRight: '6px' }"></span>
                            <span>{{ option.colorName }}</span>
                          </span>
                          <span v-if="option.sizeName" class="badge bg-white text-dark border px-2 py-0.5 shadow-xs" style="font-size: 0.72rem;">
                            {{ option.sizeName }}
                          </span>
                        </div>
                        <span class="badge bg-primary-subtle text-primary fw-bold text-nowrap flex-shrink-0 ms-3 px-2 py-0.5" style="font-size: 0.75rem;">
                          ({{ option.stockQtyBn || toBengaliNumber(option.stockQuantity ?? 0) }})
                        </span>
                      </div>
                    </div>
                  </template>
                </Select>
              </div>
            </div>

            <!-- কার্ট টেবিল বক্স (হেডারের নিচে স্ক্রলবার ও ফিক্সড কাঠামো) -->
            <div class="cart-box border rounded mb-2 flex-grow-1 d-flex flex-column" style="min-height: 160px; overflow: hidden;">
              <!-- টেবিল হেডার (স্ক্রলবারের বাইরে, সম্পূর্ণ ফুল-উইডথ জুড়ে) -->
              <div class="cart-header-wrap border-bottom flex-shrink-0">
                <table class="table mb-0 align-middle" style="table-layout: fixed; width: 100%;">
                  <colgroup>
                    <col style="width: 40px;">
                    <col style="min-width: 180px;">
                    <col style="width: 120px;">
                    <col style="width: 110px;">
                    <col style="width: 110px;">
                    <col style="width: 105px;">
                    <col style="width: 85px;">
                    <col style="width: 45px;">
                  </colgroup>
                  <thead class="sales-table-header">
                    <tr class="small text-nowrap">
                      <th class="text-center">#</th>
                      <th class="text-start">পণ্যের নাম ও বিবরণ</th>
                      <th class="text-center">পরিমাণ</th>
                      <th class="text-end">দর (৳)</th>
                      <th class="text-end">মোট দর (৳)</th>
                      <th class="text-center">ছাড়</th>
                      <th class="text-center">ভ্যাট (%)</th>
                      <th class="text-center"></th>
                    </tr>
                  </thead>
                </table>
              </div>

              <!-- কার্ট বডি (স্ক্রলবার শুধুমাত্র হেডারের পর হতে শুরু হবে) -->
              <div class="cart-body-wrap flex-grow-1" style="min-height: 0; overflow-y: auto; scrollbar-gutter: stable;">
                <!-- খালি কার্ট অবস্থা (মাঝখানে কোনো অপ্রয়োজনীয় বিভাজক লাইন ছাড়াই সম্পূর্ণ সেন্টারে) -->
                <div
                  v-if="cartItems.length === 0"
                  class="d-flex flex-column align-items-center justify-content-center h-100 text-muted py-4">
                  <i class="bi bi-cart-x fs-1 d-block mb-2 text-secondary opacity-50"></i>
                  <p class="mb-1 fw-semibold">কার্ট খালি রয়েছে</p>
                  <p class="small text-muted mb-0">উপরে বারকোড স্ক্যান করুন অথবা তালিকা থেকে পণ্য নির্বাচন করুন</p>
                </div>

                <!-- কার্ট পণ্য তালিকা টেবিল -->
                <table
                  v-else
                  class="table table-hover align-middle mb-0"
                  style="table-layout: fixed; width: 100%;">
                  <colgroup>
                    <col style="width: 40px;">
                    <col style="min-width: 180px;">
                    <col style="width: 120px;">
                    <col style="width: 110px;">
                    <col style="width: 110px;">
                    <col style="width: 105px;">
                    <col style="width: 85px;">
                    <col style="width: 45px;">
                  </colgroup>
                  <tbody class="small">
                    <!-- Cart Items Rows -->
                    <tr
                      v-for="(row, idx) in cartItems"
                      :key="row.uid"
                      class="cart-row">
                      <td class="text-center text-muted">{{ idx + 1 }}</td>
                      
                      <!-- পণ্যের নাম ও বিবরণ: উপরে নাম, নিচে সাইজ ও কালার -->
                      <td class="text-start">
                        <div class="fw-semibold text-truncate" :title="row.name">
                          {{ cleanItemName(row.name) }}
                        </div>
                        <div v-if="row.sizeName || row.colorName" class="text-muted mt-0.5 d-flex align-items-center gap-1.5 flex-wrap" style="font-size: 0.78rem;">
                          <span v-if="row.sizeName">সাইজ: {{ row.sizeName }}</span>
                          <span v-if="row.sizeName && row.colorName" class="opacity-50">|</span>
                          <span v-if="row.colorName" class="d-inline-flex align-items-center gap-1">
                            <span v-if="row.colorCode" class="d-inline-block rounded-circle border" :style="{ backgroundColor: row.colorCode, width: '8px', height: '8px' }"></span>
                            কালার: {{ row.colorName }}
                          </span>
                        </div>
                      </td>

                      <!-- পরিমাণ -->
                      <td class="text-center">
                        <input
                          v-model.number="row.quantity"
                          type="number"
                          min="1"
                          :max="row.availableStock"
                          class="form-control form-control-sm text-center mx-auto fw-semibold"
                          style="max-width: 85px;"
                          @input="if (row.quantity > row.availableStock) { row.quantity = row.availableStock; showToast(`'${cleanItemName(row.name)}' এর সর্বোচ্চ উপলব্ধ স্টক ${row.availableStock} টি`, 'warning'); } recalculateLine(row)" />
                      </td>

                      <!-- দর (৳) -->
                      <td class="text-end">
                        <input
                          v-model.number="row.unitPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          class="form-control form-control-sm text-end fw-semibold ms-auto"
                          style="max-width: 95px;"
                          @input="recalculateLine(row)" />
                      </td>

                      <!-- মোট দর (৳) -->
                      <td class="text-end fw-bold text-success text-nowrap font-monospace">
                        {{ Number(row.totalPrice || 0).toFixed(2) }}
                      </td>

                      <!-- ছাড় -->
                      <td class="text-center">
                        <input
                          v-model.number="row.discountValue"
                          type="number"
                          min="0"
                          step="any"
                          class="form-control form-control-sm text-end mx-auto"
                          style="max-width: 85px;"
                          placeholder="0"
                          @input="recalculateLine(row)" />
                      </td>

                      <!-- ভ্যাট (%) -->
                      <td class="text-center text-nowrap font-monospace">
                        {{ row.vatRate || 0 }}%
                      </td>

                      <!-- ডিলিট বাটন -->
                      <td class="text-center">
                        <button
                          type="button"
                          class="btn btn-link btn-sm text-danger p-0 delete-btn"
                          title="কার্ট থেকে বাদ দিন"
                          @click="removeFromCart(idx)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- কার্ট ক্লিয়ার করার বাটন -->
            <div v-if="cartItems.length > 0" class="d-flex justify-content-between align-items-center flex-shrink-0">
              <button
                type="button"
                class="btn btn-link btn-sm text-danger text-decoration-none p-0"
                @click="clearCart">
                <i class="bi bi-trash3 me-1"></i>সম্পূর্ণ কার্ট খালি করুন
              </button>
              <div class="text-muted small">
                মোট পণ্য: <strong>{{ totalUniqueItems }}</strong> টি | মোট পিস: <strong>{{ totalQuantity }}</strong> টি
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ডান পাশ: বিল সারসংক্ষেপ ও পেমেন্ট সেটেলমেন্ট -->
      <div class="pos-checkout-col d-flex flex-column flex-shrink-0">
        <div class="card border shadow-sm checkout-card h-100">
          <div class="card-header bg-success text-white py-2.5 d-flex align-items-center justify-content-between">
            <h6 class="m-0 fw-bold text-white d-flex align-items-center gap-1.5">
              <i class="bi bi-receipt"></i>বিল সারসংক্ষেপ ও পেমেন্ট
            </h6>
            <span class="badge bg-white text-success fw-bold">
              {{ cartItems.length }} আইটেম
            </span>
          </div>

          <div class="card-body p-3">
            <!-- ক্যালকুলেশন ব্রেকডাউন -->
            <div class="summary-breakdown">
              <!-- সাবটোটাল (পণ্যমূল্য) -->
              <div class="d-flex justify-content-between align-items-center mb-2 small">
                <span class="text-secondary text-nowrap">সাবটোটাল (পণ্যমূল্য):</span>
                <div style="width: 120px;">
                  <input
                    type="text"
                    :value="summary.subtotal.toFixed(2)"
                    readonly
                    class="form-control pos-calc-input text-end fw-semibold opacity-75" />
                </div>
              </div>

              <!-- বিশেষ ছাড় (একক রো) -->
              <div class="d-flex justify-content-between align-items-center mb-2 small">
                <div class="d-inline-flex align-items-center">
                  <span class="text-secondary text-nowrap me-2">বিশেষ ছাড়:</span>
                  <!-- রেডিও বাটন (% ও ৳) -->
                  <div class="d-inline-flex align-items-center" style="gap: 12px;">
                    <label class="d-inline-flex align-items-center cursor-pointer m-0 user-select-none" style="font-size: 0.84rem;">
                      <input
                        type="radio"
                        v-model="form.discountType"
                        value="percent"
                        name="saleInvoiceDiscountType"
                        class="form-check-input m-0 cursor-pointer" />
                      <span class="ms-1 fw-medium">%</span>
                    </label>
                    <label class="d-inline-flex align-items-center cursor-pointer m-0 user-select-none" style="font-size: 0.84rem;">
                      <input
                        type="radio"
                        v-model="form.discountType"
                        value="fixed"
                        name="saleInvoiceDiscountType"
                        class="form-check-input m-0 cursor-pointer" />
                      <span class="ms-1 fw-medium">৳</span>
                    </label>
                  </div>
                  <!-- শতকরা ছাড়ে মাইনাস হওয়া টাকার পরিমাণ -->
                  <span
                    v-if="form.discountType === 'percent' && Number(summary.invoiceDiscount) > 0"
                    class="text-danger fw-bold font-monospace text-nowrap ms-2"
                    style="font-size: 0.75rem;">
                    (-{{ summary.invoiceDiscount.toFixed(2) }})
                  </span>
                </div>

                <div style="width: 120px;">
                  <input
                    id="invoiceDiscountInput"
                    v-model.number="form.discountValue"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0"
                    class="form-control pos-calc-input text-end fw-semibold" />
                </div>
              </div>

              <!-- ভ্যাট হিসাব (মূল্য নির্ধারণ থেকে স্বয়ংক্রিয় হিসাব) -->
              <div class="d-flex justify-content-between align-items-center mb-2 small">
                <span class="text-secondary text-nowrap">মোট ভ্যাট:</span>
                <div style="width: 120px;">
                  <input
                    type="text"
                    :value="summary.totalVat.toFixed(2)"
                    readonly
                    class="form-control pos-calc-input text-end fw-semibold text-primary opacity-75" />
                </div>
              </div>

              <!-- সর্বমোট প্রদেয় বিল (উপরে ও নিচে সুষম গ্যাপ ও স্পষ্ট বর্ডার লাইন) -->
              <div class="d-flex justify-content-between align-items-center border-top border-bottom my-2 py-2">
                <span class="fs-6 fw-bold text-nowrap">সর্বমোট প্রদেয়:</span>
                <div style="width: 120px;">
                  <input
                    type="text"
                    :value="summary.netPayable.toFixed(2)"
                    readonly
                    class="form-control pos-calc-input text-end fw-bold text-success bg-success-subtle border-success" />
                </div>
              </div>
            </div>

            <!-- গৃহীত টাকা (একক রো) -->
            <div class="d-flex justify-content-between align-items-center mb-3 small">
              <div class="d-inline-flex align-items-center" style="gap: 8px;">
                <label for="paidAmountInput" class="form-label small fw-semibold mb-0 text-nowrap">গৃহীত টাকা:</label>
                <button
                  v-if="isPaidAmountCustom && Number(form.paidAmount) !== summary.netPayable"
                  type="button"
                  class="btn btn-link btn-xs p-0 text-decoration-none text-muted small me-0.5"
                  title="সর্বমোট প্রদেয় টাকা বসান"
                  @click="resetPaidAmountToNetPayable">
                  <i class="bi bi-arrow-counterclockwise"></i>
                </button>
                <span v-if="changeAmount > 0" class="small fw-bold text-primary font-monospace text-nowrap">
                  ফেরত: <span class="currency-symbol">৳</span>{{ changeAmount.toFixed(2) }}
                </span>
                <span v-else-if="dueAmount > 0" class="small fw-bold text-danger font-monospace text-nowrap">
                  বকেয়া: <span class="currency-symbol">৳</span>{{ dueAmount.toFixed(2) }}
                </span>
              </div>
              <div style="width: 120px;">
                <input
                  id="paidAmountInput"
                  v-model.number="form.paidAmount"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  class="form-control pos-calc-input text-end fw-bold"
                  @input="onPaidAmountUserEdit" />
              </div>
            </div>

            <!-- পেমেন্ট মাধ্যম নির্বাচন -->
            <div class="mb-3">
              <label class="form-label small fw-semibold mb-1">পেমেন্ট মাধ্যম</label>
              <div class="row g-1">
                <div class="col-3">
                  <button
                    type="button"
                    class="btn btn-sm w-100 py-1 text-nowrap method-btn"
                    :class="form.paymentMethod === 'cash' ? 'btn-success text-white shadow-sm fw-bold' : 'btn-outline-secondary'"
                    @click="form.paymentMethod = 'cash'">
                    <i class="bi bi-cash me-1"></i>ক্যাশ
                  </button>
                </div>
                <div class="col-3">
                  <button
                    type="button"
                    class="btn btn-sm w-100 py-1 text-nowrap method-btn"
                    :class="form.paymentMethod === 'bkash' ? 'btn-danger text-white shadow-sm fw-bold' : 'btn-outline-secondary'"
                    @click="form.paymentMethod = 'bkash'">
                    বিকাশ
                  </button>
                </div>
                <div class="col-3">
                  <button
                    type="button"
                    class="btn btn-sm w-100 py-1 text-nowrap method-btn"
                    :class="form.paymentMethod === 'nagad' ? 'btn-warning text-dark shadow-sm fw-bold' : 'btn-outline-secondary'"
                    @click="form.paymentMethod = 'nagad'">
                    নগদ
                  </button>
                </div>
                <div class="col-3">
                  <button
                    type="button"
                    class="btn btn-sm w-100 py-1 text-nowrap method-btn"
                    :class="form.paymentMethod === 'card' ? 'btn-primary text-white shadow-sm fw-bold' : 'btn-outline-secondary'"
                    @click="form.paymentMethod = 'card'">
                    কার্ড
                  </button>
                </div>
              </div>

              <!-- ক্যাশ ব্যতীত অন্য মাধ্যমে ট্রানজেকশন আইডি (Trx ID) ইনপুট -->
              <div v-if="form.paymentMethod !== 'cash'" class="mt-2">
                <Input
                  id="trxIdInput"
                  v-model.trim="form.transactionId"
                  placeholder="ট্রানজেকশন আইডি (TrxID / স্লিপ নং)..."
                  topclass="mb-0" />
              </div>
            </div>

            <!-- নোট বা মন্তব্য -->
            <div class="mb-3">
              <Input
                id="saleNotes"
                v-model.trim="form.notes"
                placeholder="নোট বা বিশেষ তথ্য (ঐচ্ছিক)..."
                topclass="mb-0" />
            </div>

            <!-- বিক্রয় নিশ্চিতকরণ বোতাম (একক রো: বামে সেইভ ড্রাফট, ডানে সম্পন্ন ও প্রিন্ট) -->
            <div class="row g-2">
              <div class="col-6">
                <button
                  type="button"
                  class="btn btn-outline-secondary fw-semibold py-2 w-100 d-flex align-items-center justify-content-center text-nowrap"
                  :disabled="submitting || cartItems.length === 0"
                  @click="submitSale(false)">
                  <i class="bi bi-file-earmark-check me-1"></i>
                  <span>{{ editingSaleId ? 'ড্রাফট আপডেট' : 'সেইভ ড্রাফট' }}</span>
                </button>
              </div>

              <div class="col-6">
                <button
                  type="button"
                  class="btn btn-success text-white fw-bold py-2 w-100 shadow-sm d-flex align-items-center justify-content-center text-nowrap"
                  :disabled="submitting || cartItems.length === 0"
                  @click="submitSale(true)">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
                  <i v-else class="bi bi-printer-fill me-1"></i>
                  <span>{{ editingSaleId ? 'আপডেট ও প্রিন্ট' : 'সম্পন্ন ও প্রিন্ট' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- ড্রাফট চালানের তালিকা (Draft Sales Section) under POS Counter with clear gap -->
      <div class="card border shadow-sm mt-4 draft-sales-card">
        <div class="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2 py-2">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-file-earmark-text text-warning fs-5"></i>
            <h6 class="m-0 fw-bold">ড্রাফট চালানের তালিকা</h6>
            <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle font-monospace">
              {{ draftSalesList.length }} টি ড্রাফট
            </span>
          </div>
          <small class="text-muted">
            <i class="bi bi-info-circle me-1"></i>ড্রাফট চালান কার্টে লোড করতে "কার্টে নিন" চাপুন অথবা ক্লিয়ার করতে ডিলিট করুন
          </small>
        </div>

        <div class="card-body p-0">
          <div v-if="draftSalesList.length === 0" class="text-center py-4">
            <i class="bi bi-file-earmark-check text-muted fs-3 mb-2 d-block"></i>
            <p class="text-muted small mb-0">বর্তমানে কোনো ড্রাফট চালান সংরক্ষিত নেই।</p>
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="sales-table-header">
                <tr class="small text-nowrap">
                  <th style="width: 50px;" class="text-center">#</th>
                  <th style="width: 160px;" class="text-start">ইনভয়েস নং</th>
                  <th style="width: 120px;" class="text-center">তারিখ</th>
                  <th style="min-width: 160px;" class="text-start">গ্রাহক</th>
                  <th style="width: 120px;" class="text-center">পরিমাণ ও পণ্য</th>
                  <th style="width: 140px;" class="text-end">মোট মূল্য (৳)</th>
                  <th style="width: 160px;" class="text-center">একশন</th>
                </tr>
              </thead>
              <tbody class="small">
                <tr v-for="(draft, dIdx) in draftSalesList" :key="draft.id">
                  <td class="text-center text-muted">{{ dIdx + 1 }}</td>
                  <td class="text-start font-monospace fw-semibold">{{ draft.invoiceNumber }}</td>
                  <td class="text-center text-muted">{{ formatDate(draft.saleDate) }}</td>
                  <td class="text-start">
                    <span class="fw-medium">{{ draft.customerName || 'ওয়াকিং কাস্টমার' }}</span>
                    <span v-if="draft.customerMobile" class="text-muted d-block font-monospace" style="font-size: 0.72rem;">{{ draft.customerMobile }}</span>
                  </td>
                  <td class="text-center text-nowrap">
                    <div class="fw-bold text-dark font-monospace">{{ getSaleTotalQty(draft) }} পিস</div>
                    <div class="text-muted" style="font-size: 0.74rem;">({{ draft.items?.length || 0 }} টি পণ্য)</div>
                  </td>
                  <td class="text-end fw-bold text-success font-monospace">৳{{ Number(draft.totalAmount || 0).toFixed(2) }}</td>
                  <td class="text-center">
                    <div class="d-inline-flex gap-1">
                      <button
                        type="button"
                        class="btn btn-xs btn-outline-success d-inline-flex align-items-center gap-1"
                        title="কার্টে লোড করুন"
                        @click="loadDraftIntoCart(draft)">
                        <i class="bi bi-arrow-up-right-circle"></i>
                        <span>কার্টে নিন</span>
                      </button>
                      <button
                        type="button"
                        class="btn btn-xs btn-outline-danger d-inline-flex align-items-center gap-1"
                        title="ড্রাফট ক্লিয়ার করুন"
                        @click="confirmDeleteSale(draft.id)">
                        <i class="bi bi-trash"></i>
                        <span>ক্লিয়ার</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 2: বিক্রয় তালিকা (Sales List View) -->
    <div v-if="activeView === 'list'" class="card border shadow-sm">
      <div class="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2 py-2">
        <div class="d-flex align-items-center gap-2">
          <h6 class="m-0 fw-bold">সকল বিক্রয় চালানের তালিকা</h6>
          <span class="badge bg-secondary-subtle text-secondary border">
            {{ filteredSalesList.length }} টি
          </span>
        </div>

        <!-- সার্চ ও রিফ্রেশ বার -->
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <div class="position-relative" style="min-width: 220px;">
            <input
              v-model.trim="listSearchQuery"
              type="text"
              class="form-control form-control-sm ps-4 search-input-unified"
              placeholder="ইনভয়েস বা গ্রাহক খুঁজুন..." />
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted small pe-none"></i>
            <button
              v-if="listSearchQuery"
              type="button"
              class="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-2"
              @click="listSearchQuery = ''">
              <i class="bi bi-x"></i>
            </button>
          </div>

          <button
            type="button"
            class="btn btn-sm btn-secondary d-inline-flex align-items-center justify-content-center shadow-sm filter-reset-btn"
            title="রিফ্রেশ করুন"
            @click="loadAllData">
            <i class="bi bi-arrow-counterclockwise" :class="{ 'spin-icon': loading }"></i>
          </button>
        </div>
      </div>

      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <div class="text-muted small mt-2">বিক্রয় তথ্য লোড হচ্ছে...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredSalesList.length === 0" class="text-center py-5">
          <i class="bi bi-inbox text-muted fs-1 mb-2 d-block"></i>
          <p class="text-muted mb-0">কোনো বিক্রয় রেকর্ড পাওয়া যায়নি।</p>
        </div>

        <!-- Table View -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="sales-table-header">
              <tr class="small text-nowrap">
                <th style="width: 45px;" class="text-center">#</th>
                <th style="width: 170px;" class="text-start">ইনভয়েস ও তারিখ</th>
                <th style="min-width: 250px;" class="text-start">গ্রাহক</th>
                <th style="width: 130px;" class="text-center">ক্যাশিয়ার</th>
                <th style="width: 110px;" class="text-center">পরিমাণ ও পণ্য</th>
                <th style="width: 130px;" class="text-end">মোট বিল (৳)</th>
                <th style="width: 120px;" class="text-end">পরিশোধ (৳)</th>
                <th style="width: 100px;" class="text-center">মাধ্যম</th>
                <th style="width: 100px;" class="text-center">স্ট্যাটাস</th>
                <th style="width: 90px;" class="text-center">একশন</th>
              </tr>
            </thead>
            <tbody class="small">
              <tr v-for="(sale, idx) in paginatedSales" :key="sale.id">
                <td class="text-center text-muted">
                  {{ (currentPage - 1) * perPage + idx + 1 }}
                </td>
                <td class="text-start text-nowrap">
                  <div class="font-monospace fw-semibold text-dark">{{ sale.invoiceNumber }}</div>
                  <div class="text-muted mt-0.5" style="font-size: 0.76rem;">
                    <i class="bi bi-calendar-event me-1"></i>{{ formatDate(sale.saleDate) }}
                  </div>
                </td>
                <td class="text-start">
                  <div class="fw-semibold text-dark fs-6">{{ sale.customerName || 'ওয়াক-ইন কাস্টমার' }}</div>
                  <div v-if="sale.customerMobile" class="text-muted font-monospace mt-0.5" style="font-size: 0.76rem;">
                    <i class="bi bi-telephone me-1"></i>{{ sale.customerMobile }}
                  </div>
                </td>
                <td class="text-center">
                  <span class="badge bg-light text-dark border">
                    {{ sale.cashierName || '-' }}
                  </span>
                </td>
                <td class="text-center text-nowrap">
                  <div class="fw-bold text-dark font-monospace fs-6">{{ getSaleTotalQty(sale) }} পিস</div>
                  <div class="text-muted" style="font-size: 0.74rem;">({{ sale.items?.length || 0 }} টি পণ্য)</div>
                </td>
                <td class="text-end fw-bold font-monospace text-dark text-nowrap">
                  <span class="currency-symbol text-muted me-0.5">৳</span>{{ Number(sale.totalAmount || 0).toFixed(2) }}
                </td>
                <td class="text-end font-monospace text-success text-nowrap">
                  <span class="currency-symbol text-success opacity-75 me-0.5">৳</span>{{ Number(sale.paidAmount || 0).toFixed(2) }}
                </td>
                <td class="text-center text-capitalize">
                  <span class="badge bg-light text-muted border">
                    {{ sale.paymentMethod || 'ক্যাশ' }}
                  </span>
                  <div v-if="sale.transactionId" class="text-muted font-monospace mt-0.5" style="font-size: 0.7rem;">
                    Trx: {{ sale.transactionId }}
                  </div>
                </td>
                <td class="text-center">
                  <span
                    class="badge"
                    :class="Number(sale.dueAmount || 0) <= 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'">
                    {{ Number(sale.dueAmount || 0) <= 0 ? 'পরিশোধিত' : `বকেয়া: ৳${Number(sale.dueAmount).toFixed(0)}` }}
                  </span>
                </td>
                <td class="text-center text-nowrap">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary p-1 px-2 me-1 action-btn"
                    title="বিক্রয় এডিট করুন"
                    @click="editSale(sale)">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-success p-1 px-2 me-1 action-btn"
                    title="রসিদ প্রিন্ট করুন"
                    @click="previewAndPrintSale(sale)">
                    <i class="bi bi-printer"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger p-1 px-2 action-btn"
                    title="বাতিল করুন"
                    @click="confirmDeleteSale(sale.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- পেজিনেশন -->
      <div v-if="filteredSalesList.length > 0" class="card-footer bg-transparent border-top py-2 px-3">
        <Pagination :data="paginationData" variant="success" />
      </div>
    </div>

    <!-- প্রিন্টেবল রসিদ মোডাল (POS Thermal & A4 Receipt Modal) -->
    <div
      v-if="showPrintModal"
      class="modal fade show d-block"
      style="background: rgba(0, 0, 0, 0.5); z-index: 1070;"
      tabindex="-1">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 480px;">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-bottom py-2.5">
            <h6 class="modal-title fw-bold">
              <i class="bi bi-printer me-1 text-success"></i>বিক্রয় রসিদ (POS Receipt)
            </h6>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="showPrintModal = false"></button>
          </div>

          <div class="modal-body p-3">
            <!-- Thermal Receipt Printable Layout -->
            <div id="thermal-receipt" class="receipt-container p-3 bg-white border rounded">
              <div class="text-center pb-2 border-bottom mb-2">
                <h5 class="fw-bold m-0 fs-5">{{ companyDisplayName }}</h5>
                <p v-if="companySlogan" class="small text-muted mb-0">{{ companySlogan }}</p>
                <p class="small text-muted mb-0">মোবাইল: {{ companyPhone }}</p>
              </div>

              <!-- চালান মেটা তথ্য -->
              <div class="receipt-meta small pb-2 border-bottom mb-2">
                <div class="d-flex justify-content-between">
                  <span>ইনভয়েস: <strong>{{ activeReceiptSale?.invoiceNumber }}</strong></span>
                  <span>তারিখ: {{ formatDate(activeReceiptSale?.saleDate) }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span>গ্রাহক: {{ activeReceiptSale?.customerName || 'ওয়াকিং কাস্টমার' }}</span>
                  <span>ক্যাশিয়ার: <strong>{{ activeReceiptSale?.cashierName || cashierDisplayName }}</strong></span>
                </div>
              </div>

              <!-- আইটেম টেবিল -->
              <table class="table table-sm table-borderless small mb-2">
                <thead class="border-bottom">
                  <tr>
                    <th class="text-start p-1">পণ্য</th>
                    <th class="text-center p-1">পরিমাণ</th>
                    <th class="text-end p-1">দর</th>
                    <th class="text-end p-1">মোট</th>
                  </tr>
                </thead>
                <tbody class="border-bottom">
                  <tr v-for="it in activeReceiptSale?.items || []" :key="it.id">
                    <td class="p-1">
                      <div class="fw-semibold">{{ cleanItemName(it.name) }}</div>
                      <small v-if="it.sizeName || it.colorName" class="text-muted d-block" style="font-size: 0.72rem;">
                        <span v-if="it.sizeName">সাইজ: {{ it.sizeName }}</span>
                        <span v-if="it.sizeName && it.colorName"> | </span>
                        <span v-if="it.colorName">কালার: {{ it.colorName }}</span>
                      </small>
                    </td>
                    <td class="text-center p-1 font-monospace">{{ it.quantity }}</td>
                    <td class="text-end p-1 font-monospace">{{ Number(it.unitPrice).toFixed(2) }}</td>
                    <td class="text-end p-1 font-monospace">{{ Number(it.totalPrice).toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>

              <!-- সারসংক্ষেপ হিসাব -->
              <div class="receipt-totals small pb-2 border-bottom mb-2">
                <div class="d-flex justify-content-between">
                  <span>সাবটোটাল:</span>
                  <span class="font-monospace"><span class="currency-symbol me-0.5">৳</span>{{ Number(activeReceiptSale?.subtotal || 0).toFixed(2) }}</span>
                </div>
                <div v-if="Number(activeReceiptSale?.discountAmount || 0) > 0" class="d-flex justify-content-between text-danger">
                  <span>ছাড়:</span>
                  <span class="font-monospace">- <span class="currency-symbol me-0.5">৳</span>{{ Number(activeReceiptSale?.discountAmount).toFixed(2) }}</span>
                </div>
                <div v-if="Number(activeReceiptSale?.vatAmount || 0) > 0" class="d-flex justify-content-between text-muted">
                  <span>{{ activeReceiptSale?.vatMode === 'inclusive' ? 'ভ্যাট (অন্তর্ভুক্ত)' : 'ভ্যাট' }}:</span>
                  <span class="font-monospace"><span class="currency-symbol me-0.5">৳</span>{{ Number(activeReceiptSale?.vatAmount).toFixed(2) }}</span>
                </div>
                <div class="d-flex justify-content-between fw-bold fs-6 pt-1 border-top mt-1">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span class="font-monospace text-success"><span class="currency-symbol me-0.5">৳</span>{{ Number(activeReceiptSale?.totalAmount || 0).toFixed(2) }}</span>
                </div>
                <div class="d-flex justify-content-between pt-1">
                  <span>
                    পরিশোধিত ({{ activeReceiptSale?.paymentMethod || 'ক্যাশ' }}):
                    <small v-if="activeReceiptSale?.transactionId" class="text-muted d-block font-monospace" style="font-size: 0.7rem;">
                      TrxID: {{ activeReceiptSale.transactionId }}
                    </small>
                  </span>
                  <span class="font-monospace"><span class="currency-symbol me-0.5">৳</span>{{ Number(activeReceiptSale?.paidAmount || 0).toFixed(2) }}</span>
                </div>
                <div v-if="Number(activeReceiptSale?.changeAmount || 0) > 0" class="d-flex justify-content-between text-primary">
                  <span>ফেরত দেওয়া হয়েছে:</span>
                  <span class="font-monospace"><span class="currency-symbol me-0.5">৳</span>{{ Number(activeReceiptSale?.changeAmount).toFixed(2) }}</span>
                </div>
                <div v-if="Number(activeReceiptSale?.dueAmount || 0) > 0" class="d-flex justify-content-between text-danger fw-semibold">
                  <span>বকেয়া:</span>
                  <span class="font-monospace"><span class="currency-symbol me-0.5">৳</span>{{ Number(activeReceiptSale?.dueAmount).toFixed(2) }}</span>
                </div>
              </div>

              <!-- ফুটার বার্তা -->
              <div class="text-center pt-1 small text-muted" style="font-size: 0.72rem;">
                <p class="mb-0">ধন্যবাদ, আবার আসবেন!</p>
                <p class="mb-0">ক্রয়কৃত পণ্য ৭ দিনের মধ্যে ক্যাশ মেমোসহ পরিবর্তনযোগ্য।</p>
              </div>
            </div>
          </div>

          <div class="modal-footer border-top py-2 px-3 d-flex justify-content-between">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              @click="showPrintModal = false">
              বন্ধ করুন
            </button>
            <button
              type="button"
              class="btn btn-sm btn-success text-white px-4 shadow-sm"
              @click="printReceipt">
              <i class="bi bi-printer-fill me-1"></i>প্রিন্ট দিন
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, onMounted, onUnmounted, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { authUser } from "@/composables/useAuth";
import Pagination from "@/components/datatable/Pagination.vue";
import Input from "@/components/Input.vue";
import Select from "@/components/Select.vue";

const router = useRouter();
const route = useRoute();
const setBreadcrumbs = inject<((crumbs: any[] | null) => void) | null>("setBreadcrumbs", null);

// Active View: 'pos' or 'list'
const activeView = ref<"pos" | "list">("pos");

function switchView(view: "pos" | "list") {
  activeView.value = view;
  if (view === "pos") {
    if (route.path !== "/sales") {
      router.push("/sales");
    }
  } else {
    if (route.path !== "/sales-list") {
      router.push("/sales-list");
    }
  }
}

watch(
  () => [route.path, route.query.view],
  ([path, queryView]) => {
    if (path === "/sales-list" || queryView === "list") {
      activeView.value = "list";
    } else {
      activeView.value = "pos";
    }
  },
  { immediate: true }
);

watch(
  () => activeView.value,
  (view) => {
    if (setBreadcrumbs) {
      if (view === "list") {
        setBreadcrumbs([
          { label: "পণ্য বিক্রয় ও পিওএস", to: "/sales" },
          { label: "বিক্রয় তালিকা" }
        ]);
      } else {
        setBreadcrumbs([
          { label: "পণ্য বিক্রয় ও পিওএস (POS)" }
        ]);
      }
    }
  },
  { immediate: true }
);

// Toast Notification State
const toast = reactive({
  show: false,
  message: "",
  type: "success" as "success" | "warning" | "danger" | "info"
});

function showToast(msg: string, type: "success" | "warning" | "danger" | "info" = "success") {
  toast.message = msg;
  toast.type = type;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 4000);
}

// Data Lists
const loading = ref(false);
const submitting = ref(false);
const itemsList = ref<any[]>([]);
const customersList = ref<any[]>([]);
const salesList = ref<any[]>([]);
const draftSalesList = computed(() => {
  return salesList.value.filter((s) => s.status === "draft");
});
const completedSalesList = computed(() => {
  return salesList.value.filter((s) => s.status !== "draft");
});
const companyInfo = ref<any>(null);

// Scanner & Product Selection
const barcodeInputRef = ref<HTMLInputElement | null>(null);
const scannerQuery = ref("");
const selectedDropdownItem = ref<any>(null);
const selectedSubCategoryId = ref<number | string | null>(null);
const selectResetKey = ref(0);

// Cashier Name logic
// User Requirement: "বিক্রেতা/ক্যাশিয়ার (Salesperson / Cashier): যে ডাটা এন্ট্রি করছে তার নাম বসবে।"
const cashierDisplayName = computed(() => {
  return (authUser.value as any)?.name || (authUser.value as any)?.fullName || "অ্যাডমিন ক্যাশিয়ার";
});

// Company Display Info
const companyDisplayName = computed(() => {
  return companyInfo.value?.name || (authUser.value as any)?.companyName || "ফ্যাশন হাউজ";
});
const companyPhone = computed(() => {
  return companyInfo.value?.phone || "০১৭০০০০০০০০";
});

// Today Date formatting
const todayFormatted = computed(() => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
});

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

// Helper: Format invoice number using company pattern
function formatInvoiceNumber(pattern: string, prefix: string, count: number): string {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const yy = yyyy.slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  let result = (pattern || "{PREFIX}-{YYYY}-{0001}").trim();
  result = result
    .replace(/\{PREFIX\}/gi, (prefix || "INV").trim().toUpperCase())
    .replace(/\{YYYY\}/gi, yyyy)
    .replace(/\{YY\}/gi, yy)
    .replace(/\{MM\}/gi, mm)
    .replace(/\{DD\}/gi, dd);

  const seqMatch = result.match(/\{(0+1|1)\}/);
  if (seqMatch) {
    const token = seqMatch[1];
    const width = token.length;
    const seqStr = String(count).padStart(width, "0");
    result = result.replace(seqMatch[0], seqStr);
  } else {
    result += `-${String(count).padStart(4, "0")}`;
  }

  return result;
}

// Auto-generated Invoice Number according to company settings (invoicePattern, invoicePrefix, invoiceResetCycle)
const generatedInvoiceNumber = computed(() => {
  const prefix = (companyInfo.value?.invoicePrefix || "INV").trim().toUpperCase();
  const pattern = (companyInfo.value?.invoicePattern || "{PREFIX}-{YYYY}-{0001}").trim();
  const resetCycle = companyInfo.value?.invoiceResetCycle || "yearly";

  let count = 1;
  if (resetCycle === "yearly") {
    const currentYear = new Date().getFullYear();
    const thisYearSales = salesList.value.filter((s) => {
      const d = s.saleDate || s.createdAt;
      return d && String(d).startsWith(String(currentYear));
    });
    count = thisYearSales.length + 1;
  } else {
    count = salesList.value.length + 1;
  }

  return formatInvoiceNumber(pattern, prefix, count);
});

// Sales Form Model
const form = reactive({
  customerId: "" as number | string,
  customerType: "walk_in" as string,
  customerName: "ওয়াক-ইন কাস্টমার",
  customerMobile: "",
  customerAddress: "",
  discountValue: 0 as number,
  discountType: "fixed" as "fixed" | "percent",
  paidAmount: 0 as number,
  paymentMethod: "cash",
  transactionId: "",
  notes: ""
});

// Cart Items Interface
interface CartItem {
  uid: string;
  itemId: number;
  barcode: string;
  name: string;
  categoryName: string;
  brandName: string;
  sizeName: string;
  colorName: string;
  colorCode?: string;
  quantity: number;
  availableStock: number;
  unitCost: number;
  unitPrice: number;
  vatRate: number; // User Requirement: "ভ্যাট হিসাব হবে আইটেমের মূল্য নির্ধারণ পেইজে থেকে। সবসময় লাস্ট রেট অনুযায়ী হিসাব হবে।"
  vatType: "inclusive" | "exclusive";
  vatAmount: number;
  discountType: "percent" | "fixed";
  discountValue: number;
  discountAmount: number;
  totalPrice: number;
}

const cartItems = ref<CartItem[]>([]);

// Bengali Number Formatter
function toBengaliNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined || num === "") return "০";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/[0-9]/g, (w) => bengaliDigits[+w]);
}

// Clean Item Name helper (strips design suffix like _DGN005 and size suffixes)
function cleanItemName(name: string): string {
  if (!name) return "";
  return name
    .replace(/_DGN\d+.*$/i, "")
    .replace(/\s*DGN\d+\b/gi, "")
    .replace(/\s*\(\s*(?:সাইজ|size)[\s\-:—].*?\)/i, "")
    .replace(/\s+(?:সাইজ|size)[\s\-:—].*$/i, "")
    .replace(/[\-_]\s*$/g, "")
    .trim();
}

// Sub-Category Filter Options (User Requirement: পণ্য নামের আগে সাব ক্যাটাগরি ফিল্ড দিয়ে ফিল্টার করার সুবিধা)
const subCategoryFilterOptions = computed(() => {
  const map = new Map<number, string>();
  for (const it of itemsList.value) {
    if (Number(it.stockQuantity || 0) > 0) {
      const subId = Number(it.subCategoryId || it.subCategory?.id);
      const subName = it.subCategory?.name;
      if (subId && subName && !map.has(subId)) {
        map.set(subId, subName);
      }
    }
  }
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
});

// Filtered Available Items for search & dropdown (ইউজারের নির্দেশনা: স্টক নেই এমন পণ্য তালিকায় আসবে না)
const availableItems = computed(() => {
  let list = itemsList.value.filter((it) => Number(it.stockQuantity || 0) > 0);
  if (selectedSubCategoryId.value) {
    list = list.filter(
      (it) => Number(it.subCategoryId || it.subCategory?.id) === Number(selectedSubCategoryId.value)
    );
  }
  return list;
});

const standardSizeOrder: Record<string, number> = {
  free: 0,
  fs: 0,
  "free size": 0,
  xs: 1,
  s: 2,
  m: 3,
  l: 4,
  xl: 5,
  xxl: 6,
  "2xl": 6,
  xxxl: 7,
  "3xl": 7,
  "4xl": 8,
  "5xl": 9,
  "6xl": 10
};

function compareSizes(aSize: any, bSize: any, aName: string = "", bName: string = ""): number {
  const aClean = (aName || aSize?.name || "").trim().toLowerCase();
  const bClean = (bName || bSize?.name || "").trim().toLowerCase();

  if (aClean === bClean) return 0;
  if (!aClean) return 1;
  if (!bClean) return -1;

  // 1. Check sortOrder from catalog database if configured
  const aOrder = Number(aSize?.sortOrder || 0);
  const bOrder = Number(bSize?.sortOrder || 0);
  if (aOrder > 0 && bOrder > 0 && aOrder !== bOrder) {
    return aOrder - bOrder;
  }

  // 2. Check standard letter sizes (XS, S, M, L, XL, XXL, etc.)
  const aRank = standardSizeOrder[aClean];
  const bRank = standardSizeOrder[bClean];
  if (aRank !== undefined && bRank !== undefined) {
    return aRank - bRank;
  }
  if (aRank !== undefined) return -1;
  if (bRank !== undefined) return 1;

  // 3. Check numeric sizes (e.g. 28, 30, 32, 34, 36...)
  const aNum = parseFloat(aClean);
  const bNum = parseFloat(bClean);
  if (!isNaN(aNum) && !isNaN(bNum) && aNum !== bNum) {
    return aNum - bNum;
  }

  // 4. Default natural string comparison
  return aClean.localeCompare(bClean, "bn", { numeric: true, sensitivity: "base" });
}

// POS Product Options for Searchable Select Component (সর্টিং: পণ্যের নাম -> সাইজ -> কালার)
const posItemOptions = computed(() => {
  const options = availableItems.value.map((it: any) => {
    const cleanName = cleanItemName(it.name);
    const sizeName = it.size?.name || "";
    const colorName = it.color?.name || "";
    const specs = [sizeName, colorName].filter(Boolean).join(", ");
    const specsPart = specs ? ` [${specs}]` : "";
    const stockQty = toBengaliNumber(it.stockQuantity ?? 0);
    // User Requirement: "স্টক শুধু ব্রাকেটে দিলে স্পেস কম নিবে যেমন (২), স্টক শব্দ ব্যবহার প্রয়োজন নেই"
    const displayName = `${cleanName}${specsPart} (${stockQty})`;
    return {
      ...it,
      displayName,
      cleanName,
      sizeName,
      colorName,
      colorCode: it.color?.code || "",
      stockQtyBn: stockQty
    };
  });

  // User Requirement: "পণ্যের নাম, সাইজ, কালার এভাবে সর্টিং হবে"
  return options.sort((a, b) => {
    // ১. পণ্যের নাম (A-Z / ক-খ)
    const nameDiff = a.cleanName.localeCompare(b.cleanName, "bn", { sensitivity: "base" });
    if (nameDiff !== 0) return nameDiff;

    // ২. সাইজ (S, M, L, XL, XXL বা ২৮, ৩০, ৩২...)
    const sizeDiff = compareSizes(a.size, b.size, a.sizeName, b.sizeName);
    if (sizeDiff !== 0) return sizeDiff;

    // ৩. কালার (বর্ণানুক্রমিক)
    return (a.colorName || "").localeCompare(b.colorName || "", "bn", { sensitivity: "base" });
  });
});

function normalizeDigitEn(str: string): string {
  const bnToEn: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return (str || "").replace(/[০-৯]/g, (d) => bnToEn[d] || d);
}

function normalizeDigitBn(str: string): string {
  const enToBn: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return (str || "").replace(/[0-9]/g, (d) => enToBn[d] || d);
}

// Comprehensive search filter for POS items (মাল্টি-ওয়ার্ড ও প্রতিটি শব্দ/অংশ অনুযায়ী সার্চ)
function filterPosItem(option: any, label: string, search: string): boolean {
  if (!search) return true;
  const rawQ = search.trim().toLowerCase();
  if (!rawQ) return true;

  // Build a consolidated search target including Name, Clean Name, Specs, Brand, Size, Color, Barcode, etc.
  const targetParts = [
    label || "",
    option.displayName || "",
    option.name || "",
    option.cleanName || "",
    option.code || "",
    option.barcode || "",
    option.latestBarcode || "",
    option.sizeName || "",
    option.colorName || "",
    option.brand?.name || "",
    option.brandName || "",
    option.subCategory?.name || "",
    option.category?.name || ""
  ];
  const combinedTarget = targetParts.join(" ").toLowerCase();
  const targetBn = normalizeDigitBn(combinedTarget);
  const targetEn = normalizeDigitEn(combinedTarget);

  // Split search query into individual words/tokens
  const tokens = rawQ.split(/\s+/).filter(Boolean);

  // Every word typed must match somewhere in the product info (with Bengali/English digit and hyphen tolerance)
  return tokens.every((token) => {
    const tokenClean = token.replace(/[-_]/g, "");
    const tokenBn = normalizeDigitBn(token);
    const tokenEn = normalizeDigitEn(token);

    return (
      combinedTarget.includes(token) ||
      targetBn.includes(tokenBn) ||
      targetEn.includes(tokenEn) ||
      (tokenClean && combinedTarget.replace(/[-_]/g, "").includes(tokenClean))
    );
  });
}

// Send WhatsApp Receipt
function sendWhatsAppReceipt() {
  const sale = activeReceiptSale.value;
  if (!sale) return;

  let mobile = (sale.customerMobile || "").trim();
  // Strip non-digits
  mobile = mobile.replace(/[^\d]/g, "");
  if (mobile.startsWith("01")) {
    mobile = "88" + mobile;
  } else if (mobile.startsWith("1") && mobile.length === 10) {
    mobile = "880" + mobile;
  }

  const compName = companyDisplayName.value;
  const invNo = sale.invoiceNumber;
  const date = formatDate(sale.saleDate);
  const total = Number(sale.totalAmount || 0).toFixed(2);
  const paid = Number(sale.paidAmount || 0).toFixed(2);
  const due = Number(sale.dueAmount || 0).toFixed(2);

  let itemsListText = "";
  (sale.items || []).forEach((it: any, i: number) => {
    const itName = cleanItemName(it.name);
    const specs = [it.sizeName ? `সাইজ: ${it.sizeName}` : "", it.colorName ? `কালার: ${it.colorName}` : ""].filter(Boolean).join(", ");
    const specsStr = specs ? ` (${specs})` : "";
    const qty = it.quantity;
    const price = Number(it.unitPrice).toFixed(2);
    const lineTotal = Number(it.totalPrice).toFixed(2);
    itemsListText += `${i + 1}. ${itName}${specsStr} - ${qty} x ৳${price} = ৳${lineTotal}\n`;
  });

  let msg = `*${compName}*\n`;
  if (companySlogan.value) {
    msg += `_${companySlogan.value}_\n`;
  }
  msg += `মোবাইল: ${companyPhone.value}\n`;
  msg += `--------------------------------\n`;
  msg += `*বিক্রয় রসিদ (Cash Memo)*\n`;
  msg += `ইনভয়েস: *${invNo}*\n`;
  msg += `তারিখ: ${date}\n`;
  msg += `গ্রাহক: ${sale.customerName || "সম্মানিত গ্রাহক"}\n`;
  msg += `--------------------------------\n`;
  msg += `*পণ্যের বিবরণ:*\n${itemsListText}`;
  msg += `--------------------------------\n`;
  msg += `সাবটোটাল: ৳${Number(sale.subtotal || 0).toFixed(2)}\n`;
  if (Number(sale.discountAmount || 0) > 0) {
    msg += `ছাড়: -৳${Number(sale.discountAmount).toFixed(2)}\n`;
  }
  if (Number(sale.vatAmount || 0) > 0) {
    msg += `ভ্যাট: ৳${Number(sale.vatAmount).toFixed(2)}\n`;
  }
  msg += `*সর্বমোট প্রদেয়: ৳${total}*\n`;
  msg += `পরিশোধিত: ৳${paid} (${sale.paymentMethod || "ক্যাশ"})\n`;
  if (Number(due) > 0) {
    msg += `*বকেয়া: ৳${due}*\n`;
  }
  msg += `--------------------------------\n`;
  msg += `ধন্যবাদ, আবার আসবেন!`;

  const url = mobile
    ? `https://api.whatsapp.com/send?phone=${encodeURIComponent(mobile)}&text=${encodeURIComponent(msg)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

  window.open(url, "_blank");
  showToast("হোয়াটসঅ্যাপ খোলা হচ্ছে...", "info");
}

// Focus Barcode Input
function focusBarcodeInput() {
  nextTick(() => {
    barcodeInputRef.value?.focus();
  });
}

// Customer dropdown options & state
const customerMobileInputRef = ref<HTMLInputElement | null>(null);

const customerTypeOptions = [
  { label: "ওয়াক-ইন কাস্টমার", value: "walk_in" },
  { label: "খুচরা কাস্টমার", value: "retail" },
  { label: "পাইকারি কাস্টমার", value: "wholesale" },
  { label: "কর্পোরেট কাস্টমার", value: "corporate" }
];

// Rule: পাইকারী ও কর্পোরেট কাস্টমারের ক্ষেত্রে নাম ও মোবাইল বাধ্যতামূলক
const isCustomerMandatory = computed(() => {
  return form.customerType === "wholesale" || form.customerType === "corporate";
});

function getCustomerTypeLabel(type: string): string {
  switch (type) {
    case "walk_in":
      return "ওয়াক-ইন";
    case "retail":
      return "খুচরা";
    case "wholesale":
      return "পাইকারি";
    case "corporate":
      return "কর্পোরেট";
    default:
      return "সাধারণ";
  }
}

const filteredCustomerOptions = computed(() => {
  // Only real registered customers in dropdown
  let list = customersList.value.filter(
    (c) =>
      c.customerType !== "walk_in" &&
      c.customerType !== "other" &&
      c.name !== "ওয়াক-ইন কাস্টমার" &&
      c.name !== "ওয়াকিং কাস্টমার" &&
      c.name !== "খুচরা কাস্টমার" &&
      c.name !== "পাইকারি কাস্টমার" &&
      c.name !== "কর্পোরেট কাস্টমার" &&
      c.name !== "অন্যান্য কাস্টমার"
  );

  // Prioritize customers of current selected customerType
  if (form.customerType && form.customerType !== "walk_in") {
    return [...list].sort((a, b) => {
      const matchA = a.customerType === form.customerType ? 0 : 1;
      const matchB = b.customerType === form.customerType ? 0 : 1;
      return matchA - matchB;
    });
  }

  return list;
});

function createCustomerOption(newVal: string) {
  const cleanName = (newVal || "").trim();
  return {
    id: null,
    name: cleanName,
    mobile: "",
    customerType: form.customerType || "retail"
  };
}

function onCustomerNameSelect(selected: any) {
  const selectedName = typeof selected === "object" && selected ? selected.name : selected;
  form.customerName = (selectedName || "").trim();

  if (!form.customerName) {
    form.customerId = "";
    if (form.customerType === "walk_in") {
      form.customerName = "ওয়াক-ইন কাস্টমার";
    }
    return;
  }

  const matched = customersList.value.find(
    (c) => (c.name || "").trim().toLowerCase() === form.customerName.toLowerCase()
  );

  if (matched) {
    form.customerId = matched.id;
    if (matched.mobile) {
      form.customerMobile = matched.mobile;
    }
    if (matched.address) {
      form.customerAddress = matched.address;
    }
    if (matched.customerType && matched.customerType !== "walk_in") {
      form.customerType = matched.customerType;
    }
  } else {
    form.customerId = "";
  }
}

function onCustomerSearch(search: string) {
  if (search && search.trim()) {
    form.customerName = search.trim();
  }
}

function onCustomerMobileInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const clean = target.value
    .replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)))
    .replace(/[^\d+]/g, "");
  form.customerMobile = clean;
  target.value = clean;
}

function onCustomerTypeChange() {
  if (form.customerType === "walk_in") {
    resetToDefaultCustomer();
  } else {
    if (form.customerName === "ওয়াক-ইন কাস্টমার" || form.customerName === "ওয়াকিং কাস্টমার") {
      form.customerName = "";
      form.customerMobile = "";
      form.customerAddress = "";
      form.customerId = "";
    }
  }
}

function resetToDefaultCustomer() {
  form.customerType = "walk_in";
  form.customerName = "ওয়াক-ইন কাস্টমার";
  form.customerMobile = "";
  form.customerAddress = "";
  const walkIn = customersList.value.find(
    (c) => c.customerType === "walk_in" || c.name === "ওয়াক-ইন কাস্টমার" || c.name === "ওয়াকিং কাস্টমার"
  );
  form.customerId = walkIn ? walkIn.id : "";
}

// Add Item to Cart Helper
function addItemToCart(item: any) {
  const availableStock = Number(item.stockQuantity ?? item.availableStock ?? 0);
  if (availableStock <= 0) {
    showToast(`"${cleanItemName(item.name)}" পণ্যটির স্টক শেষ (স্টক: ০)`, "warning");
    return;
  }

  // Check if item already exists in cart
  const existing = cartItems.value.find((c) => c.itemId === item.id);
  if (existing) {
    if (existing.quantity + 1 > existing.availableStock) {
      showToast(`"${cleanItemName(item.name)}" এর সর্বোচ্চ উপলব্ধ স্টক ${existing.availableStock} টি`, "warning");
      return;
    }
    existing.quantity += 1;
    recalculateLine(existing);
    showToast(`"${cleanItemName(item.name)}" এর পরিমাণ ১ বাড়ানো হয়েছে`, "info");
    return;
  }

  // Get Latest VAT Rate, VAT Type, Discount, and Selling Price from Item Pricing (as enriched by backend)
  const unitPrice = Number(item.sellingPrice) || 0;
  const vatRate = item.latestVatRate !== undefined ? Number(item.latestVatRate) : 0;
  const vatType: "inclusive" | "exclusive" = item.latestVatType === "exclusive" ? "exclusive" : "inclusive";
  const unitCost = Number(item.latestUnitCost || item.purchasePrice || 0);
  const qty = 1;

  // Auto populate discount from item pricing if set
  const discountType: "percent" | "fixed" = (item.latestDiscountType || item.discountType) === "fixed" ? "fixed" : "percent";
  const discountValue = item.latestDiscount !== undefined && item.latestDiscount !== null ? Number(item.latestDiscount) : (Number(item.discount) || 0);

  let discount = 0;
  if (discountValue > 0) {
    if (discountType === "fixed") {
      discount = Number((discountValue * qty).toFixed(2));
    } else {
      discount = Number(((unitPrice * qty) * (discountValue / 100)).toFixed(2));
    }
  }
  discount = Math.min(unitPrice * qty, discount);

  const basePrice = Math.max(0, unitPrice * qty - discount);

  let vatAmount = 0;
  let totalPrice = 0;
  if (vatType === "inclusive") {
    vatAmount = vatRate > 0 ? Number((basePrice - basePrice / (1 + vatRate / 100)).toFixed(2)) : 0;
    totalPrice = Number(basePrice.toFixed(2));
  } else {
    vatAmount = vatRate > 0 ? Number((basePrice * (vatRate / 100)).toFixed(2)) : 0;
    totalPrice = Number((basePrice + vatAmount).toFixed(2));
  }

  cartItems.value.push({
    uid: `${item.id}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    itemId: item.id,
    barcode: item.latestBarcode || item.code || "",
    name: item.name,
    categoryName: item.category?.name || "",
    brandName: item.brand?.name || "",
    sizeName: item.size?.name || "",
    colorName: item.color?.name || "",
    colorCode: item.color?.code || "",
    quantity: qty,
    availableStock,
    unitCost,
    unitPrice,
    vatRate,
    vatType,
    vatAmount,
    discountType,
    discountValue,
    discountAmount: discount,
    totalPrice
  });


}

// Barcode Scan Handler
function handleBarcodeScan() {
  const query = scannerQuery.value.trim();
  if (!query) return;

  const q = query.toLowerCase();

  // Search by exact barcode (Method 2, standard 14-digit, or item code)
  const qClean = q.replace(/[^a-z0-9]/gi, "");
  const found = itemsList.value.find((it) => {
    const barcode = (it.barcode || "").toLowerCase();
    const barcodeClean = barcode.replace(/[^a-z0-9]/gi, "");
    const latestBarcode = (it.latestBarcode || "").toLowerCase();
    const latestBarcodeClean = latestBarcode.replace(/[^a-z0-9]/gi, "");
    const code = (it.code || "").toLowerCase();
    const codeClean = code.replace(/[^a-z0-9]/gi, "");

    if (barcode === q || latestBarcode === q || code === q) return true;
    if (barcodeClean && qClean && barcodeClean === qClean) return true;
    if (latestBarcodeClean && qClean && latestBarcodeClean === qClean) return true;
    if (codeClean && qClean && codeClean === qClean) return true;

    // Check if q matches 4-character hex variant ID (e.g. 0009)
    if (qClean.length >= 4 && it.id) {
      const hexPrefix = Number(it.id).toString(16).toLowerCase().padStart(4, "0");
      if (hexPrefix && qClean.startsWith(hexPrefix)) return true;
    }

    return (
      (barcode && barcode.includes(q)) ||
      (latestBarcode && latestBarcode.includes(q))
    );
  });

  if (found) {
    if (Number(found.stockQuantity || 0) <= 0) {
      showToast(`"${cleanItemName(found.name)}" পণ্যটির পর্যাপ্ত স্টক নেই (স্টক: ০)`, "warning");
      scannerQuery.value = "";
      return;
    }
    addItemToCart(found);
    scannerQuery.value = "";
    focusBarcodeInput();
  } else {
    // Try matching by name, color, size, or design code
    const nameMatch = itemsList.value.find((it) => {
      const n = (it.name || "").toLowerCase();
      const color = (it.color?.name || "").toLowerCase();
      const size = (it.size?.name || "").toLowerCase();
      const dgn = (it.designCode || "").toLowerCase();
      return n.includes(q) || color.includes(q) || dgn.includes(q);
    });
    if (nameMatch) {
      if (Number(nameMatch.stockQuantity || 0) <= 0) {
        showToast(`"${cleanItemName(nameMatch.name)}" পণ্যটির পর্যাপ্ত স্টক নেই (স্টক: ০)`, "warning");
        scannerQuery.value = "";
        return;
      }
      addItemToCart(nameMatch);
      scannerQuery.value = "";
      focusBarcodeInput();
    } else {
      showToast(`"${query}" বারকোড বা নামের কোনো পণ্য পাওয়া যায়নি`, "warning");
    }
  }
}

// Dropdown Product Select
function handleDropdownProductSelect(val?: any) {
  if (!val) return;
  const itemId = typeof val === "object" ? val.id : val;
  if (!itemId) return;
  const item = itemsList.value.find((it) => Number(it.id) === Number(itemId));
  if (item) {
    addItemToCart(item);
  }
  selectedDropdownItem.value = null;
  selectResetKey.value++;
  nextTick(() => {
    focusBarcodeInput();
  });
}

// Change Quantity (+ / -)
function changeQty(row: CartItem, delta: number) {
  const nextVal = (row.quantity || 1) + delta;
  if (delta > 0 && nextVal > row.availableStock) {
    showToast(`"${cleanItemName(row.name)}" এর সর্বোচ্চ উপলব্ধ স্টক ${row.availableStock} টি`, "warning");
    return;
  }
  row.quantity = Math.max(1, nextVal);
  recalculateLine(row);
}

// Recalculate single line values
function recalculateLine(row: CartItem) {
  const qty = Math.max(1, Number(row.quantity) || 1);
  const price = Math.max(0, Number(row.unitPrice) || 0);
  const val = Math.max(0, Number(row.discountValue) || 0);
  const vatRate = Math.max(0, Number(row.vatRate) || 0);

  let discount = 0;
  if (row.discountType === "fixed") {
    discount = Number((val * qty).toFixed(2));
  } else {
    discount = Number(((price * qty) * (val / 100)).toFixed(2));
  }
  discount = Math.min(price * qty, discount);
  row.discountAmount = discount;

  const basePrice = Math.max(0, price * qty - discount);
  if (row.vatType === "inclusive") {
    row.vatAmount = vatRate > 0 ? Number((basePrice - basePrice / (1 + vatRate / 100)).toFixed(2)) : 0;
    row.totalPrice = Number(basePrice.toFixed(2));
  } else {
    row.vatAmount = vatRate > 0 ? Number((basePrice * (vatRate / 100)).toFixed(2)) : 0;
    row.totalPrice = Number((basePrice + row.vatAmount).toFixed(2));
  }
}

// Remove single item from cart
function removeFromCart(index: number) {
  cartItems.value.splice(index, 1);
}

// Clear all cart

function getSaleTotalQty(sale: any): number {
  if (!sale || !Array.isArray(sale.items)) return 0;
  return sale.items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 0), 0);
}

const editingSaleId = ref<number | null>(null);
const editingInvoiceNumber = ref<string>("");

function editSale(sale: any) {
  if (!sale) return;
  if (cartItems.value.length > 0 && editingSaleId.value !== sale.id) {
    if (!confirm("বর্তমান কার্টের তথ্য পরিবর্তন করে এই বিক্রয় চালানটি এডিট করতে চান?")) {
      return;
    }
  }

  editingSaleId.value = sale.id;
  editingInvoiceNumber.value = sale.invoiceNumber || "";

  cartItems.value = (sale.items || []).map((item: any) => {
    const orig = itemsList.value.find((it) => it.id === item.itemId) || {};
    return {
      itemId: item.itemId,
      barcode: item.barcode || orig.code || orig.barcode || "",
      name: item.name || orig.name || "নামহীন পণ্য",
      categoryName: item.categoryName || orig.category?.name || "",
      brandName: item.brandName || orig.brand?.name || "",
      sizeName: item.sizeName || orig.size?.name || "",
      colorName: item.colorName || orig.color?.name || "",
      colorCode: orig.color?.code || "",
      quantity: Math.max(1, Number(item.quantity) || 1),
      unitCost: Number(item.unitCost) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      vatRate: Number(item.vatRate) || 0,
      vatAmount: Number(item.vatAmount) || 0,
      vatType: "inclusive",
      discountAmount: Number(item.discountAmount) || 0,
      totalPrice: Number(item.totalPrice) || (Number(item.unitPrice || 0) * (Number(item.quantity) || 1)),
      stockQuantity: orig.stockQuantity ?? 999
    };
  });

  form.customerId = sale.customerId || "";
  form.customerName = sale.customerName || "ওয়াক-ইন কাস্টমার";
  form.customerMobile = sale.customerMobile || "";
  form.customerAddress = sale.customerAddress || "";
  form.notes = sale.notes || "";
  form.paymentMethod = sale.paymentMethod || "cash";
  form.transactionId = sale.transactionId || "";
  form.discountValue = Number(sale.discountAmount) || 0;
  form.discountType = "fixed";
  isPaidAmountCustom.value = true;
  form.paidAmount = Number(sale.paidAmount) || 0;

  activeView.value = "pos";
  showToast(`চালান ${sale.invoiceNumber} এডিট মোডে লোড হয়েছে`, "info");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function editLastSale() {
  if (completedSalesList.value.length === 0) {
    showToast("এডিট করার মতো কোনো সম্পন্ন বিক্রয় পাওয়া যায়নি", "warning");
    return;
  }
  const lastSale = completedSalesList.value[0];
  editSale(lastSale);
}

function cancelEditSale() {
  editingSaleId.value = null;
  editingInvoiceNumber.value = "";
  clearCart();
  showToast("এডিট মোড বাতিল করা হয়েছে", "secondary");
}

function clearCart() {
  cartItems.value = [];
  form.discountValue = 0;
  form.discountType = "fixed";
  isPaidAmountCustom.value = false;
  form.paidAmount = 0;
  form.transactionId = "";
  form.notes = "";
}

// Summary Calculations
const totalUniqueItems = computed(() => cartItems.value.length);
const totalQuantity = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
});

const summary = computed(() => {
  let subtotal = 0;
  let totalVat = 0;
  let totalItemPrice = 0;

  for (const item of cartItems.value) {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const price = Math.max(0, Number(item.unitPrice) || 0);
    const itemDiscount = Math.max(0, Number(item.discountAmount) || 0);
    subtotal += Math.max(0, price * qty - itemDiscount);
    totalVat += Number(item.vatAmount || 0);
    totalItemPrice += Number(item.totalPrice || 0);
  }

  let invoiceDiscount = 0;
  const rawDiscount = Math.max(0, Number(form.discountValue) || 0);
  if (form.discountType === "percent") {
    invoiceDiscount = Number((subtotal * (rawDiscount / 100)).toFixed(2));
  } else {
    invoiceDiscount = rawDiscount;
  }
  invoiceDiscount = Math.min(totalItemPrice, invoiceDiscount);

  const netPayable = Math.max(0, totalItemPrice - invoiceDiscount);

  return {
    subtotal,
    invoiceDiscount,
    totalVat,
    netPayable
  };
});

// Paid Amount State & Default Sync with Net Payable
// User Requirement: "বাই ডিফল্ট বিলের প্রদেয় সর্বমোট বসবে। ইউজার প্রয়োজনে এডিট করে নিবে।"
const isPaidAmountCustom = ref(false);

function onPaidAmountUserEdit(val?: string | number) {
  isPaidAmountCustom.value = true;
}

function resetPaidAmountToNetPayable() {
  isPaidAmountCustom.value = false;
  form.paidAmount = summary.value.netPayable;
}

watch(
  () => summary.value.netPayable,
  (newPayable) => {
    if (!isPaidAmountCustom.value) {
      form.paidAmount = newPayable;
    }
  },
  { immediate: true }
);

// Change and Due Amount Calculation
const changeAmount = computed(() => {
  const paid = Math.max(0, Number(form.paidAmount) || 0);
  const payable = summary.value.netPayable;
  return paid > payable ? paid - payable : 0;
});

const dueAmount = computed(() => {
  const paid = Math.max(0, Number(form.paidAmount) || 0);
  const payable = summary.value.netPayable;
  return payable > paid ? payable - paid : 0;
});

// Print Modal & Active Receipt State
const showPrintModal = ref(false);
const activeReceiptSale = ref<any>(null);

// Submit Sale
async function submitSale(printAfterSubmit: boolean) {
  if (cartItems.value.length === 0) {
    showToast("কার্টে কোনো পণ্য নেই! কমপক্ষে একটি পণ্য যোগ করুন", "warning");
    return;
  }

  // Mandatory check: পাইকারী ও কর্পোরেট কাস্টমারের ক্ষেত্রে নাম ও মোবাইল বাধ্যতামূলক
  if (isCustomerMandatory.value) {
    const name = (form.customerName || "").trim();
    if (!name || name === "ওয়াক-ইন কাস্টমার" || name === "ওয়াকিং কাস্টমার") {
      showToast("পাইকারী ও কর্পোরেট কাস্টমারের জন্য গ্রাহকের নাম আবশ্যক", "warning");
      customerNameInputRef.value?.focus();
      return;
    }
    const mobile = (form.customerMobile || "").trim();
    if (!mobile) {
      showToast("পাইকারী ও কর্পোরেট কাস্টমারের জন্য মোবাইল নম্বর আবশ্যক", "warning");
      customerMobileInputRef.value?.focus();
      return;
    }
  }

  submitting.value = true;
  try {
    const isDraft = !printAfterSubmit;
    const finalPaid = isPaidAmountCustom.value ? Math.max(0, Number(form.paidAmount) || 0) : summary.value.netPayable;
    const payload = {
      isDraft,
      status: isDraft ? "draft" : undefined,
      customerId: form.customerId || null,
      customerType: form.customerType || "walk_in",
      customerName: form.customerName || "ওয়াক-ইন কাস্টমার",
      customerMobile: form.customerMobile || "",
      customerAddress: form.customerAddress || "",
      cashierName: cashierDisplayName.value,
      invoiceNumber: generatedInvoiceNumber.value,
      subtotal: summary.value.subtotal,
      discountAmount: summary.value.invoiceDiscount,
      vatAmount: summary.value.totalVat,
      totalAmount: summary.value.netPayable,
      paidAmount: isDraft ? 0 : finalPaid,
      changeAmount: isDraft ? 0 : changeAmount.value,
      dueAmount: isDraft ? summary.value.netPayable : dueAmount.value,
      paymentMethod: form.paymentMethod || "cash",
      transactionId: form.paymentMethod !== "cash" ? (form.transactionId || "") : "",
      vatMode: cartItems.value.some((c) => c.vatType === "exclusive") ? "exclusive" : "inclusive",
      notes: form.notes || "",
      items: cartItems.value.map((c) => ({
        itemId: c.itemId,
        barcode: c.barcode,
        name: c.name,
        categoryName: c.categoryName,
        brandName: c.brandName,
        sizeName: c.sizeName,
        colorName: c.colorName,
        quantity: c.quantity,
        unitCost: c.unitCost,
        unitPrice: c.unitPrice,
        vatRate: c.vatRate,
        vatAmount: c.vatAmount,
        discountAmount: c.discountAmount,
        totalPrice: c.totalPrice
      }))
    };

    let created: any = null;
    if (editingSaleId.value) {
      const res = await axios.put(`/api/inventory/sales/${editingSaleId.value}`, payload);
      created = res.data?.data;
      showToast("বিক্রয় চালান সফলভাবে আপডেট করা হয়েছে!", "success");
    } else {
      const res = await axios.post("/api/inventory/sales", payload);
      created = res.data?.data;
      if (isDraft) {
        showToast("বিক্রয় চালান ড্রাফট হিসেবে সংরক্ষিত হয়েছে!", "info");
      } else {
        showToast("পণ্য বিক্রয় সফলভাবে সম্পন্ন হয়েছে!", "success");
      }
    }

    // Clear Form & Cart
    clearCart();

    // Reload Data to refresh inventory stock and sales list
    await loadAllData();

    if (!isDraft) {
      if (printAfterSubmit && created) {
        activeReceiptSale.value = created;
        showPrintModal.value = true;
      }
      // Redirect to sales list page
      switchView("list");
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || "বিক্রয় সম্পন্ন করতে ব্যর্থ হয়েছে", "danger");
  } finally {
    submitting.value = false;
  }
}

// Load Draft back into active cart
async function loadDraftIntoCart(draft: any) {
  if (cartItems.value.length > 0) {
    if (!confirm("বর্তমান কার্টের পণ্য মুছে এই ড্রাফট চালানটি কার্টে লোড করতে চান?")) {
      return;
    }
  }

  // Restore cart items
  cartItems.value = (draft.items || []).map((item: any) => {
    const orig = itemsList.value.find((it) => it.id === item.itemId) || {};
    return {
      itemId: item.itemId,
      barcode: item.barcode || orig.barcode || "",
      name: item.name || orig.name || "নামহীন পণ্য",
      categoryName: item.categoryName || orig.category?.name || "",
      brandName: item.brandName || orig.brand?.name || "",
      sizeName: item.sizeName || orig.size?.name || "",
      colorName: item.colorName || orig.color?.name || "",
      colorCode: orig.color?.code || "",
      quantity: Math.max(1, Number(item.quantity) || 1),
      unitCost: Number(item.unitCost) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      vatRate: Number(item.vatRate) || 0,
      vatAmount: Number(item.vatAmount) || 0,
      vatType: "inclusive",
      discountAmount: Number(item.discountAmount) || 0,
      totalPrice: Number(item.totalPrice) || (Number(item.unitPrice || 0) * (Number(item.quantity) || 1)),
      stockQuantity: orig.stockQuantity ?? 999
    };
  });

  // Restore customer & form
  form.customerId = draft.customerId || "";
  form.customerName = draft.customerName || "ওয়াকিং কাস্টমার";
  form.customerMobile = draft.customerMobile || "";
  form.customerAddress = draft.customerAddress || "";
  form.notes = draft.notes || "";
  form.paymentMethod = draft.paymentMethod || "cash";
  form.transactionId = draft.transactionId || "";
  form.discountValue = Number(draft.discountAmount) || 0;
  form.discountType = "fixed";

  // Remove this draft from DB since it is being resumed in cart
  try {
    await axios.delete(`/api/inventory/sales/${draft.id}`);
    await loadAllData();
    showToast(`ড্রাফট চালান ${draft.invoiceNumber} কার্টে লোড হয়েছে`, "info");
  } catch (err) {
    // Continue
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Print Receipt Trigger
function printReceipt() {
  const printContents = document.getElementById("thermal-receipt")?.innerHTML;
  if (!printContents) return;

  const win = window.open("", "_blank", "width=600,height=700");
  if (!win) return;

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>বিক্রয় রসিদ - ${activeReceiptSale.value?.invoiceNumber || ""}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 10px;
            color: #000;
          }
          .receipt-container {
            max-width: 320px;
            margin: auto;
          }
          @media print {
            body { padding: 0; }
            .receipt-container { max-width: 100%; border: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          ${printContents}
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        <\/script>
      </body>
    </html>
  `);
  win.document.close();
}

function previewAndPrintSale(sale: any) {
  activeReceiptSale.value = sale;
  showPrintModal.value = true;
}

// Delete Sale Confirmation
async function confirmDeleteSale(id: number) {
  if (!confirm("আপনি কি নিশ্চিতভাবে এই বিক্রয় চালানটি মুছে ফেলতে চান? বিক্রিত আইটেমগুলোর স্টক স্বয়ংক্রিয়ভাবে পুনরায় যোগ হবে।")) {
    return;
  }
  try {
    await axios.delete(`/api/inventory/sales/${id}`);
    showToast("বিক্রয় চালানটি সফলভাবে মুছে ফেলা হয়েছে", "success");
    loadAllData();
  } catch (err: any) {
    showToast(err.response?.data?.message || "রেকর্ড মুছতে ব্যর্থ হয়েছে", "danger");
  }
}

// Sales List View: Filtering & Pagination
const listSearchQuery = ref("");
const currentPage = ref(1);
const perPage = ref(10);

const filteredSalesList = computed(() => {
  let list = completedSalesList.value;
  if (listSearchQuery.value.trim()) {
    const q = listSearchQuery.value.toLowerCase().trim();
    list = list.filter(
      (s) =>
        (s.invoiceNumber && s.invoiceNumber.toLowerCase().includes(q)) ||
        (s.customerName && s.customerName.toLowerCase().includes(q)) ||
        (s.customerMobile && s.customerMobile.toLowerCase().includes(q)) ||
        (s.cashierName && s.cashierName.toLowerCase().includes(q))
    );
  }
  return list;
});

const paginationData = computed(() => {
  const total = filteredSalesList.value.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage.value));
  return {
    current_page: currentPage.value,
    last_page: lastPage,
    per_page: perPage.value,
    total: total,
    path: route.path
  };
});

const paginatedSales = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredSalesList.value.slice(start, start + perPage.value);
});


// Background Real-time Customer Sync
async function fetchCustomersOnly() {
  try {
    const custRes = await axios.get(`/api/inventory/customers?_t=${Date.now()}`);
    const fresh = custRes.data?.data || [];
    customersList.value = fresh;
  } catch {}
}

let customerBc: BroadcastChannel | null = null;
let customerSyncTimer: any = null;

function onStorageSync(e: StorageEvent) {
  if (e.key === "byabosayee_customer_synced_at") {
    fetchCustomersOnly();
  }
}

function onWindowFocus() {
  fetchCustomersOnly();
}

// Load All Backend Data
async function loadAllData() {
  loading.value = true;
  try {
    const [itemsRes, custRes, salesRes, compRes] = await Promise.all([
      axios.get("/api/inventory/items"),
      axios.get(`/api/inventory/customers?_t=${Date.now()}`).catch(() => ({ data: { data: [] } })),
      axios.get("/api/inventory/sales").catch(() => ({ data: { data: [] } })),
      axios.get("/api/company/profile").catch(() => ({ data: { data: {} } }))
    ]);

    itemsList.value = itemsRes.data?.data || [];
    customersList.value = custRes.data?.data || [];
    salesList.value = salesRes.data?.data || [];
    companyInfo.value = compRes.data?.data || {};

    if (!form.customerId) {
      resetToDefaultCustomer();
    }
  } catch (err: any) {
    showToast("ডাটা লোড করতে ব্যর্থ হয়েছে", "danger");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadAllData();
  focusBarcodeInput();
});
</script>

<style scoped>
.sales-page {
  font-family: inherit;
}

.pos-layout-container {
  min-height: 0;
}

.pos-checkout-col {
  width: 100%;
}

@media (min-width: 1200px) {
  .pos-checkout-col {
    width: 350px !important;
    max-width: 350px !important;
  }
}

.cart-header-wrap {
  background-color: var(--bs-tertiary-bg, #f8f9fa);
}

.cart-body-wrap {
  scrollbar-gutter: stable;
  overflow-y: auto;
  overflow-x: hidden;
}

/* কার্ট বডির মসৃণ স্লিম স্ক্রলবার (শুধুমাত্র হেডারের নিচ থেকে শুরু) */
.cart-body-wrap::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.cart-body-wrap::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.04);
  border-radius: 4px;
}
.cart-body-wrap::-webkit-scrollbar-thumb {
  background: rgba(120, 120, 120, 0.3);
  border-radius: 4px;
}
.cart-body-wrap::-webkit-scrollbar-thumb:hover {
  background: rgba(120, 120, 120, 0.5);
}

.cart-body-wrap {
  scrollbar-width: thin;
  scrollbar-color: rgba(120, 120, 120, 0.3) rgba(0, 0, 0, 0.04);
}

.sales-form-card {
  border-top: 3px solid #198754 !important;
}

.scanner-input {
  height: 38px;
  font-size: 0.95rem;
  border: 1px solid #198754 !important;
  box-shadow: 0 0 0 0.15rem rgba(25, 135, 84, 0.15);
}

.search-input-unified {
  height: 31px;
  border: 1px solid var(--bs-border-color, #d9dee3) !important;
  border-radius: 0.375rem !important;
  font-size: 0.8125rem;
}

.sales-table-header {
  background-color: var(--bs-tertiary-bg, #f8f9fa);
}

.sales-table-header th {
  padding: 8px 10px;
  font-weight: 600;
  color: var(--bs-body-color, #495057);
  background-color: var(--bs-tertiary-bg, #f8f9fa);
  border: none;
}

.cart-row:hover {
  background-color: rgba(25, 135, 84, 0.04);
}





.table-num-input::-webkit-outer-spin-button,
.table-num-input::-webkit-inner-spin-button,
.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}
.table-num-input[type=number],
.qty-input[type=number],
.pos-calc-input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.pos-calc-input {
  width: 120px !important;
  height: 31px !important;
  min-height: 31px !important;
  max-height: 31px !important;
  font-size: 0.875rem !important;
  font-family: var(--bs-font-monospace);
  padding: 3px 8px !important;
  line-height: 1.5 !important;
  border-radius: var(--bs-border-radius-sm) !important;
  box-shadow: none !important;
  background-color: var(--bs-body-bg);
  color: var(--bs-body-color);
  border-color: var(--bs-border-color);
}
.pos-calc-input[readonly] {
  background-color: var(--bs-tertiary-bg, rgba(120, 120, 120, 0.08));
}
.pos-calc-input.bg-success-subtle {
  background-color: var(--bs-success-bg-subtle, rgba(25, 135, 84, 0.18)) !important;
  border-color: var(--bs-success-border-subtle, #198754) !important;
}
.pos-calc-input[type=number]::-webkit-inner-spin-button,
.pos-calc-input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.action-btn {
  height: 28px;
  line-height: 1;
}

.delete-btn {
  opacity: 0.7;
  transition: opacity 0.15s ease-in-out;
}
.delete-btn:hover {
  opacity: 1;
}

.filter-reset-btn {
  height: 31px;
  width: 32px;
}

.btn-xs {
  padding: 2px 6px;
  font-size: 0.72rem;
  border-radius: 0.25rem;
}

.method-btn {
  font-size: 0.78rem;
}

.receipt-container {
  font-family: 'Courier New', Courier, monospace;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

.colorful-divider {
  height: 2px;
  border: none;
  background-color: #198754;
  border-radius: 2px;
  opacity: 0.75;
}

.currency-symbol {
  font-size: 0.82em;
  font-weight: 500;
  display: inline-block;
  line-height: 1;
  vertical-align: 0.02em;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

:deep(.pos-product-select .vs__dropdown-menu) {
  max-width: 650px;
  width: 100%;
}
:deep(.pos-product-select .vs__dropdown-option) {
  white-space: normal !important;
  word-break: break-word;
  padding: 6px 10px;
}

</style>