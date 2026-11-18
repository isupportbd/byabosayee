<template>
  <div class="summary-report-component">
    <!-- Top KPI Cards (4 Column Grid) -->
    <div class="row g-3 mb-4">
      <!-- 1. মোট বিক্রয় -->
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

      <!-- 2. মোট ক্রয় -->
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

      <!-- 3. বর্তমান স্টক মজুদ সম্পদ -->
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

      <!-- 4. প্রত্যাশিত সম্ভাব্য লাভ -->
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

    <!-- Comparative Breakdown Rows -->
    <div class="row g-3">
      <!-- Left: বিক্রয় ও আদায় বিবরণী -->
      <div class="col-12 col-lg-6">
        <div class="card border shadow-sm h-100">
          <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between">
            <span class="fw-bold text-dark d-flex align-items-center gap-2">
              <i class="bi bi-cash-stack text-success"></i>
              <span>বিক্রয় ও নগদ আদায় বিশ্লেষণ (নির্বাচিত সময়কাল)</span>
            </span>
            <span class="badge bg-success-subtle text-success border border-success-subtle">ক্যাশফ্লো</span>
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

      <!-- Right: ক্রয় ও দেনা বিবরণী -->
      <div class="col-12 col-lg-6">
        <div class="card border shadow-sm h-100">
          <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between">
            <span class="fw-bold text-dark d-flex align-items-center gap-2">
              <i class="bi bi-truck text-primary"></i>
              <span>মালামাল ক্রয় ও দেনা বিশ্লেষণ (নির্বাচিত সময়কাল)</span>
            </span>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle">খরচ হিসাব</span>
          </div>
          <div class="card-body p-3">
            <ul class="list-group list-group-flush small">
              <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                <span class="text-muted"><i class="bi bi-journal-text me-1"></i>মোট ক্রয় চালান:</span>
                <span class="fw-bold">{{ toBengaliNumber(summary.purchases?.count || 0) }} টি</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                <span class="text-muted"><i class="bi bi-cash-coin me-1"></i>মোট চালানের পণ্যের মূল্য:</span>
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
  </div>
</template>

<script setup lang="ts">
defineProps<{
  summary: any;
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
