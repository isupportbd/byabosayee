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
        <button
          type="button"
          class="btn btn-sm"
          :class="activeView === 'pos' ? 'btn-success text-white shadow-sm' : 'btn-outline-success'"
          @click="switchView('pos')">
          <i class="bi bi-upc-scan me-1"></i>নতুন বিক্রয় (POS)
        </button>
        <button
          type="button"
          class="btn btn-sm shadow-sm fw-medium d-inline-flex align-items-center gap-1.5"
          :class="activeView === 'list' ? 'btn-success text-white' : 'btn-outline-success'"
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
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-success-subtle text-success border border-success-subtle font-monospace px-2 py-1">
                ইনভয়েস: {{ generatedInvoiceNumber }}
              </span>
              <span class="badge bg-light text-dark border">
                <i class="bi bi-calendar-date me-1 text-muted"></i>{{ todayFormatted }}
              </span>
            </div>
            <!-- ক্যাশিয়ার / ডাটা এন্ট্রি কারী তথ্য ও বিক্রয় তালিকা বাটন -->
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1" title="ডাটা এন্ট্রি করছেন">
                <i class="bi bi-person-badge me-1"></i>বিক্রেতা/ক্যাশিয়ার: <strong>{{ cashierDisplayName }}</strong>
              </span>
              <button
                type="button"
                class="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 py-1 px-2.5 shadow-sm fw-medium"
                @click="switchView('list')">
                <i class="bi bi-card-list"></i>
                <span>বিক্রয় তালিকা</span>
              </button>
            </div>
          </div>

          <div class="card-body p-3 d-flex flex-column h-100" style="min-height: 0;">
            <!-- গ্রাহক নির্বাচন ও মোবাইল সার্চ ব্লক (রেগুলার ফর্ম রো) -->
            <div class="row g-2 align-items-center mb-2 flex-shrink-0">
              <div class="col-12 col-md-5">
                <label class="form-label small fw-semibold mb-1 d-flex justify-content-between">
                  <span>গ্রাহক (Customer)</span>
                  <button
                    type="button"
                    class="btn btn-link btn-xs p-0 text-success text-decoration-none"
                    @click="form.customerId = ''; form.customerName = 'ওয়াকিং কাস্টমার'; form.customerMobile = ''">
                    <i class="bi bi-arrow-counterclockwise"></i> ডিফল্ট ওয়াকিং
                  </button>
                </label>
                <select
                  v-model="form.customerId"
                  class="form-select form-select-sm search-input-unified"
                  @change="onCustomerSelect">
                  <option value="">ওয়াকিং কাস্টমার (Walk-in Customer)</option>
                  <option v-for="c in customersList" :key="c.id" :value="c.id">
                    {{ c.name }} {{ c.phone ? `(${c.phone})` : '' }}
                  </option>
                </select>
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label small fw-semibold mb-1">গ্রাহকের নাম</label>
                <input
                  v-model.trim="form.customerName"
                  type="text"
                  class="form-control form-control-sm search-input-unified"
                  placeholder="গ্রাহকের নাম লিখুন..." />
              </div>
              <div class="col-12 col-md-3">
                <label class="form-label small fw-semibold mb-1">মোবাইল নম্বর</label>
                <input
                  v-model.trim="form.customerMobile"
                  type="text"
                  class="form-control form-control-sm search-input-unified font-monospace"
                  placeholder="০১XXXXXXXXX" />
              </div>
            </div>

            <!-- গ্রাহক তথ্য ও পণ্য স্ক্যানারের মধ্যবর্তী বিভাজক লাইন -->
            <hr class="colorful-divider my-2 flex-shrink-0" />

            <!-- ফাস্ট বারকোড স্ক্যানার ও পণ্য সার্চ ইনপুট (রেগুলার রো) -->
            <div class="row g-2 align-items-center mb-2 flex-shrink-0">
              <div class="col-12 col-md-5">
                <div class="position-relative">
                  <input
                    ref="barcodeInputRef"
                    v-model="scannerQuery"
                    type="text"
                    class="form-control form-control-sm ps-5 search-input-unified"
                    placeholder="বারকোড স্ক্যান করুন বা এন্টার চাপুন..."
                    autofocus
                    @keydown.enter.prevent="handleBarcodeScan" />
                  <i class="bi bi-upc-scan position-absolute top-50 start-0 translate-middle-y ms-3 text-muted fs-6 pe-none"></i>
                  <button
                    v-if="scannerQuery"
                    type="button"
                    class="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-2"
                    @click="scannerQuery = ''; focusBarcodeInput()">
                    <i class="bi bi-x-circle"></i>
                  </button>
                </div>
              </div>
              <div class="col-12 col-md-7">
                <!-- ড্রপডাউন থেকে পণ্য যোগ করার সুবিধা (মূল্যের বদলে স্টক দেখানো হচ্ছে) -->
                <select
                  v-model="selectedDropdownItemId"
                  class="form-select form-select-sm search-input-unified w-100"
                  @change="handleDropdownProductSelect">
                  <option value="">বা তালিকা থেকে পণ্য নির্বাচন করুন...</option>
                  <option
                    v-for="it in availableItems"
                    :key="it.id"
                    :value="it.id">
                    {{ cleanItemName(it.name) }} [{{ it.size?.name || '-' }}] - স্টক: {{ it.stockQuantity ?? 0 }} টি
                  </option>
                </select>
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
                      
                      <!-- পণ্যের নাম ও বিবরণ: উপরে নাম, নিচে সাইজ -->
                      <td class="text-start">
                        <div class="fw-semibold text-truncate" :title="row.name">
                          {{ cleanItemName(row.name) }}
                        </div>
                        <div v-if="row.sizeName" class="text-muted mt-0.5" style="font-size: 0.78rem;">
                          সাইজ: {{ row.sizeName }}
                        </div>
                      </td>

                      <!-- পরিমাণ -->
                      <td class="text-center text-nowrap">
                        <div class="d-inline-flex align-items-center justify-content-center flex-nowrap quantity-wrapper">
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-secondary qty-btn"
                            title="পরিমাণ কমান"
                            @click="changeQty(row, -1)">
                            -
                          </button>
                          <input
                            v-model.number="row.quantity"
                            type="number"
                            min="1"
                            :max="row.availableStock"
                            class="form-control form-control-sm text-center fw-bold qty-input mx-1"
                            @input="if (row.quantity > row.availableStock) { row.quantity = row.availableStock; showToast(`'${cleanItemName(row.name)}' এর সর্বোচ্চ উপলব্ধ স্টক ${row.availableStock} টি`, 'warning'); } recalculateLine(row)" />
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-secondary qty-btn"
                            title="পরিমাণ বাড়ান"
                            @click="changeQty(row, 1)">
                            +
                          </button>
                        </div>
                      </td>

                      <!-- দর (৳) -->
                      <td class="text-end">
                        <input
                          v-model.number="row.unitPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          class="form-control form-control-sm text-end fw-semibold table-num-input"
                          @input="recalculateLine(row)" />
                      </td>

                      <!-- মোট দর (৳) -->
                      <td class="text-end fw-bold text-success text-nowrap font-monospace">
                        {{ Number(row.totalPrice || 0).toFixed(2) }}
                      </td>

                      <!-- ছাড় (% বা ৳) -->
                      <td class="text-center">
                        <div class="input-group input-group-sm" style="width: 98px; margin: 0 auto;">
                          <input
                            v-model.number="row.discountValue"
                            type="number"
                            min="0"
                            step="any"
                            class="form-control form-control-sm text-end table-num-input px-1"
                            placeholder="0"
                            @input="recalculateLine(row)" />
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-secondary px-1 text-nowrap fw-bold"
                            style="font-size: 0.75rem; width: 28px; line-height: 1;"
                            :title="row.discountType === 'fixed' ? 'টাকা (৳) - ক্লিক করলে শতাংশ (%) হবে' : 'শতাংশ (%) - ক্লিক করলে টাকা (৳) হবে'"
                            @click="row.discountType = (row.discountType === 'fixed' ? 'percent' : 'fixed'); recalculateLine(row)">
                            {{ row.discountType === 'fixed' ? '৳' : '%' }}
                          </button>
                        </div>
                      </td>

                      <!-- ভ্যাট (%) -->
                      <td class="text-center text-nowrap">
                        <span class="badge bg-light text-dark border font-monospace">
                          {{ row.vatRate || 0 }}%
                        </span>
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
                  <span>সেইভ ড্রাফট</span>
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
                  <span>সম্পন্ন ও প্রিন্ট</span>
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
                  <th style="width: 120px;" class="text-center">পণ্য সংখ্যা</th>
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
                  <td class="text-center">
                    <span class="badge bg-light text-dark border">{{ draft.items?.length || 0 }} টি</span>
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
                <th style="width: 50px;" class="text-center">#</th>
                <th style="width: 160px;" class="text-start">ইনভয়েস নং</th>
                <th style="width: 110px;" class="text-center">তারিখ</th>
                <th style="min-width: 160px;" class="text-start">গ্রাহক</th>
                <th style="width: 130px;" class="text-center">ক্যাশিয়ার</th>
                <th style="width: 90px;" class="text-center">পণ্য সংখ্যা</th>
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
                <td class="text-start">
                  <span class="font-monospace fw-semibold text-dark">{{ sale.invoiceNumber }}</span>
                </td>
                <td class="text-center text-muted">
                  {{ formatDate(sale.saleDate) }}
                </td>
                <td class="text-start">
                  <div class="fw-semibold text-dark">{{ sale.customerName || 'ওয়াকিং কাস্টমার' }}</div>
                  <div v-if="sale.customerMobile" class="text-muted font-monospace" style="font-size: 0.72rem;">
                    {{ sale.customerMobile }}
                  </div>
                </td>
                <td class="text-center">
                  <span class="badge bg-light text-dark border">
                    {{ sale.cashierName || '-' }}
                  </span>
                </td>
                <td class="text-center">
                  <span class="badge bg-secondary-subtle text-secondary">
                    {{ sale.items?.length || 0 }} টি
                  </span>
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
                <p class="small text-muted mb-0">ফ্যাশন ও গার্মেন্টস বিক্রয় শো-রুম</p>
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
                      <small v-if="it.sizeName" class="text-muted">সাইজ: {{ it.sizeName }}</small>
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
import { computed, inject, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { authUser } from "@/composables/useAuth";
import Pagination from "@/components/datatable/Pagination.vue";
import Input from "@/components/Input.vue";

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
const selectedDropdownItemId = ref<number | string>("");

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
  customerName: "ওয়াকিং কাস্টমার",
  customerMobile: "",
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

// Filtered Available Items for search & dropdown (ইউজারের নির্দেশনা: স্টক নেই এমন পণ্য তালিকায় আসবে না)
const availableItems = computed(() => {
  return itemsList.value.filter((it) => Number(it.stockQuantity || 0) > 0);
});

// Clean Item Name helper (strips size suffix like _S, _38 as already verified)
function cleanItemName(name: string): string {
  if (!name) return "";
  return name
    .replace(/\s*\(\s*(?:সাইজ|size)[\s\-:—].*?\)/i, "")
    .replace(/\s*(?:সাইজ|size)[\s\-:—].*$/i, "")
    .replace(/\s*(?:সাইজ|size)\s*[-:—]?\s*.*$/i, "")
    .replace(/_[^_]+$/, "")
    .trim();
}

// Focus Barcode Input
function focusBarcodeInput() {
  nextTick(() => {
    barcodeInputRef.value?.focus();
  });
}

// On Customer Selected from Dropdown
function onCustomerSelect() {
  if (!form.customerId) {
    form.customerName = "ওয়াকিং কাস্টমার";
    form.customerMobile = "";
    return;
  }
  const cust = customersList.value.find((c) => Number(c.id) === Number(form.customerId));
  if (cust) {
    form.customerName = cust.name || "";
    form.customerMobile = cust.phone || "";
  }
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

  // Search by exact barcode (14-digit or item code), or item name match
  const found = itemsList.value.find((it) => {
    const bc = (it.latestBarcode || "").toLowerCase();
    const code = (it.code || "").toLowerCase();
    const q = query.toLowerCase();
    return bc === q || code === q || bc.includes(q);
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
    // Try matching by name
    const nameMatch = itemsList.value.find((it) => it.name && it.name.toLowerCase().includes(query.toLowerCase()));
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
function handleDropdownProductSelect() {
  if (!selectedDropdownItemId.value) return;
  const item = itemsList.value.find((it) => Number(it.id) === Number(selectedDropdownItemId.value));
  if (item) {
    addItemToCart(item);
  }
  selectedDropdownItemId.value = "";
  focusBarcodeInput();
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

  submitting.value = true;
  try {
    const isDraft = !printAfterSubmit;
    const finalPaid = isPaidAmountCustom.value ? Math.max(0, Number(form.paidAmount) || 0) : summary.value.netPayable;
    const payload = {
      isDraft,
      status: isDraft ? "draft" : undefined,
      customerId: form.customerId || null,
      customerName: form.customerName || "ওয়াকিং কাস্টমার",
      customerMobile: form.customerMobile || "",
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

    const res = await axios.post("/api/inventory/sales", payload);
    const created = res.data?.data;

    // Clear Form & Cart
    clearCart();

    // Reload Data to refresh inventory stock and sales list
    await loadAllData();

    if (isDraft) {
      showToast("বিক্রয় চালান ড্রাফট হিসেবে সংরক্ষিত হয়েছে!", "info");
      // Remain on POS view so cashier can see draft in table below
    } else {
      showToast("পণ্য বিক্রয় সফলভাবে সম্পন্ন হয়েছে!", "success");
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

// Load All Backend Data
async function loadAllData() {
  loading.value = true;
  try {
    const [itemsRes, custRes, salesRes, compRes] = await Promise.all([
      axios.get("/api/inventory/items"),
      axios.get("/api/inventory/customers").catch(() => ({ data: { data: [] } })),
      axios.get("/api/inventory/sales").catch(() => ({ data: { data: [] } })),
      axios.get("/api/company/profile").catch(() => ({ data: { data: {} } }))
    ]);

    itemsList.value = itemsRes.data?.data || [];
    customersList.value = custRes.data?.data || [];
    salesList.value = salesRes.data?.data || [];
    companyInfo.value = compRes.data?.data || {};
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

.table-num-input {
  height: 28px;
  font-size: 0.82rem;
  padding: 2px 6px;
}

.quantity-wrapper {
  width: 96px;
}

.qty-btn {
  width: 24px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1;
}

.qty-input {
  width: 44px;
  height: 28px;
  padding: 0 2px;
  font-size: 0.85rem;
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
</style>
