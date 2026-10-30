<template>
  <div class="dashboard-page">
    <Toast ref="toastRef" />

    <div class="dashboard-content">

      <!-- ১. সুপারএডমিন ড্যাশবোর্ড কার্ডস (শুধুমাত্র সুপারএডমিন দেখতে পাবেন) -->
      <div v-if="isSuperAdmin" class="row g-3 mb-3">
        <!-- ১. কোম্পানী কার্ড -->
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="card border shadow-sm h-100 merchant-card card-bar-primary">
            <div class="card-body d-flex flex-column justify-content-between p-3">
              <!-- Top: Icon + Title + Actions -->
              <div class="d-flex justify-content-between align-items-center mb-2 gap-2 flex-wrap">
                <div class="d-flex align-items-center min-w-0">
                  <div class="card-icon-box text-primary me-2">
                    <i class="bi bi-buildings"></i>
                  </div>
                  <div class="text-truncate">
                    <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">কোম্পানী</h5>
                    <span class="text-muted small">Company</span>
                  </div>
                </div>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-0.5 small text-nowrap flex-shrink-0"
                  @click="openCreateModal">
                  +যোগ করুন
                </button>
              </div>

              <!-- Stat Value & Bottom Corner View Button -->
              <div class="py-2 d-flex justify-content-between align-items-end gap-2">
                <div class="min-w-0">
                  <div class="d-flex align-items-baseline">
                    <span class="stat-value me-2 text-primary">{{ toBengaliNumber(companyCount) }}</span>
                    <span class="text-muted small">টি কোম্পানী</span>
                  </div>
                  <p class="text-muted small mb-0 mt-1 text-truncate">
                    <i class="bi bi-building-check text-primary me-1"></i>কোম্পানী এডমিন ও ব্যবস্থাপনা
                  </p>
                </div>
                <router-link
                  to="/company-admins"
                  class="view-icon-btn text-primary text-decoration-none flex-shrink-0"
                  title="তালিকা দেখুন">
                  <i class="bi bi-eye"></i>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- ২. সেটিংস (গ্লোবাল সেটিংস) -->
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="card border shadow-sm h-100 merchant-card card-bar-secondary">
            <div class="card-body d-flex flex-column justify-content-between p-3">
              <!-- Top: Icon + Title -->
              <div class="d-flex justify-content-between align-items-center mb-2 gap-2 flex-wrap">
                <div class="d-flex align-items-center min-w-0">
                  <div class="card-icon-box text-secondary me-2">
                    <i class="bi bi-gear-wide-connected"></i>
                  </div>
                  <div class="text-truncate">
                    <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">সেটিংস</h5>
                    <span class="text-muted small">Global Settings</span>
                  </div>
                </div>
              </div>

              <!-- Stat Value & Bottom Corner View Button -->
              <div class="py-2 d-flex justify-content-between align-items-end gap-2">
                <div class="min-w-0">
                  <div class="d-flex align-items-baseline">
                    <span class="stat-value me-2 text-secondary">গ্লোবাল</span>
                    <span class="text-muted small">সেটিংস</span>
                  </div>
                  <p class="text-muted small mb-0 mt-1 text-truncate">
                    <i class="bi bi-sliders text-secondary me-1"></i>সিস্টেম ও গ্লোবাল কনফিগারেশন
                  </p>
                </div>
                <router-link
                  to="/settings"
                  class="view-icon-btn text-secondary text-decoration-none flex-shrink-0"
                  title="সেটিংস দেখুন">
                  <i class="bi bi-eye"></i>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- ৩. স্টোরেজ (স্টোরেজ ম্যানেজমেন্ট) -->
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="card border shadow-sm h-100 merchant-card card-bar-info">
            <div class="card-body d-flex flex-column justify-content-between p-3">
              <!-- Top: Icon + Title -->
              <div class="d-flex justify-content-between align-items-center mb-2 gap-2 flex-wrap">
                <div class="d-flex align-items-center min-w-0">
                  <div class="card-icon-box text-info me-2">
                    <i class="bi bi-hdd-network"></i>
                  </div>
                  <div class="text-truncate">
                    <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">স্টোরেজ</h5>
                    <span class="text-muted small">Storage & Backup</span>
                  </div>
                </div>
              </div>

              <!-- Stat Value & Bottom Corner View Button -->
              <div class="py-2 d-flex justify-content-between align-items-end gap-2">
                <div class="min-w-0">
                  <div class="d-flex align-items-baseline">
                    <span class="stat-value me-2 text-info">{{ dbSizePretty || 'লোড হচ্ছে...' }}</span>
                    <span class="text-muted small">ডাটাবেজ</span>
                  </div>
                  <p class="text-muted small mb-0 mt-1 text-truncate">
                    <i class="bi bi-database-check text-info me-1"></i>PostgreSQL ব্যাকআপ ও রিস্টোর
                  </p>
                </div>
                <router-link
                  to="/storage"
                  class="view-icon-btn text-info text-decoration-none flex-shrink-0"
                  title="স্টোরেজ ও ব্যাকআপ দেখুন">
                  <i class="bi bi-eye"></i>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ২. কোম্পানী এডমিন ড্যাশবোর্ড (কোম্পানী লগইন করলে ব্যবসায়িক ও ইনভেন্টরি হাব দেখাবে) -->
      <div v-else-if="isCompanyAdmin" class="company-dashboard-section mb-4">
        <!-- ১. ক্রয়, মূল্য নির্ধারণ, বিক্রয় ও মজুদ কার্ডস - ৪ কলাম লেআউট -->
        <div class="row g-3 mb-3">
          <!-- ১. ক্রয় -->
          <div class="col-12 col-sm-6 col-lg-3 d-flex">
            <div class="card border shadow-sm w-100 merchant-card card-bar-primary">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2 gap-1.5 flex-nowrap">
                  <div class="d-flex align-items-center min-w-0">
                    <div class="card-icon-box text-primary me-2">
                      <i class="bi bi-cart-check"></i>
                    </div>
                    <div class="text-truncate">
                      <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">ক্রয়</h5>
                    </div>
                  </div>
                  <router-link
                    to="/purchases?view=form"
                    class="btn btn-sm btn-outline-primary rounded-pill px-2 py-0.5 small text-nowrap flex-shrink-0 text-decoration-none">
                    +নতুন ক্রয়
                  </router-link>
                </div>
                <div class="d-flex justify-content-between align-items-end gap-2 pt-1">
                  <div class="min-w-0">
                    <div class="d-flex align-items-baseline">
                      <span class="stat-value me-1 text-primary">{{ toBengaliNumber(inventoryStats.purchases.totalAmount) }}</span>
                      <span class="text-muted small">৳ মোট ক্রয়</span>
                    </div>
                    <p class="text-muted small mb-0 mt-1 text-truncate">
                      <i class="bi bi-receipt text-primary me-1"></i>{{ toBengaliNumber(inventoryStats.purchases.count) }} টি চালানে মাল গ্রহণ
                    </p>
                  </div>
                  <router-link
                    to="/purchases?view=list"
                    class="view-icon-btn text-primary flex-shrink-0 text-decoration-none"
                    title="ক্রয় তালিকা দেখুন">
                    <i class="bi bi-eye"></i>
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- ২. মূল্য নির্ধারণ (ক্রয়ের পরে কার্ড) -->
          <div class="col-12 col-sm-6 col-lg-3 d-flex">
            <div class="card border shadow-sm w-100 merchant-card card-bar-purple">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2 gap-1.5 flex-nowrap">
                  <div class="d-flex align-items-center min-w-0">
                    <div class="card-icon-box text-purple me-2">
                      <i class="bi bi-tags-fill"></i>
                    </div>
                    <div class="text-truncate">
                      <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">মূল্য নির্ধারণ</h5>
                    </div>
                  </div>
                  <router-link
                    to="/pricing"
                    class="btn btn-sm btn-outline-purple rounded-pill px-2 py-0.5 small text-nowrap flex-shrink-0 text-decoration-none">
                    +মূল্য নির্ধারণ
                  </router-link>
                </div>
                <div class="d-flex justify-content-between align-items-end gap-2 pt-1">
                  <div class="min-w-0">
                    <div class="d-flex align-items-baseline">
                      <span class="stat-value me-1 text-purple">{{ toBengaliNumber(inventoryStats.items.count) }}</span>
                      <span class="text-muted small">টি পণ্যের বিক্রয়মূল্য</span>
                    </div>
                    <p class="text-muted small mb-0 mt-1 text-truncate">
                      <i class="bi bi-cash-stack text-purple me-1"></i>ক্রয়মূল্যের ওপর মার্জিন সেট
                    </p>
                  </div>
                  <router-link
                    to="/pricing"
                    class="view-icon-btn text-purple flex-shrink-0 text-decoration-none"
                    title="মূল্য নির্ধারণ তালিকা দেখুন">
                    <i class="bi bi-eye"></i>
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- ৩. বিক্রয় -->
          <div class="col-12 col-sm-6 col-lg-3 d-flex">
            <div class="card border shadow-sm w-100 merchant-card card-bar-success">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2 gap-1.5 flex-nowrap">
                  <div class="d-flex align-items-center min-w-0">
                    <div class="card-icon-box text-success me-2">
                      <i class="bi bi-cash-coin"></i>
                    </div>
                    <div class="text-truncate">
                      <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">বিক্রয়</h5>
                    </div>
                  </div>
                  <router-link
                    to="/sales"
                    class="btn btn-sm btn-outline-success rounded-pill px-2 py-0.5 small text-nowrap flex-shrink-0 text-decoration-none">
                    +নতুন বিক্রয়
                  </router-link>
                </div>
                <div class="d-flex justify-content-between align-items-end gap-2 pt-1">
                  <div class="min-w-0">
                    <div class="d-flex align-items-baseline">
                      <span class="stat-value me-1 text-success">{{ toBengaliNumber(inventoryStats.sales.totalAmount) }}</span>
                      <span class="text-muted small">৳ মোট বিক্রয়</span>
                    </div>
                    <p class="text-muted small mb-0 mt-1 text-truncate">
                      <i class="bi bi-receipt-cutoff text-success me-1"></i>{{ toBengaliNumber(inventoryStats.sales.count) }} টি বিক্রয় চালান
                    </p>
                  </div>
                  <router-link
                    to="/sales-list"
                    class="view-icon-btn text-success flex-shrink-0 text-decoration-none"
                    title="বিক্রয় তালিকা দেখুন">
                    <i class="bi bi-eye"></i>
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- ৪. মজুদ / স্টক -->
          <div class="col-12 col-sm-6 col-lg-3 d-flex">
            <div class="card border shadow-sm w-100 merchant-card card-bar-info">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2 gap-1.5 flex-nowrap">
                  <div class="d-flex align-items-center min-w-0">
                    <div class="card-icon-box text-info me-2">
                      <i class="bi bi-boxes"></i>
                    </div>
                    <div class="text-truncate">
                      <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">মজুদ / স্টক</h5>
                    </div>
                  </div>
                  <router-link
                    to="/stock"
                    class="btn btn-sm btn-outline-info rounded-pill px-2.5 py-0.5 small text-nowrap flex-shrink-0 text-decoration-none">
                    বিস্তারিত
                  </router-link>
                </div>
                <div class="d-flex justify-content-between align-items-end gap-2 pt-1">
                  <div class="min-w-0">
                    <div class="d-flex align-items-baseline">
                      <span class="stat-value me-1 text-info">{{ toBengaliNumber(inventoryStats.items.totalStock) }}</span>
                      <span class="text-muted small">পিস বর্তমান মজুদ</span>
                    </div>
                    <p class="text-muted small mb-0 mt-1 text-truncate">
                      <i class="bi bi-currency-dollar text-info me-1"></i>মূল্য: {{ toBengaliNumber(inventoryStats.items.stockValue) }} ৳
                    </p>
                  </div>
                  <router-link to="/stock" class="view-icon-btn text-info flex-shrink-0 text-decoration-none" title="স্টক বিবরণ দেখুন"><i class="bi bi-eye"></i></router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ২. ক্যাটালগ কার্ডস (পণ্য, ব্রান্ড নেম, বার কোড, কাস্টমার লিস্ট) - ৪ কলাম লেআউট -->
        <div class="row g-3 mb-3">
          <!-- ১. আইটেম / পণ্য -->
          <div class="col-12 col-sm-6 col-lg-3 d-flex">
            <div class="card border shadow-sm w-100 merchant-card card-bar-warning">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2 gap-1.5 flex-nowrap">
                  <div class="d-flex align-items-center min-w-0">
                    <div class="card-icon-box text-warning me-2">
                      <i class="bi bi-tag-fill"></i>
                    </div>
                    <div class="text-truncate">
                      <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">পণ্য</h5>
                    </div>
                  </div>
                  <router-link
                    to="/items?view=form"
                    class="btn btn-sm btn-outline-warning rounded-pill px-2 py-0.5 small text-nowrap flex-shrink-0 text-decoration-none">
                    +নতুন পণ্য
                  </router-link>
                </div>
                <div class="d-flex justify-content-between align-items-end gap-2 pt-1">
                  <div class="min-w-0">
                    <div class="d-flex align-items-baseline">
                      <span class="stat-value me-2 text-warning">{{ toBengaliNumber(inventoryStats.items.count) }}</span>
                      <span class="text-muted small">টি পণ্য নিবন্ধিত</span>
                    </div>
                    <p class="text-muted small mb-0 mt-1 text-truncate">
                      <i class="bi bi-palette text-warning me-1"></i>ক্যাটাগরি, সাইজ ও কালার
                    </p>
                  </div>
                  <router-link
                    to="/items?view=list"
                    class="view-icon-btn text-warning flex-shrink-0 text-decoration-none"
                    title="পণ্য তালিকা দেখুন">
                    <i class="bi bi-eye"></i>
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- ২. ব্রান্ড নেম -->
          <div class="col-12 col-sm-6 col-lg-3 d-flex">
            <div class="card border shadow-sm w-100 merchant-card card-bar-secondary">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2 gap-1.5 flex-nowrap">
                  <div class="d-flex align-items-center min-w-0">
                    <div class="card-icon-box text-secondary me-2">
                      <i class="bi bi-bookmark-star-fill"></i>
                    </div>
                    <div class="text-truncate">
                      <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">ব্রান্ড নেম</h5>
                    </div>
                  </div>
                  <router-link
                    to="/brands?view=form"
                    class="btn btn-sm btn-outline-secondary rounded-pill px-2 py-0.5 small text-nowrap flex-shrink-0 text-decoration-none">
                    +নতুন ব্রান্ড
                  </router-link>
                </div>
                <div class="d-flex justify-content-between align-items-end gap-2 pt-1">
                  <div class="min-w-0">
                    <div class="d-flex align-items-baseline">
                      <span class="stat-value me-2 text-secondary">{{ toBengaliNumber(inventoryStats.brands.count) }}</span>
                      <span class="text-muted small">টি ব্রান্ড</span>
                    </div>
                    <p class="text-muted small mb-0 mt-1 text-truncate">
                      <i class="bi bi-patch-check text-secondary me-1"></i>কোম্পানীর ব্রান্ডসমূহ
                    </p>
                  </div>
                  <router-link
                    to="/brands?view=list"
                    class="view-icon-btn text-secondary flex-shrink-0 text-decoration-none d-inline-flex align-items-center justify-content-center"
                    title="ব্রান্ড তালিকা দেখুন">
                    <i class="bi bi-eye"></i>
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- ৩. বার কোড (ব্রান্ড নেম এর পরে কার্ড) -->
          <div class="col-12 col-sm-6 col-lg-3 d-flex">
            <div class="card border shadow-sm w-100 merchant-card card-bar-dark">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2 gap-1.5 flex-nowrap">
                  <div class="d-flex align-items-center min-w-0">
                    <div class="card-icon-box text-dark me-2">
                      <i class="bi bi-upc-scan"></i>
                    </div>
                    <div class="text-truncate">
                      <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">বার কোড</h5>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-dark rounded-pill px-2 py-0.5 small text-nowrap flex-shrink-0"
                    @click="openBarcodeModal">
                    +বার কোড
                  </button>
                </div>
                <div class="d-flex justify-content-between align-items-end gap-2 pt-1">
                  <div class="min-w-0">
                    <div class="d-flex align-items-baseline">
                      <span class="stat-value me-1 text-dark">{{ toBengaliNumber(inventoryStats.items.count) }}</span>
                      <span class="text-muted small">টি কোড জেনারেটেড</span>
                    </div>
                    <p class="text-muted small mb-0 mt-1 text-truncate">
                      <i class="bi bi-printer text-dark me-1"></i>স্টিকার ও লেবেল প্রিন্ট
                    </p>
                  </div>
                  <button
                    type="button"
                    class="view-icon-btn text-dark flex-shrink-0"
                    title="বার কোড প্রিন্ট ও তালিকা দেখুন"
                    @click="openBarcodeModal">
                    <i class="bi bi-eye"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ৪. কাস্টমার লিস্ট -->
          <div class="col-12 col-sm-6 col-lg-3 d-flex">
            <div class="card border shadow-sm w-100 merchant-card card-bar-teal">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2 gap-1.5 flex-nowrap">
                  <div class="d-flex align-items-center min-w-0">
                    <div class="card-icon-box text-teal me-2">
                      <i class="bi bi-people-fill"></i>
                    </div>
                    <div class="text-truncate">
                      <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">কাস্টমার লিস্ট</h5>
                    </div>
                  </div>
                  <router-link
                    to="/customers?view=form"
                    class="btn btn-sm btn-outline-teal rounded-pill px-2 py-0.5 small text-nowrap flex-shrink-0 text-decoration-none">
                    +কাস্টমার
                  </router-link>
                </div>
                <div class="d-flex justify-content-between align-items-end gap-2 pt-1">
                  <div class="min-w-0">
                    <div class="d-flex align-items-baseline">
                      <span class="stat-value me-2 text-teal">{{ toBengaliNumber(inventoryStats.customers?.count || 0) }}</span>
                      <span class="text-muted small">জন কাস্টমার</span>
                    </div>
                    <p class="text-muted small mb-0 mt-1 text-truncate">
                      <i class="bi bi-person-check text-teal me-1"></i>নিয়মিত খদ্দের ও পার্টি
                    </p>
                  </div>
                  <router-link
                    to="/customers?view=list"
                    class="view-icon-btn text-teal flex-shrink-0 text-decoration-none d-inline-flex align-items-center justify-content-center"
                    title="কাস্টমার তালিকা দেখুন">
                    <i class="bi bi-eye"></i>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ৩. পার্টনার, একাউন্টস, রিপোর্টস ও সেটিংস কার্ডস (সব শেষে কার্ড হবে সেটিংস) - ৪ কলাম লেআউট -->
        <div class="row g-3">
          <!-- ১. বিক্রেতা (সাপ্লায়ার ও প্রস্তুতকারক) -->
          <div class="col-12 col-sm-6 col-lg-3 d-flex">
            <div class="card border shadow-sm w-100 merchant-card card-bar-danger">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2 gap-1.5 flex-nowrap">
                  <div class="d-flex align-items-center min-w-0">
                    <div class="card-icon-box text-danger me-2">
                      <i class="bi bi-truck"></i>
                    </div>
                    <div class="text-truncate">
                      <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">বিক্রেতা</h5>
                    </div>
                  </div>
                  <router-link
                    to="/vendors?view=form"
                    class="btn btn-sm btn-outline-danger rounded-pill px-2 py-0.5 small text-nowrap flex-shrink-0 text-decoration-none">
                    +বিক্রেতা
                  </router-link>
                </div>
                <div class="d-flex justify-content-between align-items-end gap-2 pt-1">
                  <div class="min-w-0">
                    <div class="d-flex align-items-baseline">
                      <span class="stat-value me-2 text-danger">{{ toBengaliNumber(inventoryStats.suppliers.count + inventoryStats.manufacturers.count) }}</span>
                      <span class="text-muted small">জন বিক্রেতা</span>
                    </div>
                    <p class="text-muted small mb-0 mt-1 text-truncate" title="সাপ্লায়ার ও কারখানা পার্টনার">
                      <i class="bi bi-truck text-danger me-1"></i>{{ toBengaliNumber(inventoryStats.suppliers.count) }} জন সাপ্লায়ার ও {{ toBengaliNumber(inventoryStats.manufacturers.count) }} টি কারখানা
                    </p>
                  </div>
                  <router-link
                    to="/vendors?view=list"
                    class="view-icon-btn text-danger flex-shrink-0 text-decoration-none d-inline-flex align-items-center justify-content-center"
                    title="বিক্রেতা তালিকা দেখুন">
                    <i class="bi bi-eye"></i>
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- ২. একাউন্টস -->
          <div class="col-12 col-sm-6 col-lg-3 d-flex">
            <div class="card border shadow-sm w-100 merchant-card card-bar-emerald">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2 gap-1.5 flex-nowrap">
                  <div class="d-flex align-items-center min-w-0">
                    <div class="card-icon-box text-emerald me-2">
                      <i class="bi bi-wallet2"></i>
                    </div>
                    <div class="text-truncate">
                      <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">একাউন্টস</h5>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-emerald rounded-pill px-2 py-0.5 small text-nowrap flex-shrink-0"
                    @click="openAccountsModal">
                    +হিসাব খাতা
                  </button>
                </div>
                <div class="d-flex justify-content-between align-items-end gap-2 pt-1">
                  <div class="min-w-0">
                    <div class="d-flex align-items-baseline">
                      <span class="stat-value me-1 text-emerald">
                        {{ toBengaliNumber(Math.abs(inventoryStats.sales.totalAmount - inventoryStats.purchases.totalAmount).toFixed(0)) }}
                      </span>
                      <span class="text-muted small">৳ নিট ব্যালেন্স</span>
                    </div>
                    <p class="text-muted small mb-0 mt-1 text-truncate">
                      <i class="bi bi-cash-stack text-emerald me-1"></i>আয়-ব্যয়, ক্যাশ ও লেজার
                    </p>
                  </div>
                  <button
                    type="button"
                    class="view-icon-btn text-emerald flex-shrink-0"
                    title="একাউন্টস বিবরণী দেখুন"
                    @click="openAccountsModal">
                    <i class="bi bi-eye"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ৩. রিপোর্টস -->
          <div class="col-12 col-sm-6 col-lg-3 d-flex">
            <div class="card border shadow-sm w-100 merchant-card card-bar-indigo">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2 gap-1.5 flex-nowrap">
                  <div class="d-flex align-items-center min-w-0">
                    <div class="card-icon-box text-indigo me-2">
                      <i class="bi bi-file-earmark-bar-graph-fill"></i>
                    </div>
                    <div class="text-truncate">
                      <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">রিপোর্টস</h5>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-indigo rounded-pill px-2 py-0.5 small text-nowrap flex-shrink-0"
                    @click="openReportsModal">
                    +বিবরণী
                  </button>
                </div>
                <div class="d-flex justify-content-between align-items-end gap-2 pt-1">
                  <div class="min-w-0">
                    <div class="d-flex align-items-baseline">
                      <span class="stat-value me-1 text-indigo">{{ toBengaliNumber(inventoryStats.purchases.count + inventoryStats.sales.count) }}</span>
                      <span class="text-muted small">টি মোট লেনদেন</span>
                    </div>
                    <p class="text-muted small mb-0 mt-1 text-truncate">
                      <i class="bi bi-pie-chart text-indigo me-1"></i>লাভ-ক্ষতি ও স্টক অডিট
                    </p>
                  </div>
                  <button
                    type="button"
                    class="view-icon-btn text-indigo flex-shrink-0"
                    title="রিপোর্টস প্যানেল দেখুন"
                    @click="openReportsModal">
                    <i class="bi bi-eye"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ৪. সেটিংস (সব শেষে কার্ড হবে সেটিংস) -->
          <div class="col-12 col-sm-6 col-lg-3 d-flex">
            <div class="card border shadow-sm w-100 merchant-card card-bar-secondary">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2 gap-1.5 flex-nowrap">
                  <div class="d-flex align-items-center min-w-0">
                    <div class="card-icon-box text-secondary me-2">
                      <i class="bi bi-gear-wide-connected"></i>
                    </div>
                    <div class="text-truncate">
                      <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">সেটিংস</h5>
                    </div>
                  </div>
                  <router-link
                    to="/company-settings"
                    class="btn btn-sm btn-outline-secondary rounded-pill px-2 py-0.5 small text-nowrap flex-shrink-0 text-decoration-none">
                    +সেটিংস
                  </router-link>
                </div>
                <div class="d-flex justify-content-between align-items-end gap-2 pt-1">
                  <div class="min-w-0">
                    <div class="d-flex align-items-baseline">
                      <span class="stat-value me-1 text-secondary">কোম্পানী</span>
                      <span class="text-muted small">সেটিংস ও কনফিগারেশন</span>
                    </div>
                    <p class="text-muted small mb-0 mt-1 text-truncate">
                      <i class="bi bi-sliders text-secondary me-1"></i>প্রোফাইল, ব্রাঞ্চ ও চালান সেটিংস
                    </p>
                  </div>
                  <router-link
                    to="/company-settings"
                    class="view-icon-btn text-secondary flex-shrink-0 text-decoration-none"
                    title="কোম্পানী সেটিংস দেখুন">
                    <i class="bi bi-eye"></i>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- নতুন কোম্পানী এডমিন যোগ করার মডাল (শুধুমাত্র ৪টি ফিল্ড) -->
    <div
      v-if="showModal"
      class="modal fade show d-block modal-backdrop-custom"
      tabindex="-1"
      style="z-index: 1060;"
      @click.self="closeModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow border-0">
          <div class="modal-header border-bottom py-2">
            <h6 class="modal-title fw-bold m-0">
              <i class="bi bi-building-add text-primary me-2"></i>নতুন কোম্পানী এডমিন
            </h6>
            <button type="button" class="btn-close" aria-label="Close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="submitForm">
            <div class="modal-body">
              <div v-if="formError" class="alert alert-danger py-2 small mb-3">
                <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ formError }}
              </div>

              <!-- কোম্পানীর নাম -->
              <div class="mb-3">
                <label for="companyName" class="form-label fw-medium small mb-1">
                  কোম্পানীর নাম <span class="text-danger">*</span>
                </label>
                <input
                  id="companyName"
                  v-model.trim="form.companyName"
                  type="text"
                  class="form-control form-control-sm"
                  placeholder="কোম্পানীর নাম লিখুন"
                  required />
              </div>

              <!-- ইমেইল -->
              <div class="mb-3">
                <label for="email" class="form-label fw-medium small mb-1">
                  ইমেইল <span class="text-danger">*</span>
                </label>
                <input
                  id="email"
                  v-model.trim="form.email"
                  type="email"
                  class="form-control form-control-sm"
                  placeholder="admin@company.com"
                  required />
                <div class="form-text small" style="font-size: 0.75rem;">ইমেইল অবশ্যই ইউনিক হতে হবে।</div>
              </div>

              <!-- মোবাইল -->
              <div class="mb-3">
                <label for="mobile" class="form-label fw-medium small mb-1">
                  মোবাইল <span class="text-danger">*</span>
                </label>
                <div class="position-relative">
                  <input
                    id="mobile"
                    v-model.trim="form.mobile"
                    type="tel"
                    maxlength="11"
                    class="form-control form-control-sm pe-4"
                    :class="{
                      'mobile-valid': isAdminMobileValid,
                      'mobile-invalid': (adminMobileTouched || form.mobile.length === 11) && form.mobile && !isAdminMobileValid
                    }"
                    placeholder="01XXXXXXXXX"
                    @input="onAdminMobileInput"
                    @blur="adminMobileTouched = true"
                    required />
                  <span
                    v-if="isAdminMobileValid"
                    class="mobile-check-icon"
                    title="সঠিক মোবাইল নম্বর">
                    <i class="bi bi-check-circle-fill"></i>
                  </span>
                </div>
                <div
                  v-if="(adminMobileTouched || form.mobile.length === 11) && form.mobile && !isAdminMobileValid"
                  class="text-danger small mt-1"
                  style="font-size: 0.72rem;">
                  সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)
                </div>
              </div>

              <!-- পাসওয়ার্ড -->
              <div class="mb-3">
                <label for="password" class="form-label fw-medium small mb-1">
                  পাসওয়ার্ড <span class="text-danger">*</span>
                </label>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  class="form-control form-control-sm"
                  placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                  minlength="6"
                  required />
              </div>
            </div>

            <div class="modal-footer border-top py-2">
              <button type="button" class="btn btn-sm btn-secondary" :disabled="submitting" @click="closeModal">
                বাতিল
              </button>
              <button type="submit" class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm" role="status"></span>
                <i v-else class="bi bi-check-circle"></i>
                <span>সংরক্ষণ করুন</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ৪. কুইক ব্রান্ড যোগ করার মডাল -->
    <div
      v-if="showBrandModal"
      class="modal fade show d-block modal-backdrop-custom"
      tabindex="-1"
      style="z-index: 1060;"
      @click.self="showBrandModal = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow border-0">
          <div class="modal-header border-bottom py-2 d-flex justify-content-between align-items-center w-100">
            <h6 class="modal-title fw-bold m-0"><i class="bi bi-bookmark-star text-secondary me-2"></i>নতুন ব্রান্ড যোগ করুন</h6>
            <button type="button" class="btn-close m-0" @click="showBrandModal = false"></button>
          </div>
          <form @submit.prevent="submitBrandForm">
            <div class="modal-body p-3">
              <div class="mb-2">
                <label class="form-label small fw-semibold mb-1">ব্রান্ডের নাম <span class="text-danger">*</span></label>
                <input v-model.trim="brandForm.name" type="text" class="form-control form-control-sm" placeholder="যেমন: Zara, Richman, নিজস্ব ব্রান্ড" required />
              </div>
            </div>
            <div class="modal-footer border-top py-2">
              <button type="button" class="btn btn-sm btn-secondary" @click="showBrandModal = false">বাতিল</button>
              <button type="submit" class="btn btn-sm btn-primary" :disabled="brandSubmitting">
                <span v-if="brandSubmitting" class="spinner-border spinner-border-sm"></span>
                <span v-else>সংরক্ষণ করুন</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>



    <!-- ৬. নতুন কাস্টমার যোগ করার মডাল -->
    <div
      v-if="showCustomerModal"
      class="modal fade show d-block modal-backdrop-custom"
      tabindex="-1"
      style="z-index: 1060;"
      @click.self="showCustomerModal = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow border-0">
          <div class="modal-header border-bottom py-2">
            <h6 class="modal-title fw-bold m-0 d-flex align-items-center gap-2">
              <i class="bi bi-person-plus-fill text-info"></i>
              <span>নতুন কাস্টমার যোগ করুন</span>
            </h6>
            <button type="button" class="btn-close" @click="showCustomerModal = false"></button>
          </div>
          <form @submit.prevent="submitCustomerForm">
            <div class="modal-body p-3">
              <div class="mb-2.5">
                <label class="form-label small fw-semibold mb-1">কাস্টমারের নাম <span class="text-danger">*</span></label>
                <input v-model.trim="customerForm.name" type="text" class="form-control form-control-sm" placeholder="গ্রাহক বা ক্রেতার নাম" required />
              </div>
              <div class="row g-2 mb-2.5">
                <div class="col-6">
                  <label class="form-label small fw-semibold mb-1">
                    মোবাইল নম্বর <span class="text-danger">*</span>
                  </label>
                  <div class="position-relative">
                    <input
                      v-model.trim="customerForm.mobile"
                      type="tel"
                      maxlength="11"
                      class="form-control form-control-sm pe-4"
                      :class="{
                        'mobile-valid': isCustomerMobileValid,
                        'mobile-invalid': (customerMobileTouched || customerForm.mobile.length === 11) && customerForm.mobile && !isCustomerMobileValid
                      }"
                      placeholder="01XXXXXXXXX"
                      @input="onCustomerMobileInput"
                      @blur="customerMobileTouched = true"
                      required />
                    <span
                      v-if="isCustomerMobileValid"
                      class="mobile-check-icon"
                      title="সঠিক মোবাইল নম্বর">
                      <i class="bi bi-check-circle-fill"></i>
                    </span>
                  </div>
                  <div
                    v-if="(customerMobileTouched || customerForm.mobile.length === 11) && customerForm.mobile && !isCustomerMobileValid"
                    class="text-danger small mt-1"
                    style="font-size: 0.72rem;">
                    সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)
                  </div>
                </div>
                <div class="col-6">
                  <label class="form-label small fw-semibold mb-1">কাস্টমার ধরন</label>
                  <select v-model="customerForm.customerType" class="form-select form-select-sm">
                    <option value="retail">খুচরা (Retail)</option>
                    <option value="wholesale">পাইকারি (Wholesale)</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="form-label small fw-semibold mb-1">ঠিকানা</label>
                <input v-model.trim="customerForm.address" type="text" class="form-control form-control-sm" placeholder="গ্রাহকের ঠিকানা" />
              </div>
            </div>
            <div class="modal-footer border-top py-2">
              <button type="button" class="btn btn-sm btn-secondary" @click="showCustomerModal = false">বাতিল</button>
              <button type="submit" class="btn btn-sm btn-info text-white" :disabled="customerSubmitting">
                <span v-if="customerSubmitting" class="spinner-border spinner-border-sm"></span>
                <span v-else>কাস্টমার সংরক্ষণ করুন</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ৭. রিপোর্টস ও আর্থিক সারসংক্ষেপ মডাল -->
    <div
      v-if="showReportsModal"
      class="modal fade show d-block modal-backdrop-custom"
      tabindex="-1"
      style="z-index: 1060;"
      @click.self="showReportsModal = false">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow border-0">
          <div class="modal-header border-bottom py-2">
            <h6 class="modal-title fw-bold m-0 d-flex align-items-center gap-2">
              <i class="bi bi-file-earmark-bar-graph text-primary"></i>
              <span>ব্যবসায়িক রিপোর্ট ও সারসংক্ষেপ</span>
            </h6>
            <button type="button" class="btn-close" @click="showReportsModal = false"></button>
          </div>
          <div class="modal-body p-3">
            <div class="row g-3 mb-3">
              <div class="col-12 col-sm-6 col-md-3">
                <div class="p-3 rounded border text-center" style="background: var(--app-hover);">
                  <div class="text-muted small">মোট ক্রয় চালানের মূল্য</div>
                  <div class="fs-5 fw-bold text-primary mt-1">{{ toBengaliNumber(inventoryStats.purchases.totalAmount) }} ৳</div>
                  <span class="badge bg-primary-subtle text-primary mt-1">{{ toBengaliNumber(inventoryStats.purchases.count) }} টি চালান</span>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="p-3 rounded border text-center" style="background: var(--app-hover);">
                  <div class="text-muted small">মোট বিক্রয় আয়</div>
                  <div class="fs-5 fw-bold text-success mt-1">{{ toBengaliNumber(inventoryStats.sales.totalAmount) }} ৳</div>
                  <span class="badge bg-success-subtle text-success mt-1">{{ toBengaliNumber(inventoryStats.sales.count) }} টি বিক্রয়</span>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="p-3 rounded border text-center" style="background: var(--app-hover);">
                  <div class="text-muted small">বর্তমান মজুদ স্টক মূল্য</div>
                  <div class="fs-5 fw-bold text-info mt-1">{{ toBengaliNumber(inventoryStats.items.stockValue) }} ৳</div>
                  <span class="badge bg-info-subtle text-info mt-1">{{ toBengaliNumber(inventoryStats.items.totalStock) }} পিস স্টক</span>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="p-3 rounded border text-center" style="background: var(--app-hover);">
                  <div class="text-muted small">মোট পার্টনার ও কাস্টমার</div>
                  <div class="fs-5 fw-bold text-warning mt-1">{{ toBengaliNumber(inventoryStats.suppliers.count + inventoryStats.manufacturers.count + (inventoryStats.customers?.count || 0)) }} জন</div>
                  <span class="badge bg-warning-subtle text-warning mt-1">নেটওয়ার্ক</span>
                </div>
              </div>
            </div>

            <div class="alert alert-info py-2 small mb-0 d-flex align-items-center gap-2">
              <i class="bi bi-info-circle-fill fs-6"></i>
              <span>বিস্তারিত ডেট-ওয়াইজ বিক্রয় খতিয়ান, প্রফিট-মার্জিন ও জিএসটি/ভ্যাট রিপোর্ট মডিউল প্রস্তুত করা হচ্ছে।</span>
            </div>
          </div>
          <div class="modal-footer border-top py-2">
            <button type="button" class="btn btn-sm btn-secondary" @click="showReportsModal = false">বন্ধ করুন</button>
            <button type="button" class="btn btn-sm btn-primary" @click="showToast('প্রিন্ট রিপোর্ট শীঘ্রই সক্রিয় হবে', 'success')">
              <i class="bi bi-printer me-1"></i>প্রিন্ট সারসংক্ষেপ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ৮. সমন্বিত তালিকা প্রিভিউ মডাল (আইটেম / ব্রান্ড / পার্টনার্স [নাম-ধরন] / কাস্টমার) -->
    <div
      v-if="showListModal"
      class="modal fade show d-block modal-backdrop-custom"
      tabindex="-1"
      style="z-index: 1060;"
      @click.self="showListModal = false">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content shadow border-0">
          <div class="modal-header border-bottom py-2">
            <h6 class="modal-title fw-bold m-0 d-flex align-items-center gap-2">
              <i class="bi bi-list-columns-reverse text-primary"></i>
              <span>{{ listModalTitle }}</span>
            </h6>
            <button type="button" class="btn-close" @click="showListModal = false"></button>
          </div>
          <div class="modal-body p-3">
            <!-- ১. Items Table -->
            <div v-if="listModalType === 'items'" class="table-responsive">
              <table class="table table-sm table-bordered align-middle text-center mb-0">
                <thead>
                  <tr>
                    <th>নং</th>
                    <th class="text-start">পণ্যের নাম</th>
                    <th>কোড</th>
                    <th>ক্যাটাগরি</th>
                    <th>ক্রয়</th>
                    <th>বিক্রয়</th>
                    <th>স্টক</th>
                    <th>একশন</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!itemsList.length">
                    <td colspan="8" class="text-muted py-4">কোনো আইটেম পাওয়া যায়নি। নতুন পণ্য যোগ করুন।</td>
                  </tr>
                  <tr v-for="(it, idx) in itemsList" :key="it.id">
                    <td>{{ idx + 1 }}</td>
                    <td class="text-start fw-semibold">{{ it.name }}</td>
                    <td><code>{{ it.code }}</code></td>
                    <td>{{ it.category?.name || '-' }}</td>
                    <td>{{ toBengaliNumber(it.purchasePrice) }}৳</td>
                    <td>{{ toBengaliNumber(it.sellingPrice) }}৳</td>
                    <td><span class="badge bg-info-subtle text-info">{{ toBengaliNumber(it.stockQuantity) }}</span></td>
                    <td>
                      <button class="btn btn-sm btn-outline-danger py-0 px-1.5" @click="deleteItemRecord(it.id)"><i class="bi bi-trash"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- ২. Brands Table -->
            <div v-else-if="listModalType === 'brands'" class="table-responsive">
              <table class="table table-sm table-bordered align-middle text-center mb-0">
                <thead>
                  <tr>
                    <th>নং</th>
                    <th class="text-start">ব্রান্ডের নাম</th>
                    <th>দেশ / অরিজিন</th>
                    <th>একশন</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!brandsList.length">
                    <td colspan="4" class="text-muted py-4">কোনো ব্রান্ড নিবন্ধিত নেই।</td>
                  </tr>
                  <tr v-for="(b, idx) in brandsList" :key="b.id">
                    <td>{{ idx + 1 }}</td>
                    <td class="text-start fw-semibold">{{ b.name }}</td>
                    <td>{{ b.origin || '-' }}</td>
                    <td>
                      <button class="btn btn-sm btn-outline-danger py-0 px-1.5" @click="deleteBrandRecord(b.id)"><i class="bi bi-trash"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- ৩. Partners Table (সাপ্লায়ার ও প্রস্তুতকারক - নাম ও ধরন অনুযায়ী) -->
            <div v-else-if="listModalType === 'partners'" class="table-responsive">
              <div class="d-flex justify-content-between align-items-center mb-2.5 flex-wrap gap-2">
                <div class="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    class="btn"
                    :class="partnerFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'"
                    @click="partnerFilter = 'all'">
                    সকল ({{ toBengaliNumber(suppliersList.length + manufacturersList.length) }})
                  </button>
                  <button
                    type="button"
                    class="btn"
                    :class="partnerFilter === 'suppliers' ? 'btn-danger' : 'btn-outline-secondary'"
                    @click="partnerFilter = 'suppliers'">
                    সাপ্লায়ার ({{ toBengaliNumber(suppliersList.length) }})
                  </button>
                  <button
                    type="button"
                    class="btn"
                    :class="partnerFilter === 'manufacturers' ? 'btn-primary' : 'btn-outline-secondary'"
                    @click="partnerFilter = 'manufacturers'">
                    প্রস্তুতকারক ({{ toBengaliNumber(manufacturersList.length) }})
                  </button>
                </div>
                <button type="button" class="btn btn-sm btn-danger rounded-pill px-2.5" @click="openPartnerModal()">
                  <i class="bi bi-plus-circle me-1"></i>নতুন বিক্রেতা যোগ করুন
                </button>
              </div>

              <table class="table table-sm table-bordered align-middle text-center mb-0">
                <thead>
                  <tr>
                    <th>নং</th>
                    <th class="text-start">প্রতিষ্ঠানের নাম</th>
                    <th>ধরন (Type)</th>
                    <th>মোবাইল / যোগাযোগ</th>
                    <th>ঠিকানা / কারখানা</th>
                    <th>একশন</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!filteredPartners.length">
                    <td colspan="6" class="text-muted py-4">কোনো সরবরাহকারী বা প্রস্তুতকারক নিবন্ধিত নেই।</td>
                  </tr>
                  <tr v-for="(p, idx) in filteredPartners" :key="p.type + '-' + p.id">
                    <td>{{ idx + 1 }}</td>
                    <td class="text-start fw-bold">{{ p.name }}</td>
                    <td>
                      <span v-if="p.type === 'manufacturer'" class="badge bg-primary-subtle text-primary border border-primary-subtle">
                        <i class="bi bi-buildings me-1"></i>প্রস্তুতকারক
                      </span>
                      <span v-else class="badge bg-danger-subtle text-danger border border-danger-subtle">
                        <i class="bi bi-truck me-1"></i>সাপ্লায়ার
                      </span>
                    </td>
                    <td>{{ p.mobile }}</td>
                    <td class="text-start">{{ p.address }}</td>
                    <td>
                      <button
                        class="btn btn-sm btn-outline-danger py-0 px-1.5"
                        :title="p.typeName + ' মুছে ফেলুন'"
                        @click="deletePartnerRecord(p)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- ৪. Customers Table (কাস্টমার লিস্ট) -->
            <div v-else-if="listModalType === 'customers'" class="table-responsive">
              <div class="d-flex justify-content-end mb-2.5">
                <button type="button" class="btn btn-sm btn-info text-white rounded-pill px-2.5" @click="openCustomerModal">
                  <i class="bi bi-plus-circle me-1"></i>নতুন কাস্টমার যোগ করুন
                </button>
              </div>
              <table class="table table-sm table-bordered align-middle text-center mb-0">
                <thead>
                  <tr>
                    <th>নং</th>
                    <th class="text-start">কাস্টমারের নাম</th>
                    <th>মোবাইল</th>
                    <th>কাস্টমার ধরন</th>
                    <th>ঠিকানা</th>
                    <th>একশন</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!customersList.length">
                    <td colspan="6" class="text-muted py-4">কোনো কাস্টমার নিবন্ধিত নেই।</td>
                  </tr>
                  <tr v-for="(c, idx) in customersList" :key="c.id">
                    <td>{{ idx + 1 }}</td>
                    <td class="text-start fw-semibold">{{ c.name }}</td>
                    <td>{{ c.mobile || '-' }}</td>
                    <td>
                      <span v-if="c.customerType === 'wholesale'" class="badge bg-purple-subtle text-primary border">পাইকারি</span>
                      <span v-else class="badge bg-info-subtle text-info border">খুচরা</span>
                    </td>
                    <td class="text-start">{{ c.address || '-' }}</td>
                    <td>
                      <button class="btn btn-sm btn-outline-danger py-0 px-1.5" @click="deleteCustomerRecord(c.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer border-top py-2">
            <button type="button" class="btn btn-sm btn-secondary" @click="showListModal = false">বন্ধ করুন</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: বার কোড প্রিন্ট ও জেনারেশন -->
    <div
      v-if="showBarcodeModal"
      class="modal fade show d-block modal-backdrop-custom"
      tabindex="-1"
      style="z-index: 1060;"
      @click.self="showBarcodeModal = false">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content shadow border-0">
          <div class="modal-header border-bottom py-2 bg-light">
            <h6 class="modal-title fw-bold m-0 text-dark d-flex align-items-center gap-2">
              <i class="bi bi-upc-scan fs-5 text-primary"></i>
              বার কোড জেনারেশন ও স্টিকার প্রিন্ট
            </h6>
            <button type="button" class="btn-close" aria-label="Close" @click="showBarcodeModal = false"></button>
          </div>
          <div class="modal-body p-3">
            <!-- Filter & Print Options -->
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 bg-light p-2.5 rounded border">
              <div class="d-flex align-items-center gap-2 flex-grow-1" style="max-width: 400px;">
                <label class="small fw-semibold text-muted text-nowrap mb-0">পণ্য নির্বাচন:</label>
                <select v-model="barcodeSelectedItemId" class="form-select form-select-sm">
                  <option value="all">সকল পণ্য ({{ toBengaliNumber(itemsList.length) }} টি)</option>
                  <option v-for="it in itemsList" :key="it.id" :value="it.id">
                    {{ it.name }} - {{ it.code }} (সাইজ: {{ it.size?.name || '-' }})
                  </option>
                </select>
              </div>
              <div class="d-flex align-items-center gap-2">
                <label class="small fw-semibold text-muted text-nowrap mb-0">প্রতিটির কপি:</label>
                <input
                  v-model.number="barcodeCopies"
                  type="number"
                  min="1"
                  max="50"
                  class="form-control form-control-sm text-center"
                  style="width: 70px;" />
                <button
                  type="button"
                  class="btn btn-sm btn-primary text-nowrap"
                  @click="printBarcodes">
                  <i class="bi bi-printer me-1"></i>বারকোড প্রিন্ট করুন
                </button>
              </div>
            </div>

            <!-- Barcode Stickers Preview Grid -->
            <div class="barcode-preview-container p-3 border rounded bg-white">
              <div class="row g-3">
                <template v-for="it in barcodeItemsToPrint" :key="it.id">
                  <div
                    v-for="copy in barcodeCopies"
                    :key="`${it.id}-${copy}`"
                    class="col-6 col-sm-4 col-md-3 col-lg-2.4">
                    <div class="barcode-sticker border text-center p-2 rounded shadow-sm bg-light">
                      <div class="small fw-bold text-uppercase text-truncate" style="font-size: 0.75rem; letter-spacing: 0.5px;">
                        Fashion
                      </div>
                      <div class="fw-semibold text-truncate small my-0.5" :title="it.name" style="font-size: 0.8rem;">
                        {{ it.name }}
                      </div>
                      <div class="text-muted d-flex justify-content-center gap-1" style="font-size: 0.72rem;">
                        <span v-if="it.brand?.name">[{{ it.brand.name }}]</span>
                        <span>সাইজ: {{ it.size?.name || '-' }}</span>
                      </div>
                      <!-- Barcode Graphic Simulation -->
                      <div class="my-1 d-flex flex-column align-items-center justify-content-center">
                        <div class="barcode-lines d-flex align-items-end justify-content-center gap-0.5" style="height: 32px;">
                          <span
                            v-for="(w, idx) in generateBarcodePattern(it.code)"
                            :key="idx"
                            class="bg-dark"
                            :style="{ width: `${w}px`, height: '100%', display: 'inline-block' }"></span>
                        </div>
                        <div class="font-monospace fw-bold mt-1" style="font-size: 0.75rem; letter-spacing: 1px;">
                          {{ it.code || '00000000000000' }}
                        </div>
                      </div>
                      <div class="fw-bold text-primary" style="font-size: 0.85rem;">
                        মূল্য: ৳ {{ toBengaliNumber(it.sellingPrice || it.purchasePrice || 0) }}
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <div class="modal-footer border-top py-2 bg-light">
            <button type="button" class="btn btn-sm btn-secondary" @click="showBarcodeModal = false">বন্ধ করুন</button>
            <button type="button" class="btn btn-sm btn-primary" @click="printBarcodes">
              <i class="bi bi-printer me-1"></i>প্রিন্ট
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: একাউন্টস ও হিসাব খাতা (Accounts & Financial Summary) -->
    <div
      v-if="showAccountsModal"
      class="modal fade show d-block modal-backdrop-custom"
      tabindex="-1"
      style="z-index: 1060;"
      @click.self="showAccountsModal = false">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content shadow border-0">
          <div class="modal-header border-bottom py-2 bg-light">
            <h6 class="modal-title fw-bold m-0 text-emerald d-flex align-items-center gap-2">
              <i class="bi bi-wallet2 fs-5"></i>
              কোম্পানী একাউন্টস ও আর্থিক হিসাব বিবরণী (Accounts & Ledger)
            </h6>
            <button type="button" class="btn-close" aria-label="Close" @click="showAccountsModal = false"></button>
          </div>

          <div class="modal-body p-3">
            <!-- ৪টি প্রধান আর্থিক সূচক কার্ড -->
            <div class="row g-2 mb-3">
              <!-- ১. মোট বিক্রয় আয় -->
              <div class="col-12 col-sm-6 col-md-3">
                <div class="p-2.5 rounded border bg-light h-100 border-start border-4 border-success">
                  <div class="d-flex align-items-center justify-content-between mb-1">
                    <span class="text-muted small fw-medium">মোট বিক্রয় আয়</span>
                    <i class="bi bi-cash-coin text-success fs-5"></i>
                  </div>
                  <h5 class="fw-bold text-success mb-0">
                    ৳ {{ toBengaliNumber(inventoryStats.sales.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })) }}
                  </h5>
                  <small class="text-muted">{{ toBengaliNumber(inventoryStats.sales.count) }} টি বিক্রয় চালান</small>
                </div>
              </div>

              <!-- ২. মোট ক্রয় ব্যয় -->
              <div class="col-12 col-sm-6 col-md-3">
                <div class="p-2.5 rounded border bg-light h-100 border-start border-4 border-primary">
                  <div class="d-flex align-items-center justify-content-between mb-1">
                    <span class="text-muted small fw-medium">মোট ক্রয় খরচ</span>
                    <i class="bi bi-cart-check text-primary fs-5"></i>
                  </div>
                  <h5 class="fw-bold text-primary mb-0">
                    ৳ {{ toBengaliNumber(inventoryStats.purchases.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })) }}
                  </h5>
                  <small class="text-muted">{{ toBengaliNumber(inventoryStats.purchases.count) }} টি ক্রয় চালান</small>
                </div>
              </div>

              <!-- ৩. নিট স্থিতি / লাভ-ক্ষতি ব্যালেন্স -->
              <div class="col-12 col-sm-6 col-md-3">
                <div class="p-2.5 rounded border bg-light h-100 border-start border-4 border-emerald">
                  <div class="d-flex align-items-center justify-content-between mb-1">
                    <span class="text-muted small fw-medium">নিট ক্যাশ ফ্লো ব্যালেন্স</span>
                    <i class="bi bi-bank text-emerald fs-5"></i>
                  </div>
                  <h5
                    class="fw-bold mb-0"
                    :class="(inventoryStats.sales.totalAmount - inventoryStats.purchases.totalAmount) >= 0 ? 'text-emerald' : 'text-danger'">
                    ৳ {{ toBengaliNumber((inventoryStats.sales.totalAmount - inventoryStats.purchases.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })) }}
                  </h5>
                  <small class="text-muted">বিক্রয় ও ক্রয়ের ব্যবধান</small>
                </div>
              </div>

              <!-- ৪. বর্তমান ইনভেন্টরি স্টক সম্পদ -->
              <div class="col-12 col-sm-6 col-md-3">
                <div class="p-2.5 rounded border bg-light h-100 border-start border-4 border-info">
                  <div class="d-flex align-items-center justify-content-between mb-1">
                    <span class="text-muted small fw-medium">মজুদ পণ্যের মূল্য (Asset)</span>
                    <i class="bi bi-boxes text-info fs-5"></i>
                  </div>
                  <h5 class="fw-bold text-info mb-0">
                    ৳ {{ toBengaliNumber(inventoryStats.items.stockValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })) }}
                  </h5>
                  <small class="text-muted">{{ toBengaliNumber(inventoryStats.items.totalStock) }} পিস অবিক্রিত মজুদ</small>
                </div>
              </div>
            </div>

            <!-- খতিয়ান ও হিসাবের বিস্তারিত টেবিল -->
            <div class="card border mb-0">
              <div class="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                <span class="fw-semibold small">
                  <i class="bi bi-journal-text me-1 text-emerald"></i>
                  হিসাবের সাধারণ খতিয়ান বিবরণী (General Ledger Summary)
                </span>
                <span class="badge bg-light text-dark border">রিয়েলটাইম আপডেট</span>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-sm table-hover align-middle mb-0 text-center small">
                    <thead class="table-light">
                      <tr>
                        <th style="width: 50px;">#</th>
                        <th class="text-start">হিসাব খাত (Account Head)</th>
                        <th>ধরন</th>
                        <th class="text-end">মোট জমা / ডেবিট (৳)</th>
                        <th class="text-end">মোট খরচ / ক্রেডিট (৳)</th>
                        <th class="text-end">ব্যালেন্স / স্থিতি (৳)</th>
                        <th>স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="text-muted">১</td>
                        <td class="text-start fw-semibold">
                          <i class="bi bi-arrow-down-left-circle text-success me-1"></i>
                          পণ্য বিক্রয় হিসাব (Sales Revenue)
                        </td>
                        <td><span class="badge bg-success-subtle text-success">আয় (Income)</span></td>
                        <td class="text-end fw-bold text-success">৳ {{ toBengaliNumber(inventoryStats.sales.totalAmount.toFixed(2)) }}</td>
                        <td class="text-end text-muted">৳ ০.০০</td>
                        <td class="text-end fw-bold text-success">৳ {{ toBengaliNumber(inventoryStats.sales.totalAmount.toFixed(2)) }}</td>
                        <td><span class="badge bg-success">সক্রিয়</span></td>
                      </tr>
                      <tr>
                        <td class="text-muted">২</td>
                        <td class="text-start fw-semibold">
                          <i class="bi bi-arrow-up-right-circle text-primary me-1"></i>
                          পণ্য ক্রয় হিসাব (Purchase Expense)
                        </td>
                        <td><span class="badge bg-primary-subtle text-primary">ব্যয় (Expense)</span></td>
                        <td class="text-end text-muted">৳ ০.০০</td>
                        <td class="text-end fw-bold text-primary">৳ {{ toBengaliNumber(inventoryStats.purchases.totalAmount.toFixed(2)) }}</td>
                        <td class="text-end fw-bold text-primary">- ৳ {{ toBengaliNumber(inventoryStats.purchases.totalAmount.toFixed(2)) }}</td>
                        <td><span class="badge bg-success">সক্রিয়</span></td>
                      </tr>
                      <tr>
                        <td class="text-muted">৩</td>
                        <td class="text-start fw-semibold">
                          <i class="bi bi-box-seam text-info me-1"></i>
                          বর্তমান ইনভেন্টরি স্টক সম্পদ (Inventory Asset)
                        </td>
                        <td><span class="badge bg-info-subtle text-info">সম্পদ (Asset)</span></td>
                        <td class="text-end fw-bold text-info">৳ {{ toBengaliNumber(inventoryStats.items.stockValue.toFixed(2)) }}</td>
                        <td class="text-end text-muted">৳ ০.০০</td>
                        <td class="text-end fw-bold text-info">৳ {{ toBengaliNumber(inventoryStats.items.stockValue.toFixed(2)) }}</td>
                        <td><span class="badge bg-success">সক্রিয়</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer border-top py-2 bg-light">
            <button type="button" class="btn btn-sm btn-secondary" @click="showAccountsModal = false">বন্ধ করুন</button>
            <button type="button" class="btn btn-sm btn-emerald" @click="printAccounts">
              <i class="bi bi-printer me-1"></i>স্টেটমেন্ট প্রিন্ট
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";
import axios from "axios";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import Toast from "@/components/Toast.vue";
import { authUser, hasRole } from "@/composables/useAuth";

