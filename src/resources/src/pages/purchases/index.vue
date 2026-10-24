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
            </div>

            <!-- ফিল্ড সারি ১: পণ্যের নাম, ব্র্যান্ড, সাইজ, কালার, বার কোড -->
            <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-2 mb-2">
              <!-- ১. পণ্যের নাম -->
              <div class="col">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block">
                  পণ্যের নাম <span class="text-danger">*</span>
                </label>
                <select
                  v-model="currentItem.itemId"
                  class="form-select form-select-sm"
                  @change="onCurrentItemSelect">
                  <option value="" disabled>পণ্য নির্বাচন করুন</option>
                  <option v-for="it in itemsList" :key="it.id" :value="it.id">
                    {{ it.name }} {{ it.code ? `(${it.code})` : '' }}
                  </option>
                </select>
              </div>

              <!-- ২. ব্র্যান্ড -->
              <div class="col">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block">ব্র্যান্ড</label>
                <select
                  v-model="currentItem.brandId"
                  class="form-select form-select-sm"
                  @change="onCurrentItemBrandChange">
                  <option value="">(ঐচ্ছিক)</option>
                  <option v-for="b in brandsList" :key="b.id" :value="b.id">
                    {{ b.name }}
                  </option>
                </select>
              </div>

              <!-- ৩. সাইজ -->
              <div class="col">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block">
                  সাইজ <span class="text-danger">*</span>
                </label>
                <select
                  v-model="currentItem.sizeId"
                  class="form-select form-select-sm"
                  @change="onCurrentItemSizeChange">
                  <option value="" disabled>সাইজ নির্বাচন করুন</option>
                  <option v-for="s in sizesList" :key="s.id" :value="s.id">
                    {{ s.name }}
                  </option>
                </select>
              </div>

              <!-- ৪. কালার -->
              <div class="col">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block">কালার</label>
                <select v-model="currentItem.colorId" class="form-select form-select-sm">
                  <option value="">(ঐচ্ছিক)</option>
                  <option v-for="c in colorsList" :key="c.id" :value="c.id">
                    {{ c.name }}
                  </option>
                </select>
              </div>

              <!-- ৫. বার কোড -->
              <div class="col">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block">
                  বার কোড <span class="badge bg-warning-subtle text-dark border ms-1 py-0 px-1 font-monospace" style="font-size: 0.65rem;">১৪-ডিজিট</span>
                </label>
                <input
                  v-model.trim="currentItem.code"
                  type="text"
                  maxlength="30"
                  class="form-control form-control-sm font-monospace fw-bold"
                  placeholder="অটো জেনারেট"
                  @input="currentItem.isCodeCustomized = true" />
              </div>
            </div>

            <!-- ফিল্ড সারি ২: পরিমাণ, একক, মোট মূল্য, ভ্যাট, ভ্যাট ছাড়া মূল্য, ভ্যাট ছাড়া একক মূল্য -->
            <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-6 g-2 align-items-end">
              <!-- ৬. পরিমাণ -->
              <div class="col">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block">
                  পরিমাণ <span class="text-danger">*</span>
                </label>
                <input
                  v-model.number="currentItem.quantity"
                  type="number"
                  min="1"
                  class="form-control form-control-sm text-center fw-semibold"
                  placeholder="১" />
              </div>

              <!-- ৭. একক -->
              <div class="col">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block">একক</label>
                <select v-model="currentItem.unitId" class="form-select form-select-sm">
                  <option value="">একক নির্বাচন</option>
                  <option v-for="u in unitsList" :key="u.id" :value="u.id">
                    {{ u.name }}
                  </option>
                </select>
              </div>

              <!-- ৮. মোট মূল্য -->
              <div class="col">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block">
                  মোট মূল্য (৳) <span class="text-danger">*</span>
                </label>
                <input
                  v-model.number="currentItem.totalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-control form-control-sm text-end fw-semibold"
                  placeholder="0.00" />
              </div>

              <!-- ৯. ভ্যাট -->
              <div class="col">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block">ভ্যাট (%)</label>
                <input
                  v-model.number="currentItem.vatRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  class="form-control form-control-sm text-center"
                  placeholder="0" />
              </div>

              <!-- ১০. ভ্যাট ছাড়া মূল্য -->
              <div class="col">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block text-secondary">
                  ভ্যাট ছাড়া মূল্য (৳) <span class="badge bg-secondary-subtle text-secondary-emphasis ms-1 py-0 px-1" style="font-size: 0.65rem;">অটো</span>
                </label>
                <div class="form-control form-control-sm bg-light text-dark fw-bold text-end">
                  ৳ {{ toBengaliNumber(currentItemPriceExclVat) }}
                </div>
              </div>

              <!-- ১১. ভ্যাট ছাড়া একক মূল্য -->
              <div class="col">
                <label class="form-label small fw-semibold mb-1 text-truncate d-block text-primary">
                  ভ্যাট ছাড়া একক মূল্য (৳) <span class="badge bg-primary-subtle text-primary ms-1 py-0 px-1" style="font-size: 0.65rem;">অটো</span>
                </label>
                <div class="form-control form-control-sm bg-primary-subtle text-primary fw-bold text-end">
                  ৳ {{ toBengaliNumber(currentItemUnitCostExclVat) }}
                </div>
              </div>
            </div>

            <!-- একশন বাটনদ্বয়: রিসেট ও তালিকায় যুক্ত করুন -->
            <div class="d-flex justify-content-end align-items-center gap-2 mt-3 pt-2 border-top">
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary px-3"
                @click="resetCurrentItem">
                <i class="bi bi-x-circle me-1"></i>রিসেট
              </button>
              <button
                type="button"
                class="btn btn-sm btn-primary px-4 fw-semibold shadow-sm"
                @click="addItemToList">
                <i :class="editingIndex !== null ? 'bi bi-check2-circle' : 'bi bi-plus-circle'" class="me-1"></i>
                {{ editingIndex !== null ? 'পণ্য আপডেট করুন' : 'তালিকায় যুক্ত করুন' }}
              </button>
            </div>
          </div>

          <!-- সেকশন ৩: তিনটি কার্ড (১. পণ্যের সংক্ষিপ্ত বিবরণ, ২. খরচ ও সমন্বয়, ৩. চূড়ান্ত হিসাব) -->
          <div class="row g-3 mb-3">
            <!-- কার্ড ১: পণ্যের সংক্ষিপ্ত বিবরণ (টেম্পেরেরি জমা হবে, এডিট/ডিলেট করা যাবে) -->
            <div class="col-12 col-lg-4">
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
                          <th>নাম</th>
                          <th>সাইজ</th>
                          <th class="text-center">পরিমাণ</th>
                          <th class="text-end">মোট মূল্য</th>
                          <th style="width: 65px;" class="text-center">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(it, idx) in form.items"
                          :key="idx"
                          :class="{ 'table-warning': editingIndex === idx }">
                          <td class="text-center text-muted small">{{ toBengaliNumber(idx + 1) }}</td>
                          <td>
                            <div class="fw-semibold text-truncate" style="max-width: 130px;" :title="it.name">
                              {{ it.name }}
                            </div>
                            <small v-if="it.code" class="font-monospace text-muted d-block" style="font-size: 0.68rem;">
                              {{ it.code }}
                            </small>
                          </td>
                          <td>
                            <span class="badge bg-light text-dark border py-0 px-1">
                              {{ getSizeName(it.sizeId) }}
                            </span>
                          </td>
                          <td class="text-center fw-bold">
                            {{ toBengaliNumber(it.quantity) }}
                            <span class="small text-muted fw-normal" style="font-size: 0.72rem;">{{ getUnitName(it.unitId) }}</span>
                          </td>
                          <td class="text-end fw-semibold">
                            ৳ {{ toBengaliNumber(Number(it.totalPrice || 0).toFixed(2)) }}
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
            <div class="col-12 col-lg-4">
              <div class="card h-100 border shadow-sm">
                <div class="card-header bg-white border-bottom py-2 d-flex align-items-center gap-2">
                  <i class="bi bi-sliders text-warning fs-5"></i>
                  <h6 class="m-0 fw-bold">খরচ ও সমন্বয়</h6>
                </div>
                <div class="card-body p-3">
                  <!-- অন্যান্য খরচ -->
                  <div class="mb-2">
                    <label class="form-label small fw-semibold mb-1">
                      অন্যান্য খরচ (ভাড়া/কুরিয়ার/চার্জ) (৳)
                    </label>
                    <input
                      v-model.number="form.otherExpenses"
                      type="number"
                      min="0"
                      step="0.01"
                      class="form-control form-control-sm"
                      placeholder="0.00" />
                    <small class="text-muted" style="font-size: 0.73rem;">
                      যাতায়াত, কুরিয়ার, কুলি খরচ ইত্যাদি
                    </small>
                  </div>

                  <!-- ডিসকাউন্ট / ছাড় -->
                  <div class="mb-2">
                    <label class="form-label small fw-semibold mb-1">
                      চালান ডিসকাউন্ট / ছাড় (৳)
                    </label>
                    <input
                      v-model.number="form.discountAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      class="form-control form-control-sm"
                      placeholder="0.00" />
                    <small class="text-muted" style="font-size: 0.73rem;">
                      চালানের মোট মূল্যের ওপর প্রাপ্ত ছাড়
                    </small>
                  </div>

                  <!-- পেমেন্ট মাধ্যম (সুপারএডমিন সেটিংস থেকে Trx Type ড্রপডাউন) -->
                  <div class="mb-2">
                    <label class="form-label small fw-semibold mb-1">
                      পরিশোধের মাধ্যম (Trx Type) <span class="text-danger">*</span>
                    </label>
                    <select
                      v-model="form.paymentMethod"
                      class="form-select form-select-sm"
                      required>
                      <option value="">পরিশোধের মাধ্যম নির্বাচন করুন</option>
                      <option
                        v-for="pm in activePaymentMethods"
                        :key="pm.id"
                        :value="pm.code || pm.name">
                        {{ pm.name }} {{ pm.code ? `(${pm.code})` : '' }}
                      </option>
                    </select>
                  </div>

                  <!-- পরিশোধিত টাকা -->
                  <div class="mb-2">
                    <label class="form-label small fw-semibold mb-1">
                      পরিশোধিত টাকা (৳) (Paid Amount)
                    </label>
                    <input
                      v-model.number="form.paidAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      class="form-control form-control-sm fw-semibold text-success"
                      placeholder="0.00" />
                  </div>

                  <!-- চালান মন্তব্য -->
                  <div>
                    <label class="form-label small fw-semibold mb-1">
                      চালান মন্তব্য / বিবরণ
                    </label>
                    <textarea
                      v-model="form.notes"
                      rows="2"
                      class="form-control form-control-sm"
                      placeholder="চালান সম্পর্কিত কোনো বিশেষ বিবরণ..."></textarea>
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
                      <i v-else class="bi bi-check2-circle me-1"></i>
                      ক্রয় চালান সংরক্ষণ করুন
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

