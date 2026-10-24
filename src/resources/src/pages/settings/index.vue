<template>
  <div class="settings-page">
    <!-- Toast Notification Component -->
    <Toast ref="toastRef" />

    <!-- Segmented Tab Navigation Bar with Crisp Theme Contrast -->
    <div class="settings-tabs-wrapper d-flex justify-content-center mb-3">
      <div class="settings-tabs-bar d-inline-flex flex-wrap gap-1 align-items-center justify-content-center">
        <!-- 1. Category Tab -->
        <button
          type="button"
          class="tab-pill-btn d-inline-flex align-items-center gap-2"
          :class="{ active: activeTab === 'category' }"
          @click="activeTab = 'category'">
          <i class="bi bi-tags-fill"></i>
          <span>ক্যাটাগরি</span>
        </button>

        <!-- 2. Sub-Category Tab (Immediately beside Category) -->
        <button
          type="button"
          class="tab-pill-btn d-inline-flex align-items-center gap-2"
          :class="{ active: activeTab === 'subCategory' }"
          @click="activeTab = 'subCategory'">
          <i class="bi bi-diagram-3-fill"></i>
          <span>সাব-ক্যাটাগরি</span>
        </button>

        <!-- 3. Product Type Tab (Immediately beside Sub-Category) -->
        <button
          type="button"
          class="tab-pill-btn d-inline-flex align-items-center gap-2"
          :class="{ active: activeTab === 'productType' }"
          @click="activeTab = 'productType'">
          <i class="bi bi-boxes"></i>
          <span>ধরন</span>
        </button>

        <!-- 4. Size Tab -->
        <button
          type="button"
          class="tab-pill-btn d-inline-flex align-items-center gap-2"
          :class="{ active: activeTab === 'size' }"
          @click="activeTab = 'size'">
          <i class="bi bi-rulers"></i>
          <span>সাইজ</span>
        </button>

        <!-- 5. Color Tab -->
        <button
          type="button"
          class="tab-pill-btn d-inline-flex align-items-center gap-2"
          :class="{ active: activeTab === 'color' }"
          @click="activeTab = 'color'">
          <i class="bi bi-palette-fill"></i>
          <span>রং</span>
        </button>

        <!-- 6. Unit Tab -->
        <button
          type="button"
          class="tab-pill-btn d-inline-flex align-items-center gap-2"
          :class="{ active: activeTab === 'unit' }"
          @click="activeTab = 'unit'">
          <i class="bi bi-calculator-fill"></i>
          <span>পরিমাপের একক</span>
        </button>

        <!-- 7. Challan Types Tab -->
        <button
          type="button"
          class="tab-pill-btn d-inline-flex align-items-center gap-2"
          :class="{ active: activeTab === 'challanType' }"
          @click="activeTab = 'challanType'">
          <i class="bi bi-receipt"></i>
          <span>চালানের ধরন</span>
        </button>

        <!-- 8. Vendor Types Tab (সরবরাহকারীর ধরন) -->
        <button
          type="button"
          class="tab-pill-btn d-inline-flex align-items-center gap-2"
          :class="{ active: activeTab === 'vendorType' }"
          @click="activeTab = 'vendorType'">
          <i class="bi bi-person-badge-fill"></i>
          <span>সরবরাহকারীর ধরন</span>
        </button>

        <!-- 9. Bangla Font Tab -->
        <button
          type="button"
          class="tab-pill-btn d-inline-flex align-items-center gap-2"
          :class="{ active: activeTab === 'font' }"
          @click="activeTab = 'font'">
          <i class="bi bi-fonts"></i>
          <span>বাংলা ফন্ট</span>
        </button>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="card border shadow-sm">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <div class="text-muted small mt-2">সেটিংস তথ্য লোড হচ্ছে...</div>
      </div>

      <div v-else>
        <!-- ========================================== -->
        <!-- TAB 1: CATEGORIES (Slug Column Removed)    -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'category'">
          <div class="card-header border-bottom py-3 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <span class="fw-bold settings-card-title">
              ক্যাটাগরির তালিকা
            </span>
            <button
              type="button"
              class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
              @click="openModal('category')">
              <i class="bi bi-plus-circle"></i>
              <span>নতুন ক্যাটাগরি</span>
            </button>
          </div>

          <div v-if="categories.length === 0" class="text-center py-5">
            <i class="bi bi-tags text-muted fs-1 mb-2 d-block"></i>
            <p class="text-muted mb-3">কোনো ক্যাটাগরি পাওয়া যায়নি।</p>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="openModal('category')">
              প্রথম ক্যাটাগরি যোগ করুন
            </button>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col" style="width: 70px;" class="text-center">#</th>
                  <th scope="col">ক্যাটাগরির নাম</th>
                  <th scope="col" class="text-center" style="width: 120px;">স্ট্যাটাস</th>
                  <th scope="col" class="text-center" style="width: 100px;">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(cat, idx) in categories" :key="cat.id">
                  <td class="text-center text-muted small">{{ idx + 1 }}</td>
                  <td class="fw-semibold">{{ cat.name }}</td>
                  <td class="text-center">
                    <div class="form-check form-switch d-inline-flex justify-content-center m-0">
                      <input
                        class="form-check-input my-0"
                        type="checkbox"
                        role="switch"
                        :checked="cat.isActive"
                        :disabled="togglingId === `cat-${cat.id}`"
                        @change="toggleStatus('category', cat)"
                        style="cursor: pointer; width: 2.2rem; height: 1.15rem;" />
                    </div>
                  </td>
                  <td class="text-center">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary py-0 px-2 d-inline-flex align-items-center gap-1"
                      title="সম্পাদনা করুন"
                      @click="openEditModal('category', cat)">
                      <i class="bi bi-pencil-square"></i>
                      <span>এডিট</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- ========================================== -->
        <!-- TAB 2: SUB-CATEGORIES (TABLE VIEW)         -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'subCategory'">
          <div class="card-header border-bottom py-3 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <span class="fw-bold settings-card-title">
              সাব-ক্যাটাগরির তালিকা
            </span>
            <button
              type="button"
              class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
              :disabled="categories.length === 0"
              @click="openModal('subCategory')">
              <i class="bi bi-plus-circle"></i>
              <span>নতুন সাব-ক্যাটাগরি</span>
            </button>
          </div>

          <div v-if="subCategories.length === 0" class="text-center py-5">
            <i class="bi bi-diagram-3 text-muted fs-1 mb-2 d-block"></i>
            <p class="text-muted mb-3">কোনো সাব-ক্যাটাগরি পাওয়া যায়নি।</p>
            <button
              type="button"
              class="btn btn-sm btn-outline-primary"
              :disabled="categories.length === 0"
              @click="openModal('subCategory')">
              প্রথম সাব-ক্যাটাগরি যোগ করুন
            </button>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col" style="width: 70px;" class="text-center">#</th>
                  <th scope="col" style="width: 250px;">ক্যাটাগরির নাম</th>
                  <th scope="col">সাব-ক্যাটাগরির নাম</th>
                  <th scope="col" class="text-center" style="width: 120px;">স্ট্যাটাস</th>
                  <th scope="col" class="text-center" style="width: 100px;">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(sub, idx) in subCategories" :key="sub.id">
                  <td class="text-center text-muted small">{{ idx + 1 }}</td>
                  <td class="fw-semibold">{{ getCategoryName(sub.categoryId) }}</td>
                  <td class="fw-semibold">{{ sub.name }}</td>
                  <td class="text-center">
                    <div class="form-check form-switch d-inline-flex justify-content-center m-0">
                      <input
                        class="form-check-input my-0"
                        type="checkbox"
                        role="switch"
                        :checked="sub.isActive"
                        :disabled="togglingId === `sub-${sub.id}`"
                        @change="toggleStatus('subCategory', sub)"
                        style="cursor: pointer; width: 2.2rem; height: 1.15rem;" />
                    </div>
                  </td>
                  <td class="text-center">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary py-0 px-2 d-inline-flex align-items-center gap-1"
                      title="সম্পাদনা করুন"
                      @click="openEditModal('subCategory', sub)">
                      <i class="bi bi-pencil-square"></i>
                      <span>এডিট</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- TAB 3: PRODUCT TYPES (ধরন)                -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'productType'">
          <div class="card-header border-bottom py-3 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <span class="fw-bold settings-card-title">
              ধরনের তালিকা
            </span>
            <button
              type="button"
              class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
              :disabled="categories.length === 0 || subCategories.length === 0"
              @click="openModal('productType')">
              <i class="bi bi-plus-circle"></i>
              <span>নতুন ধরন</span>
            </button>
          </div>

          <div v-if="productTypes.length === 0" class="text-center py-5">
            <i class="bi bi-boxes text-muted fs-1 mb-2 d-block"></i>
            <p class="text-muted mb-3">কোনো ধরনের তথ্য পাওয়া যায়নি।</p>
            <button
              type="button"
              class="btn btn-sm btn-outline-primary"
              :disabled="categories.length === 0 || subCategories.length === 0"
              @click="openModal('productType')">
              প্রথম ধরন যোগ করুন
            </button>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col" style="width: 70px;" class="text-center">#</th>
                  <th scope="col">ক্যাটাগরির নাম</th>
                  <th scope="col">সাব-ক্যাটাগরির নাম</th>
                  <th scope="col">ধরনের নাম</th>
                  <th scope="col" class="text-center" style="width: 120px;">স্ট্যাটাস</th>
                  <th scope="col" class="text-center" style="width: 100px;">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(pt, idx) in productTypes" :key="pt.id">
                  <td class="text-center text-muted small">{{ idx + 1 }}</td>
                  <td class="fw-semibold">{{ getCategoryName(pt.categoryId) }}</td>
                  <td class="fw-semibold">{{ getSubCategoryName(pt.subCategoryId) }}</td>
                  <td class="fw-semibold">{{ pt.name }}</td>
                  <td class="text-center">
                    <div class="form-check form-switch d-inline-flex justify-content-center m-0">
                      <input
                        class="form-check-input my-0"
                        type="checkbox"
                        role="switch"
                        :checked="pt.isActive"
                        :disabled="togglingId === `productType-${pt.id}`"
                        @change="toggleStatus('productType', pt)"
                        style="cursor: pointer; width: 2.2rem; height: 1.15rem;" />
                    </div>
                  </td>
                  <td class="text-center">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary py-0 px-2 d-inline-flex align-items-center gap-1"
                      title="সম্পাদনা করুন"
                      @click="openEditModal('productType', pt)">
                      <i class="bi bi-pencil-square"></i>
                      <span>এডিট</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- TAB 4: SIZES (সাইজ)                       -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'size'">
          <div class="card-header border-bottom py-3 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <span class="fw-bold settings-card-title">
              সাইজের তালিকা
            </span>
            <button
              type="button"
              class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
              :disabled="categories.length === 0"
              @click="openModal('size')">
              <i class="bi bi-plus-circle"></i>
              <span>নতুন সাইজ</span>
            </button>
          </div>

          <div v-if="sizes.length === 0" class="text-center py-5">
            <i class="bi bi-rulers text-muted fs-1 mb-2 d-block"></i>
            <p class="text-muted mb-3">কোনো সাইজ পাওয়া যায়নি।</p>
            <button
              type="button"
              class="btn btn-sm btn-outline-primary"
              :disabled="categories.length === 0"
              @click="openModal('size')">
              প্রথম সাইজ যোগ করুন
            </button>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col" style="width: 70px;" class="text-center">#</th>
                  <th scope="col">ক্যাটাগরির নাম</th>
                  <th scope="col">সাইজের নাম</th>
                  <th scope="col" class="text-center" style="width: 120px;">স্ট্যাটাস</th>
                  <th scope="col" class="text-center" style="width: 100px;">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, idx) in sizes" :key="s.id">
                  <td class="text-center text-muted small">{{ idx + 1 }}</td>
                  <td class="fw-semibold">{{ getCategoryName(s.categoryId) }}</td>
                  <td class="fw-semibold">{{ s.name }}</td>
                  <td class="text-center">
                    <div class="form-check form-switch d-inline-flex justify-content-center m-0">
                      <input
                        class="form-check-input my-0"
                        type="checkbox"
                        role="switch"
                        :checked="s.isActive"
                        :disabled="togglingId === `size-${s.id}`"
                        @change="toggleStatus('size', s)"
                        style="cursor: pointer; width: 2.2rem; height: 1.15rem;" />
                    </div>
                  </td>
                  <td class="text-center">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary py-0 px-2 d-inline-flex align-items-center gap-1"
                      title="সম্পাদনা করুন"
                      @click="openEditModal('size', s)">
                      <i class="bi bi-pencil-square"></i>
                      <span>এডিট</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- TAB 4: COLORS                              -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'color'">
          <div class="card-header border-bottom py-3 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <span class="fw-bold settings-card-title">
              রঙের তালিকা
            </span>
            <button
              type="button"
              class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
              @click="openModal('color')">
              <i class="bi bi-plus-circle"></i>
              <span>নতুন রং</span>
            </button>
          </div>

          <div v-if="colors.length === 0" class="text-center py-5">
            <i class="bi bi-palette text-muted fs-1 mb-2 d-block"></i>
            <p class="text-muted mb-3">কোনো রং পাওয়া যায়নি।</p>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="openModal('color')">
              প্রথম রং যোগ করুন
            </button>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col" style="width: 70px;" class="text-center">#</th>
                  <th scope="col" style="width: 90px;" class="text-center">প্রিভিউ</th>
                  <th scope="col">রঙের নাম</th>
                  <th scope="col">কালার কোড (Hex)</th>
                  <th scope="col" class="text-center" style="width: 120px;">স্ট্যাটাস</th>
                  <th scope="col" class="text-center" style="width: 100px;">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(clr, idx) in colors" :key="clr.id">
                  <td class="text-center text-muted small">{{ idx + 1 }}</td>
                  <td class="text-center">
                    <span
                      class="d-inline-block rounded-circle border shadow-xs"
                      :style="{
                        backgroundColor: clr.code || '#cbd5e1',
                        width: '26px',
                        height: '26px'
                      }"></span>
                  </td>
                  <td class="fw-semibold">{{ clr.name }}</td>
                  <td class="text-muted small font-monospace">{{ clr.code || '-' }}</td>
                  <td class="text-center">
                    <div class="form-check form-switch d-inline-flex justify-content-center m-0">
                      <input
                        class="form-check-input my-0"
                        type="checkbox"
                        role="switch"
                        :checked="clr.isActive"
                        :disabled="togglingId === `color-${clr.id}`"
                        @change="toggleStatus('color', clr)"
                        style="cursor: pointer; width: 2.2rem; height: 1.15rem;" />
                    </div>
                  </td>
                  <td class="text-center">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary py-0 px-2 d-inline-flex align-items-center gap-1"
                      title="সম্পাদনা করুন"
                      @click="openEditModal('color', clr)">
                      <i class="bi bi-pencil-square"></i>
                      <span>এডিট</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>



        <!-- ========================================== -->
        <!-- TAB 6: UNITS OF MEASUREMENT                -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'unit'">
          <div class="card-header border-bottom py-3 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <span class="fw-bold settings-card-title">
              পরিমাপের এককের তালিকা
            </span>
            <button
              type="button"
              class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
              @click="openModal('unit')">
              <i class="bi bi-plus-circle"></i>
              <span>নতুন একক</span>
            </button>
          </div>

          <div v-if="units.length === 0" class="text-center py-5">
            <i class="bi bi-calculator text-muted fs-1 mb-2 d-block"></i>
            <p class="text-muted mb-3">কোনো পরিমাপের একক পাওয়া যায়নি।</p>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="openModal('unit')">
              প্রথম একক যোগ করুন
            </button>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col" style="width: 50px;" class="text-center">#</th>
                  <th scope="col">ক্যাটাগরি</th>
                  <th scope="col">সাব-ক্যাটাগরি</th>
                  <th scope="col">একক</th>
                  <th scope="col">সংক্ষিপ্ত রূপ</th>
                  <th scope="col" class="text-center" style="width: 100px;">স্টেটাস</th>
                  <th scope="col" class="text-center" style="width: 100px;">একশন</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(u, idx) in units" :key="u.id">
                  <td class="text-center text-muted small">{{ idx + 1 }}</td>
                  <td>
                    <span class="small">{{ getCategoryName(u.categoryId) }}</span>
                  </td>
                  <td>
                    <span class="small">{{ getSubCategoryName(u.subCategoryId) }}</span>
                  </td>
                  <td class="fw-semibold">{{ u.name }}</td>
                  <td>
                    <span class="badge unit-badge font-monospace">{{ u.shortName }}</span>
                  </td>
                  <td class="text-center">
                    <div class="form-check form-switch d-inline-flex justify-content-center m-0">
                      <input
                        class="form-check-input my-0"
                        type="checkbox"
                        role="switch"
                        :checked="u.isActive"
                        :disabled="togglingId === `unit-${u.id}`"
                        @change="toggleStatus('unit', u)"
                        style="cursor: pointer; width: 2.2rem; height: 1.15rem;" />
                    </div>
                  </td>
                  <td class="text-center">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary py-0 px-2 d-inline-flex align-items-center gap-1"
                      title="সম্পাদনা করুন"
                      @click="openEditModal('unit', u)">
                      <i class="bi bi-pencil-square"></i>
                      <span>এডিট</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- TAB 7: CHALLAN TYPES (চালানের ধরন)         -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'challanType'">
          <div class="card-header border-bottom py-3 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <span class="fw-bold settings-card-title d-flex align-items-center gap-2">
                <i class="bi bi-receipt text-primary fs-5"></i>
                চালানের ধরনের তালিকা
              </span>
              <div class="text-muted small">
                ক্রয় ও বিক্রয় চালানের নির্ধারিত ধরনসমূহ (যেমন: ডেলিভারি চালান, মূসক ৬.৩, বিল অব এন্ট্রি)।
              </div>
            </div>
            <button
              type="button"
              class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
              @click="openModal('challanType')">
              <i class="bi bi-plus-circle"></i>
              <span>নতুন চালানের ধরন</span>
            </button>
          </div>

          <div v-if="challanTypes.length === 0" class="text-center py-5">
            <i class="bi bi-receipt text-muted fs-1 mb-2 d-block"></i>
            <p class="text-muted mb-3">কোনো চালানের ধরন পাওয়া যায়নি।</p>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="openModal('challanType')">
              প্রথম চালানের ধরন যোগ করুন
            </button>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col" style="width: 50px;" class="text-center">#</th>
                  <th scope="col" style="width: 25%;">চালানের ধরনের নাম</th>
                  <th scope="col" style="width: 20%;">কোড (Code)</th>
                  <th scope="col">বিবরণ</th>
                  <th scope="col" class="text-center" style="width: 100px;">স্টেটাস</th>
                  <th scope="col" class="text-center" style="width: 100px;">একশন</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(ct, idx) in challanTypes" :key="ct.id">
                  <td class="text-center text-muted small">{{ idx + 1 }}</td>
                  <td class="fw-semibold">{{ ct.name }}</td>
                  <td>
                    <span v-if="ct.code" class="badge bg-secondary-subtle text-secondary-emphasis font-monospace">{{ ct.code }}</span>
                    <span v-else class="text-muted small">-</span>
                  </td>
                  <td class="small text-muted">{{ ct.description || '-' }}</td>
                  <td class="text-center">
                    <div class="form-check form-switch d-inline-flex justify-content-center m-0">
                      <input
                        class="form-check-input my-0"
                        type="checkbox"
                        role="switch"
                        :checked="ct.isActive"
                        :disabled="togglingId === `challanType-${ct.id}`"
                        @change="toggleStatus('challanType', ct)"
                        style="cursor: pointer; width: 2.2rem; height: 1.15rem;" />
                    </div>
                  </td>
                  <td class="text-center">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary py-0 px-2 d-inline-flex align-items-center gap-1"
                      title="সম্পাদনা করুন"
                      @click="openEditModal('challanType', ct)">
                      <i class="bi bi-pencil-square"></i>
                      <span>এডিট</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- TAB 8: VENDOR TYPES (সরবরাহকারীর ধরন)      -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'vendorType'">
          <div class="card-header border-bottom py-3 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <span class="fw-bold settings-card-title d-flex align-items-center gap-2">
                <i class="bi bi-person-badge-fill text-primary fs-5"></i>
                সরবরাহকারীর ধরনের তালিকা
              </span>
              <div class="text-muted small">
                পণ্য ক্রয়ের সময় সরবরাহকারী প্রতিষ্ঠানের ধরন (যেমন: সাপ্লায়ার, প্রস্তুতকারী ইত্যাদি)।
              </div>
            </div>
            <button
              type="button"
              class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
              @click="openModal('vendorType')">
              <i class="bi bi-plus-circle"></i>
              <span>নতুন সরবরাহকারীর ধরন</span>
            </button>
          </div>

          <div v-if="vendorTypes.length === 0" class="text-center py-5">
            <i class="bi bi-person-badge text-muted fs-1 mb-2 d-block"></i>
            <p class="text-muted mb-3">কোনো সরবরাহকারীর ধরন পাওয়া যায়নি।</p>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="openModal('vendorType')">
              প্রথম সরবরাহকারীর ধরন যোগ করুন
            </button>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col" style="width: 50px;" class="text-center">#</th>
                  <th scope="col">ধরনের নাম</th>
                  <th scope="col" style="width: 25%;">শর্ট কোড</th>
                  <th scope="col" class="text-center" style="width: 100px;">স্টেটাস</th>
                  <th scope="col" class="text-center" style="width: 100px;">একশন</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(vt, idx) in vendorTypes" :key="vt.id">
                  <td class="text-center text-muted small">{{ idx + 1 }}</td>
                  <td class="fw-semibold">{{ vt.name }}</td>
                  <td>
                    <span v-if="vt.code" class="badge bg-secondary-subtle text-secondary-emphasis font-monospace">{{ vt.code }}</span>
                    <span v-else class="text-muted small">-</span>
                  </td>
                  <td class="text-center">
                    <div class="form-check form-switch d-inline-flex justify-content-center m-0">
                      <input
                        class="form-check-input my-0"
                        type="checkbox"
                        role="switch"
                        :checked="vt.isActive"
                        :disabled="togglingId === `vendorType-${vt.id}`"
                        @change="toggleStatus('vendorType', vt)"
                        style="cursor: pointer; width: 2.2rem; height: 1.15rem;" />
                    </div>
                  </td>
                  <td class="text-center">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary py-0 px-2 d-inline-flex align-items-center gap-1"
                      title="সম্পাদনা করুন"
                      @click="openEditModal('vendorType', vt)">
                      <i class="bi bi-pencil-square"></i>
                      <span>এডিট</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- TAB 9: GLOBAL BANGLA FONT SELECTION (MFS LEDGER STYLE) -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'font'">
          <div class="card-header border-bottom py-3 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <span class="fw-bold settings-card-title d-flex align-items-center gap-2">
                <i class="bi bi-fonts text-primary fs-5"></i>
                সিস্টেম ডিফল্ট বাংলা ফন্ট সেটিংস
              </span>
              <div class="text-muted small">
                সুপারএডমিন হিসেবে এখান থেকে যে ফন্টটি নির্ধারণ করবেন, তা সমস্ত সাধারণ ইউজার ও ড্যাশবোর্ডে স্বয়ংক্রিয়ভাবে ডিফল্ট ফন্ট হিসেবে কার্যকর হবে।
              </div>
            </div>
          </div>

          <div class="p-3 p-md-4">
            <div class="row g-3">
              <!-- ফন্ট ১: Noto Sans Bengali (Official Standard) -->
              <div class="col-12 col-md-4">
                <div
                  class="border rounded-3 p-3 h-100 font-card transition-all position-relative"
                  :class="selectedFontId === 'noto-sans-bengali' ? 'border-primary bg-primary-subtle shadow-sm active-font-card' : 'hover-border-primary'"
                  style="cursor: pointer;"
                  @click="previewAndSelectFont('noto-sans-bengali')">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold fs-6" style="font-family: 'Noto Sans Bengali', sans-serif;">
                      নোতো সান্স (Noto Sans Bengali)
                    </span>
                    <span class="badge bg-success text-white" style="font-size: 10px;">অফিসিয়াল স্ট্যান্ডার্ড</span>
                  </div>
                  <p class="text-muted small mb-3">
                    গুগলের সার্বজনীন স্ট্যান্ডার্ড ও পরিচ্ছন্ন ফন্ট। ফরমাল ও প্রফেশনাল ব্যবহারের জন্য সেরা।
                  </p>
                  <div class="p-2 bg-body rounded border small mb-3" style="font-family: 'Noto Sans Bengali', sans-serif;">
                    <div class="fw-bold mb-1 text-muted" style="font-size: 11px;">নমুনা টেক্সট:</div>
                    <div class="fw-semibold">পোশাক, ক্যাটাগরি, সাব-ক্যাটাগরি ও ফ্যাশন ১২৩৪৫৬৭৮৯০</div>
                  </div>
                  <div class="form-check mt-auto pt-2">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="systemFont"
                      id="fontNoto"
                      value="noto-sans-bengali"
                      :checked="selectedFontId === 'noto-sans-bengali'" />
                    <label class="form-check-label small fw-semibold" for="fontNoto">
                      {{ selectedFontId === 'noto-sans-bengali' ? 'নির্বাচিত ফন্ট' : 'এই ফন্টটি বেছে নিন' }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- ফন্ট ২: Hind Siliguri -->
              <div class="col-12 col-md-4">
                <div
                  class="border rounded-3 p-3 h-100 font-card transition-all position-relative"
                  :class="selectedFontId === 'hind-siliguri' ? 'border-primary bg-primary-subtle shadow-sm active-font-card' : 'hover-border-primary'"
                  style="cursor: pointer;"
                  @click="previewAndSelectFont('hind-siliguri')">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold fs-6" style="font-family: 'Hind Siliguri', sans-serif;">
                      হিন্দ শিলিগুড়ি (Hind Siliguri)
                    </span>
                    <span class="badge bg-primary text-white" style="font-size: 10px;">জনপ্রিয়</span>
                  </div>
                  <p class="text-muted small mb-3">
                    সবচেয়ে জনপ্রিয়, আধুনিক ও দৃষ্টিনন্দন UI ফন্ট। ড্যাশবোর্ড ও অ্যাপের জন্য সেরা।
                  </p>
                  <div class="p-2 bg-body rounded border small mb-3" style="font-family: 'Hind Siliguri', sans-serif;">
                    <div class="fw-bold mb-1 text-muted" style="font-size: 11px;">নমুনা টেক্সট:</div>
                    <div class="fw-semibold">পোশাক, ক্যাটাগরি, সাব-ক্যাটাগরি ও ফ্যাশন ১২৩৪৫৬৭৮৯০</div>
                  </div>
                  <div class="form-check mt-auto pt-2">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="systemFont"
                      id="fontHind"
                      value="hind-siliguri"
                      :checked="selectedFontId === 'hind-siliguri'" />
                    <label class="form-check-label small fw-semibold" for="fontHind">
                      {{ selectedFontId === 'hind-siliguri' ? 'নির্বাচিত ফন্ট' : 'এই ফন্টটি বেছে নিন' }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- ফন্ট ৩: Anek Bangla -->
              <div class="col-12 col-md-4">
                <div
                  class="border rounded-3 p-3 h-100 font-card transition-all position-relative"
                  :class="selectedFontId === 'anek-bangla' ? 'border-primary bg-primary-subtle shadow-sm active-font-card' : 'hover-border-primary'"
                  style="cursor: pointer;"
                  @click="previewAndSelectFont('anek-bangla')">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold fs-6" style="font-family: 'Anek Bangla', sans-serif;">
                      অনেক বাংলা (Anek Bangla)
                    </span>
                    <span class="badge bg-info text-white" style="font-size: 10px;">মডার্ন</span>
                  </div>
                  <p class="text-muted small mb-3">
                    গুগলের আধুনিক ভেরিয়েবল ফন্ট। এর কার্ভগুলো অত্যন্ত স্মার্ট ও টেক-প্রোডাক্ট লুক দেয়।
                  </p>
                  <div class="p-2 bg-body rounded border small mb-3" style="font-family: 'Anek Bangla', sans-serif;">
                    <div class="fw-bold mb-1 text-muted" style="font-size: 11px;">নমুনা টেক্সট:</div>
                    <div class="fw-semibold">পোশাক, ক্যাটাগরি, সাব-ক্যাটাগরি ও ফ্যাশন ১২৩৪৫৬৭৮৯০</div>
                  </div>
                  <div class="form-check mt-auto pt-2">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="systemFont"
                      id="fontAnek"
                      value="anek-bangla"
                      :checked="selectedFontId === 'anek-bangla'" />
                    <label class="form-check-label small fw-semibold" for="fontAnek">
                      {{ selectedFontId === 'anek-bangla' ? 'নির্বাচিত ফন্ট' : 'এই ফন্টটি বেছে নিন' }}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Action Button -->
            <div class="mt-4 pt-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div class="text-muted small">
                <i class="bi bi-shield-check text-primary me-1"></i>
                <span v-if="isSuperAdmin">আপনি <strong>সুপার এডমিন</strong> হিসেবে এই ফন্টটি পুরো সিস্টেমের জন্য নির্ধারণ করতে পারবেন।</span>
                <span v-else>সুপার এডমিন নির্ধারিত ফন্ট পুরো সিস্টেমে কার্যকর রয়েছে।</span>
              </div>
              <button
                v-if="isSuperAdmin"
                type="button"
                class="btn btn-primary d-inline-flex align-items-center gap-2 px-3 shadow-sm"
                :disabled="savingFont"
                @click="saveSystemFont">
                <span v-if="savingFont" class="spinner-border spinner-border-sm" role="status"></span>
                <i v-else class="bi bi-check2-circle"></i>
                <span>সিস্টেম ডিফল্ট হিসেবে সেভ করুন</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- DYNAMIC CREATE MODAL                       -->
    <!-- ========================================== -->
    <div
      v-if="modalType"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5);"
      @mousedown="onBackdropMouseDown"
      @mouseup="onBackdropMouseUp"
      @keydown.esc="closeModal">
      <div
        class="modal-dialog modal-dialog-centered"
        @mousedown.stop
        @mouseup.stop
        @click.stop>
        <div class="modal-content shadow border-0">
          <div class="modal-header border-bottom">
            <h5 class="modal-title fw-bold">
              <i :class="modalIcon" class="text-primary me-2"></i>{{ modalTitle }}
            </h5>
            <button type="button" class="btn-close" aria-label="Close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="submitModalForm">
            <div class="modal-body">
              <div v-if="modalError" class="alert alert-danger py-2 small mb-3">
                <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ modalError }}
              </div>

              <!-- 1. Category Form (no slug) -->
              <template v-if="modalType === 'category'">
                <div class="mb-3">
                  <label for="catName" class="form-label fw-medium small">
                    ক্যাটাগরির নাম <span class="text-danger">*</span>
                  </label>
                  <input
                    id="catName"
                    v-model.trim="categoryForm.name"
                    type="text"
                    class="form-control"
                    placeholder="ক্যাটাগরির নাম লিখুন"
                    required
                    autofocus />
                </div>
              </template>

              <!-- 2. Sub-Category Form (Category Dropdown) -->
              <template v-if="modalType === 'subCategory'">
                <div class="mb-3">
                  <label for="subCatParentId" class="form-label fw-medium small">
                    ক্যাটাগরি নির্বাচন করুন <span class="text-danger">*</span>
                  </label>
                  <select
                    id="subCatParentId"
                    v-model.number="subCategoryForm.categoryId"
                    class="form-select"
                    required>
                    <option value="" disabled>-- ক্যাটাগরি বেছে নিন --</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">
                      {{ c.name }}
                    </option>
                  </select>
                  <div class="form-text small text-muted">
                    নতুন ক্যাটাগরি যোগ করলে কোনো রিলোড ছাড়াই তা এখানে প্রদর্শিত হবে।
                  </div>
                </div>
                <div class="mb-3">
                  <label for="subCatName" class="form-label fw-medium small">
                    সাব-ক্যাটাগরির নাম <span class="text-danger">*</span>
                  </label>
                  <input
                    id="subCatName"
                    v-model.trim="subCategoryForm.name"
                    type="text"
                    class="form-control"
                    placeholder="সাব-ক্যাটাগরির নাম লিখুন"
                    required
                    autofocus />
                </div>
              </template>

              <!-- 4. Size Form (Category Dependency) -->
              <template v-if="modalType === 'size'">
                <div class="mb-3">
                  <label for="sizeCatId" class="form-label fw-medium small">
                    ক্যাটাগরি নির্বাচন করুন <span class="text-danger">*</span>
                  </label>
                  <select
                    id="sizeCatId"
                    v-model.number="sizeForm.categoryId"
                    class="form-select"
                    required>
                    <option value="" disabled>-- ক্যাটাগরি বেছে নিন --</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">
                      {{ c.name }}
                    </option>
                  </select>
                </div>

                <div class="mb-3">
                  <label for="sizeName" class="form-label fw-medium small">
                    সাইজের নাম <span class="text-danger">*</span>
                  </label>
                  <input
                    id="sizeName"
                    v-model.trim="sizeForm.name"
                    type="text"
                    class="form-control"
                    placeholder="সাইজের নাম লিখুন (যেমন: S, M, L, XL, 38, 40 ইত্যাদি)"
                    required
                    autofocus />
                  <div class="form-text small text-muted mt-1">
                    <i class="bi bi-info-circle me-1"></i>কমা (,) দিয়ে একবারে একাধিক সাইজ লিখলে প্রতিটি সাইজ আলাদা আলাদা রো হিসেবে যুক্ত হবে (যেমন: S, M, L, XL)।
                  </div>
                </div>
              </template>

              <!-- 5. Color Form -->
              <template v-if="modalType === 'color'">
                <div class="mb-3">
                  <label for="colorName" class="form-label fw-medium small">
                    রঙের নাম <span class="text-danger">*</span>
                  </label>
                  <input
                    id="colorName"
                    v-model.trim="colorForm.name"
                    type="text"
                    class="form-control"
                    placeholder="রঙের নাম লিখুন"
                    required
                    autofocus />
                </div>
                <div class="mb-3">
                  <label for="colorCode" class="form-label fw-medium small">কালার হেক্স কোড (অপশনাল)</label>
                  <div class="input-group">
                    <input
                      v-model="colorForm.code"
                      type="color"
                      class="form-control form-control-color"
                      style="width: 48px; flex: none;"
                      title="কালার বেছে নিন" />
                    <input
                      id="colorCode"
                      v-model.trim="colorForm.code"
                      type="text"
                      class="form-control font-monospace"
                      placeholder="#000000" />
                  </div>
                </div>
              </template>

              <!-- 6. Product Type Form (Category & Sub-Category Dependency) -->
              <template v-if="modalType === 'productType'">
                <div class="mb-3">
                  <label for="typeCatId" class="form-label fw-medium small">
                    ক্যাটাগরি নির্বাচন করুন <span class="text-danger">*</span>
                  </label>
                  <select
                    id="typeCatId"
                    v-model.number="productTypeForm.categoryId"
                    class="form-select"
                    @change="onProductTypeCategoryChange"
                    required>
                    <option value="" disabled>-- ক্যাটাগরি বেছে নিন --</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">
                      {{ c.name }}
                    </option>
                  </select>
                </div>

                <div class="mb-3">
                  <label for="typeSubCatId" class="form-label fw-medium small">
                    সাব-ক্যাটাগরি নির্বাচন করুন <span class="text-danger">*</span>
                  </label>
                  <select
                    id="typeSubCatId"
                    v-model.number="productTypeForm.subCategoryId"
                    class="form-select"
                    :disabled="filteredSubCategoriesForProductType.length === 0"
                    required>
                    <option value="" disabled>
                      {{ filteredSubCategoriesForProductType.length === 0 ? '-- এই ক্যাটাগরিতে কোনো সাব-ক্যাটাগরি নেই --' : '-- সাব-ক্যাটাগরি বেছে নিন --' }}
                    </option>
                    <option v-for="sc in filteredSubCategoriesForProductType" :key="sc.id" :value="sc.id">
                      {{ sc.name }}
                    </option>
                  </select>
                  <div v-if="filteredSubCategoriesForProductType.length === 0 && productTypeForm.categoryId" class="form-text small text-warning">
                    <i class="bi bi-info-circle me-1"></i>নির্বাচিত ক্যাটাগরির অধীনে আগে সাব-ক্যাটাগরি যোগ করুন।
                  </div>
                </div>

                <div class="mb-3">
                  <label for="productTypeName" class="form-label fw-medium small">
                    ধরনের নাম <span class="text-danger">*</span>
                  </label>
                  <input
                    id="productTypeName"
                    v-model.trim="productTypeForm.name"
                    type="text"
                    class="form-control"
                    placeholder="ধরনের নাম লিখুন (যেমন: গোল গলা, ফুল স্লিভ ইত্যাদি)"
                    required
                    autofocus />
                </div>
              </template>

              <!-- 7. Unit of Measurement Form -->
              <template v-if="modalType === 'unit'">
                <!-- ১. ক্যাটাগরি -->
                <div class="mb-3">
                  <label for="unitCategory" class="form-label fw-medium small">
                    ক্যাটাগরি <span class="text-danger">*</span>
                  </label>
                  <select
                    id="unitCategory"
                    v-model="unitForm.categoryId"
                    class="form-select"
                    required
                    @change="onUnitCategoryChange">
                    <option value="" disabled>ক্যাটাগরি নির্বাচন করুন</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>

                <!-- ২. সাব-ক্যাটাগরি (ডিপেন্ডেন্ট) -->
                <div class="mb-3">
                  <label for="unitSubCategory" class="form-label fw-medium small">
                    সাব-ক্যাটাগরি <span class="text-danger">*</span>
                  </label>
                  <select
                    id="unitSubCategory"
                    v-model="unitForm.subCategoryId"
                    class="form-select"
                    :disabled="!unitForm.categoryId || filteredSubCategoriesForUnit.length === 0"
                    required>
                    <option value="" disabled>
                      {{ !unitForm.categoryId ? 'আগে ক্যাটাগরি নির্বাচন করুন' : filteredSubCategoriesForUnit.length === 0 ? 'এই ক্যাটাগরিতে কোনো সাব-ক্যাটাগরি নেই' : 'সাব-ক্যাটাগরি নির্বাচন করুন' }}
                    </option>
                    <option v-for="sc in filteredSubCategoriesForUnit" :key="sc.id" :value="sc.id">
                      {{ sc.name }}
                    </option>
                  </select>
                </div>

                <!-- ৩. এককের নাম -->
                <div class="mb-3">
                  <label for="unitName" class="form-label fw-medium small">
                    এককের নাম <span class="text-danger">*</span>
                  </label>
                  <input
                    id="unitName"
                    v-model.trim="unitForm.name"
                    type="text"
                    class="form-control"
                    placeholder="যেমন: পিস, ডজন, কেজি, গজ, মিটার ইত্যাদি"
                    required />
                </div>

                <!-- ৪. সংক্ষিপ্ত রূপ -->
                <div class="mb-3">
                  <label for="unitShort" class="form-label fw-medium small">
                    সংক্ষিপ্ত রূপ (Short Name) <span class="text-danger">*</span>
                  </label>
                  <input
                    id="unitShort"
                    v-model.trim="unitForm.shortName"
                    type="text"
                    class="form-control font-monospace"
                    placeholder="যেমন: pcs, doz, kg, yd, mtr ইত্যাদি"
                    required />
                </div>
              </template>

              <!-- 8. Challan Type Form (চালানের ধরন) -->
              <template v-if="modalType === 'challanType'">
                <div class="mb-3">
                  <label for="challanTypeName" class="form-label fw-medium small">
                    চালানের ধরনের নাম <span class="text-danger">*</span>
                  </label>
                  <input
                    id="challanTypeName"
                    v-model.trim="challanTypeForm.name"
                    type="text"
                    class="form-control"
                    placeholder="যেমন: ডেলিভারি চালান, মূসক ৬.৩, বিল অব এন্ট্রি ইত্যাদি"
                    required
                    autofocus />
                </div>
                <div class="mb-3">
                  <label for="challanTypeCode" class="form-label fw-medium small">
                    শর্টকোড (ঐচ্ছিক)
                  </label>
                  <input
                    id="challanTypeCode"
                    v-model.trim="challanTypeForm.code"
                    type="text"
                    class="form-control font-monospace text-uppercase"
                    placeholder="যেমন: DELIVERY, MUSHAK_6_3" />
                </div>
                <div class="mb-3">
                  <label for="challanTypeDesc" class="form-label fw-medium small">
                    বিবরণ (ঐচ্ছিক)
                  </label>
                  <textarea
                    id="challanTypeDesc"
                    v-model.trim="challanTypeForm.description"
                    rows="2"
                    class="form-control small"
                    placeholder="চালানের ধরন সম্পর্কিত সংক্ষিপ্ত বিবরণ"></textarea>
                </div>
              </template>

              <!-- 9. Vendor Type Form (সরবরাহকারীর ধরন) -->
              <template v-if="modalType === 'vendorType'">
                <div class="mb-3">
                  <label for="vendorTypeName" class="form-label fw-medium small">
                    সরবরাহকারীর ধরনের নাম <span class="text-danger">*</span>
                  </label>
                  <input
                    id="vendorTypeName"
                    v-model.trim="vendorTypeForm.name"
                    type="text"
                    class="form-control"
                    placeholder="যেমন: সাপ্লায়ার, প্রস্তুতকারী ইত্যাদি"
                    required
                    autofocus />
                </div>
                <div class="mb-3">
                  <label for="vendorTypeCode" class="form-label fw-medium small">
                    শর্টকোড (ঐচ্ছিক)
                  </label>
                  <input
                    id="vendorTypeCode"
                    v-model.trim="vendorTypeForm.code"
                    type="text"
                    class="form-control font-monospace"
                    placeholder="যেমন: supplier, manufacturer" />
                </div>
              </template>
            </div>

            <div class="modal-footer border-top">
              <button type="button" class="btn btn-secondary" :disabled="modalSubmitting" @click="closeModal">
                বাতিল
              </button>
              <button
                type="submit"
                class="btn btn-primary d-inline-flex align-items-center gap-1"
                :disabled="modalSubmitting">
                <span v-if="modalSubmitting" class="spinner-border spinner-border-sm" role="status"></span>
                <i v-else :class="isEditing ? 'bi bi-check2-circle' : 'bi bi-check-circle'"></i>
                <span>{{ isEditing ? 'আপডেট করুন' : 'সংরক্ষণ করুন' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";
import axios from "axios";
import { computed, inject, onMounted, reactive, ref } from "vue";
import Toast from "@/components/Toast.vue";
import { useAdminUiStore } from "@/stores/admin-ui";
import { hasRole } from "@/composables/useAuth";

useHead({ title: "গ্লোবাল সেটিংস - Fashion" });

const setPageTitle = inject<((title: string) => void) | undefined>("setPageTitle");
if (setPageTitle) {
  setPageTitle("গ্লোবাল সেটিংস");
}

type TabType = "category" | "subCategory" | "size" | "color" | "productType" | "unit" | "challanType" | "vendorType" | "font";
type ModalType = "category" | "subCategory" | "sizeGroup" | "size" | "color" | "productType" | "unit" | "challanType" | "vendorType" | null;

const ui = useAdminUiStore();
const isSuperAdmin = computed(() => hasRole("super_admin"));
const selectedFontId = ref<string>(ui.currentFontId || "noto-sans-bengali");
const savingFont = ref(false);

function previewAndSelectFont(fontId: string) {
  selectedFontId.value = fontId;
  ui.applyFont(fontId);
}

async function loadSystemFont() {
  try {
    const res = await axios.get("/api/settings/public");
    const found = res.data?.data?.find((s: any) => s.key === "system_bangla_font");
    if (found?.value) {
      selectedFontId.value = found.value;
      ui.applyFont(found.value);
    } else {
      selectedFontId.value = ui.currentFontId || "noto-sans-bengali";
    }
  } catch {
    selectedFontId.value = ui.currentFontId || "noto-sans-bengali";
  }
}

async function saveSystemFont() {
  savingFont.value = true;
  try {
    await axios.post("/api/settings", {
      key: "system_bangla_font",
      value: selectedFontId.value,
      group: "general",
      description: "Default Bangla font for all users"
    });
    ui.applyFont(selectedFontId.value);
    showToast("সিস্টেম ডিফল্ট বাংলা ফন্ট সফলভাবে সংরক্ষিত হয়েছে", "success");
  } catch (err: any) {
    showToast(err?.response?.data?.message || "ফন্ট সেভ করতে সমস্যা হয়েছে", "danger");
  } finally {
    savingFont.value = false;
  }
}

interface CategoryItem {
  id: number;
  name: string;
  isActive: boolean;
  createdAt?: string;
  subCategories?: SubCategoryItem[];
}

interface SubCategoryItem {
  id: number;
  categoryId: number;
  name: string;
  isActive: boolean;
  createdAt?: string;
}

interface SizeItem {
  id: number;
  categoryId: number;
  subCategoryId?: number | null;
  sizeGroupId?: number | null;
  name: string;
  sortOrder?: number;
  isActive: boolean;
  createdAt?: string;
}

interface SizeGroupItem {
  id: number;
  name: string;
  isActive: boolean;
  sizes: SizeItem[];
}

interface ColorItem {
  id: number;
  name: string;
  code?: string | null;
  isActive: boolean;
}

interface ProductTypeItem {
  id: number;
  categoryId: number;
  subCategoryId: number;
  name: string;
  isActive: boolean;
  createdAt?: string;
}

interface UnitItem {
  id: number;
  categoryId?: number | null;
  subCategoryId?: number | null;
  name: string;
  shortName: string;
  isActive: boolean;
  createdAt?: string;
}

interface ChallanTypeItem {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
}

interface VendorTypeItem {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
}

// Reactive UI states
const activeTab = ref<TabType>("category");
const loading = ref(true);
const modalSubmitting = ref(false);
const togglingId = ref<string | null>(null);
const modalType = ref<ModalType>(null);
const modalError = ref("");
const isEditing = ref(false);
const editingId = ref<number | null>(null);
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

// Master Data Arrays (Vue Reactive)
const categories = ref<CategoryItem[]>([]);
const subCategories = ref<SubCategoryItem[]>([]);
const sizeGroups = ref<SizeGroupItem[]>([]);
const sizes = ref<SizeItem[]>([]);
const colors = ref<ColorItem[]>([]);
const productTypes = ref<ProductTypeItem[]>([]);
const units = ref<UnitItem[]>([]);
const challanTypes = ref<ChallanTypeItem[]>([]);
const vendorTypes = ref<VendorTypeItem[]>([]);

// Forms
const categoryForm = reactive({ name: "" });
const subCategoryForm = reactive({ categoryId: "" as string | number, name: "" });
const sizeGroupForm = reactive({ name: "" });
const sizeForm = reactive({ categoryId: "" as string | number, name: "" });
const colorForm = reactive({ name: "", code: "#000000" });
const productTypeForm = reactive({ categoryId: "" as string | number, subCategoryId: "" as string | number, name: "" });
const unitForm = reactive({
  categoryId: "" as string | number,
  subCategoryId: "" as string | number,
  name: "",
  shortName: ""
});
const challanTypeForm = reactive({
  name: "",
  code: "",
  description: ""
});
const vendorTypeForm = reactive({
  name: "",
  code: ""
});

const filteredSubCategoriesForProductType = computed(() => {
  if (!productTypeForm.categoryId) return [];
  return subCategories.value.filter((sc) => sc.categoryId === Number(productTypeForm.categoryId));
});

function onProductTypeCategoryChange() {
  const available = filteredSubCategoriesForProductType.value;
  if (available.length > 0) {
    productTypeForm.subCategoryId = available[0].id;
  } else {
    productTypeForm.subCategoryId = "";
  }
}

const filteredSubCategoriesForUnit = computed(() => {
  if (!unitForm.categoryId) return [];
  return subCategories.value.filter((sc) => sc.categoryId === Number(unitForm.categoryId));
});

function onUnitCategoryChange() {
  const available = filteredSubCategoriesForUnit.value;
  if (available.length > 0) {
    unitForm.subCategoryId = available[0].id;
  } else {
    unitForm.subCategoryId = "";
  }
}

function showToast(message: string, type: "success" | "danger" = "success") {
  toastRef.value?.toastme(message, type);
}

const modalTitle = computed(() => {
  if (isEditing.value) {
    switch (modalType.value) {
      case "category":
        return "ক্যাটাগরি সম্পাদনা";
      case "subCategory":
        return "সাব-ক্যাটাগরি সম্পাদনা";
      case "sizeGroup":
        return "সাইজ গ্রুপ সম্পাদনা";
      case "size":
        return "সাইজ সম্পাদনা";
      case "color":
        return "রং সম্পাদনা";
      case "productType":
        return "ধরনের নাম সম্পাদনা";
      case "unit":
        return "পরিমাপের একক সম্পাদনা";
      case "challanType":
        return "চালানের ধরন সম্পাদনা";
      case "vendorType":
        return "সরবরাহকারীর ধরন সম্পাদনা";
      default:
        return "সম্পাদনা";
    }
  }
  switch (modalType.value) {
    case "category":
      return "নতুন ক্যাটাগরি";
    case "subCategory":
      return "নতুন সাব-ক্যাটাগরি";
    case "sizeGroup":
      return "নতুন সাইজ গ্রুপ";
    case "size":
      return "নতুন সাইজ";
    case "color":
      return "নতুন রং";
    case "productType":
      return "নতুন ধরন";
    case "unit":
      return "নতুন পরিমাপের একক";
    case "challanType":
      return "নতুন চালানের ধরন";
    case "vendorType":
      return "নতুন সরবরাহকারীর ধরন";
    default:
      return "";
  }
});

const modalIcon = computed(() => {
  if (isEditing.value) {
    return "bi bi-pencil-square";
  }
  switch (modalType.value) {
    case "category":
      return "bi bi-tags";
    case "subCategory":
      return "bi bi-diagram-3";
    case "sizeGroup":
      return "bi bi-folder-plus";
    case "size":
      return "bi bi-rulers";
    case "color":
      return "bi bi-palette";
    case "productType":
      return "bi bi-boxes";
    case "unit":
      return "bi bi-calculator";
    case "challanType":
      return "bi bi-receipt";
    case "vendorType":
      return "bi bi-person-badge";
    default:
      return "bi bi-plus-circle";
  }
});

/**
 * Load all master data lists in one clean request
 */
async function fetchMasterData() {
  loading.value = true;
  try {
    const res = await axios.get("/api/catalog/master");
    const data = res.data?.data || {};
    categories.value = data.categories || [];
    subCategories.value = data.subCategories || [];
    sizeGroups.value = data.sizeGroups || [];
    sizes.value = data.sizes || [];
    colors.value = data.colors || [];
    productTypes.value = data.productTypes || [];
    units.value = data.units || [];
    challanTypes.value = data.challanTypes || [];
    vendorTypes.value = data.vendorTypes || [];
  } catch (error: any) {
    showToast(error.response?.data?.message || "মাস্টার ডাটা লোড করতে ব্যর্থ হয়েছে", "danger");
  } finally {
    loading.value = false;
  }
}

function getCategoryName(categoryId?: number | null) {
  if (!categoryId) return "-";
  const cat = categories.value.find((c) => c.id === categoryId);
  return cat ? cat.name : "-";
}

function getSubCategoryName(subCategoryId?: number | null) {
  if (!subCategoryId) return "-";
  const sub = subCategories.value.find((s) => s.id === subCategoryId);
  return sub ? sub.name : "-";
}

function openModal(type: ModalType) {
  isEditing.value = false;
  editingId.value = null;
  modalType.value = type;
  modalError.value = "";
  if (type === "category") categoryForm.name = "";
  if (type === "subCategory") {
    subCategoryForm.categoryId = categories.value[0]?.id || "";
    subCategoryForm.name = "";
  }
  if (type === "size") {
    sizeForm.categoryId = categories.value[0]?.id || "";
    sizeForm.name = "";
  }
  if (type === "color") {
    colorForm.name = "";
    colorForm.code = "#000000";
  }
  if (type === "productType") {
    productTypeForm.categoryId = categories.value[0]?.id || "";
    const subs = subCategories.value.filter((s) => s.categoryId === Number(productTypeForm.categoryId));
    productTypeForm.subCategoryId = subs[0]?.id || "";
    productTypeForm.name = "";
  }
  if (type === "unit") {
    unitForm.categoryId = categories.value[0]?.id || "";
    const subs = subCategories.value.filter((s) => s.categoryId === Number(unitForm.categoryId));
    unitForm.subCategoryId = subs[0]?.id || "";
    unitForm.name = "";
    unitForm.shortName = "";
  }
  if (type === "challanType") {
    challanTypeForm.name = "";
    challanTypeForm.code = "";
    challanTypeForm.description = "";
  }
  if (type === "vendorType") {
    vendorTypeForm.name = "";
    vendorTypeForm.code = "";
  }
}

function openEditModal(type: ModalType, item: any) {
  isEditing.value = true;
  editingId.value = item.id;
  modalType.value = type;
  modalError.value = "";

  if (type === "category") {
    categoryForm.name = item.name;
  } else if (type === "subCategory") {
    subCategoryForm.categoryId = item.categoryId;
    subCategoryForm.name = item.name;
  } else if (type === "size") {
    sizeForm.categoryId = item.categoryId;
    sizeForm.name = item.name;
  } else if (type === "color") {
    colorForm.name = item.name;
    colorForm.code = item.code || "#000000";
  } else if (type === "productType") {
    productTypeForm.categoryId = item.categoryId;
    productTypeForm.subCategoryId = item.subCategoryId;
    productTypeForm.name = item.name;
  } else if (type === "unit") {
    unitForm.categoryId = item.categoryId || "";
    unitForm.subCategoryId = item.subCategoryId || "";
    unitForm.name = item.name;
    unitForm.shortName = item.shortName;
  } else if (type === "challanType") {
    challanTypeForm.name = item.name;
    challanTypeForm.code = item.code || "";
    challanTypeForm.description = item.description || "";
  } else if (type === "vendorType") {
    vendorTypeForm.name = item.name;
    vendorTypeForm.code = item.code || "";
  }
}

function openModalForSubCategory(categoryId: number) {
  openModal("subCategory");
  subCategoryForm.categoryId = categoryId;
}

function closeModal() {
  modalType.value = null;
  modalError.value = "";
  isEditing.value = false;
  editingId.value = null;
}

let backdropMouseDown = false;

function onBackdropMouseDown(e: MouseEvent) {
  backdropMouseDown = e.target === e.currentTarget;
}

function onBackdropMouseUp(e: MouseEvent) {
  // Never close on backdrop click when editing to prevent losing user edits
  if (isEditing.value) {
    backdropMouseDown = false;
    return;
  }
  // Only close if mousedown and mouseup strictly started and ended on backdrop
  if (backdropMouseDown && e.target === e.currentTarget) {
    closeModal();
  }
  backdropMouseDown = false;
}

/**
 * Submit dynamic modal form without any page reload.
 * Handles both CREATE and UPDATE with instant reactive updates.
 */
async function submitModalForm() {
  modalError.value = "";
  modalSubmitting.value = true;

  try {
    if (isEditing.value && editingId.value) {
      // ================= UPDATE FLOW =================
      if (modalType.value === "category") {
        const res = await axios.put(`/api/catalog/categories/${editingId.value}`, {
          name: categoryForm.name
        });
        const updated = res.data.data;
        const target = categories.value.find((c) => c.id === updated.id);
        if (target) {
          target.name = updated.name;
        }
        showToast(res.data.message || "ক্যাটাগরি আপডেট হয়েছে", "success");
        closeModal();
      } else if (modalType.value === "subCategory") {
        const res = await axios.put(`/api/catalog/sub-categories/${editingId.value}`, {
          categoryId: Number(subCategoryForm.categoryId),
          name: subCategoryForm.name
        });
        const updated: SubCategoryItem = res.data.data;
        const target = subCategories.value.find((sc) => sc.id === updated.id);
        if (target) {
          target.name = updated.name;
          target.categoryId = updated.categoryId;
        }
        // Update in parent categories reactive array if nested
        categories.value.forEach((cat) => {
          if (cat.subCategories) {
            const nested = cat.subCategories.find((sc) => sc.id === updated.id);
            if (nested) {
              nested.name = updated.name;
              nested.categoryId = updated.categoryId;
            }
          }
        });
        showToast(res.data.message || "সাব-ক্যাটাগরি আপডেট হয়েছে", "success");
        closeModal();
      } else if (modalType.value === "size") {
        const res = await axios.put(`/api/catalog/sizes/${editingId.value}`, {
          categoryId: Number(sizeForm.categoryId),
          name: sizeForm.name
        });
        const updated: SizeItem = res.data.data;
        const target = sizes.value.find((s) => s.id === updated.id);
        if (target) {
          target.name = updated.name;
          target.categoryId = updated.categoryId;
        }
        showToast(res.data.message || "সাইজ আপডেট হয়েছে", "success");
        closeModal();
      } else if (modalType.value === "color") {
        const res = await axios.put(`/api/catalog/colors/${editingId.value}`, {
          name: colorForm.name,
          code: colorForm.code
        });
        const updated: ColorItem = res.data.data;
        const target = colors.value.find((c) => c.id === updated.id);
        if (target) {
          target.name = updated.name;
          target.code = updated.code;
        }
        showToast(res.data.message || "রং আপডেট হয়েছে", "success");
        closeModal();
      } else if (modalType.value === "productType") {
        const res = await axios.put(`/api/catalog/product-types/${editingId.value}`, {
          categoryId: Number(productTypeForm.categoryId),
          subCategoryId: Number(productTypeForm.subCategoryId),
          name: productTypeForm.name
        });
        const updated: ProductTypeItem = res.data.data;
        const target = productTypes.value.find((pt) => pt.id === updated.id);
        if (target) {
          target.name = updated.name;
          target.categoryId = updated.categoryId;
          target.subCategoryId = updated.subCategoryId;
        }
        showToast(res.data.message || "ধরনের নাম আপডেট হয়েছে", "success");
        closeModal();
      } else if (modalType.value === "unit") {
        const res = await axios.put(`/api/catalog/units/${editingId.value}`, {
          categoryId: Number(unitForm.categoryId),
          subCategoryId: Number(unitForm.subCategoryId),
          name: unitForm.name,
          shortName: unitForm.shortName
        });
        const updated: UnitItem = res.data.data;
        const target = units.value.find((u) => u.id === updated.id);
        if (target) {
          target.name = updated.name;
          target.shortName = updated.shortName;
          target.categoryId = updated.categoryId;
          target.subCategoryId = updated.subCategoryId;
        }
        showToast(res.data.message || "পরিমাপের একক আপডেট হয়েছে", "success");
        closeModal();
      } else if (modalType.value === "challanType") {
        const res = await axios.put(`/api/catalog/challan-types/${editingId.value}`, {
          name: challanTypeForm.name,
          code: challanTypeForm.code || null,
          description: challanTypeForm.description || null
        });
        const updated: ChallanTypeItem = res.data.data;
        const target = challanTypes.value.find((ct) => ct.id === updated.id);
        if (target) {
          target.name = updated.name;
          target.code = updated.code;
          target.description = updated.description;
        }
        showToast(res.data.message || "চালানের ধরন আপডেট হয়েছে", "success");
        closeModal();
      } else if (modalType.value === "vendorType") {
        const res = await axios.put(`/api/catalog/vendor-types/${editingId.value}`, {
          name: vendorTypeForm.name,
          code: vendorTypeForm.code || null
        });
        const updated: VendorTypeItem = res.data.data;
        const target = vendorTypes.value.find((vt) => vt.id === updated.id);
        if (target) {
          target.name = updated.name;
          target.code = updated.code;
        }
        showToast(res.data.message || "সরবরাহকারীর ধরন আপডেট হয়েছে", "success");
        closeModal();
      }
    } else {
      // ================= CREATE FLOW =================
      if (modalType.value === "category") {
        const res = await axios.post("/api/catalog/categories", {
          name: categoryForm.name
        });
        // Reactive instant unshift without page reload
        categories.value.unshift({
          ...res.data.data,
          subCategories: []
        });
        showToast(res.data.message || "ক্যাটাগরি যুক্ত হয়েছে", "success");
        closeModal();
      } else if (modalType.value === "subCategory") {
        const res = await axios.post("/api/catalog/sub-categories", {
          categoryId: Number(subCategoryForm.categoryId),
          name: subCategoryForm.name
        });
        const newSub: SubCategoryItem = res.data.data;
        // Reactive instant unshift without page reload
        subCategories.value.unshift(newSub);
        const targetCat = categories.value.find((c) => c.id === newSub.categoryId);
        if (targetCat) {
          if (!targetCat.subCategories) targetCat.subCategories = [];
          targetCat.subCategories.push(newSub);
        }
        showToast(res.data.message || "সাব-ক্যাটাগরি যুক্ত হয়েছে", "success");
        closeModal();
      } else if (modalType.value === "size") {
        const res = await axios.post("/api/catalog/sizes", {
          categoryId: Number(sizeForm.categoryId),
          name: sizeForm.name
        });
        const newItems = res.data?.items || (res.data?.data ? [res.data.data] : []);
        sizes.value.unshift(...newItems);
        showToast(res.data.message || "নতুন সাইজ সফলভাবে যুক্ত হয়েছে", "success");
        closeModal();
      } else if (modalType.value === "color") {
        const res = await axios.post("/api/catalog/colors", {
          name: colorForm.name,
          code: colorForm.code
        });
        // Reactive instant unshift without page reload
        colors.value.unshift(res.data.data);
        showToast(res.data.message || "রং যুক্ত হয়েছে", "success");
        closeModal();
      } else if (modalType.value === "productType") {
        const res = await axios.post("/api/catalog/product-types", {
          categoryId: Number(productTypeForm.categoryId),
          subCategoryId: Number(productTypeForm.subCategoryId),
          name: productTypeForm.name
        });
        // Reactive instant unshift without page reload
        productTypes.value.unshift(res.data.data);
        showToast(res.data.message || "নতুন ধরন সফলভাবে যুক্ত হয়েছে", "success");
        closeModal();
      } else if (modalType.value === "unit") {
        const res = await axios.post("/api/catalog/units", {
          categoryId: Number(unitForm.categoryId),
          subCategoryId: Number(unitForm.subCategoryId),
          name: unitForm.name,
          shortName: unitForm.shortName
        });
        // Reactive instant unshift without page reload
        units.value.unshift(res.data.data);
        showToast(res.data.message || "পরিমাপের একক যুক্ত হয়েছে", "success");
        closeModal();
      } else if (modalType.value === "challanType") {
        const res = await axios.post("/api/catalog/challan-types", {
          name: challanTypeForm.name,
          code: challanTypeForm.code || null,
          description: challanTypeForm.description || null
        });
        challanTypes.value.unshift(res.data.data);
        showToast(res.data.message || "নতুন চালানের ধরন যুক্ত হয়েছে", "success");
        closeModal();
      } else if (modalType.value === "vendorType") {
        const res = await axios.post("/api/catalog/vendor-types", {
          name: vendorTypeForm.name,
          code: vendorTypeForm.code || null
        });
        vendorTypes.value.unshift(res.data.data);
        showToast(res.data.message || "নতুন সরবরাহকারীর ধরন যুক্ত হয়েছে", "success");
        closeModal();
      }
    }
  } catch (error: any) {
    modalError.value = error.response?.data?.message || "সংরক্ষণ করতে ব্যর্থ হয়েছে";
  } finally {
    modalSubmitting.value = false;
  }
}

/**
 * Toggle Status Switch for any entity with optimistic reactive update (No Reload)
 */
async function toggleStatus(
  entity: "category" | "subCategory" | "sizeGroup" | "size" | "color" | "productType" | "unit" | "challanType" | "vendorType",
  item: any
) {
  const previousStatus = item.isActive;
  const newStatus = !previousStatus;
  const toggleKey = `${entity}-${item.id}`;

  // Optimistic UI update
  item.isActive = newStatus;
  togglingId.value = toggleKey;

  let url = "";
  if (entity === "category") url = `/api/catalog/categories/${item.id}/status`;
  if (entity === "subCategory") url = `/api/catalog/sub-categories/${item.id}/status`;
  if (entity === "sizeGroup") url = `/api/catalog/size-groups/${item.id}/status`;
  if (entity === "size") url = `/api/catalog/sizes/${item.id}/status`;
  if (entity === "color") url = `/api/catalog/colors/${item.id}/status`;
  if (entity === "productType") url = `/api/catalog/product-types/${item.id}/status`;
  if (entity === "unit") url = `/api/catalog/units/${item.id}/status`;
  if (entity === "challanType") url = `/api/catalog/challan-types/${item.id}/status`;
  if (entity === "vendorType") url = `/api/catalog/vendor-types/${item.id}/status`;

  try {
    const res = await axios.patch(url, { isActive: newStatus });
    showToast(res.data?.message || "স্ট্যাটাস পরিবর্তন সফল হয়েছে", "success");
  } catch (error: any) {
    // Revert optimistic update on failure
    item.isActive = previousStatus;
    showToast(error.response?.data?.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে", "danger");
  } finally {
    togglingId.value = null;
  }
}

onMounted(() => {
  fetchMasterData();
  loadSystemFont();
});
</script>

<style lang="scss" scoped>
.settings-page {
  animation: fadeIn 0.15s ease-in-out;
  min-height: 400px;

  .settings-card-title {
    color: #212529;
    font-size: 1rem;
  }

  .settings-tabs-wrapper {
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .settings-tabs-bar {
    background-color: #e9ecef;
    border: 1px solid #ced4da;
    padding: 4px;
    border-radius: 10px;
  }

  .tab-pill-btn {
    background: transparent;
    border: none;
    color: #495057;
    padding: 7px 14px;
    border-radius: 7px;
    font-weight: 600;
    font-size: 0.88rem;
    transition: all 0.15s ease-in-out;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      color: #0d6efd;
      background-color: rgba(13, 110, 253, 0.08);
    }

    &.active {
      background-color: #0d6efd !important;
      color: #ffffff !important;
      box-shadow: 0 2px 5px rgba(13, 110, 253, 0.3);

      .tab-badge {
        background-color: #ffffff !important;
        color: #0d6efd !important;
        border-color: transparent !important;
      }
    }
  }

  .tab-badge {
    background-color: #ffffff;
    color: #495057;
    font-size: 0.75rem;
    padding: 2px 7px;
    border-radius: 10px;
    border: 1px solid #ced4da;
    font-weight: 700;
  }



  .group-container-card {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
  }

  .group-count-badge {
    background-color: #e9ecef;
    color: #495057;
  }

  .size-pill-item {
    background-color: #ffffff;
    color: #212529;
    border: 1px solid #dee2e6 !important;
  }

  .unit-badge {
    background-color: #e7f1ff;
    color: #0d6efd;
    border: 1px solid #b6d4fe;
    font-size: 0.85rem;
    padding: 4px 10px;
  }

  .category-badge-pill {
    background-color: #eef2f6;
    color: #334155;
    border: 1px solid #cbd5e1;
    font-size: 0.84rem;
    padding: 4px 10px;
    border-radius: 6px;
  }

  .font-card {
    transition: all 0.2s ease-in-out;

    &:hover {
      border-color: #0d6efd !important;
      transform: translateY(-2px);
    }

    &.active-font-card {
      border-width: 2px !important;
      border-color: #0d6efd !important;
      background-color: rgba(13, 110, 253, 0.05) !important;
    }
  }
}
</style>

<style lang="scss">
/* SCSS Dark Theme Rules strictly namespaced to settings-page and its modals */
.theme-dark {
  .settings-page {
    .settings-card-title {
      color: #f1f3f5 !important;
    }

    .category-badge-pill {
      background-color: #252532 !important;
      color: #cbd5e1 !important;
      border: 1px solid #383848 !important;
    }

    .settings-tabs-bar {
      background-color: #1b1b22 !important;
      border: 1px solid #383844 !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }

    .tab-pill-btn {
      color: #adb5bd !important;

      &:hover {
        color: #ffffff !important;
        background-color: rgba(255, 255, 255, 0.08) !important;
      }

      &.active {
        background-color: #3b8eed !important;
        color: #ffffff !important;
        box-shadow: 0 2px 8px rgba(59, 142, 237, 0.4);

        .tab-badge {
          background-color: #ffffff !important;
          color: #3b8eed !important;
          border-color: transparent !important;
        }
      }
    }

    .tab-badge {
      background-color: #272733 !important;
      color: #e9ecef !important;
      border: 1px solid #3f3f50 !important;
    }



    .group-container-card {
      background-color: #1a1a23 !important;
      border: 1px solid #343442 !important;
    }

    .group-count-badge {
      background-color: #2b2b3a !important;
      color: #e9ecef !important;
    }

    .size-pill-item {
      background-color: #252530 !important;
      color: #ffffff !important;
      border: 1px solid #383844 !important;
    }

    .font-card {
      background-color: #1a1a23 !important;
      border-color: #343442 !important;

      &:hover {
        border-color: #3b8eed !important;
      }

      &.active-font-card {
        border-color: #3b8eed !important;
        background-color: rgba(59, 142, 237, 0.12) !important;
      }
    }

    .unit-badge {
      background-color: #17233f !important;
      color: #6ea8fe !important;
      border-color: #20335e !important;
    }
  }

  /* Modal Dark Theme */
  .modal-content {
    background-color: #1b1b22 !important;
    color: #e5e5eb !important;
    border: 1px solid #383844 !important;

    .modal-header,
    .modal-footer {
      border-color: #2e2e3a !important;
    }

    .modal-header .btn-close:focus {
      box-shadow: none !important;
      outline: none !important;
    }

    .modal-body {
      .form-control,
      .form-select {
        background-color: #14141a !important;
        color: #f0f0f5 !important;
        border: 1px solid #383844 !important;

        &:focus {
          border-color: #3b8eed !important;
          box-shadow: 0 0 0 0.2rem rgba(59, 142, 237, 0.25) !important;
        }

        &::placeholder {
          color: #64748b !important;
          opacity: 0.6 !important;
          font-style: italic;
        }
      }
    }
  }
}

/* Light mode modal placeholder & close button */
.modal-content {
  .modal-header .btn-close:focus {
    box-shadow: none !important;
    outline: none !important;
  }

  .modal-body {
    .form-control::placeholder,
    .form-select::placeholder {
      color: #94a3b8 !important;
      opacity: 0.6 !important;
      font-style: italic;
    }
  }
}
</style>