useHead({ title: "Dashboard" });

const router = useRouter();

const isSuperAdmin = computed(() => hasRole("super_admin"));
const isCompanyAdmin = computed(() => hasRole("company_admin"));
const currentCompanyName = computed(() => (authUser.value as any)?.companyName || (authUser.value as any)?.name || "কোম্পানী");

const companyCount = ref(0);
const dbSizePretty = ref("");
const showModal = ref(false);
const submitting = ref(false);
const formError = ref("");
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const form = reactive({
  companyName: "",
  email: "",
  mobile: "",
  password: ""
});

const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
function toBengaliNumber(n: number | string) {
  return String(n).replace(/[0-9]/g, (d) => bengaliDigits[Number(d)]);
}

function showToast(message: string, type: "success" | "danger" | "warning" | "info" = "success") {
  toastRef.value?.toastme(message, type);
}

async function fetchCompanyCount() {
  try {
    const res = await axios.get("/api/company");
    companyCount.value = res.data?.data?.length || 0;
  } catch {
    companyCount.value = 0;
  }
}

async function fetchDbStats() {
  try {
    const res = await axios.get("/api/backup/stats");
    dbSizePretty.value = res.data?.data?.sizePretty || "";
  } catch {
    dbSizePretty.value = "";
  }
}

function openCreateModal() {
  form.companyName = "";
  form.email = "";
  form.mobile = "";
  form.password = "";
  formError.value = "";
  adminMobileTouched.value = false;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  formError.value = "";
  adminMobileTouched.value = false;
}

