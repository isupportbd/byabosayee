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
          v-if="activeView === 'list'"
          type="button"
          class="btn btn-sm btn-primary"
          @click="activeView = 'form'">
          <i class="bi bi-cart-plus me-1"></i>নতুন ক্রয় চালান
        </button>
        <button
          v-else
          type="button"
          class="btn btn-sm btn-outline-secondary"
          @click="activeView = 'list'">
          <i class="bi bi-receipt-cutoff me-1"></i>ক্রয় তালিকা ({{ toBengaliNumber(purchasesList.length) }})
        </button>
      </div>
    </div>

    <!-- VIEW 1: নতুন ক্রয় চালান ফর্ম -->
    <div v-show="activeView === 'form'" class="card border shadow-sm mb-4 purchase-form-card">
      <div class="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between py-2.5">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-file-earmark-plus text-primary fs-5"></i>
          <h6 class="m-0 fw-bold">নতুন ক্রয় চালান ফরম</h6>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-light text-dark border">
            <i class="bi bi-calendar-check me-1 text-primary"></i>এন্ট্রি তারিখ: <strong>{{ todayFormatted }}</strong> (অপরিবর্তনীয়)
          </span>
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
                <select
                  v-model="selectedPartnerId"
                  class="form-select form-select-sm"
                  required
                  @change="onPartnerChange">
                  <option value="" disabled>{{ selectedVendorTypeName }} নির্বাচন করুন</option>
                  <option
                    v-for="v in filteredVendorsBySelectedType"
                    :key="`${v.source}-${v.id}`"
                    :value="`${v.source}:${v.id}`">
                    {{ v.name }} {{ v.mobile ? `(${v.mobile})` : '' }} {{ v.country ? `[${v.country}]` : '' }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- সেকশন ২: পণ্যের তালিকা (Line Items) -->
          <div class="p-3 bg-white rounded border mb-3">
            <div class="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-primary rounded-pill">২</span>
                <h6 class="m-0 fw-semibold text-primary">চালানের পণ্যসমূহ</h6>
                <span class="badge bg-secondary-subtle text-secondary small">
                  মোট আইটেম {{ toBengaliNumber(form.items.length) }} টি
                </span>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                @click="addRow">
                <i class="bi bi-plus-lg me-1"></i>পণ্য যোগ করুন
              </button>
            </div>

            <!-- পণ্যের টেবিল -->
            <div class="table-responsive">
              <table class="table table-sm table-bordered align-middle mb-0 line-items-table">
                <thead class="table-light">
                  <tr class="small text-nowrap">
                    <th style="width: 35px;" class="text-center">#</th>
                    <th style="min-width: 220px;">পণ্যের নাম <span class="text-danger">*</span></th>
                    <th style="min-width: 110px;">ব্র্যান্ড</th>
                    <th style="min-width: 95px;">সাইজ <span class="text-danger">*</span></th>
                    <th style="min-width: 95px;">কালার</th>
                    <th style="min-width: 140px;" class="bg-warning-subtle text-dark">বার কোড (১৪-ডিজিট)</th>
                    <th style="width: 90px;">পরিমাণ <span class="text-danger">*</span></th>
                    <th style="width: 80px;">একক</th>
                    <th style="width: 110px;">মোট মূল্য (৳) <span class="text-danger">*</span></th>
                    <th style="width: 115px;" class="bg-primary-subtle text-primary text-center">একক ক্রয়মূল্য (অটো)</th>
                    <th style="width: 45px;" class="text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in form.items" :key="idx">
                    <td class="text-center small text-muted">{{ toBengaliNumber(idx + 1) }}</td>

                    <!-- পণ্যের নাম (পণ্য তালিকা থেকে ড্রপডাউন) -->
                    <td>
                      <select
                        v-model="row.itemId"
                        class="form-select form-select-sm"
                        required
                        @change="onRowItemSelect(row)">
                        <option value="" disabled>পণ্য নির্বাচন করুন</option>
                        <option v-for="it in itemsList" :key="it.id" :value="it.id">
                          {{ it.name }} {{ it.code ? `(${it.code})` : '' }}
                        </option>
                      </select>
                      <small v-if="getItemCategorySubtitle(row.itemId)" class="text-muted d-block text-truncate mt-0.5" style="font-size: 0.72rem;">
                        <i class="bi bi-tag text-primary me-1"></i>{{ getItemCategorySubtitle(row.itemId) }}
                      </small>
                    </td>

                    <!-- ব্র্যান্ড -->
                    <td>
                      <select
                        v-model="row.brandId"
                        class="form-select form-select-sm"
                        @change="onBrandChange(row)">
                        <option value="">(ঐচ্ছিক)</option>
                        <option v-for="b in brandsList" :key="b.id" :value="b.id">
                          {{ b.name }}
                        </option>
                      </select>
                    </td>

                    <!-- সাইজ -->
                    <td>
                      <select
                        v-model="row.sizeId"
                        class="form-select form-select-sm"
                        required
                        @change="onSizeChange(row)">
                        <option value="" disabled>সাইজ</option>
                        <option v-for="s in sizesList" :key="s.id" :value="s.id">
                          {{ s.name }}
                        </option>
                      </select>
                    </td>

                    <!-- কালার -->
                    <td>
                      <select v-model="row.colorId" class="form-select form-select-sm">
                        <option value="">(ঐচ্ছিক)</option>
                        <option v-for="c in colorsList" :key="c.id" :value="c.id">
                          {{ c.name }}
                        </option>
                      </select>
                    </td>

                    <!-- বার কোড (ব্র্যান্ড সিলেক্ট হলে অটো ১৪ ডিজিট তৈরি, ইউজার চাইলে পরিবর্তনযোগ্য) -->
                    <td style="min-width: 140px;" class="bg-warning-subtle bg-opacity-10">
                      <input
                        v-model.trim="row.code"
                        type="text"
                        maxlength="30"
                        class="form-control form-control-sm font-monospace text-center fw-bold border-warning-subtle"
                        placeholder="১৪-ডিজিট কোড"
                        title="ব্র্যান্ড নির্বাচন হলে স্বয়ংক্রিয় ১৪ ডিজিট বারকোড তৈরি হবে। আপনি চাইলে পরিবর্তন করতে পারেন।"
                        @input="row.isCodeCustomized = true" />
                    </td>

                    <!-- পরিমাণ -->
                    <td>
                      <input
                        v-model.number="row.quantity"
                        type="number"
                        min="1"
                        class="form-control form-control-sm text-center"
                        required />
                    </td>

                    <!-- একক -->
                    <td>
                      <select v-model="row.unitId" class="form-select form-select-sm">
                        <option value="">একক</option>
                        <option v-for="u in unitsList" :key="u.id" :value="u.id">
                          {{ u.name }}
                        </option>
                      </select>
                    </td>

                    <!-- মোট মূল্য -->
                    <td>
                      <input
                        v-model.number="row.totalPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        class="form-control form-control-sm text-end"
                        placeholder="0.00"
                        required />
                    </td>

                    <!-- অটো একক ক্রয়মূল্য (Landed Unit Cost) প্রিভিউ -->
                    <td class="bg-primary-subtle text-center fw-bold text-primary small">
                      ৳ {{ toBengaliNumber(calculateRowUnitCost(row)) }}
                    </td>

                    <!-- রিমুভ বাটন -->
                    <td class="text-center">
                      <button
                        type="button"
                        class="btn btn-link text-danger p-0"
                        title="এই লাইনটি বাদ দিন"
                        :disabled="form.items.length <= 1"
                        @click="removeRow(idx)">
                        <i class="bi bi-trash fs-6"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- সেকশন ৩: খরচ সমন্বয়, পেমেন্ট ও সামারি -->
          <div class="row g-3 mb-3">
            <!-- বাম দিক: অতিরিক্ত খরচ ও ডিসকাউন্ট -->
            <div class="col-12 col-md-6">
              <div class="p-3 bg-light rounded border h-100">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <span class="badge bg-primary rounded-pill">৩</span>
                  <h6 class="m-0 fw-semibold text-primary">খরচ সমন্বয় ও পেমেন্ট তথ্য</h6>
                </div>

                <div class="row g-2 mb-2">
                  <!-- অন্যান্য খরচ -->
                  <div class="col-12 col-sm-6">
                    <label class="form-label small fw-semibold mb-1">
                      অন্যান্য খরচ (ভাড়া/কুরিয়ার/চার্জ)
                    </label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text">৳</span>
                      <input
                        v-model.number="form.otherExpenses"
                        type="number"
                        min="0"
                        step="0.01"
                        class="form-control"
                        placeholder="0.00" />
                    </div>
                    <small class="text-muted" style="font-size: 0.75rem;">
                      যাতায়াত, কুরিয়ার চার্জ, কুলি খরচ ইত্যাদি
                    </small>
                  </div>

                  <!-- ডিসকাউন্ট বা ছাড় -->
                  <div class="col-12 col-sm-6">
                    <label class="form-label small fw-semibold mb-1">
                      চালান ডিসকাউন্ট / ছাড়
                    </label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text">৳</span>
                      <input
                        v-model.number="form.discountAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        class="form-control"
                        placeholder="0.00" />
                    </div>
                    <small class="text-muted" style="font-size: 0.75rem;">
                      চালানের মোট মূল্যের ওপর প্রাপ্ত ছাড়
                    </small>
                  </div>
                </div>

                <hr class="my-2" />

                <!-- পেমেন্ট মেথড ও পরিশোধ -->
                <div class="row g-2">
                  <div class="col-12 col-sm-6">
                    <label class="form-label small fw-semibold mb-1">
                      পেমেন্ট মাধ্যম <span class="text-danger">*</span>
                    </label>
                    <select
                      v-model="form.paymentMethod"
                      class="form-select form-select-sm"
                      required>
                      <option value="cash">নগদ / ক্যাশ (Cash)</option>
                      <option value="bkash">বিকাশ (bKash)</option>
                      <option value="nagad">নগদ (Nagad)</option>
                      <option value="bank">ব্যাংক ট্রান্সফার (Bank)</option>
                    </select>
                  </div>

                  <div class="col-12 col-sm-6">
                    <label class="form-label small fw-semibold mb-1">
                      পরিশোধিত টাকা (Paid Amount)
                    </label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text">৳</span>
                      <input
                        v-model.number="form.paidAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        class="form-control"
                        placeholder="0.00" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ডান দিক: মোট হিসাব সামারি কার্ড -->
            <div class="col-12 col-md-6">
              <div class="p-3 bg-white rounded border shadow-sm h-100 d-flex flex-column justify-content-between">
                <div>
                  <h6 class="fw-bold mb-3 text-dark d-flex align-items-center justify-content-between">
                    <span><i class="bi bi-calculator me-1 text-primary"></i>চালানের চূড়ান্ত হিসাব বিবরণী</span>
                    <span class="badge bg-info-subtle text-info border">অটো ক্যালকুলেটেড</span>
                  </h6>

                  <div class="summary-line d-flex justify-content-between align-items-center py-1 border-bottom">
                    <span class="text-muted small">পণ্যের উপমোট মূল্য (Items Subtotal):</span>
                    <strong class="text-dark">৳ {{ toBengaliNumber(itemsSubtotal.toFixed(2)) }}</strong>
                  </div>

                  <div class="summary-line d-flex justify-content-between align-items-center py-1 border-bottom">
                    <span class="text-muted small">(+) অন্যান্য খরচাবলী (Landed Expenses):</span>
                    <span class="text-danger">+ ৳ {{ toBengaliNumber((form.otherExpenses || 0).toFixed(2)) }}</span>
                  </div>

                  <div class="summary-line d-flex justify-content-between align-items-center py-1 border-bottom">
                    <span class="text-muted small">(-) চালানের ডিসকাউন্ট (Discount):</span>
                    <span class="text-success">- ৳ {{ toBengaliNumber((form.discountAmount || 0).toFixed(2)) }}</span>
                  </div>

                  <div class="summary-line d-flex justify-content-between align-items-center py-2 border-bottom bg-light px-2 rounded mt-1">
                    <span class="fw-bold text-dark fs-6">মোট চালানের মূল্য (Net Landed Total):</span>
                    <span class="fw-bold fs-5 text-primary">৳ {{ toBengaliNumber(finalTotalAmount.toFixed(2)) }}</span>
                  </div>

                  <div class="summary-line d-flex justify-content-between align-items-center py-1 mt-1">
                    <span class="text-muted small">পরিশোধিত টাকা (Paid):</span>
                    <span class="text-success fw-semibold">৳ {{ toBengaliNumber((form.paidAmount || 0).toFixed(2)) }}</span>
                  </div>

                  <div class="summary-line d-flex justify-content-between align-items-center py-1">
                    <span class="text-muted small">বকেয়া টাকা (Due Amount):</span>
                    <span
                      class="fw-bold"
                      :class="dueAmount > 0 ? 'text-danger' : 'text-muted'">
                      ৳ {{ toBengaliNumber(dueAmount.toFixed(2)) }}
                    </span>
                  </div>
                </div>

                <!-- সাবমিট বাটন -->
                <div class="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    @click="resetForm">
                    <i class="bi bi-arrow-counterclockwise me-1"></i>রিসেট
                  </button>
                  <button
                    type="submit"
                    class="btn btn-sm btn-primary px-4 fw-semibold"
                    :disabled="submitting">
                    <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="bi bi-check2-circle me-1"></i>
                    ক্রয় চালান সংরক্ষণ করুন
                  </button>
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
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 text-nowrap">
            <thead class="table-light">
              <tr class="small">
                <th style="width: 40px;" class="text-center">#</th>
                <th>চালানের ধরন</th>
                <th>চালান নং</th>
                <th>সাপ্লায়ার / প্রস্তুতকারী</th>
                <th>চালান তারিখ</th>
                <th>এন্ট্রি তারিখ</th>
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
              <tr v-for="(p, index) in filteredPurchases" :key="p.id">
                <td class="text-center small text-muted">{{ toBengaliNumber(index + 1) }}</td>
                <td>
                  <span class="badge bg-secondary-subtle text-secondary border">
                    {{ p.challanType?.name || 'সাধারণ চালান' }}
                  </span>
                </td>
                <td class="fw-semibold text-primary">{{ p.challanNumber || '-' }}</td>
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
                <td class="small text-muted">{{ formatDate(p.challanDate) }}</td>
                <td class="small text-muted">
                  {{ formatDate(p.createdAt) }}
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
                <td class="text-center small text-capitalize">
                  <span class="badge bg-light text-dark border">
                    {{ formatPaymentMethod(p.paymentMethod) }}
                  </span>
                </td>
                <td class="text-center">
                  <span
                    class="badge"
                    :class="Number(p.dueAmount || 0) <= 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'">
                    {{ Number(p.dueAmount || 0) <= 0 ? 'পরিশোধিত' : 'বকেয়া' }}
                  </span>
                </td>
                <td class="text-center">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary py-0 px-2"
                    title="চালানের পণ্য ও ১৪ ডিজিটের বারকোড দেখুন"
                    @click="openDetailsModal(p)">
                    <i class="bi bi-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal: চালানের বিস্তারিত ও ১৪ ডিজিটের বারকোড ভিউ -->
    <div
      v-if="selectedPurchase"
      class="modal fade show d-block"
      style="background: rgba(0, 0, 0, 0.5); z-index: 1060;"
      tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header bg-light py-2">
            <h6 class="modal-title fw-bold text-primary d-flex align-items-center gap-2">
              <i class="bi bi-receipt-cutoff fs-5"></i>
              চালানের বিস্তারিত ও পণ্যের বারকোড লিস্ট (চালান নং: {{ selectedPurchase.challanNumber }})
            </h6>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="selectedPurchase = null"></button>
          </div>

          <div class="modal-body p-3">
            <!-- চালান তথ্য সামারি হেডার -->
            <div class="row g-2 mb-3 bg-light p-2.5 rounded border small">
              <div class="col-6 col-md-3">
                <span class="text-muted d-block">চালানের ধরন:</span>
                <strong>{{ selectedPurchase.challanType?.name || 'সাধারণ চালান' }}</strong>
              </div>
              <div class="col-6 col-md-3">
                <span class="text-muted d-block">সাপ্লায়ার / প্রস্তুতকারী:</span>
                <strong>{{ selectedPurchase.supplier?.name || selectedPurchase.manufacturer?.name || '-' }}</strong>
              </div>
              <div class="col-6 col-md-3">
                <span class="text-muted d-block">চালান তারিখ:</span>
                <strong>{{ formatDate(selectedPurchase.challanDate) }}</strong>
              </div>
              <div class="col-6 col-md-3">
                <span class="text-muted d-block">সিস্টেম এন্ট্রি তারিখ:</span>
                <strong>{{ formatDate(selectedPurchase.createdAt) }}</strong>
              </div>

              <div class="col-6 col-md-3 mt-2">
                <span class="text-muted d-block">পণ্যের মূল মূল্য (Subtotal):</span>
                <strong>৳ {{ toBengaliNumber(Number(selectedPurchase.itemsAmount || 0).toFixed(2)) }}</strong>
              </div>
              <div class="col-6 col-md-3 mt-2">
                <span class="text-muted d-block">অন্যান্য খরচ / ডিসকাউন্ট:</span>
                <span>+৳ {{ toBengaliNumber(Number(selectedPurchase.otherExpenses || 0).toFixed(2)) }} / -৳ {{ toBengaliNumber(Number(selectedPurchase.discountAmount || 0).toFixed(2)) }}</span>
              </div>
              <div class="col-6 col-md-3 mt-2">
                <span class="text-muted d-block">সর্বমোট ক্রয়মূল্য:</span>
                <strong class="text-primary fs-6">৳ {{ toBengaliNumber(Number(selectedPurchase.totalAmount || 0).toFixed(2)) }}</strong>
              </div>
              <div class="col-6 col-md-3 mt-2">
                <span class="text-muted d-block">পরিশোধিত / বকেয়া:</span>
                <span class="text-success fw-bold">৳ {{ toBengaliNumber(Number(selectedPurchase.paidAmount || 0).toFixed(2)) }}</span> /
                <span class="text-danger fw-bold">৳ {{ toBengaliNumber(Number(selectedPurchase.dueAmount || 0).toFixed(2)) }}</span>
              </div>
            </div>

            <!-- পণ্যের তালিকা ও ১৪ ডিজিটের বারকোড -->
            <h6 class="fw-bold mb-2 text-dark d-flex align-items-center justify-content-between">
              <span>
                <i class="bi bi-upc-scan text-primary me-1"></i>
                পণ্যসমূহ ও অটো জেনারেটেড ১৪ ডিজিটের বারকোড (Pure Numeric)
              </span>
              <span class="badge bg-secondary small">
                মোট আইটেম {{ toBengaliNumber(selectedPurchase.items?.length || 0) }} টি
              </span>
            </h6>

            <div class="table-responsive">
              <table class="table table-sm table-bordered align-middle mb-0">
                <thead class="table-light small text-nowrap">
                  <tr>
                    <th class="text-center" style="width: 35px;">#</th>
                    <th>১৪-ডিজিট বারকোড</th>
                    <th>পণ্যের নাম</th>
                    <th>ক্যাটাগরি</th>
                    <th>সাব-ক্যাটাগরি</th>
                    <th>ব্র্যান্ড</th>
                    <th>সাইজ</th>
                    <th>কালার</th>
                    <th class="text-center">পরিমাণ</th>
                    <th class="text-end">লাইন মোট (৳)</th>
                    <th class="text-end bg-primary-subtle text-primary fw-bold">একক ক্রয়মূল্য (৳)</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr v-for="(it, i) in selectedPurchase.items" :key="it.id || i">
                    <td class="text-center text-muted">{{ toBengaliNumber(Number(i) + 1) }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-1 font-monospace fw-bold text-dark bg-light px-2 py-0.5 rounded border border-secondary-subtle">
                        <i class="bi bi-upc text-primary"></i>
                        <span>{{ it.code }}</span>
                      </div>
                    </td>
                    <td class="fw-semibold">{{ it.name }}</td>
                    <td>{{ it.category?.name || '-' }}</td>
                    <td>{{ it.subCategory?.name || '-' }}</td>
                    <td>{{ it.brand?.name || '-' }}</td>
                    <td><span class="badge bg-light text-dark border">{{ it.size?.name || '-' }}</span></td>
                    <td>{{ it.color?.name || '-' }}</td>
                    <td class="text-center fw-bold">{{ toBengaliNumber(it.quantity) }} {{ it.unit?.name || '' }}</td>
                    <td class="text-end">৳ {{ toBengaliNumber(Number(it.totalPrice || 0).toFixed(2)) }}</td>
                    <td class="text-end bg-primary-subtle text-primary fw-bold">
                      ৳ {{ toBengaliNumber(Number(it.unitCost || 0).toFixed(2)) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer bg-light py-2">
            <button
              type="button"
              class="btn btn-sm btn-secondary"
              @click="selectedPurchase = null">
              বন্ধ করুন
            </button>
            <button
              type="button"
              class="btn btn-sm btn-primary"
              @click="printChallan">
              <i class="bi bi-printer me-1"></i>প্রিন্ট চালান
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

// View State
const activeView = ref<"form" | "list">("form");
const submitting = ref(false);
const loadingPurchases = ref(false);
const searchQuery = ref("");
const selectedPurchase = ref<any>(null);

// Vendor toggle & dynamic master list
const vendorType = ref<string>("supplier");
const vendorTypesList = ref<any[]>([]);

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

const filteredVendorsBySelectedType = computed(() => {
  const currentType = (vendorType.value || "").trim().toLowerCase();
  const currentTypeName = (selectedVendorTypeName.value || "").trim().toLowerCase();

  // If manufacturer
  if (isManufacturerVendor.value) {
    return manufacturersList.value.map((m) => ({
      id: m.id,
      name: m.name,
      mobile: m.mobile,
      country: m.country,
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
    country: undefined,
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
    country: m.country,
    source: "manufacturer" as const
  }));

  const combined = [...matchedFromSuppliers, ...matchedFromManufacturers];

  // If no specific partner is registered under this custom type yet, fallback to all suppliers so dropdown is not empty
  if (combined.length === 0 && currentType !== "supplier" && currentTypeName !== "সাপ্লায়ার") {
    return suppliersList.value.map((s) => ({
      id: s.id,
      name: s.name,
      mobile: s.mobile,
      country: undefined,
      source: "supplier" as const
    }));
  }

  return combined;
});

// Master Catalog Data
const categoriesList = ref<any[]>([]);
const subCategoriesList = ref<any[]>([]);
const brandsList = ref<any[]>([]);
const sizesList = ref<any[]>([]);
const colorsList = ref<any[]>([]);
const unitsList = ref<any[]>([]);
const challanTypesList = ref<any[]>([]);
const suppliersList = ref<any[]>([]);
const manufacturersList = ref<any[]>([]);
const purchasesList = ref<any[]>([]);
const itemsList = ref<any[]>([]);

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
  quantity: number;
  totalPrice: number;
}

const form = reactive({
  challanTypeId: "" as number | "",
  challanNumber: "",
  challanDate: todayISO,
  supplierId: "" as number | "",
  manufacturerId: "" as number | "",
  paymentMethod: "cash",
  otherExpenses: 0,
  discountAmount: 0,
  paidAmount: 0,
  notes: "",
  items: [createBlankRow()] as PurchaseItemRow[]
});

function createBlankRow(): PurchaseItemRow {
  return {
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
    quantity: 1,
    totalPrice: 0
  };
}

function addRow() {
  form.items.push(createBlankRow());
}

function removeRow(idx: number) {
  if (form.items.length > 1) {
    form.items.splice(idx, 1);
  }
}

function generateRowBarcode(row: PurchaseItemRow, force: boolean = false) {
  if (!force && row.isCodeCustomized && row.code) {
    return;
  }
  // Formula: Category(2) + SubCategory(2) + Brand(2) + Size(2) + YYMM(4) + Batch(2) = 14 digits
  const cat = String(row.categoryId || 0).padStart(2, "0").slice(-2);
  const sub = String(row.subCategoryId || 0).padStart(2, "0").slice(-2);
  const brand = String(row.brandId || 0).padStart(2, "0").slice(-2);
  const size = String(row.sizeId || 0).padStart(2, "0").slice(-2);

  let d = form.challanDate ? new Date(form.challanDate) : new Date();
  if (isNaN(d.getTime())) d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yymm = `${yy}${mm}`;
  const batch = "01";

  row.code = `${cat}${sub}${brand}${size}${yymm}${batch}`;
}

function onBrandChange(row: PurchaseItemRow) {
  generateRowBarcode(row, true);
}

function onSizeChange(row: PurchaseItemRow) {
  generateRowBarcode(row, false);
}

function onRowItemSelect(row: PurchaseItemRow) {
  const selected = itemsList.value.find((it) => it.id === Number(row.itemId));
  if (selected) {
    row.name = selected.name;
    row.categoryId = selected.categoryId || "";
    row.subCategoryId = selected.subCategoryId || "";
    if (selected.brandId) row.brandId = selected.brandId;
    if (selected.sizeId) row.sizeId = selected.sizeId;
    if (selected.colorId) row.colorId = selected.colorId;
    if (selected.unitId) row.unitId = selected.unitId;
    if (Number(selected.purchasePrice) > 0 && (!row.totalPrice || row.totalPrice === 0)) {
      row.totalPrice = Number((Number(selected.purchasePrice) * (row.quantity || 1)).toFixed(2));
    }
    generateRowBarcode(row, false);
  }
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
const itemsSubtotal = computed(() => {
  return form.items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
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

// Live calculated Landed Unit Cost for preview
function calculateRowUnitCost(row: PurchaseItemRow): string {
  const qty = Math.max(1, Number(row.quantity) || 1);
  const lineTotal = Math.max(0, Number(row.totalPrice) || 0);
  const sub = itemsSubtotal.value;
  const netExtra = (Number(form.otherExpenses) || 0) - (Number(form.discountAmount) || 0);
  const itemShare = sub > 0 ? (lineTotal / sub) * netExtra : 0;
  const landedLineTotal = Math.max(0, lineTotal + itemShare);
  return (landedLineTotal / qty).toFixed(2);
}

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

function formatPaymentMethod(m: string): string {
  const map: Record<string, string> = {
    cash: "নগদ (Cash)",
    bkash: "বিকাশ",
    nagad: "নগদ (মবাইল)",
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

function openDetailsModal(p: any) {
  selectedPurchase.value = p;
}

function printChallan() {
  window.print();
}

// Reset form
function resetForm() {
  selectedPartnerId.value = "";
  form.challanNumber = "";
  form.challanDate = todayISO;
  form.supplierId = "";
  form.manufacturerId = "";
  form.paymentMethod = "cash";
  form.otherExpenses = 0;
  form.discountAmount = 0;
  form.paidAmount = 0;
  form.notes = "";
  form.items = [createBlankRow()];
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
  for (let i = 0; i < form.items.length; i++) {
    const row = form.items[i];
    if (!row.itemId && !row.name.trim()) {
      showToast(`লাইন #${i + 1} এর পণ্য নির্বাচন করুন`, "warning");
      return;
    }
    if (!row.sizeId) {
      showToast(`লাইন #${i + 1} এর সাইজ নির্বাচন করুন`, "warning");
      return;
    }
    if ((Number(row.quantity) || 0) <= 0) {
      showToast(`লাইন #${i + 1} এর পরিমাণ অবশ্যই ১ বা তার বেশি হতে হবে`, "warning");
      return;
    }
  }

  submitting.value = true;
  try {
    const payload = {
      challanTypeId: form.challanTypeId || null,
      challanNumber: form.challanNumber,
      challanDate: form.challanDate,
      supplierId: !isManufacturerVendor.value ? form.supplierId : null,
      manufacturerId: isManufacturerVendor.value ? form.manufacturerId : null,
      paymentMethod: form.paymentMethod,
      otherExpenses: form.otherExpenses,
      discountAmount: form.discountAmount,
      paidAmount: form.paidAmount,
      notes: form.notes,
      items: form.items.map((row) => ({
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
        totalPrice: row.totalPrice
      }))
    };

    const res = await axios.post("/api/inventory/purchases", payload);
    showToast(res.data?.message || "নতুন ক্রয় চালান সফলভাবে সংরক্ষিত হয়েছে!", "success");
    resetForm();
    await fetchPurchases();
    activeView.value = "list";
  } catch (err: any) {
    showToast(err.response?.data?.message || "ক্রয় চালান সংরক্ষণ করতে ব্যর্থ হয়েছে", "danger");
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  await Promise.all([fetchCatalogData(), fetchPurchases()]);
});
</script>

<style scoped>
.purchases-page {
  font-family: inherit;
}

.purchase-form-card {
  border-top: 3px solid #0d6efd !important;
}

.line-items-table th {
  font-weight: 600;
  vertical-align: middle;
}

.frozen-input {
  background-color: #f8f9fa !important;
  opacity: 0.65;
  cursor: not-allowed;
}

.summary-line {
  font-size: 0.88rem;
}

@media print {
  .purchases-page > *:not(.modal) {
    display: none !important;
  }
  .modal {
    position: static !important;
    background: none !important;
  }
  .modal-dialog {
    max-width: 100% !important;
    margin: 0 !important;
  }
  .modal-footer {
    display: none !important;
  }
}
</style>
