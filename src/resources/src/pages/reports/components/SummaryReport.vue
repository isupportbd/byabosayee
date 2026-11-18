<template>
  <div class="summary-report-component">
    <!-- ১. শীর্ষ ৪টি কেপিআই কার্ড (৪ কলাম গ্রিড) -->
    <div class="row g-3 mb-4">
      <!-- ১.১ মোট বিক্রয় -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-success">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">মোট বিক্রয় (রাজস্ব)</span>
              <div class="stat-icon-circle bg-success-subtle text-success">
                <i class="bi bi-cart-check"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-4 fw-bold text-success me-1">৳ {{ toBengaliNumber(formatAmount(summary.sales?.totalAmount)) }}</span>
            </div>
            <div class="small text-muted mt-1 d-flex justify-content-between">
              <span><i class="bi bi-receipt text-success me-1"></i>{{ toBengaliNumber(summary.sales?.count || 0) }} টি বিক্রয় চালান</span>
              <span class="text-success fw-medium">আদায়: ৳{{ toBengaliNumber(formatAmount(summary.sales?.paidAmount)) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ১.২ মোট ক্রয় -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-primary">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">মোট ক্রয় (খরচ)</span>
              <div class="stat-icon-circle bg-primary-subtle text-primary">
                <i class="bi bi-bag-plus"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-4 fw-bold text-primary me-1">৳ {{ toBengaliNumber(formatAmount(summary.purchases?.totalAmount)) }}</span>
            </div>
            <div class="small text-muted mt-1 d-flex justify-content-between">
              <span><i class="bi bi-truck text-primary me-1"></i>{{ toBengaliNumber(summary.purchases?.count || 0) }} টি চালান</span>
              <span class="text-danger fw-medium">বকেয়া দেনা: ৳{{ toBengaliNumber(formatAmount(summary.purchases?.dueAmount)) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ১.৩ বর্তমান স্টক মজুদ সম্পদ -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-info">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">মজুদ পণ্যের ক্রয়মূল্য</span>
              <div class="stat-icon-circle bg-info-subtle text-info">
                <i class="bi bi-boxes"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-4 fw-bold text-info me-1">৳ {{ toBengaliNumber(formatAmount(summary.inventory?.purchaseValue)) }}</span>
            </div>
            <div class="small text-muted mt-1 d-flex justify-content-between">
              <span><i class="bi bi-box-seam text-info me-1"></i>{{ toBengaliNumber(summary.inventory?.totalPieces || 0) }} পিস মজুদ</span>
              <span class="text-secondary">{{ toBengaliNumber(summary.inventory?.totalItems || 0) }} টি আইটেম</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ১.৪ প্রত্যাশিত সম্ভাব্য লাভ -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-emerald">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">স্টক বিক্রির সম্ভাব্য মুনাফা</span>
              <div class="stat-icon-circle bg-emerald-subtle text-emerald">
                <i class="bi bi-graph-up-arrow"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-4 fw-bold text-emerald me-1">৳ {{ toBengaliNumber(formatAmount(summary.inventory?.potentialProfit)) }}</span>
            </div>
            <div class="small text-muted mt-1 d-flex justify-content-between">
              <span>বিক্রয় মূল্য: ৳{{ toBengaliNumber(formatAmount(summary.inventory?.sellingValue)) }}</span>
              <span class="badge bg-emerald-subtle text-emerald border border-emerald-subtle">ইনভেন্টরি মার্জিন</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ২. সেলস পারফরম্যান্স অ্যানালিটিক্স (৩টি কলাম: ব্র্যান্ড, ডিজাইন ও আইটেম) -->
    <div class="row g-3 mb-4">
      <!-- ২.১ কোন ব্র্যান্ডের পণ্য বেশি বিক্রয় হয় -->
      <div class="col-12 col-md-4">
        <div class="card border shadow-sm h-100">
          <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-award-fill text-warning fs-5"></i>
              <span class="fw-bold text-dark">সর্বোচ্চ বিক্রিত ব্র্যান্ড</span>
            </div>
            <button
              type="button"
              class="btn btn-sm btn-outline-warning border-0 p-1 text-dark d-flex align-items-center gap-1 small"
              title="স্টক ট্যাবে ব্র্যান্ডের পণ্য দেখুন"
              @click="$emit('switch-tab', 'stock')">
              <i class="bi bi-eye"></i>
              <span class="small">ভিউ</span>
            </button>
          </div>
          <div class="card-body p-0">
            <div v-if="!summary.analytics?.topBrands?.length" class="p-4 text-center text-muted small">
              <i class="bi bi-inbox text-muted fs-4 d-block mb-1"></i>
              কোনো ব্র্যান্ডের বিক্রয় রেকর্ড নেই।
            </div>
            <div v-else class="list-group list-group-flush small">
              <div
                v-for="(brand, idx) in summary.analytics?.topBrands"
                :key="brand.brandName"
                class="list-group-item d-flex justify-content-between align-items-center px-3 py-2.5">
                <div class="d-flex align-items-center gap-2">
                  <span class="badge rounded-circle bg-light text-dark border rank-badge">
                    {{ toBengaliNumber(idx + 1) }}
                  </span>
                  <div>
                    <div class="fw-bold text-dark">{{ brand.brandName }}</div>
                    <small class="text-muted">বর্তমান গুদাম মজুদ: {{ toBengaliNumber(brand.currentStock) }} পিস</small>
                  </div>
                </div>
                <div class="text-end">
                  <div class="fw-bold text-primary">{{ toBengaliNumber(brand.quantitySold) }} পিস বিক্রয়</div>
                  <small class="text-success fw-medium">৳ {{ toBengaliNumber(formatAmount(brand.totalRevenue)) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ২.২ কোন ডিজাইন বেশি বিক্রয় হয়েছে -->
      <div class="col-12 col-md-4">
        <div class="card border shadow-sm h-100">
          <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-palette2 text-info fs-5"></i>
              <span class="fw-bold text-dark">সর্বোচ্চ বিক্রিত ডিজাইন</span>
            </div>
            <button
              type="button"
              class="btn btn-sm btn-outline-info border-0 p-1 text-info d-flex align-items-center gap-1 small"
              title="ডিজাইন অনুযায়ী স্টক দেখুন"
              @click="$emit('switch-tab', 'stock')">
              <i class="bi bi-eye"></i>
              <span class="small">ভিউ</span>
            </button>
          </div>
          <div class="card-body p-0">
            <div v-if="!summary.analytics?.topDesigns?.length" class="p-4 text-center text-muted small">
              <i class="bi bi-inbox text-muted fs-4 d-block mb-1"></i>
              কোনো ডিজাইনের বিক্রয় রেকর্ড নেই।
            </div>
            <div v-else class="list-group list-group-flush small">
              <div
                v-for="(dgn, idx) in summary.analytics?.topDesigns"
                :key="dgn.designCode"
                class="list-group-item d-flex justify-content-between align-items-center px-3 py-2.5">
                <div class="d-flex align-items-center gap-2">
                  <span class="badge rounded-circle bg-light text-dark border rank-badge">
                    {{ toBengaliNumber(idx + 1) }}
                  </span>
                  <div>
                    <div class="fw-bold text-dark font-monospace">{{ dgn.designCode }}</div>
                    <small class="text-muted">{{ dgn.brandName || 'সাধারণ' }} | মজুদ: {{ toBengaliNumber(dgn.currentStock) }} পিস</small>
                  </div>
                </div>
                <div class="text-end">
                  <div class="fw-bold text-info">{{ toBengaliNumber(dgn.quantitySold) }} পিস বিক্রয়</div>
                  <small class="text-success fw-medium">৳ {{ toBengaliNumber(formatAmount(dgn.totalRevenue)) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ২.৩ কোন আইটেম সবচেয়ে বেশি বিক্রি হয়েছে -->
      <div class="col-12 col-md-4">
        <div class="card border shadow-sm h-100">
          <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-fire text-danger fs-5"></i>
              <span class="fw-bold text-dark">সবচেয়ে বেশি বিক্রিত আইটেম</span>
            </div>
            <button
              type="button"
              class="btn btn-sm btn-outline-danger border-0 p-1 text-danger d-flex align-items-center gap-1 small"
              title="লাভ-ক্ষতি ও মার্জিন বিশ্লেষণ দেখুন"
              @click="$emit('switch-tab', 'profit_loss')">
              <i class="bi bi-eye"></i>
              <span class="small">ভিউ</span>
            </button>
          </div>
          <div class="card-body p-0">
            <div v-if="!summary.analytics?.topProducts?.length" class="p-4 text-center text-muted small">
              <i class="bi bi-inbox text-muted fs-4 d-block mb-1"></i>
              কোনো পণ্যের বিক্রয় রেকর্ড নেই।
            </div>
            <div v-else class="list-group list-group-flush small">
              <div
                v-for="(prod, idx) in summary.analytics?.topProducts"
                :key="prod.itemId || prod.name"
                class="list-group-item d-flex justify-content-between align-items-center px-3 py-2.5">
                <div class="d-flex align-items-center gap-2">
                  <span class="badge rounded-circle bg-light text-dark border rank-badge">
                    {{ toBengaliNumber(idx + 1) }}
                  </span>
                  <div>
                    <div class="fw-bold text-dark text-truncate" style="max-width: 140px;" :title="prod.name">
                      {{ prod.name }}
                    </div>
                    <small class="text-muted font-monospace">{{ prod.code || prod.barcode }} | মজুদ: {{ toBengaliNumber(prod.currentStock) }}</small>
                  </div>
                </div>
                <div class="text-end">
                  <div class="fw-bold text-danger">{{ toBengaliNumber(prod.quantitySold) }} পিস</div>
                  <small class="text-success fw-medium">৳ {{ toBengaliNumber(formatAmount(prod.totalRevenue)) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ৩. তুলনামূলক বিশ্লেষণ (বিক্রয় ও নগদ আদায় বনাম মালামাল ক্রয় ও দেনা) -->
    <div class="row g-3 mb-4">
      <!-- ৩.১ বিক্রয় ও আদায় বিবরণী -->
      <div class="col-12 col-lg-6">
        <div class="card border shadow-sm h-100">
          <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between">
            <span class="fw-bold text-dark d-flex align-items-center gap-2">
              <i class="bi bi-cash-stack text-success"></i>
              <span>বিক্রয় ও নগদ আদায় বিশ্লেষণ (নির্বাচিত সময়কাল)</span>
            </span>
            <button
              type="button"
              class="btn btn-sm btn-outline-success border-0 p-1 text-success d-flex align-items-center gap-1 small"
              title="আর্থিক স্টেটমেন্টে বিস্তারিত দেখুন"
              @click="$emit('switch-tab', 'statement')">
              <i class="bi bi-eye"></i>
              <span class="small">ভিউ বিবরণী</span>
            </button>
          </div>
          <div class="card-body p-3">
            <ul class="list-group list-group-flush small">
              <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                <span class="text-muted"><i class="bi bi-receipt me-1"></i>মোট বিক্রয় চালান:</span>
                <span class="fw-bold">{{ toBengaliNumber(summary.sales?.count || 0) }} টি</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                <span class="text-muted"><i class="bi bi-tag me-1"></i>মোট বিক্রয় মূল্য (ছাড় বাদে):</span>
                <span class="fw-bold text-success fs-6">৳ {{ toBengaliNumber(formatAmount(summary.sales?.totalAmount)) }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                <span class="text-muted"><i class="bi bi-check2-circle me-1 text-success"></i>নগদ আদায়কৃত টাকা:</span>
                <span class="fw-bold text-success">৳ {{ toBengaliNumber(formatAmount(summary.sales?.paidAmount)) }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                <span class="text-muted"><i class="bi bi-exclamation-circle me-1 text-danger"></i>কাস্টমারদের কাছে বাকি (বকেয়া):</span>
                <span class="fw-bold text-danger">৳ {{ toBengaliNumber(formatAmount(summary.sales?.dueAmount)) }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                <span class="text-muted"><i class="bi bi-percent me-1 text-primary"></i>প্রদত্ত মোট ডিসকাউন্ট:</span>
                <span class="text-primary fw-semibold">৳ {{ toBengaliNumber(formatAmount(summary.sales?.discountAmount)) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- ৩.২ ক্রয় ও দেনা বিবরণী -->
      <div class="col-12 col-lg-6">
        <div class="card border shadow-sm h-100">
          <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between">
            <span class="fw-bold text-dark d-flex align-items-center gap-2">
              <i class="bi bi-truck text-primary"></i>
              <span>মালামাল ক্রয় ও দেনা বিশ্লেষণ (নির্বাচিত সময়কাল)</span>
            </span>
            <button
              type="button"
              class="btn btn-sm btn-outline-primary border-0 p-1 text-primary d-flex align-items-center gap-1 small"
              title="দেনা-পাওনা খতিয়ান দেখুন"
              @click="$emit('switch-tab', 'parties')">
              <i class="bi bi-eye"></i>
              <span class="small">ভিউ বিবরণী</span>
            </button>
          </div>
          <div class="card-body p-3">
            <ul class="list-group list-group-flush small">
              <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                <span class="text-muted"><i class="bi bi-receipt-cutoff me-1 text-primary"></i>মোট ক্রয় চালান:</span>
                <span class="fw-bold">{{ toBengaliNumber(summary.purchases?.count || 0) }} টি</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                <span class="text-muted"><i class="bi bi-currency-dollar me-1 text-primary"></i>মোট ক্রয় চালান মূল্য:</span>
                <span class="fw-bold text-primary fs-6">৳ {{ toBengaliNumber(formatAmount(summary.purchases?.totalAmount)) }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                <span class="text-muted"><i class="bi bi-credit-card me-1 text-primary"></i>সাপ্লায়ারদের পরিশোধিত টাকা:</span>
                <span class="fw-bold text-primary">৳ {{ toBengaliNumber(formatAmount(summary.purchases?.paidAmount)) }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                <span class="text-muted"><i class="bi bi-clock-history me-1 text-danger"></i>সরবরাহকারীদের কাছে দেনা (বকেয়া):</span>
                <span class="fw-bold text-danger">৳ {{ toBengaliNumber(formatAmount(summary.purchases?.dueAmount)) }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                <span class="text-muted"><i class="bi bi-shield-check me-1 text-secondary"></i>মজুদ স্ট্যাটাস সতর্কতা:</span>
                <div>
                  <span class="badge bg-warning-subtle text-warning border me-1">{{ toBengaliNumber(summary.inventory?.lowStockCount || 0) }} টি লো-স্টক</span>
                  <span class="badge bg-danger-subtle text-danger border">{{ toBengaliNumber(summary.inventory?.outOfStockCount || 0) }} টি স্টক-আউট</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- ৪. সবার শেষে: ইনভেন্টরি রিস্টক ও ক্রয়ের সিদ্ধান্ত গাইড (কোনটা বাড়ানো দরকার বনাম কোনটা কেনার প্রয়োজন নেই) -->
    <div class="row g-3">
      <!-- ৪.১ কোন পণ্যগুলোর স্টক বাড়ানো দরকার (High Demand / Low Stock) -->
      <div class="col-12 col-lg-6">
        <div class="card border shadow-sm h-100 card-bar-danger">
          <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <div class="badge-icon bg-danger-subtle text-danger p-1 rounded">
                <i class="bi bi-exclamation-triangle-fill"></i>
              </div>
              <div>
                <span class="fw-bold text-dark d-block">স্টক বাড়ানো দরকার (জরুরি ক্রয় তালিকা)</span>
                <small class="text-muted">চাহিদা বেশি অথবা স্টক সতর্কতা সীমার নিচে নেমে গেছে</small>
              </div>
            </div>
            <div class="d-flex align-items-center gap-1">
              <button
                type="button"
                class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 px-2 py-0.5 small"
                title="সকল লো-স্টক পণ্য দেখুন"
                @click="$emit('view-stock', 'low_stock')">
                <i class="bi bi-eye"></i>
                <span>সকল লো-স্টক</span>
              </button>
            </div>
          </div>

          <div class="card-body p-0">
            <div v-if="!summary.analytics?.restockRecommendations?.length" class="p-4 text-center text-muted small">
              <i class="bi bi-check-circle text-success fs-3 d-block mb-1"></i>
              বর্তমানে সব পণ্যের পর্যাপ্ত স্টক আছে, জরুরি ঘাটতি নেই।
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover align-middle mb-0 small">
                <thead class="table-light">
                  <tr>
                    <th>পণ্যের নাম ও কোড</th>
                    <th>ব্র্যান্ড / ডিজাইন</th>
                    <th class="text-center">বিক্রয়</th>
                    <th class="text-center">বর্তমান স্টক</th>
                    <th class="text-end">অবস্থা / ভিউ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in summary.analytics?.restockRecommendations" :key="item.itemId || item.name">
                    <td>
                      <div class="fw-semibold text-dark">{{ item.name }}</div>
                      <div class="font-monospace text-muted small">{{ item.code || item.barcode }}</div>
                    </td>
                    <td>
                      <div>{{ item.brandName || '-' }}</div>
                      <small class="text-muted">ডিজাইন: {{ item.designCode || '-' }}</small>
                    </td>
                    <td class="text-center fw-medium">
                      {{ toBengaliNumber(item.quantitySold || 0) }} পিস
                    </td>
                    <td class="text-center">
                      <span class="badge py-1 px-2" :class="item.currentStock <= 0 ? 'bg-danger text-white' : 'bg-warning text-dark'">
                        {{ toBengaliNumber(item.currentStock) }} পিস
                      </span>
                    </td>
                    <td class="text-end">
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary border-0 p-1 me-1 text-danger"
                        title="স্টকে খুঁজুন"
                        @click="$emit('search-stock', item.name)">
                        <i class="bi bi-arrow-right-circle"></i>
                      </button>
                      <span v-if="item.currentStock <= 0" class="badge bg-danger-subtle text-danger border border-danger-subtle">
                        স্টক শূন্য
                      </span>
                      <span v-else class="badge bg-warning-subtle text-dark border border-warning-subtle">
                        স্টক বাড়ান
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ৪.২ কোন পণ্যগুলো নতুন করে কেনার প্রয়োজন নেই (Overstocked / Slow Moving) -->
      <div class="col-12 col-lg-6">
        <div class="card border shadow-sm h-100 card-bar-success">
          <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <div class="badge-icon bg-success-subtle text-success p-1 rounded">
                <i class="bi bi-shield-check"></i>
              </div>
              <div>
                <span class="fw-bold text-dark d-block">কেনার প্রয়োজন নেই (পর্যাপ্ত মজুদ আছে)</span>
                <small class="text-muted">গুদামে পর্যাপ্ত মজুদ রয়েছে, নতুন করে কেনার প্রয়োজন নেই</small>
              </div>
            </div>
            <div class="d-flex align-items-center gap-1">
              <button
                type="button"
                class="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 px-2 py-0.5 small"
                title="সকল পর্যাপ্ত মজুদ পণ্য দেখুন"
                @click="$emit('view-stock', 'in_stock')">
                <i class="bi bi-eye"></i>
                <span>সকল মজুদ</span>
              </button>
            </div>
          </div>

          <div class="card-body p-0">
            <div v-if="!summary.analytics?.noRestockNeeded?.length" class="p-4 text-center text-muted small">
              <i class="bi bi-info-circle text-muted fs-3 d-block mb-1"></i>
              কোনো অতিরিক্ত মজুদ বা ওভারস্টক পণ্য শনাক্ত হয়নি।
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover align-middle mb-0 small">
                <thead class="table-light">
                  <tr>
                    <th>পণ্যের নাম ও কোড</th>
                    <th>ব্র্যান্ড / ডিজাইন</th>
                    <th class="text-center">বর্তমান মজুদ</th>
                    <th class="text-end">স্টক ক্রয়মূল্য</th>
                    <th class="text-end">অবস্থা / ভিউ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in summary.analytics?.noRestockNeeded" :key="item.itemId || item.name">
                    <td>
                      <div class="fw-semibold text-dark">{{ item.name }}</div>
                      <div class="font-monospace text-muted small">{{ item.code || item.barcode }}</div>
                    </td>
                    <td>
                      <div>{{ item.brandName || '-' }}</div>
                      <small class="text-muted">ডিজাইন: {{ item.designCode || '-' }}</small>
                    </td>
                    <td class="text-center">
                      <span class="badge bg-success-subtle text-success border border-success-subtle py-1 px-2 fw-bold">
                        {{ toBengaliNumber(item.currentStock) }} পিস
                      </span>
                    </td>
                    <td class="text-end fw-medium text-dark">
                      ৳ {{ toBengaliNumber(formatAmount(item.stockCostValue)) }}
                    </td>
                    <td class="text-end">
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary border-0 p-1 me-1 text-success"
                        title="স্টকে খুঁজুন"
                        @click="$emit('search-stock', item.name)">
                        <i class="bi bi-arrow-right-circle"></i>
                      </button>
                      <span class="badge bg-light text-secondary border">
                        নিরাপদ মজুদ
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  summary: any;
}>();

defineEmits<{
  (e: "switch-tab", tab: "summary" | "stock" | "statement" | "profit_loss" | "parties"): void;
  (e: "view-stock", status: "all" | "in_stock" | "low_stock" | "out_of_stock"): void;
  (e: "search-stock", query: string): void;
}>();

function toBengaliNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === "") return "০";
  const str = String(val);
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return str.replace(/[0-9]/g, (w) => bengaliDigits[+w]);
}

function formatAmount(val: number | string | undefined | null): string {
  const num = Number(val) || 0;
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
</script>

<style scoped>
.card-bar-success {
  border-left: 4px solid #198754 !important;
}
.card-bar-primary {
  border-left: 4px solid #0d6efd !important;
}
.card-bar-info {
  border-left: 4px solid #0dcaf0 !important;
}
.card-bar-warning {
  border-left: 4px solid #ffc107 !important;
}
.card-bar-danger {
  border-left: 4px solid #dc3545 !important;
}
.card-bar-emerald {
  border-left: 4px solid #059669 !important;
}
.stat-icon-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
.rank-badge {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}
.text-emerald {
  color: #059669 !important;
}
.bg-emerald-subtle {
  background-color: #d1fae5 !important;
}
.border-emerald-subtle {
  border-color: #a7f3d0 !important;
}
</style>