async function submitForm() {
  formError.value = "";
  if (!isAdminMobileValid.value) {
    adminMobileTouched.value = true;
    formError.value = "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)";
    return;
  }
  submitting.value = true;
  try {
    const res = await axios.post("/api/company", {
      companyName: form.companyName,
      email: form.email,
      mobile: form.mobile,
      password: form.password
    });

    closeModal();
    showToast(res.data?.message || "কোম্পানী সফলভাবে তৈরি হয়েছে!", "success");
    await fetchCompanyCount();
  } catch (error: any) {
    formError.value = error.response?.data?.message || "কোম্পানী এডমিন তৈরি ব্যর্থ হয়েছে";
  } finally {
    submitting.value = false;
  }
}

// ==========================================
// COMPANY ADMIN INVENTORY & DASHBOARD STATE
// ==========================================
const inventoryStats = reactive({
  purchases: { count: 0, totalAmount: 0 },
  sales: { count: 0, totalAmount: 0 },
  items: { count: 0, totalStock: 0, stockValue: 0 },
  brands: { count: 0 },
  suppliers: { count: 0 },
  manufacturers: { count: 0 },
  customers: { count: 0 }
});

const showItemModal = ref(false);
const showBrandModal = ref(false);
const showSupplierModal = ref(false);
const showManufacturerModal = ref(false);
const showPartnerModal = ref(false);
const showCustomerModal = ref(false);
const showReportsModal = ref(false);
const showListModal = ref(false);
const listModalType = ref<"items" | "brands" | "suppliers" | "manufacturers" | "partners" | "customers">("items");
const listModalTitle = ref("");