// View State
const activeView = ref<"form" | "list">("form");
const submitting = ref(false);
const loadingPurchases = ref(false);
const searchQuery = ref("");
const selectedPurchase = ref<any>(null);

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
  vatRate?: number;
  priceExclVat?: number;
  unitPriceExclVat?: number;
}

const editingIndex = ref<number | null>(null);

const currentItem = reactive<PurchaseItemRow & { vatRate: number }>({
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
  totalPrice: 0,
  vatRate: 0,
  priceExclVat: 0,
  unitPriceExclVat: 0
});

// ভ্যাট ছাড়া মূল্য: totalPrice / (1 + vatRate / 100)
const currentItemPriceExclVat = computed(() => {
  const total = Number(currentItem.totalPrice) || 0;
  const vat = Number(currentItem.vatRate) || 0;
  if (total <= 0) return "0.00";
  const excl = total / (1 + vat / 100);
  return excl.toFixed(2);
});

// ভ্যাট ছাড়া একক মূল্য: priceExclVat / quantity
const currentItemUnitCostExclVat = computed(() => {
  const qty = Number(currentItem.quantity) || 0;
  const excl = parseFloat(currentItemPriceExclVat.value) || 0;
  if (qty <= 0 || excl <= 0) return "0.00";
  return (excl / qty).toFixed(2);
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
  paidAmount: 0,
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
    currentItem.name = selected.name;
    currentItem.categoryId = selected.categoryId || "";
    currentItem.subCategoryId = selected.subCategoryId || "";
    if (selected.brandId) currentItem.brandId = selected.brandId;
    if (selected.sizeId) currentItem.sizeId = selected.sizeId;
    if (selected.colorId) currentItem.colorId = selected.colorId;
    if (selected.unitId) currentItem.unitId = selected.unitId;
    if (Number(selected.purchasePrice) > 0 && (!currentItem.totalPrice || currentItem.totalPrice === 0)) {
      currentItem.totalPrice = Number((Number(selected.purchasePrice) * (currentItem.quantity || 1)).toFixed(2));
    }
    generateCurrentItemBarcode(false);
  }
}

