<template>
  <div class="capital-list-page">
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

    <!-- Header Actions -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div class="d-flex align-items-center gap-2">
        <div class="header-icon-box bg-emerald text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
          <i class="bi bi-wallet2 fs-5"></i>
        </div>
        <div>
          <h5 class="m-0 fw-bold">মূলধন / পুঁজি বিনিয়োগ তালিকা</h5>
          <small class="text-muted">শেয়ারহোল্ডার ও ব্যবসায় মোট মূলধন জমার বিস্তারিত হিসাব খাতা</small>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <router-link
          to="/accounts/capital/create"
          class="btn btn-sm btn-emerald text-white d-inline-flex align-items-center gap-1.5 px-3 py-1.5 shadow-sm fw-medium">
          <i class="bi bi-plus-circle"></i>
          <span>+নতুন মূলধন যোগ</span>
        </router-link>
        <router-link
          to="/accounts/withdrawals"
          class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1.5 px-3 py-1.5 shadow-sm fw-medium">
          <i class="bi bi-dash-circle"></i>
          <span>উত্তোলন তালিকা</span>
        </router-link>
      </div>
    </div>

    <!-- 1. Top Summary Metric Cards (4 Columns) -->
    <div class="row g-3 mb-4">
      <!-- মোট মূলধন -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-emerald">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">মোট মূলধন জমা</span>
              <div class="stat-icon-circle bg-emerald-subtle text-emerald">
                <i class="bi bi-cash-stack"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-5 fw-bold text-emerald me-1">৳ {{ toBengaliNumber(formatAmount(summary.totalAmount)) }}</span>
            </div>
            <div class="small text-muted mt-1">
              <i class="bi bi-check-circle text-emerald me-1"></i>সর্বমোট সংগৃহীত পুঁজি
            </div>
          </div>
        </div>
      </div>

      <!-- মোট বিনিয়োগকারী -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-primary">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">অংশীদার / বিনিয়োগকারী</span>
              <div class="stat-icon-circle bg-primary-subtle text-primary">
                <i class="bi bi-people-fill"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-5 fw-bold text-primary me-1">{{ toBengaliNumber(summary.shareholdersCount) }}</span>
              <span class="text-muted small">জন</span>
            </div>
            <div class="small text-muted mt-1">
              <i class="bi bi-person-check text-primary me-1"></i>সক্রিয় শেয়ারহোল্ডার
            </div>
          </div>
        </div>
      </div>

      <!-- মোট লেনদেন সংখ্যা -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-purple">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">মোট বিনিয়োগ এন্ট্রি</span>
              <div class="stat-icon-circle bg-purple-subtle text-purple">
                <i class="bi bi-receipt"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-5 fw-bold text-purple me-1">{{ toBengaliNumber(summary.count) }}</span>
              <span class="text-muted small">টি ভাউচার</span>
            </div>
            <div class="small text-muted mt-1">
              <i class="bi bi-file-earmark-text text-purple me-1"></i>মোট মূলধন লেনদেন
            </div>
          </div>
        </div>
      </div>

      <!-- সার্বিক নিট স্থিতি -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-info">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small fw-medium">নিট মূলধন স্থিতি</span>
              <div class="stat-icon-circle bg-info-subtle text-info">
                <i class="bi bi-bank"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline">
              <span class="fs-5 fw-bold text-info me-1">৳ {{ toBengaliNumber(formatAmount(overallStats.netCapital)) }}</span>
            </div>
            <div class="small text-muted mt-1">
              <i class="bi bi-arrow-down-up text-info me-1"></i>উত্তোলন বাদে বর্তমান পুঁজি
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Shareholder Summary & Unified Ledger Card -->
    <div class="card border shadow-sm mb-4">
      <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <div class="stat-icon-circle bg-emerald-subtle text-emerald" style="width: 30px; height: 30px; font-size: 14px;">
            <i class="bi bi-person-lines-fill"></i>
          </div>
          <h6 class="m-0 fw-bold">অংশীদার / শেয়ারহোল্ডারদের সার্বিক লেজার ও স্থিতি</h6>
          <span class="badge bg-emerald-subtle text-emerald border border-emerald-subtle">
            {{ toBengaliNumber(ledgerList.length) }} জন অংশীদার
          </span>
        </div>
        <div class="small text-muted">
          কে কবে কত টাকা মূলধন দিয়েছেন এবং কত টাকা উত্তোলন করেছেন তার চূড়ান্ত স্থিতি
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th class="ps-3" style="width: 50px;">#</th>
                <th>অংশীদার / শেয়ারহোল্ডার</th>
                <th>পদবী / শেয়ার ধরন</th>
                <th class="text-end">মোট জমা মূলধন</th>
                <th class="text-end">মোট উত্তোলন</th>
                <th class="text-end">বর্তমান স্থিতি (ব্যালেন্স)</th>
                <th class="text-center">সর্বশেষ লেনদেন</th>
                <th class="text-center pe-3" style="width: 140px;">স্টেটমেন্ট</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="ledgerList.length === 0">
                <td colspan="8" class="text-center py-4 text-muted small">
                  কোনো শেয়ারহোল্ডারের রেকর্ড পাওয়া যায়নি। কোম্পানি সেটিংসে গিয়ে শেয়ারহোল্ডার যোগ করতে পারেন।
                </td>
              </tr>
              <tr v-for="(sh, idx) in ledgerList" :key="sh.id || idx">
                <td class="ps-3 text-muted small">{{ toBengaliNumber(idx + 1) }}</td>
                <td>
                  <span class="fw-bold text-dark">{{ sh.name }}</span>
                </td>
                <td>
                  <span class="badge bg-secondary-subtle text-secondary border small">{{ sh.ownershipType || 'মালিক' }}</span>
                </td>
                <td class="text-end text-success fw-bold">
                  ৳ {{ toBengaliNumber(formatAmount(sh.totalInvested)) }}
                </td>
                <td class="text-end text-danger fw-bold">
                  ৳ {{ toBengaliNumber(formatAmount(sh.totalWithdrawn)) }}
                </td>
                <td class="text-end fw-bold fs-6" :class="sh.balance >= 0 ? 'text-emerald' : 'text-danger'">
                  ৳ {{ toBengaliNumber(formatAmount(sh.balance)) }}
                </td>
                <td class="text-center text-muted small">
                  {{ sh.lastDate ? toBengaliDate(sh.lastDate) : 'লেনদেন নেই' }}
                </td>
                <td class="text-center pe-3">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-emerald d-inline-flex align-items-center gap-1 py-1 px-2.5 shadow-sm small"
                    title="জমা ও উত্তোলনের প্রতিটি তারিখ সহ পূর্ণাঙ্গ বিবরণী দেখুন"
                    @click="openShareholderStatement(sh)">
                    <i class="bi bi-file-earmark-spreadsheet"></i>
                    <span>লেজার খতিয়ান</span>
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot class="table-light fw-bold" v-if="ledgerList.length > 0">
              <tr>
                <td colspan="3" class="ps-3 text-end text-dark">সর্বমোট মূলধন স্থিতি:</td>
                <td class="text-end text-success">৳ {{ toBengaliNumber(formatAmount(ledgerSummary.grandTotalInvested)) }}</td>
                <td class="text-end text-danger">৳ {{ toBengaliNumber(formatAmount(ledgerSummary.grandTotalWithdrawn)) }}</td>
                <td class="text-end text-emerald fs-6">৳ {{ toBengaliNumber(formatAmount(ledgerSummary.netCapitalBalance)) }}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- 3. Main List Card: Individual Capital Vouchers -->
    <div class="card border shadow-sm">
      <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <h6 class="m-0 fw-bold">মূলধন ভাউচার বিবরণী</h6>
          <span class="badge bg-secondary-subtle text-secondary border">
            {{ toBengaliNumber(capitalsList.length) }} টি রেকর্ড
          </span>
        </div>

        <div class="d-flex align-items-center gap-2 flex-wrap">
          <!-- Filter Tabs by Shareholder -->
          <div class="filter-tabs-wrapper">
            <button
              type="button"
              class="filter-tab-btn"
              :class="{ active: selectedShareholderFilter === 'all' }"
              @click="selectedShareholderFilter = 'all'">
              সকল ({{ toBengaliNumber(capitalsList.length) }})
            </button>
            <button
              v-for="sh in summary.shareholderBreakdown"
              :key="sh.name"
              type="button"
              class="filter-tab-btn"
              :class="{ active: selectedShareholderFilter === sh.name }"
              @click="selectedShareholderFilter = sh.name">
              {{ sh.name }} (৳{{ toBengaliNumber(formatAmount(sh.total)) }})
            </button>
          </div>

          <!-- Date Filters -->
          <div class="d-flex align-items-center gap-1">
            <input
              v-model="startDate"
              type="date"
              class="form-control form-control-sm py-1"
              style="width: 135px;"
              title="শুরুর তারিখ"
              @change="fetchCapitals" />
            <span class="text-muted small">হতে</span>
            <input
              v-model="endDate"
              type="date"
              class="form-control form-control-sm py-1"
              style="width: 135px;"
              title="শেষ তারিখ"
              @change="fetchCapitals" />
            <button
              v-if="startDate || endDate"
              type="button"
              class="btn btn-sm btn-outline-secondary p-1"
              title="তারিখ ফিল্টার মুছুন"
              @click="clearDateFilter">
              <i class="bi bi-x"></i>
            </button>
          </div>

          <!-- Search Input -->
          <div class="position-relative" style="min-width: 200px;">
            <input
              v-model.trim="searchQuery"
              type="text"
              class="form-control form-control-sm ps-4"
              placeholder="নাম, রসিদ বা মন্তব্য খুঁজুন..." />
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
          <div class="spinner-border text-emerald" role="status">
            <span class="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <div class="text-muted small mt-2">মূলধন বিবরণী লোড হচ্ছে...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredCapitals.length === 0" class="text-center py-5">
          <i class="bi bi-wallet2 text-muted fs-1 mb-2 d-block"></i>
          <p class="text-muted mb-2">
            {{ searchQuery || selectedShareholderFilter !== 'all' ? 'অনুসন্ধানের সাথে কোনো মূলধন রেকর্ড মেলেনি।' : 'এখনো কোনো মূলধন বা পুঁজি বিনিয়োগ যোগ করা হয়নি।' }}
          </p>
          <router-link
            to="/accounts/capital/create"
            class="btn btn-sm btn-emerald text-white px-3 py-1 shadow-sm">
            +প্রথম মূলধন যোগ করুন
          </router-link>
        </div>

        <!-- Table View -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th class="ps-3 text-center" style="width: 50px;">#</th>
                <th style="min-width: 105px;">তারিখ</th>
                <th style="min-width: 180px;">বিনিয়োগকারী ও পদবী</th>
                <th style="min-width: 150px;">পেমেন্ট মাধ্যম ও রসিদ</th>
                <th class="text-end" style="min-width: 130px;">টাকার পরিমাণ</th>
                <th style="min-width: 180px;">মন্তব্য / বিবরণ</th>
                <th class="text-end pe-3" style="width: 100px;">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(cap, idx) in filteredCapitals" :key="cap.id">
                <td class="ps-3 text-center text-muted small">
                  {{ toBengaliNumber(idx + 1) }}
                </td>

                <!-- Date -->
                <td>
                  <span class="fw-semibold text-dark">{{ toBengaliDate(cap.date) }}</span>
                </td>

                <!-- Shareholder Name & Ownership -->
                <td>
                  <div class="d-flex align-items-center gap-1.5">
                    <span class="fw-bold text-dark">{{ cap.shareholderName }}</span>
                    <span class="badge rounded-pill bg-emerald-subtle text-emerald border border-emerald-subtle small py-0.5">
                      {{ cap.ownershipType || 'মালিক' }}
                    </span>
                  </div>
                </td>

                <!-- Payment Method & Receipt -->
                <td>
                  <div class="d-flex flex-column">
                    <span class="small fw-semibold text-dark">
                      <i class="bi bi-credit-card me-1 text-muted"></i>{{ cap.paymentMethod || 'নগদ' }}
                    </span>
                    <small v-if="cap.receiptNo" class="text-muted" title="রসিদ নং">
                      রসিদ: {{ cap.receiptNo }}
                    </small>
                    <small v-if="cap.accountDetails" class="text-muted text-truncate" style="max-width: 170px;" :title="cap.accountDetails">
                      {{ cap.accountDetails }}
                    </small>
                  </div>
                </td>

                <!-- Amount -->
                <td class="text-end">
                  <span class="fw-bold fs-6 text-success">
                    ৳ {{ toBengaliNumber(formatAmount(cap.amount)) }}
                  </span>
                </td>

                <!-- Notes -->
                <td>
                  <span class="small text-muted text-truncate d-inline-block" style="max-width: 250px;" :title="cap.notes || '-'">
                    {{ cap.notes || '-' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="text-end pe-3">
                  <div class="d-inline-flex align-items-center gap-1">
                    <router-link
                      :to="`/accounts/capital/create?id=${cap.id}`"
                      class="btn btn-sm btn-outline-primary btn-action-icon"
                      title="সম্পাদন করুন">
                      <i class="bi bi-pencil-square"></i>
                    </router-link>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger btn-action-icon"
                      title="মুছে ফেলুন"
                      @click="confirmDelete(cap)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot class="table-light">
              <tr class="fw-bold">
                <td colspan="4" class="ps-3 text-end text-dark">মোট মূলধন জমা:</td>
                <td class="text-end text-success fs-6">৳ {{ toBengaliNumber(formatAmount(filteredTotal)) }}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="deletingCapital"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom py-2 text-bg-danger">
            <h6 class="modal-title small fw-bold">
              <i class="bi bi-exclamation-triangle-fill me-1"></i>মূলধন মুছে ফেলা
            </h6>
            <button type="button" class="btn-close btn-close-white" @click="deletingCapital = null"></button>
          </div>
          <div class="modal-body text-center py-3">
            <p class="mb-1 text-dark">
              আপনি কি নিশ্চিত যে <strong>{{ deletingCapital.shareholderName }}</strong> এর <strong>৳ {{ toBengaliNumber(formatAmount(deletingCapital.amount)) }}</strong> এর মূলধন রেকর্ডটি মুছে ফেলতে চান?
            </p>
            <small class="text-danger">এই লেনদেন মুছে ফেললে সার্বিক মূলধন স্থিতি থেকে বাদ যাবে।</small>
          </div>
          <div class="modal-footer border-top py-1.5 justify-content-center">
            <button type="button" class="btn btn-sm btn-outline-secondary px-3" @click="deletingCapital = null">
              বাতিল
            </button>
            <button
              type="button"
              class="btn btn-sm btn-danger px-3 d-inline-flex align-items-center gap-1"
              :disabled="deleteLoading"
              @click="executeDelete">
              <span v-if="deleteLoading" class="spinner-border spinner-border-sm"></span>
              <span v-else>হ্যাঁ, মুছুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Shareholder Detailed Statement Modal -->
    <div
      v-if="selectedStatementShareholder"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0,0,0,0.5); z-index: 1060;"
      @click.self="selectedStatementShareholder = null">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom py-2.5 bg-light">
            <div>
              <h6 class="modal-title fw-bold text-dark d-flex align-items-center gap-2 mb-0">
                <i class="bi bi-person-badge text-emerald fs-5"></i>
                <span>{{ selectedStatementShareholder.name }} - বিস্তারিত হিসাব খতিয়ান</span>
              </h6>
              <small class="text-muted">পদবী: {{ selectedStatementShareholder.ownershipType || 'মালিক' }}</small>
            </div>
            <button type="button" class="btn-close" aria-label="Close" @click="selectedStatementShareholder = null"></button>
          </div>
          <div class="modal-body p-3">
            <!-- 3 Mini Metric Cards -->
            <div class="row g-2 mb-3">
              <div class="col-4">
                <div class="p-2.5 rounded bg-success-subtle border border-success-subtle text-center">
                  <div class="small text-success fw-medium">মোট জমা মূলধন</div>
                  <div class="fs-6 fw-bold text-success">৳ {{ toBengaliNumber(formatAmount(selectedStatementShareholder.totalInvested)) }}</div>
                </div>
              </div>
              <div class="col-4">
                <div class="p-2.5 rounded bg-danger-subtle border border-danger-subtle text-center">
                  <div class="small text-danger fw-medium">মোট উত্তোলন</div>
                  <div class="fs-6 fw-bold text-danger">৳ {{ toBengaliNumber(formatAmount(selectedStatementShareholder.totalWithdrawn)) }}</div>
                </div>
              </div>
              <div class="col-4">
                <div class="p-2.5 rounded bg-emerald-subtle border border-emerald-subtle text-center">
                  <div class="small text-emerald fw-medium">বর্তমান অবশিষ্ট স্থিতি</div>
                  <div class="fs-6 fw-bold text-emerald">৳ {{ toBengaliNumber(formatAmount(selectedStatementShareholder.balance)) }}</div>
                </div>
              </div>
            </div>

            <!-- Transactions Table -->
            <div class="table-responsive border rounded">
              <table class="table table-sm table-hover align-middle mb-0">
                <thead class="table-light small">
                  <tr>
                    <th class="ps-3">তারিখ</th>
                    <th>লেনদেনের ধরন</th>
                    <th>মাধ্যম ও রসিদ/ভাউচার</th>
                    <th class="text-end">জমা (৳)</th>
                    <th class="text-end">উত্তোলন (৳)</th>
                    <th class="pe-3">বিবরণ / মন্তব্য</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!selectedStatementShareholder.transactions || selectedStatementShareholder.transactions.length === 0">
                    <td colspan="6" class="text-center py-4 text-muted small">
                      কোনো লেনদেন রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                  <tr v-for="tx in selectedStatementShareholder.transactions" :key="tx.type + tx.id">
                    <td class="ps-3 fw-semibold small text-nowrap">{{ toBengaliDate(tx.date) }}</td>
                    <td>
                      <span
                        class="badge rounded-pill"
                        :class="tx.type === 'deposit' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'">
                        <i :class="tx.type === 'deposit' ? 'bi bi-plus-circle' : 'bi bi-dash-circle'" class="me-1"></i>
                        {{ tx.type === 'deposit' ? 'মূলধন জমা' : 'টাকা উত্তোলন' }}
                      </span>
                    </td>
                    <td class="small">
                      <div>{{ tx.paymentMethod || 'নগদ' }}</div>
                      <small v-if="tx.reference" class="text-muted">নং: {{ tx.reference }}</small>
                    </td>
                    <td class="text-end text-success fw-bold small">
                      {{ tx.type === 'deposit' ? `+ ৳ ${toBengaliNumber(formatAmount(tx.amount))}` : '-' }}
                    </td>
                    <td class="text-end text-danger fw-bold small">
                      {{ tx.type === 'withdrawal' ? `- ৳ ${toBengaliNumber(formatAmount(tx.amount))}` : '-' }}
                    </td>
                    <td class="small text-muted pe-3">{{ tx.notes || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer py-2 bg-light">
            <button type="button" class="btn btn-sm btn-secondary" @click="selectedStatementShareholder = null">
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

const loading = ref(false);
const capitalsList = ref<any[]>([]);
const summary = ref<any>({
  totalAmount: 0,
  count: 0,
  shareholdersCount: 0,
  shareholderBreakdown: []
});
const overallStats = ref<any>({
  totalCapital: 0,
  totalWithdrawn: 0,
  netCapital: 0
});

// Shareholder Ledger State
const ledgerList = ref<any[]>([]);
const ledgerSummary = ref<any>({
  grandTotalInvested: 0,
  grandTotalWithdrawn: 0,
  netCapitalBalance: 0,
  totalShareholders: 0
});
const selectedStatementShareholder = ref<any>(null);

function openShareholderStatement(sh: any) {
  selectedStatementShareholder.value = sh;
}

async function fetchLedger() {
  try {
    const res = await axios.get("/api/accounts/ledger");
    ledgerList.value = res.data?.data || [];
    ledgerSummary.value = res.data?.summary || {
      grandTotalInvested: 0,
      grandTotalWithdrawn: 0,
      netCapitalBalance: 0,
      totalShareholders: 0
    };
  } catch (e) {
    console.warn("Failed to fetch shareholder ledger:", e);
  }
}

const selectedShareholderFilter = ref("all");
const searchQuery = ref("");
const startDate = ref("");
const endDate = ref("");

const deletingCapital = ref<any>(null);
const deleteLoading = ref(false);

const toast = reactive({
  show: false,
  message: "",
  type: "success"
});

function showToast(message: string, type: "success" | "danger" | "warning" | "info" = "success") {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 4000);
}

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

function toBengaliDate(dateStr: string): string {
  if (!dateStr) return "-";
  return toBengaliNumber(dateStr);
}

async function fetchCapitals() {
  loading.value = true;
  try {
    const params: any = {};
    if (startDate.value) params.startDate = startDate.value;
    if (endDate.value) params.endDate = endDate.value;

    const res = await axios.get("/api/accounts/capitals", { params });
    capitalsList.value = res.data?.data || [];
    summary.value = res.data?.summary || {
      totalAmount: 0,
      count: 0,
      shareholdersCount: 0,
      shareholderBreakdown: []
    };
  } catch (err: any) {
    showToast(err.response?.data?.message || "মূলধন তথ্য লোড করতে ব্যর্থ হয়েছে", "danger");
  } finally {
    loading.value = false;
  }
}

async function fetchOverallSummary() {
  try {
    const res = await axios.get("/api/accounts/summary");
    overallStats.value = res.data?.data || {
      totalCapital: 0,
      totalWithdrawn: 0,
      netCapital: 0
    };
  } catch (err) {
    console.warn("Failed to load overall accounts summary:", err);
  }
}

function clearDateFilter() {
  startDate.value = "";
  endDate.value = "";
  fetchCapitals();
}

const filteredCapitals = computed(() => {
  let list = capitalsList.value;

  if (selectedShareholderFilter.value !== "all") {
    list = list.filter((item) => item.shareholderName === selectedShareholderFilter.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (item) =>
        item.shareholderName.toLowerCase().includes(q) ||
        (item.receiptNo && item.receiptNo.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        (item.paymentMethod && item.paymentMethod.toLowerCase().includes(q))
    );
  }

  return list;
});

const filteredTotal = computed(() => {
  return filteredCapitals.value.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
});

function confirmDelete(cap: any) {
  deletingCapital.value = cap;
}

async function executeDelete() {
  if (!deletingCapital.value) return;
  deleteLoading.value = true;
  try {
    const res = await axios.delete(`/api/accounts/capitals/${deletingCapital.value.id}`);
    showToast(res.data?.message || "মূলধন রেকর্ড সফলভাবে মুছে ফেলা হয়েছে", "success");
    deletingCapital.value = null;
    await Promise.all([fetchCapitals(), fetchOverallSummary(), fetchLedger()]);
  } catch (err: any) {
    showToast(err.response?.data?.message || "মুছে ফেলতে ব্যর্থ হয়েছে", "danger");
  } finally {
    deleteLoading.value = false;
  }
}

onMounted(() => {
  fetchCapitals();
  fetchOverallSummary();
  fetchLedger();
});
</script>

<style scoped>
.btn-emerald {
  background-color: #059669;
  border-color: #059669;
}
.btn-emerald:hover {
  background-color: #047857;
  border-color: #047857;
}
.btn-outline-emerald {
  color: #059669;
  border-color: #059669;
}
.btn-outline-emerald:hover {
  background-color: #059669;
  color: #ffffff;
}
.text-emerald {
  color: #059669 !important;
}
.bg-emerald {
  background-color: #059669 !important;
}
.bg-emerald-subtle {
  background-color: rgba(5, 150, 105, 0.1) !important;
}
.border-emerald-subtle {
  border-color: rgba(5, 150, 105, 0.25) !important;
}

.text-purple {
  color: #7c3aed !important;
}
.bg-purple-subtle {
  background-color: rgba(124, 58, 237, 0.1) !important;
}

.card-bar-emerald {
  border-top: 3px solid #059669 !important;
}
.card-bar-primary {
  border-top: 3px solid #0d6efd !important;
}
.card-bar-purple {
  border-top: 3px solid #7c3aed !important;
}
.card-bar-info {
  border-top: 3px solid #0dcaf0 !important;
}

.stat-icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.filter-tabs-wrapper {
  display: inline-flex;
  background: #f1f5f9;
  padding: 2px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}
.filter-tab-btn {
  border: none;
  background: transparent;
  padding: 4px 10px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
  border-radius: 4px;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.filter-tab-btn.active {
  background: #ffffff;
  color: #059669;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-action-icon {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}
</style>