// মূল্য নির্ধারণ (Pricing) State
const showPricingModal = ref(false);
const pricingSearch = ref("");
const pricingMarginPercent = ref<number | "">("");
const pricingSavingId = ref<number | null>(null);

// বার কোড (Barcode) State
const showBarcodeModal = ref(false);
const barcodeSelectedItemId = ref<number | "all">("all");
const barcodeCopies = ref(1);

// একাউন্টস (Accounts) State
const showAccountsModal = ref(false);

function openAccountsModal() {
  fetchInventoryStats();
  showAccountsModal.value = true;
}

const filteredPricingItems = computed(() => {
  if (!pricingSearch.value.trim()) return itemsList.value;
  const q = pricingSearch.value.toLowerCase().trim();
  return itemsList.value.filter(
    (it) =>
      (it.name && it.name.toLowerCase().includes(q)) ||
      (it.code && it.code.toLowerCase().includes(q)) ||
      (it.category?.name && it.category.name.toLowerCase().includes(q))
  );
});

const barcodeItemsToPrint = computed(() => {
  if (barcodeSelectedItemId.value === "all") {
    return itemsList.value;
  }
  return itemsList.value.filter((it) => it.id === Number(barcodeSelectedItemId.value));
});

function calcMarginPercent(purchase: number | string, selling: number | string): string {
  const p = Number(purchase) || 0;
  const s = Number(selling) || 0;
  if (p <= 0) return "100";
  return (((s - p) / p) * 100).toFixed(1);
}