function addItemToList() {
  if (!currentItem.itemId && !currentItem.name.trim()) {
    showToast("অনুগ্রহ করে একটি পণ্য নির্বাচন করুন", "warning");
    return;
  }
  if (!currentItem.sizeId) {
    showToast("অনুগ্রহ করে পণ্যের সাইজ নির্বাচন করুন", "warning");
    return;
  }
  if ((Number(currentItem.quantity) || 0) <= 0) {
    showToast("পরিমাণ অবশ্যই ১ বা তার বেশি হতে হবে", "warning");
    return;
  }

  const rowData: PurchaseItemRow = {
    itemId: currentItem.itemId,
    categoryId: currentItem.categoryId,
    subCategoryId: currentItem.subCategoryId,
    brandId: currentItem.brandId,
    sizeId: currentItem.sizeId,
    colorId: currentItem.colorId,
    unitId: currentItem.unitId,
    name: currentItem.name.trim(),
    code: currentItem.code?.trim() || "",
    isCodeCustomized: currentItem.isCodeCustomized,
    quantity: Number(currentItem.quantity) || 1,
    totalPrice: Number(currentItem.totalPrice) || 0,
    vatRate: Number(currentItem.vatRate) || 0,
    priceExclVat: parseFloat(currentItemPriceExclVat.value) || 0,
    unitPriceExclVat: parseFloat(currentItemUnitCostExclVat.value) || 0
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
  currentItem.quantity = 1;
  currentItem.totalPrice = 0;
  currentItem.vatRate = 0;
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
  currentItem.name = it.name;
  currentItem.code = it.code || "";
  currentItem.isCodeCustomized = it.isCodeCustomized || false;
  currentItem.quantity = it.quantity;
  currentItem.totalPrice = it.totalPrice;
  currentItem.vatRate = it.vatRate || 0;
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
const totalQuantity = computed(() => {
  return form.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
});

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