function generateBarcodePattern(code: string | null | undefined): number[] {
  const str = String(code || "01180520261001");
  const pattern: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const digit = parseInt(str[i], 10) || 1;
    pattern.push((digit % 3) + 1);
    pattern.push(1);
  }
  return pattern;
}

function openPricingModal() {
  router.push("/pricing");
}

async function openBarcodeModal() {
  await fetchItems();
  router.push("/barcodes");
}

async function saveItemPrice(item: any) {
  pricingSavingId.value = item.id;
  try {
    await axios.put(`/api/inventory/items/${item.id}`, {
      sellingPrice: item.sellingPrice
    });
    showToast(`"${item.name}" এর বিক্রয়মূল্য সফলভাবে সংরক্ষিত হয়েছে`, "success");
    await fetchInventoryStats();
  } catch (err: any) {
    showToast(err.response?.data?.message || "মূল্য সংরক্ষণ করা যায়নি", "danger");
  } finally {
    pricingSavingId.value = null;
  }
}

function applyBulkMargin() {
  const m = Number(pricingMarginPercent.value);
  if (isNaN(m) || m <= 0) {
    showToast("সঠিক লাভ মার্জিন শতকরা (%) লিখুন", "warning");
    return;
  }
  for (const it of itemsList.value) {
    const buy = Number(it.purchasePrice) || 0;
    it.sellingPrice = Math.round(buy * (1 + m / 100));
  }
  showToast(`সকল পণ্যে ${toBengaliNumber(m)}% মার্জিন প্রয়োগ করা হয়েছে। অনুগ্রহ করে সেভ বাটনে চাপুন`, "info");
}

function printBarcodes() {
  window.print();
}

function printAccounts() {
  window.print();
}

const itemSubmitting = ref(false);
const brandSubmitting = ref(false);
const supplierSubmitting = ref(false);
const manufacturerSubmitting = ref(false);
const partnerSubmitting = ref(false);
const customerSubmitting = ref(false);

const itemsList = ref<any[]>([]);
const brandsList = ref<any[]>([]);
const suppliersList = ref<any[]>([]);
const manufacturersList = ref<any[]>([]);
const customersList = ref<any[]>([]);

const partnerFilter = ref<"all" | "suppliers" | "manufacturers">("all");

const masterCatalog = reactive({
  categories: [] as any[],
  subCategories: [] as any[],
  productTypes: [] as any[],
  sizes: [] as any[],
  colors: [] as any[],
  units: [] as any[]
});

const itemForm = reactive({
  name: "",
  code: "",
  categoryId: null as number | null,
  subCategoryId: null as number | null,
  productTypeId: null as number | null,
  brandId: null as number | null,
  supplierId: null as number | null,
  manufacturerId: null as number | null,
  colorId: null as number | null,
  sizeId: null as number | null,
  unitId: null as number | null,
  purchasePrice: 0,
  sellingPrice: 0,
  stockQuantity: 0,
  imageUrl: ""
});

const brandForm = reactive({
  name: "",
  origin: ""
});

const supplierForm = reactive({
  name: "",
  contactPerson: "",
  mobile: "",
  address: ""
});

const manufacturerForm = reactive({
  name: "",
  country: "",
  factoryAddress: ""
});

const partnerForm = reactive({
  type: "supplier" as "supplier" | "manufacturer",
  name: "",
  mobile: "",
  extra: "",
  address: ""
});

const customerForm = reactive({
  name: "",
  mobile: "",
  customerType: "retail",
  address: ""
});

// Mobile number validation helpers (Bangladeshi 11 digits: 013-019)
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

const adminMobileTouched = ref(false);
const isAdminMobileValid = computed(() => {
  return isValidBdMobile(form.mobile);
});
function onAdminMobileInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const clean = normalizeBengaliDigits(target.value).slice(0, 11);
  form.mobile = clean;
  target.value = clean;
}

const partnerMobileTouched = ref(false);
const isPartnerMobileValid = computed(() => {
  return isValidBdMobile(partnerForm.mobile);
});

function onPartnerMobileInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const clean = normalizeBengaliDigits(target.value).slice(0, 11);
  partnerForm.mobile = clean;
  target.value = clean;
}

const customerMobileTouched = ref(false);
const isCustomerMobileValid = computed(() => {
  return isValidBdMobile(customerForm.mobile);
});

function onCustomerMobileInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const clean = normalizeBengaliDigits(target.value).slice(0, 11);
  customerForm.mobile = clean;
  target.value = clean;
}

// Unified partner list for filter & table (নাম - ধরন)
const filteredPartners = computed(() => {
  const supps = suppliersList.value.map((s) => ({
    id: s.id,
    name: s.name,
    type: "supplier",
    typeName: "সাপ্লায়ার",
    mobile: s.mobile || s.contactPerson || "-",
    address: s.address || "-"
  }));
  const manus = manufacturersList.value.map((m) => ({
    id: m.id,
    name: m.name,
    type: "manufacturer",
    typeName: "প্রস্তুতকারক",
    mobile: m.mobile || m.country || "-",
    address: m.factoryAddress || "-"
  }));
  if (partnerFilter.value === "suppliers") return supps;
  if (partnerFilter.value === "manufacturers") return manus;
  return [...supps, ...manus];
});

// Dependent Dropdowns
const availableSubCategories = computed(() => {
  if (!itemForm.categoryId) return [];
  return masterCatalog.subCategories.filter((s: any) => s.categoryId === Number(itemForm.categoryId));
});

const availableProductTypes = computed(() => {
  if (!itemForm.categoryId || !itemForm.subCategoryId) return [];
  return masterCatalog.productTypes.filter(
    (pt: any) => pt.categoryId === Number(itemForm.categoryId) && pt.subCategoryId === Number(itemForm.subCategoryId)
  );
});

function onCategoryChange() {
  itemForm.subCategoryId = null;
  itemForm.productTypeId = null;
}

function onSubCategoryChange() {
  itemForm.productTypeId = null;
}

// Fetch Inventory Stats
async function fetchInventoryStats() {
  try {
    const res = await axios.get("/api/inventory/stats");
    const data = res.data?.data || {};
    inventoryStats.purchases = data.purchases || { count: 0, totalAmount: 0 };
    inventoryStats.sales = data.sales || { count: 0, totalAmount: 0 };
    inventoryStats.items = data.items || { count: 0, totalStock: 0, stockValue: 0 };
    inventoryStats.brands = data.brands || { count: 0 };
    inventoryStats.suppliers = data.suppliers || { count: 0 };
    inventoryStats.manufacturers = data.manufacturers || { count: 0 };
    inventoryStats.customers = data.customers || { count: 0 };
  } catch (e) {
    console.error("Failed to fetch inventory stats:", e);
  }
}

// Fetch Master Catalog for Item Dropdowns
async function fetchMasterCatalog() {
  try {
    const res = await axios.get("/api/catalog/master");
    const data = res.data?.data || {};
    masterCatalog.categories = data.categories || [];
    masterCatalog.subCategories = data.subCategories || [];
    masterCatalog.productTypes = data.productTypes || [];
    masterCatalog.sizes = data.sizes || [];
    masterCatalog.colors = data.colors || [];
    masterCatalog.units = data.units || [];
  } catch (e) {
    console.error("Failed to fetch master catalog:", e);
  }
}

// Fetch Brands
async function fetchBrands() {
  try {
    const res = await axios.get("/api/inventory/brands");
    brandsList.value = res.data?.data || [];
    inventoryStats.brands.count = brandsList.value.length;
  } catch {
    brandsList.value = [];
  }
}

// Fetch Suppliers
async function fetchSuppliers() {
  try {
    const res = await axios.get("/api/inventory/suppliers");
    suppliersList.value = res.data?.data || [];
    inventoryStats.suppliers.count = suppliersList.value.length;
  } catch {
    suppliersList.value = [];
  }
}

// Fetch Manufacturers
async function fetchManufacturers() {
  try {
    const res = await axios.get("/api/inventory/manufacturers");
    manufacturersList.value = res.data?.data || [];
    inventoryStats.manufacturers.count = manufacturersList.value.length;
  } catch {
    manufacturersList.value = [];
  }
}

// Fetch Customers
async function fetchCustomers() {
  try {
    const res = await axios.get("/api/inventory/customers");
    customersList.value = res.data?.data || [];
    inventoryStats.customers.count = customersList.value.length;
  } catch {
    customersList.value = [];
  }
}

// Fetch Items
async function fetchItems() {
  try {
    const res = await axios.get("/api/inventory/items");
    itemsList.value = res.data?.data || [];
  } catch {
    itemsList.value = [];
  }
}

// Modal Openers


function openBrandModal() {
  brandForm.name = "";
  brandForm.origin = "";
  showBrandModal.value = true;
}

function openPartnerModal(defaultType: "supplier" | "manufacturer" = "supplier") {
  partnerForm.type = defaultType;
  partnerForm.name = "";
  partnerForm.mobile = "";
  partnerForm.extra = defaultType === "manufacturer" ? "বাংলাদেশ" : "";
  partnerForm.address = "";
  partnerMobileTouched.value = false;
  showPartnerModal.value = true;
}

function openSupplierModal() {
  openPartnerModal("supplier");
}

function openManufacturerModal() {
  openPartnerModal("manufacturer");
}

function openCustomerModal() {
  customerForm.name = "";
  customerForm.mobile = "";
  customerForm.customerType = "retail";
  customerForm.address = "";
  customerMobileTouched.value = false;
  showCustomerModal.value = true;
}

function openReportsModal() {
  showReportsModal.value = true;
}

// List Modals
async function openItemListModal() {
  listModalType.value = "items";
  listModalTitle.value = "আইটেম / পণ্যের তালিকা";
  await fetchItems();
  showListModal.value = true;
}

async function openBrandListModal() {
  listModalType.value = "brands";
  listModalTitle.value = "ব্রান্ডের তালিকা";
  await fetchBrands();
  showListModal.value = true;
}

async function openPartnerListModal() {
  listModalType.value = "partners";
  listModalTitle.value = "বিক্রেতা তালিকা (সাপ্লায়ার ও কারখানা পার্টনার)";
  partnerFilter.value = "all";
  await Promise.all([fetchSuppliers(), fetchManufacturers()]);
  showListModal.value = true;
}

async function openCustomerListModal() {
  listModalType.value = "customers";
  listModalTitle.value = "কাস্টমার / গ্রাহক তালিকা";
  await fetchCustomers();
  showListModal.value = true;
}

async function openSupplierListModal() {
  await openPartnerListModal();
  partnerFilter.value = "suppliers";
}

async function openManufacturerListModal() {
  await openPartnerListModal();
  partnerFilter.value = "manufacturers";
}

// Form Submissions
async function submitItemForm() {
  itemSubmitting.value = true;
  try {
    const res = await axios.post("/api/inventory/items", itemForm);
    showToast(res.data?.message || "পণ্য সফলভাবে সংরক্ষিত হয়েছে", "success");
    showItemModal.value = false;
    await fetchInventoryStats();
    await fetchItems();
  } catch (err: any) {
    showToast(err.response?.data?.message || "পণ্য সংরক্ষণ ব্যর্থ হয়েছে", "danger");
  } finally {
    itemSubmitting.value = false;
  }
}

async function submitBrandForm() {
  brandSubmitting.value = true;
  try {
    const res = await axios.post("/api/inventory/brands", brandForm);
    showToast(res.data?.message || "ব্রান্ড সফলভাবে যোগ করা হয়েছে", "success");
    showBrandModal.value = false;
    await fetchBrands();
    await fetchInventoryStats();
  } catch (err: any) {
    showToast(err.response?.data?.message || "ব্রান্ড সংরক্ষণ ব্যর্থ হয়েছে", "danger");
  } finally {
    brandSubmitting.value = false;
  }
}

async function submitPartnerForm() {
  if (!partnerForm.name || !partnerForm.name.trim()) {
    showToast("প্রতিষ্ঠানের নাম আবশ্যক", "warning");
    return;
  }
  if (!isPartnerMobileValid.value) {
    partnerMobileTouched.value = true;
    showToast("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)", "warning");
    return;
  }

  partnerSubmitting.value = true;
  try {
    if (partnerForm.type === "supplier") {
      const res = await axios.post("/api/inventory/suppliers", {
        name: partnerForm.name,
        mobile: partnerForm.mobile,
        contactPerson: partnerForm.extra,
        address: partnerForm.address
      });
      showToast(res.data?.message || "সাপ্লায়ার সফলভাবে যোগ করা হয়েছে", "success");
      await fetchSuppliers();
    } else {
      const res = await axios.post("/api/inventory/manufacturers", {
        name: partnerForm.name,
        country: partnerForm.extra || "বাংলাদেশ",
        mobile: partnerForm.mobile,
        factoryAddress: partnerForm.address
      });
      showToast(res.data?.message || "প্রস্তুতকারক সফলভাবে যোগ করা হয়েছে", "success");
      await fetchManufacturers();
    }
    showPartnerModal.value = false;
    await fetchInventoryStats();
  } catch (err: any) {
    showToast(err.response?.data?.message || "পার্টনার সংরক্ষণ ব্যর্থ হয়েছে", "danger");
  } finally {
    partnerSubmitting.value = false;
  }
}

async function submitCustomerForm() {
  if (!customerForm.name || !customerForm.name.trim()) {
    showToast("কাস্টমারের নাম আবশ্যক", "warning");
    return;
  }
  if (!isCustomerMobileValid.value) {
    customerMobileTouched.value = true;
    showToast("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)", "warning");
    return;
  }

  customerSubmitting.value = true;
  try {
    const res = await axios.post("/api/inventory/customers", customerForm);
    showToast(res.data?.message || "কাস্টমার সফলভাবে সংরক্ষিত হয়েছে", "success");
    showCustomerModal.value = false;
    await fetchCustomers();
    await fetchInventoryStats();
  } catch (err: any) {
    showToast(err.response?.data?.message || "কাস্টমার সংরক্ষণ ব্যর্থ হয়েছে", "danger");
  } finally {
    customerSubmitting.value = false;
  }
}

// Delete Record Handlers
async function deleteItemRecord(id: number) {
  if (!confirm("আপনি কি নিশ্চিতভাবে এই আইটেমটি মুছে ফেলতে চান?")) return;
  try {
    await axios.delete(`/api/inventory/items/${id}`);
    showToast("আইটেম সফলভাবে মুছে ফেলা হয়েছে", "success");
    await fetchItems();
    await fetchInventoryStats();
  } catch {
    showToast("মুছে ফেলতে ব্যর্থ হয়েছে", "danger");
  }
}

async function deleteBrandRecord(id: number) {
  if (!confirm("আপনি কি নিশ্চিতভাবে এই ব্রান্ডটি মুছে ফেলতে চান?")) return;
  try {
    await axios.delete(`/api/inventory/brands/${id}`);
    showToast("ব্রান্ড মুছে ফেলা হয়েছে", "success");
    await fetchBrands();
    await fetchInventoryStats();
  } catch {
    showToast("মুছে ফেলতে ব্যর্থ হয়েছে", "danger");
  }
}

async function deletePartnerRecord(partner: any) {
  const confirmMsg = partner.type === "supplier"
    ? `আপনি কি নিশ্চিতভাবে সাপ্লায়ার "${partner.name}" মুছে ফেলতে চান?`
    : `আপনি কি নিশ্চিতভাবে প্রস্তুতকারক "${partner.name}" মুছে ফেলতে চান?`;
  if (!confirm(confirmMsg)) return;

  try {
    if (partner.type === "supplier") {
      await axios.delete(`/api/inventory/suppliers/${partner.id}`);
      showToast("সাপ্লায়ার মুছে ফেলা হয়েছে", "success");
      await fetchSuppliers();
    } else {
      await axios.delete(`/api/inventory/manufacturers/${partner.id}`);
      showToast("প্রস্তুতকারক মুছে ফেলা হয়েছে", "success");
      await fetchManufacturers();
    }
    await fetchInventoryStats();
  } catch {
    showToast("মুছে ফেলতে ব্যর্থ হয়েছে", "danger");
  }
}

async function deleteCustomerRecord(id: number) {
  if (!confirm("আপনি কি নিশ্চিতভাবে এই কাস্টমার রেকর্ডটি মুছে ফেলতে চান?")) return;
  try {
    await axios.delete(`/api/inventory/customers/${id}`);
    showToast("কাস্টমার মুছে ফেলা হয়েছে", "success");
    await fetchCustomers();
    await fetchInventoryStats();
  } catch {
    showToast("মুছে ফেলতে ব্যর্থ হয়েছে", "danger");
  }
}

watch(
  isCompanyAdmin,
  (val) => {
    if (val) {
      fetchInventoryStats();
      fetchMasterCatalog();
      fetchBrands();
      fetchSuppliers();
      fetchManufacturers();
      fetchCustomers();
    }
  },
  { immediate: true }
);

watch(
  isSuperAdmin,
  (val) => {
    if (val) {
      fetchCompanyCount();
      fetchDbStats();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (isSuperAdmin.value) {
    fetchCompanyCount();
    fetchDbStats();
  }
  if (isCompanyAdmin.value) {
    fetchInventoryStats();
    fetchMasterCatalog();
    fetchBrands();
    fetchSuppliers();
    fetchManufacturers();
    fetchCustomers();
  }
});
</script>

<style scoped>
.dashboard-content {
  width: 100%;
  max-width: 100%;
}

.card-icon-box {
  width: 34px;
  height: 34px;
  border: 1.5px solid currentColor;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1rem;
  background: transparent;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.merchant-card {
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-top-width: 3.5px !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}

.merchant-card .card-body {
  padding: 0.85rem !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  height: 100% !important;
  min-height: 132px !important;
}

.merchant-card .card-title {
  line-height: 1.25;
  margin-bottom: 0 !important;
}

.view-icon-btn {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 2px !important;
  margin: 0 !important;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  line-height: 1;
  transition: transform 0.2s ease, opacity 0.2s ease;
  opacity: 0.8;
}

.view-icon-btn:hover {
  opacity: 1;
  transform: scale(1.22);
}

/* Mobile number input validation checkmark and border indicators */
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

html[data-bs-theme="dark"] .mobile-valid,
.theme-dark .mobile-valid {
  border-color: #20c997 !important;
}
html[data-bs-theme="dark"] .mobile-valid:focus,
.theme-dark .mobile-valid:focus {
  box-shadow: 0 0 0 0.2rem rgba(32, 201, 151, 0.25) !important;
}
html[data-bs-theme="dark"] .mobile-check-icon,
.theme-dark .mobile-check-icon {
  color: #20c997 !important;
}

.card-bar-primary {
  border-top-color: #0d6efd !important;
}

.card-bar-secondary {
  border-top-color: #6c757d !important;
}

.card-bar-info {
  border-top-color: #0dcaf0 !important;
}

.card-bar-success {
  border-top-color: #198754 !important;
}

.card-bar-warning {
  border-top-color: #d97706 !important;
}

/* Deeper Amber/Gold for Warning in Light Mode (fixes pale/washed out yellow) */
.text-warning {
  color: #b45309 !important;
}

.btn-outline-warning {
  color: #b45309 !important;
  border-color: #d97706 !important;
  background-color: transparent !important;
}
.btn-outline-warning:hover,
.btn-outline-warning:focus,
.btn-outline-warning:active {
  color: #ffffff !important;
  background-color: #d97706 !important;
  border-color: #d97706 !important;
}

html[data-bs-theme="dark"] .card-bar-warning,
.theme-dark .card-bar-warning {
  border-top-color: #f59e0b !important;
}
html[data-bs-theme="dark"] .text-warning,
.theme-dark .text-warning {
  color: #fbbf24 !important;
}
html[data-bs-theme="dark"] .btn-outline-warning,
.theme-dark .btn-outline-warning {
  color: #fbbf24 !important;
  border-color: #f59e0b !important;
}
html[data-bs-theme="dark"] .btn-outline-warning:hover,
.theme-dark .btn-outline-warning:hover {
  color: #000000 !important;
  background-color: #fbbf24 !important;
}

.card-bar-danger {
  border-top-color: #dc3545 !important;
}

.card-bar-indigo {
  border-top-color: #6610f2 !important;
}

.card-bar-teal {
  border-top-color: #20c997 !important;
}

/* Custom Theme Color Utilities for Teal (#20c997) & Indigo (#6610f2) */
.text-teal {
  color: #20c997 !important;
}

.btn-outline-teal {
  color: #20c997 !important;
  border-color: #20c997 !important;
  background-color: transparent !important;
}
.btn-outline-teal:hover,
.btn-outline-teal:focus,
.btn-outline-teal:active {
  color: #000000 !important;
  background-color: #20c997 !important;
  border-color: #20c997 !important;
  font-weight: 600;
}

.btn-teal {
  color: #000000 !important;
  background-color: #20c997 !important;
  border-color: #20c997 !important;
  font-weight: 600;
}
.btn-teal:hover {
  background-color: #1aa179 !important;
  border-color: #1aa179 !important;
  color: #000000 !important;
}

.text-indigo {
  color: #6610f2 !important;
}

.btn-outline-indigo {
  color: #6610f2 !important;
  border-color: #6610f2 !important;
  background-color: transparent !important;
}
.btn-outline-indigo:hover,
.btn-outline-indigo:focus,
.btn-outline-indigo:active {
  color: #fff !important;
  background-color: #6610f2 !important;
  border-color: #6610f2 !important;
}

/* Custom Purple Styles for মূল্য নির্ধারণ */
.card-bar-purple {
  border-top-color: #7c3aed !important;
}
.text-purple {
  color: #7c3aed !important;
}
.btn-outline-purple {
  color: #7c3aed !important;
  border-color: #7c3aed !important;
  background-color: transparent !important;
}
.btn-outline-purple:hover,
.btn-outline-purple:focus,
.btn-outline-purple:active {
  color: #ffffff !important;
  background-color: #7c3aed !important;
  border-color: #7c3aed !important;
}
.btn-purple {
  color: #ffffff !important;
  background-color: #7c3aed !important;
  border-color: #7c3aed !important;
}
.btn-purple:hover {
  background-color: #6d28d9 !important;
  border-color: #6d28d9 !important;
}

/* Custom Emerald Styles for একাউন্টস */
.card-bar-emerald {
  border-top-color: #059669 !important;
}
.text-emerald {
  color: #059669 !important;
}
.btn-outline-emerald {
  color: #059669 !important;
  border-color: #059669 !important;
  background-color: transparent !important;
}
.btn-outline-emerald:hover,
.btn-outline-emerald:focus,
.btn-outline-emerald:active {
  color: #ffffff !important;
  background-color: #059669 !important;
  border-color: #059669 !important;
}
.btn-emerald {
  color: #ffffff !important;
  background-color: #059669 !important;
  border-color: #059669 !important;
}
.btn-emerald:hover {
  background-color: #047857 !important;
  border-color: #047857 !important;
}

/* Custom Dark Bar for বার কোড */
.card-bar-dark {
  border-top-color: #1e293b !important;
}
html[data-bs-theme="dark"] .card-bar-dark,
.theme-dark .card-bar-dark {
  border-top-color: #94a3b8 !important;
}

/* Barcode Sticker Styles */
.barcode-sticker {
  border: 1px dashed #cbd5e1 !important;
  background-color: #ffffff;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.barcode-sticker:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}
@media print {
  body * {
    visibility: hidden;
  }
  .barcode-preview-container,
  .barcode-preview-container * {
    visibility: visible;
  }
  .barcode-preview-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}

.merchant-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.08) !important;
}

.placeholder-panel {
  border: 1px solid var(--app-border);
  border-radius: 0.3rem;
  background: var(--app-surface);
  min-height: 120px;
}

/* Dark Mode and Adaptive Theme Controls for Modals, Tables, and Forms */
:deep(.modal-content),
.modal-content {
  background-color: var(--app-surface) !important;
  color: var(--app-text) !important;
  border: 1px solid var(--app-border) !important;
}

:deep(.modal-header),
.modal-header {
  background-color: transparent !important;
  border-bottom: 1px solid var(--app-border) !important;
  color: var(--app-text-strong) !important;
}

:deep(.modal-footer),
.modal-footer {
  background-color: transparent !important;
  border-top: 1px solid var(--app-border) !important;
}

:deep(.modal-title),
.modal-title {
  color: var(--app-text-strong) !important;
}

:deep(.table),
.table {
  color: var(--app-text) !important;
  border-color: var(--app-border) !important;
}

:deep(.table > :not(caption) > * > *),
.table > :not(caption) > * > * {
  background-color: transparent !important;
  border-bottom: 1px solid var(--app-border) !important;
  color: var(--app-text) !important;
}

:deep(.table thead th),
.table thead th {
  background-color: var(--app-hover) !important;
  color: var(--app-text-strong) !important;
  border-bottom: 1px solid var(--app-border) !important;
}

:deep(.form-control),
:deep(.form-select),
.form-control,
.form-select {
  background-color: var(--app-surface) !important;
  border-color: var(--app-border) !important;
  color: var(--app-text) !important;
}

:deep(.form-control:focus),
:deep(.form-select:focus),
.form-control:focus,
.form-select:focus {
  background-color: var(--app-surface) !important;
  border-color: var(--app-primary) !important;
  color: var(--app-text) !important;
  box-shadow: 0 0 0 0.2rem color-mix(in srgb, var(--app-primary), transparent 75%) !important;
}

:deep(.input-group-text),
.input-group-text {
  background-color: var(--app-hover) !important;
  border-color: var(--app-border) !important;
  color: var(--app-text) !important;
}

/* Modal Backdrop with deep dimming and blur to obscure background page */
.modal-backdrop-custom {
  background: rgba(10, 14, 22, 0.85) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
}

html[data-bs-theme="light"] .modal-backdrop-custom,
.theme-light .modal-backdrop-custom {
  background: rgba(15, 23, 42, 0.65) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
}

/* Modal Content enhancements */
:deep(.modal-content),
.modal-content {
  background-color: var(--app-surface) !important;
  color: var(--app-text) !important;
  border: 1px solid var(--app-border) !important;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.5) !important;
  border-radius: 0.75rem !important;
}

/* Modern, Clean & Sleek Modal Close Button - No ugly boxes, borders or weird inverts */
:deep(.modal-header .btn-close),
.modal-header .btn-close,
:deep(.btn-close),
.btn-close {
  box-sizing: border-box !important;
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  min-height: 32px !important;
  padding: 0 !important;
  margin: 0 !important;
  background-color: transparent !important;
  border: 0 !important;
  border-style: none !important;
  border-radius: 50% !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  opacity: 0.75 !important;
  outline: none !important;
  box-shadow: none !important;
  filter: none !important;
  cursor: pointer !important;
  transition: all 0.2s ease-in-out !important;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23ffffff'%3e%3cpath d='M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414'/%3e%3c/svg%3e") !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  background-size: 13px !important;
}

:deep(.modal-header .btn-close:hover),
.modal-header .btn-close:hover,
:deep(.btn-close:hover),
.btn-close:hover {
  opacity: 1 !important;
  background-color: rgba(255, 255, 255, 0.14) !important;
  transform: scale(1.08) !important;
  border: 0 !important;
  outline: none !important;
  box-shadow: none !important;
}

:deep(.modal-header .btn-close:focus),
:deep(.modal-header .btn-close:active),
.modal-header .btn-close:focus,
.modal-header .btn-close:active,
:deep(.btn-close:focus),
:deep(.btn-close:active),
.btn-close:focus,
.btn-close:active {
  outline: none !important;
  box-shadow: none !important;
  border: 0 !important;
  background-color: rgba(255, 255, 255, 0.18) !important;
}

/* Light mode close icon */
html[data-bs-theme="light"] :deep(.modal-header .btn-close),
.theme-light :deep(.modal-header .btn-close),
html[data-bs-theme="light"] :deep(.btn-close),
.theme-light :deep(.btn-close) {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23212529'%3e%3cpath d='M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414'/%3e%3c/svg%3e") !important;
}

html[data-bs-theme="light"] :deep(.modal-header .btn-close:hover),
.theme-light :deep(.modal-header .btn-close:hover),
html[data-bs-theme="light"] :deep(.btn-close:hover),
.theme-light :deep(.btn-close:hover) {
  background-color: rgba(0, 0, 0, 0.08) !important;
}

@media (max-width: 575.98px) {
  .merchant-card .card-body {
    padding: 0.75rem !important;
  }
  .stat-value {
    font-size: 1.15rem;
  }
  .card-icon-box {
    width: 30px;
    height: 30px;
    font-size: 0.9rem;
  }
}
</style>
