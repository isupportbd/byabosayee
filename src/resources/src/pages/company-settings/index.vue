<template>
  <div class="company-settings-page">
    <Toast ref="toastRef" />

    <!-- Page Header -->
    <div class="mb-3">
      <h4 class="fw-bold mb-0 d-flex align-items-center gap-2">
        <i class="bi bi-gear-fill text-primary"></i>
        <span>সেটিংস</span>
      </h4>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="card border shadow-sm p-5 text-center">
      <div class="spinner-border text-primary mx-auto mb-2" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <span class="text-muted small">কোম্পানীর তথ্য লোড হচ্ছে...</span>
    </div>

    <!-- Main Settings Card with Tabs -->
    <div v-else class="card border shadow-sm">
      <!-- Tabs Header -->
      <div class="card-header border-bottom p-2 bg-transparent">
        <div class="nav nav-pills gap-1 flex-wrap" role="tablist">
          <button
            type="button"
            class="nav-tab-btn btn btn-sm px-3 py-1.5 rounded-3 d-inline-flex align-items-center gap-2"
            :class="{ active: activeTab === 'profile' }"
            @click="activeTab = 'profile'">
            <i class="bi bi-building"></i>
            <span>কোম্পানী প্রোফাইল</span>
          </button>

          <button
            type="button"
            class="nav-tab-btn btn btn-sm px-3 py-1.5 rounded-3 d-inline-flex align-items-center gap-2"
            :class="{ active: activeTab === 'invoice' }"
            @click="activeTab = 'invoice'">
            <i class="bi bi-receipt"></i>
            <span>চালান ও মেমো কনফিগারেশন</span>
          </button>

          <button
            type="button"
            class="nav-tab-btn btn btn-sm px-3 py-1.5 rounded-3 d-inline-flex align-items-center gap-2"
            :class="{ active: activeTab === 'security' }"
            @click="activeTab = 'security'">
            <i class="bi bi-shield-lock"></i>
            <span>পাসওয়ার্ড ও নিরাপত্তা</span>
          </button>
        </div>
      </div>

      <div class="card-body p-3 p-md-4">
        <!-- ========================================== -->
        <!-- TAB 1: COMPANY PROFILE -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'profile'">
          <form @submit.prevent="saveProfile">
            <div class="row g-3">
              <!-- Company Name -->
              <div class="col-12 col-md-6">
                <Input
                  id="companyNameInput"
                  v-model.trim="profileForm.companyName"
                  label="কোম্পানীর নাম"
                  placeholder="কোম্পানীর নাম লিখুন"
                  topclass="mb-0"
                  must />
              </div>

              <!-- Tagline / Slogan -->
              <div class="col-12 col-md-6">
                <Input
                  id="taglineInput"
                  v-model.trim="profileForm.tagline"
                  label="স্লোগান / ট্যাগলাইন (অপশনাল)"
                  placeholder="যেমন: সেরা মানের পোশাক প্রস্তুতকারক"
                  topclass="mb-0" />
              </div>

              <!-- Email (Readonly) -->
              <div class="col-12 col-md-6">
                <Input
                  id="emailInput"
                  :model-value="profileData.email"
                  type="email"
                  label="অফিসিয়াল ইমেইল"
                  readonly
                  topclass="mb-0" />
              </div>

              <!-- Mobile -->
              <div class="col-12 col-md-6">
                <Input
                  id="mobileInput"
                  v-model.trim="profileForm.mobile"
                  category="mobile"
                  label="মোবাইল নম্বর"
                  placeholder="01XXXXXXXXX"
                  topclass="mb-0"
                  must />
              </div>

              <!-- Phone / Hotline -->
              <div class="col-12 col-md-6">
                <Input
                  id="phoneInput"
                  v-model.trim="profileForm.phone"
                  label="বিকল্প ফোন / হটলাইন"
                  placeholder="অফিস ল্যান্ডফোন বা হটলাইন"
                  topclass="mb-0" />
              </div>

              <!-- Trade License -->
              <div class="col-12 col-md-6">
                <Input
                  id="tradeInput"
                  v-model.trim="profileForm.tradeLicense"
                  label="ট্রেড লাইসেন্স নম্বর"
                  placeholder="ট্রেড লাইসেন্স নম্বর লিখুন"
                  topclass="mb-0" />
              </div>

              <!-- VAT / BIN Number -->
              <div class="col-12 col-md-6">
                <Input
                  id="vatInput"
                  v-model.trim="profileForm.vatBin"
                  category="bin"
                  label="ভ্যাট / বিআইএন (BIN) নম্বর"
                  placeholder="ভ্যাট রেজিস্ট্রেশন বা BIN নম্বর"
                  topclass="mb-0" />
              </div>

              <!-- Logo URL / Preview -->
              <div class="col-12 col-md-6">
                <Input
                  id="logoInput"
                  v-model.trim="profileForm.logo"
                  type="url"
                  label="কোম্পানীর লোগো ইউআরএল"
                  placeholder="https://example.com/logo.png"
                  topclass="mb-0" />
              </div>

              <!-- Address -->
              <div class="col-12">
                <TextArea
                  id="addressInput"
                  v-model.trim="profileForm.address"
                  label="ফ্যাক্টরি ও অফিস ঠিকানা (চালানে প্রিন্ট হবে)"
                  placeholder="রোড, বাড়ি, এলাকা, জেলা ইত্যাদি বিস্তারিত লিখুন"
                  rows="3" />
              </div>
            </div>

            <div class="mt-4 pt-3 border-top d-flex justify-content-end">
              <Button
                type="submit"
                class="btn btn-primary d-inline-flex align-items-center gap-2 shadow-sm"
                :disabled="savingProfile">
                <span v-if="savingProfile" class="spinner-border spinner-border-sm" role="status"></span>
                <i v-else class="bi bi-check-circle"></i>
                <span>প্রোফাইল সংরক্ষণ করুন</span>
              </Button>
            </div>
          </form>
        </div>

        <!-- ========================================== -->
        <!-- TAB 2: INVOICE & CHALAN SETTINGS -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'invoice'">
          <form @submit.prevent="saveProfile">
            <div class="row g-4">
              <!-- Left Column: Inputs -->
              <div class="col-12 col-lg-7">
                <!-- মেমো ও চালান প্রিন্ট ফরম্যাট নির্বাচন (এ৪, এ৫, পস ৮০মিমি, পস ৫৮মিমি) -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold mb-1.5 d-flex align-items-center gap-1.5">
                    <i class="bi bi-printer-fill text-primary"></i>
                    <span>মেমো প্রিন্ট সাইজ ও ফরম্যাট</span>
                  </label>

                  <div class="row g-2">
                    <!-- A4 Paper -->
                    <div class="col-6 col-sm-3">
                      <div
                        class="print-format-option p-3 rounded-3 border h-100 d-flex flex-column justify-content-between cursor-pointer user-select-none"
                        :class="{ 'active-format': profileForm.printFormat === 'a4' }"
                        @click="profileForm.printFormat = 'a4'">
                        <div class="d-flex align-items-start justify-content-between mb-2">
                          <div class="format-icon-box rounded-2 d-flex align-items-center justify-content-center">
                            <i class="bi bi-file-earmark-text fs-5"></i>
                          </div>
                          <i v-if="profileForm.printFormat === 'a4'" class="bi bi-check-circle-fill text-primary ms-1 fs-6"></i>
                        </div>
                        <div>
                          <div class="fw-bold small text-truncate">এ৪ (A4 Full)</div>
                          <div class="text-muted" style="font-size: 10px;">২১০ × ২৯৭ মিমি</div>
                        </div>
                      </div>
                    </div>

                    <!-- A5 Paper -->
                    <div class="col-6 col-sm-3">
                      <div
                        class="print-format-option p-3 rounded-3 border h-100 d-flex flex-column justify-content-between cursor-pointer user-select-none"
                        :class="{ 'active-format': profileForm.printFormat === 'a5' }"
                        @click="profileForm.printFormat = 'a5'">
                        <div class="d-flex align-items-start justify-content-between mb-2">
                          <div class="format-icon-box rounded-2 d-flex align-items-center justify-content-center">
                            <i class="bi bi-file-earmark fs-5"></i>
                          </div>
                          <i v-if="profileForm.printFormat === 'a5'" class="bi bi-check-circle-fill text-primary ms-1 fs-6"></i>
                        </div>
                        <div>
                          <div class="fw-bold small text-truncate">এ৫ (A5 Half)</div>
                          <div class="text-muted" style="font-size: 10px;">১৪৮ × ২১০ মিমি</div>
                        </div>
                      </div>
                    </div>

                    <!-- POS 80mm -->
                    <div class="col-6 col-sm-3">
                      <div
                        class="print-format-option p-3 rounded-3 border h-100 d-flex flex-column justify-content-between cursor-pointer user-select-none"
                        :class="{ 'active-format': profileForm.printFormat === 'pos' || profileForm.printFormat === 'pos_80' }"
                        @click="profileForm.printFormat = 'pos'">
                        <div class="d-flex align-items-start justify-content-between mb-2">
                          <div class="format-icon-box rounded-2 d-flex align-items-center justify-content-center">
                            <i class="bi bi-receipt-cutoff fs-5"></i>
                          </div>
                          <i v-if="profileForm.printFormat === 'pos' || profileForm.printFormat === 'pos_80'" class="bi bi-check-circle-fill text-primary ms-1 fs-6"></i>
                        </div>
                        <div>
                          <div class="fw-bold small text-truncate">পস ৮০ মিমি</div>
                          <div class="text-muted" style="font-size: 10px;">৩.১৫ ইঞ্চি রোল</div>
                        </div>
                      </div>
                    </div>

                    <!-- POS 58mm -->
                    <div class="col-6 col-sm-3">
                      <div
                        class="print-format-option p-3 rounded-3 border h-100 d-flex flex-column justify-content-between cursor-pointer user-select-none"
                        :class="{ 'active-format': profileForm.printFormat === 'pos_58' }"
                        @click="profileForm.printFormat = 'pos_58'">
                        <div class="d-flex align-items-start justify-content-between mb-2">
                          <div class="format-icon-box rounded-2 d-flex align-items-center justify-content-center">
                            <i class="bi bi-receipt fs-5"></i>
                          </div>
                          <i v-if="profileForm.printFormat === 'pos_58'" class="bi bi-check-circle-fill text-primary ms-1 fs-6"></i>
                        </div>
                        <div>
                          <div class="fw-bold small text-truncate">পস ৫৮ মিমি</div>
                          <div class="text-muted" style="font-size: 10px;">২.২৮ ইঞ্চি রোল</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- চালান ও পণ্য কোড প্রিফিক্স ও প্যাটার্ন ফিল্ডস -->
                <div class="row g-3 mb-3">
                  <div class="col-12 col-sm-3">
                    <Input
                      id="productPrefixInput"
                      v-model.trim="profileForm.productPrefix"
                      label="পণ্য কোড প্রিফিক্স"
                      placeholder="PRD-"
                      class="text-uppercase font-monospace"
                      must />
                  </div>

                  <div class="col-12 col-sm-3">
                    <Input
                      id="invoicePrefixInput"
                      v-model.trim="profileForm.invoicePrefix"
                      label="চালান প্রিফিক্স"
                      placeholder="INV"
                      class="text-uppercase font-monospace"
                      must />
                  </div>

                  <div class="col-12 col-sm-6">
                    <Input
                      id="invoicePatternInput"
                      v-model.trim="profileForm.invoicePattern"
                      label="চালান নম্বর প্যাটার্ন টেমপ্লেট"
                      placeholder="{PREFIX}-{YYYY}-{0001}"
                      class="font-monospace"
                      must />
                  </div>
                </div>

                <!-- ট্যাগ চয়েসার ও প্রিসেটস -->
                <div class="mb-3">
                  <div class="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-1.5">
                    <span class="small fw-semibold text-muted" style="font-size: 11.5px;">প্যাটার্ন ভেরিয়েবল ট্যাগসমূহ:</span>
                    <div class="d-flex gap-1.5">
                      <button
                        type="button"
                        class="btn btn-xs btn-link p-0 text-decoration-none small text-primary"
                        style="font-size: 11px;"
                        @click="setPatternPreset('{PREFIX}-{YYYY}-{0001}')">
                        [প্রিসেট ১]
                      </button>
                      <button
                        type="button"
                        class="btn btn-xs btn-link p-0 text-decoration-none small text-primary"
                        style="font-size: 11px;"
                        @click="setPatternPreset('{PREFIX}/{YY}/{MM}/{0001}')">
                        [প্রিসেট ২]
                      </button>
                      <button
                        type="button"
                        class="btn btn-xs btn-link p-0 text-decoration-none small text-primary"
                        style="font-size: 11px;"
                        @click="setPatternPreset('{PREFIX}-{0001}')">
                        [প্রিসেট ৩]
                      </button>
                    </div>
                  </div>
                  <div class="d-flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary py-0.5 px-2 font-monospace rounded-pill"
                      style="font-size: 11px;"
                      title="কোম্পানী প্রিফিক্স"
                      @click="appendPatternTag('{PREFIX}')">
                      + {PREFIX}
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary py-0.5 px-2 font-monospace rounded-pill"
                      style="font-size: 11px;"
                      title="৪ ডিজিটের বর্তমান বছর"
                      @click="appendPatternTag('{YYYY}')">
                      + {YYYY}
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary py-0.5 px-2 font-monospace rounded-pill"
                      style="font-size: 11px;"
                      title="২ ডিজিটের বর্তমান বছর"
                      @click="appendPatternTag('{YY}')">
                      + {YY}
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary py-0.5 px-2 font-monospace rounded-pill"
                      style="font-size: 11px;"
                      title="২ ডিজিটের বর্তমান মাস"
                      @click="appendPatternTag('{MM}')">
                      + {MM}
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary py-0.5 px-2 font-monospace rounded-pill"
                      style="font-size: 11px;"
                      title="৪ ডিজিটের ক্রমিক নম্বর"
                      @click="appendPatternTag('{0001}')">
                      + {0001}
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary py-0.5 px-2 font-monospace rounded-pill"
                      style="font-size: 11px;"
                      title="৫ ডিজিটের ক্রমিক নম্বর"
                      @click="appendPatternTag('{00001}')">
                      + {00001}
                    </button>
                  </div>
                </div>

                <!-- লাইভ প্রিভিউ নমুনা বক্স -->
                <div class="p-2.5 rounded-2 border preview-sample-box mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div class="d-flex align-items-center gap-2">
                    <span class="text-muted small">নমুনার মতো তৈরি হবে:</span>
                    <strong class="font-monospace text-primary fs-6">{{ sampleInvoiceNumber }}</strong>
                  </div>
                  <span class="badge bg-primary-subtle text-primary font-monospace" style="font-size: 11px;">
                    ডায়নামিক
                  </span>
                </div>

                <!-- ক্রমিক নম্বর রিসেট সাইকেল -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold mb-1.5 d-flex align-items-center gap-1.5">
                    <i class="bi bi-arrow-repeat text-primary"></i>
                    <span>ক্রমিক নম্বর রিসেট ব্যবস্থাপনা</span>
                  </label>
                  <div class="row g-2">
                    <div class="col-12 col-sm-6">
                      <div
                        class="print-format-option p-3 rounded-3 border d-flex align-items-center gap-3 cursor-pointer user-select-none"
                        :class="{ 'active-format': profileForm.invoiceResetCycle === 'yearly' }"
                        @click="profileForm.invoiceResetCycle = 'yearly'">
                        <div class="format-icon-box rounded-2 d-flex align-items-center justify-content-center">
                          <i class="bi bi-calendar-event fs-5"></i>
                        </div>
                        <div class="flex-grow-1 min-w-0">
                          <div class="d-flex align-items-center justify-content-between mb-0.5">
                            <span class="fw-bold small">প্রতি বছর রিসেট (Yearly)</span>
                            <i v-if="profileForm.invoiceResetCycle === 'yearly'" class="bi bi-check-circle-fill text-primary ms-2 fs-6"></i>
                          </div>
                          <span class="text-muted" style="font-size: 11px; line-height: 1.3;">নতুন বছর শুরু হলে মেমো নং ১ থেকে শুরু হবে</span>
                        </div>
                      </div>
                    </div>

                    <div class="col-12 col-sm-6">
                      <div
                        class="print-format-option p-3 rounded-3 border d-flex align-items-center gap-3 cursor-pointer user-select-none"
                        :class="{ 'active-format': profileForm.invoiceResetCycle === 'continuous' }"
                        @click="profileForm.invoiceResetCycle = 'continuous'">
                        <div class="format-icon-box rounded-2 d-flex align-items-center justify-content-center">
                          <i class="bi bi-infinity fs-5"></i>
                        </div>
                        <div class="flex-grow-1 min-w-0">
                          <div class="d-flex align-items-center justify-content-between mb-0.5">
                            <span class="fw-bold small">কন্টিনিউয়াস (Continuous)</span>
                            <i v-if="profileForm.invoiceResetCycle === 'continuous'" class="bi bi-check-circle-fill text-primary ms-2 fs-6"></i>
                          </div>
                          <span class="text-muted" style="font-size: 11px; line-height: 1.3;">কখনোই রিসেট হবে না, ক্রমিক চলতেই থাকবে</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <TextArea
                    id="paymentInfoInput"
                    v-model.trim="profileForm.paymentInfo"
                    label="পেমেন্ট তথ্য ও ব্যাংক বিবরণী"
                    placeholder="বিলের নিচে বায়ারের পেমেন্টের জন্য ব্যাংক একাউন্ট বা বিকাশ/নগদ মার্চেন্ট নম্বর লিখুন"
                    rows="3" />
                </div>

                <div class="mb-3">
                  <TextArea
                    id="termsInput"
                    v-model.trim="profileForm.invoiceTerms"
                    label="চালানের শর্তাবলী ও রিটার্ন পলিসি (মেমো নোট)"
                    placeholder="১. চালানের মাল বুঝে নেওয়ার পর কোনো অভিযোগ গ্রহণযোগ্য নয়।&#10;২. বিক্রিত পণ্য ৭ দিনের মধ্যে পরিবর্তনের সুযোগ রয়েছে।"
                    rows="4" />
                </div>

                <div class="pt-2">
                  <Button
                    type="submit"
                    class="btn btn-primary d-inline-flex align-items-center gap-2 shadow-sm"
                    :disabled="savingProfile">
                    <span v-if="savingProfile" class="spinner-border spinner-border-sm" role="status"></span>
                    <i v-else class="bi bi-check-circle"></i>
                    <span>চালান সেটিংস সংরক্ষণ করুন</span>
                  </Button>
                </div>
              </div>

              <!-- Right Column: Live Chalan/Invoice Preview Card -->
              <div class="col-12 col-lg-5">
                <div class="card border preview-outer-card h-100 shadow-sm">
                  <div class="card-header border-bottom py-2 bg-transparent d-flex justify-content-between align-items-center">
                    <span class="small fw-bold text-muted d-flex align-items-center gap-1.5">
                      <i :class="isPosFormat ? 'bi bi-receipt-cutoff text-primary' : 'bi bi-file-earmark-text text-primary'"></i>
                      <span>{{ previewTitle }}</span>
                    </span>
                    <span class="badge font-monospace" :class="isPosFormat ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-secondary'" style="font-size: 10px;">
                      {{ sampleInvoiceNumber }}
                    </span>
                  </div>

                  <div class="card-body p-2 p-md-3 d-flex flex-column justify-content-start overflow-auto">
                    <!-- POS THERMAL PREVIEW (80mm or 58mm) -->
                    <div v-if="isPosFormat" class="pos-paper-wrapper d-flex justify-content-center py-2">
                      <div
                        class="actual-pos-paper"
                        :style="{ width: profileForm.printFormat === 'pos_58' ? '210px' : '280px', maxWidth: profileForm.printFormat === 'pos_58' ? '210px' : '280px' }">
                        <!-- POS Header -->
                        <div class="text-center pb-1">
                          <div class="pos-header-title fw-bold text-uppercase">{{ profileForm.companyName || 'আপনার কোম্পানীর নাম' }}</div>
                          <div class="pos-text-muted" style="font-size: 10.5px;">{{ profileForm.tagline || 'ক্যাশ মেমো / বিক্রয় রসিদ' }}</div>
                          <div class="pos-text-muted" style="font-size: 10px;">{{ profileForm.address || 'দোকান / শোরুম ঠিকানা' }}</div>
                          <div class="pos-text-muted" style="font-size: 10px;">মোবাইল: {{ profileForm.mobile || '01XXXXXXXXX' }}</div>
                          <div v-if="profileForm.vatBin" class="pos-text-muted" style="font-size: 10px;">BIN: {{ profileForm.vatBin }}</div>
                        </div>

                        <!-- Rule -->
                        <div class="pos-rule my-1.5"></div>

                        <!-- Meta Info -->
                        <div class="d-flex justify-content-between font-monospace" style="font-size: 10.5px;">
                          <span>মেমো: <strong>{{ sampleInvoiceNumber }}</strong></span>
                          <span>তারিখ: {{ new Date().toLocaleDateString('bn-BD') }}</span>
                        </div>
                        <div class="d-flex justify-content-between pos-text-muted font-monospace" style="font-size: 9.5px;">
                          <span>সময়: {{ new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) }}</span>
                          <span>কাউন্টার: #০১</span>
                        </div>

                        <!-- Rule -->
                        <div class="pos-rule my-1.5"></div>

                        <!-- Items Table -->
                        <table class="w-100 pos-table font-monospace" style="font-size: 10.5px;">
                          <thead>
                            <tr class="border-bottom border-dark border-opacity-25">
                              <th class="text-start pb-1">আইটেম</th>
                              <th class="text-center pb-1">পরিমাণ</th>
                              <th class="text-end pb-1">টাকা</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td class="text-start py-1">১. কটন শার্ট (XL)</td>
                              <td class="text-center py-1">২</td>
                              <td class="text-end py-1">১,৪০০</td>
                            </tr>
                            <tr>
                              <td class="text-start py-1">২. জিন্স প্যান্ট (32)</td>
                              <td class="text-center py-1">১</td>
                              <td class="text-end py-1">১,২০০</td>
                            </tr>
                          </tbody>
                        </table>

                        <!-- Rule -->
                        <div class="pos-rule my-1.5"></div>

                        <!-- Totals -->
                        <div class="font-monospace" style="font-size: 11px;">
                          <div class="d-flex justify-content-between py-0.5">
                            <span>মোট বিল:</span>
                            <strong>২,৬০০৳</strong>
                          </div>
                          <div class="d-flex justify-content-between py-0.5">
                            <span>পরিশোধ (নগদ):</span>
                            <strong>২,৬০০৳</strong>
                          </div>
                          <div class="d-flex justify-content-between py-0.5 pos-text-muted">
                            <span>বকেয়া:</span>
                            <span>০৳</span>
                          </div>
                          <!-- বকেয়া রো এর পরে খালি রো -->
                          <div class="py-0.5">&nbsp;</div>
                        </div>

                        <!-- Payment Info -->
                        <div v-if="profileForm.paymentInfo" class="mt-1.5 pt-1 pos-rule"></div>
                        <div v-if="profileForm.paymentInfo" class="text-center pos-text-muted pt-1" style="font-size: 9.5px;">
                          {{ profileForm.paymentInfo }}
                        </div>

                        <!-- Terms Section (Separated & each bullet on a separate line) -->
                        <div class="pos-rule my-1.5"></div>
                        <div class="pos-terms-box text-start px-1" style="font-size: 8.5px; line-height: 1.4;">
                          <div class="fw-bold mb-1" style="font-size: 9px;">শর্তাবলী ও রিটার্ন পলিসি:</div>
                          <div
                            v-for="(term, idx) in formattedTermsLines"
                            :key="idx"
                            class="pos-text-muted py-0.5 d-flex align-items-start gap-1">
                            <span>{{ term }}</span>
                          </div>
                        </div>

                        <!-- Greetings & Dynamic Barcode -->
                        <div class="pos-rule my-1.5"></div>
                        <div class="text-center pt-1">
                          <div class="fw-bold" style="font-size: 11px;">ধন্যবাদ, আবার আসবেন!</div>
                          <!-- Real Dynamic Code 128 Barcode with Memo No, Date & Amount in English -->
                          <div class="pos-barcode-container d-flex flex-column align-items-center mt-1.5">
                            <svg
                              class="barcode-svg"
                              :viewBox="`0 0 ${barcodeBars.totalWidth} 40`"
                              style="width: 100%; max-width: 240px; height: 38px;"
                              shape-rendering="crispEdges">
                              <rect width="100%" height="100%" fill="#ffffff" />
                              <rect
                                v-for="(bar, bIdx) in barcodeBars.bars"
                                :key="bIdx"
                                :x="bar.x"
                                y="0"
                                :width="bar.w"
                                height="40"
                                fill="#000000" />
                            </svg>
                          </div>
                          <div class="pos-text-muted mt-1.5" style="font-size: 8px;">* ক্যাশ কাউন্টার মেমো কপি *</div>
                        </div>
                      </div>
                    </div>

                    <!-- A4 / A5 PREVIEW -->
                    <div v-else class="a4-sheet-wrapper d-flex justify-content-center py-2">
                      <div
                        class="actual-a4-sheet shadow-sm p-3 rounded-1 border d-flex flex-column justify-content-between"
                        :style="{ width: profileForm.printFormat === 'a5' ? '300px' : '360px', minHeight: profileForm.printFormat === 'a5' ? '400px' : '480px' }">
                        <div>
                          <!-- Header -->
                          <div class="d-flex justify-content-between align-items-start border-bottom pb-2 mb-2">
                            <div>
                              <h6 class="fw-bold mb-0 text-primary">{{ profileForm.companyName || 'আপনার কোম্পানীর নাম' }}</h6>
                              <div class="text-muted small" style="font-size: 10.5px;">
                                {{ profileForm.tagline || 'পোশাক প্রস্তুতকারক ও পাইকারি বিক্রেতা' }}
                              </div>
                              <div class="text-muted small mt-0.5" style="font-size: 10px;">
                                {{ profileForm.address || 'ফ্যাক্টরি ও অফিস ঠিকানা এখানে থাকবে' }}
                              </div>
                            </div>
                            <div class="text-end" style="font-size: 10px;">
                              <span class="badge bg-primary-subtle text-primary font-monospace mb-1" style="font-size: 9.5px;">
                                {{ profileForm.printFormat === 'a5' ? 'মেমো (A5)' : 'চালান (A4)' }}
                              </span>
                              <div><strong>মোবাইল:</strong> {{ profileForm.mobile || '01XXXXXXXXX' }}</div>
                              <div v-if="profileForm.vatBin"><strong>BIN:</strong> {{ profileForm.vatBin }}</div>
                            </div>
                          </div>

                          <!-- Bill to details -->
                          <div class="row g-2 mb-2 text-muted" style="font-size: 9.5px;">
                            <div class="col-7">
                              <div><strong>প্রাপক / বায়ার:</strong> পাইকারি ক্রেতা / গ্রাহক</div>
                              <div>ঠিকানা: চকবাজার, ঢাকা</div>
                            </div>
                            <div class="col-5 text-end">
                              <div>তারিখ: {{ new Date().toLocaleDateString('bn-BD') }}</div>
                              <div>চালান: {{ sampleInvoiceNumber }}</div>
                            </div>
                          </div>

                          <!-- Items Table -->
                          <div class="table-responsive mb-2">
                            <table class="table table-sm table-bordered text-center align-middle mb-0" style="font-size: 10px;">
                              <thead class="table-light">
                                <tr>
                                  <th>নং</th>
                                  <th class="text-start">পণ্যের বিবরণ</th>
                                  <th>পরিমাণ</th>
                                  <th>দর</th>
                                  <th class="text-end">মোট</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>১</td>
                                  <td class="text-start">কটন শার্ট (XL)</td>
                                  <td>২ পিস</td>
                                  <td>৭০০</td>
                                  <td class="text-end">১,৪০০৳</td>
                                </tr>
                                <tr>
                                  <td>২</td>
                                  <td class="text-start">জিন্স প্যান্ট (32)</td>
                                  <td>১ পিস</td>
                                  <td>১,২০০</td>
                                  <td class="text-end">১,২০০৳</td>
                                </tr>
                                <tr class="fw-bold table-light">
                                  <td colspan="4" class="text-end">সর্বমোট:</td>
                                  <td class="text-end">২,৬০০৳</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <!-- Footer & Signatures -->
                        <div class="border-top pt-2 mt-2">
                          <div v-if="profileForm.paymentInfo" class="mb-1 text-muted" style="font-size: 9.5px;">
                            <strong>পেমেন্ট:</strong> {{ profileForm.paymentInfo }}
                          </div>

                          <!-- Separated Terms with separate lines -->
                          <div class="mb-2 text-muted" style="font-size: 9px; line-height: 1.4;">
                            <strong class="d-block mb-0.5">শর্তাবলী ও রিটার্ন পলিসি:</strong>
                            <div v-for="(term, idx) in formattedTermsLines" :key="idx" class="d-flex align-items-start gap-1 py-0.5">
                              <span>{{ term }}</span>
                            </div>
                          </div>

                          <!-- A4 Dynamic Code 128 Barcode -->
                          <div class="d-flex justify-content-center my-2">
                            <div class="text-center" style="max-width: 230px;">
                              <svg
                                class="barcode-svg"
                                :viewBox="`0 0 ${barcodeBars.totalWidth} 34`"
                                style="width: 100%; height: 32px;"
                                shape-rendering="crispEdges">
                                <rect width="100%" height="100%" fill="#ffffff" />
                                <rect
                                  v-for="(bar, bIdx) in barcodeBars.bars"
                                  :key="bIdx"
                                  :x="bar.x"
                                  y="0"
                                  :width="bar.w"
                                  height="34"
                                  fill="#000000" />
                              </svg>
                            </div>
                          </div>

                          <div class="d-flex justify-content-between pt-2 text-muted" style="font-size: 9.5px;">
                            <div class="text-center">
                              <div class="border-top border-secondary border-opacity-50 pt-0.5" style="width: 80px;">গ্রাহকের স্বাক্ষর</div>
                            </div>
                            <div class="text-center">
                              <div class="border-top border-secondary border-opacity-50 pt-0.5" style="width: 90px;">অনুমোদিত স্বাক্ষর</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- ========================================== -->
        <!-- TAB 3: PASSWORD & SECURITY -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'security'">
          <div class="col-12 col-md-8 col-lg-6 mx-auto py-2">
            <div class="p-3 password-info-box rounded-3 border mb-4">
              <h6 class="fw-bold mb-1 d-flex align-items-center gap-2">
                <i class="bi bi-key-fill text-warning"></i>
                <span>পাসওয়ার্ড পরিবর্তন করুন</span>
              </h6>
              <p class="text-muted small mb-0">
                সুপারএডমিন কর্তৃক প্রাপ্ত প্রাথমিক পাসওয়ার্ড পরিবর্তন করে আপনার নিজস্ব শক্তিশালী ও গোপন পাসওয়ার্ড সেট করুন।
              </p>
            </div>

            <form @submit.prevent="changePassword">
              <!-- Current Password -->
              <InputPasswordToggle
                id="currentPass"
                v-model="passwordForm.currentPassword"
                label="বর্তমান পাসওয়ার্ড"
                placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                topclass="mb-3"
                must />

              <!-- New Password -->
              <InputPasswordToggle
                id="newPass"
                v-model="passwordForm.newPassword"
                label="নতুন পাসওয়ার্ড"
                placeholder="কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড"
                minlength="6"
                topclass="mb-3"
                must />

              <!-- Confirm Password -->
              <InputPasswordToggle
                id="confirmPass"
                v-model="passwordForm.confirmPassword"
                label="নতুন পাসওয়ার্ড নিশ্চিতকরণ"
                placeholder="নতুন পাসওয়ার্ডটি পুনরায় লিখুন"
                minlength="6"
                topclass="mb-4"
                must />

              <div class="d-flex justify-content-end">
                <Button
                  type="submit"
                  class="btn btn-warning text-dark fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                  :disabled="changingPassword">
                  <span v-if="changingPassword" class="spinner-border spinner-border-sm" role="status"></span>
                  <i v-else class="bi bi-shield-check"></i>
                  <span>পাসওয়ার্ড আপডেট করুন</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";
import axios from "axios";
import { computed, inject, onMounted, reactive, ref } from "vue";
import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import InputPasswordToggle from "@/components/InputPasswordToggle.vue";
import TextArea from "@/components/TextArea.vue";
import Toast from "@/components/Toast.vue";
import { useAuthStore } from "@/stores/auth";

useHead({ title: "সেটিংস - Fashion" });

const setPageTitle = inject<((title: string) => void) | undefined>("setPageTitle");
if (setPageTitle) {
  setPageTitle("সেটিংস");
}

const auth = useAuthStore();
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const activeTab = ref<"profile" | "invoice" | "security">("profile");
const loading = ref(true);
const savingProfile = ref(false);
const changingPassword = ref(false);

const profileData = ref({
  id: null as number | null,
  userId: 0,
  companyName: "",
  tagline: "",
  email: "",
  phone: "",
  mobile: "",
  address: "",
  tradeLicense: "",
  vatBin: "",
  invoicePrefix: "INV",
  productPrefix: "PRD-",
  invoicePattern: "{PREFIX}-{YYYY}-{0001}",
  invoiceResetCycle: "yearly",
  printFormat: "a4",
  invoiceTerms: "",
  paymentInfo: "",
  logo: "",
  isActive: true
});

const profileForm = reactive({
  companyName: "",
  tagline: "",
  phone: "",
  mobile: "",
  address: "",
  tradeLicense: "",
  vatBin: "",
  invoicePrefix: "INV",
  productPrefix: "PRD-",
  invoicePattern: "{PREFIX}-{YYYY}-{0001}",
  invoiceResetCycle: "yearly",
  printFormat: "a4",
  invoiceTerms: "",
  paymentInfo: "",
  logo: ""
});

const sampleInvoiceNumber = computed(() => {
  const prefix = (profileForm.invoicePrefix || "INV").trim().toUpperCase();
  const pattern = (profileForm.invoicePattern || "{PREFIX}-{YYYY}-{0001}").trim();
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const yy = yyyy.slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  let result = pattern
    .replace(/\{PREFIX\}/gi, prefix)
    .replace(/\{YYYY\}/gi, yyyy)
    .replace(/\{YY\}/gi, yy)
    .replace(/\{MM\}/gi, mm)
    .replace(/\{DD\}/gi, dd)
    .replace(/\{000001\}/g, "000001")
    .replace(/\{00001\}/g, "00001")
    .replace(/\{0001\}/g, "0001")
    .replace(/\{001\}/g, "001")
    .replace(/\{01\}/g, "01")
    .replace(/\{1\}/g, "1");

  return result || `${prefix}-${yyyy}-0001`;
});

const isPosFormat = computed(() => {
  return profileForm.printFormat === "pos" || profileForm.printFormat === "pos_80" || profileForm.printFormat === "pos_58";
});

const previewTitle = computed(() => {
  switch (profileForm.printFormat) {
    case "pos":
    case "pos_80":
      return "পস ৮০মিমি লাইভ প্রিভিউ";
    case "pos_58":
      return "পস ৫৮মিমি মিনি রসিদ প্রিভিউ";
    case "a5":
      return "এ৫ হাফ পাতা মেমো প্রিভিউ";
    case "a4":
    default:
      return "এ৪ স্ট্যান্ডার্ড চালান প্রিভিউ";
  }
});

function getFormatDimensions(format: string) {
  switch (format) {
    case "pos":
    case "pos_80":
      return "৮০ মিমি (৩.১৫ ইঞ্চি রোল)";
    case "pos_58":
      return "৫৮ মিমি (২.২৮ ইঞ্চি রোল)";
    case "a5":
      return "১৪৮ × ২১০ মিমি (এ৫)";
    case "a4":
    default:
      return "২১০ × ২৯৭ মিমি (এ৪)";
  }
}

// Standard GS1 Code 128 (Subtype B) Barcode Patterns
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

// Split terms line-by-line and separate bullets
const formattedTermsLines = computed(() => {
  const terms = (profileForm.invoiceTerms || "").trim();
  if (!terms) {
    return [
      "* পণ্য বুঝে নেয়ার পর কোনো অভিযোগ গ্রহণযোগ্য নয়।",
      "* বিক্রিত পণ্য ফেরতযোগ্য নয়।"
    ];
  }

  const rawLines = terms.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const result: string[] = [];

  for (const line of rawLines) {
    if (line.includes("*") && (line.match(/\*/g) || []).length > 1) {
      const parts = line.split(/(?=\*)/).map(p => p.trim()).filter(Boolean);
      result.push(...parts);
    } else {
      result.push(line);
    }
  }

  return result.length ? result : [
    "* পণ্য বুঝে নেয়ার পর কোনো অভিযোগ গ্রহণযোগ্য নয়।",
    "* বিক্রিত পণ্য ফেরতযোগ্য নয়।"
  ];
});

// Barcode Raw String: Memo No, Date & Amount in English
const barcodeRawText = computed(() => {
  const memo = (sampleInvoiceNumber.value || "INV-0001").trim();
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const dateStr = `${day}/${month}/${year}`;
  const amountStr = "2600 Tk";

  return `${memo} | ${dateStr} | ${amountStr}`;
});

// Dynamic Code 128 Barcode Bars
const barcodeBars = computed(() => {
  const text = barcodeRawText.value;
  // Code 128B start index: 104
  const indices: number[] = [104];
  let checksum = 104;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32;
    if (code < 0 || code > 95) continue;
    indices.push(code);
    checksum += code * (i + 1);
  }

  const checkDigit = checksum % 103;
  indices.push(checkDigit);
  indices.push(106); // Stop code (index 106)

  const quietZone = 20;
  let currentX = quietZone;
  const bars: { x: number; w: number }[] = [];

  for (const idx of indices) {
    const pattern = CODE128_PATTERNS[idx];
    if (!pattern) continue;
    for (let p = 0; p < pattern.length; p++) {
      const w = parseInt(pattern[p], 10);
      const isBar = p % 2 === 0;
      if (isBar) {
        bars.push({ x: currentX, w: w });
      }
      currentX += w;
    }
  }

  return {
    bars,
    totalWidth: currentX + quietZone
  };
});

function appendPatternTag(tag: string) {
  if (!profileForm.invoicePattern) {
    profileForm.invoicePattern = tag;
  } else {
    const trimmed = profileForm.invoicePattern.trim();
    const needsSeparator = !trimmed.endsWith("-") && !trimmed.endsWith("/") && !trimmed.endsWith("_");
    profileForm.invoicePattern = trimmed + (needsSeparator ? "-" : "") + tag;
  }
}

function setPatternPreset(preset: string) {
  profileForm.invoicePattern = preset;
}

const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
});

function showToast(message: string, type: "success" | "danger" = "success") {
  toastRef.value?.toastme(message, type);
}

async function fetchProfile() {
  loading.value = true;
  try {
    const res = await axios.get("/api/company/profile");
    const data = res.data?.data || {};
    profileData.value = { ...data };

    profileForm.companyName = data.companyName || "";
    profileForm.tagline = data.tagline || "";
    profileForm.phone = data.phone || "";
    profileForm.mobile = data.mobile || "";
    profileForm.address = data.address || "";
    profileForm.tradeLicense = data.tradeLicense || "";
    profileForm.vatBin = data.vatBin || "";
    profileForm.invoicePrefix = data.invoicePrefix || "INV";
    profileForm.productPrefix = data.productPrefix || "PRD-";
    profileForm.invoicePattern = data.invoicePattern || "{PREFIX}-{YYYY}-{0001}";
    profileForm.invoiceResetCycle = data.invoiceResetCycle || "yearly";
    profileForm.printFormat = data.printFormat || "a4";
    profileForm.invoiceTerms = data.invoiceTerms || "";
    profileForm.paymentInfo = data.paymentInfo || "";
    profileForm.logo = data.logo || "";
  } catch (err: any) {
    showToast(err.response?.data?.message || "কোম্পানীর তথ্য লোড করতে ব্যর্থ হয়েছে", "danger");
  } finally {
    loading.value = false;
  }
}

async function saveProfile() {
  savingProfile.value = true;
  try {
    const res = await axios.put("/api/company/profile", {
      companyName: profileForm.companyName,
      tagline: profileForm.tagline,
      phone: profileForm.phone,
      mobile: profileForm.mobile,
      address: profileForm.address,
      tradeLicense: profileForm.tradeLicense,
      vatBin: profileForm.vatBin,
      invoicePrefix: profileForm.invoicePrefix,
      productPrefix: profileForm.productPrefix,
      invoicePattern: profileForm.invoicePattern,
      invoiceResetCycle: profileForm.invoiceResetCycle,
      printFormat: profileForm.printFormat,
      invoiceTerms: profileForm.invoiceTerms,
      paymentInfo: profileForm.paymentInfo,
      logo: profileForm.logo
    });

    showToast(res.data?.message || "কোম্পানীর তথ্য সফলভাবে সংরক্ষিত হয়েছে", "success");
    await fetchProfile();
    // Refresh auth bootstrap so company name reflects in app header immediately
    await auth.bootstrap();
  } catch (err: any) {
    showToast(err.response?.data?.message || "সংরক্ষণ ব্যর্থ হয়েছে", "danger");
  } finally {
    savingProfile.value = false;
  }
}

async function changePassword() {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showToast("নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না", "danger");
    return;
  }

  changingPassword.value = true;
  try {
    const res = await axios.post("/api/company/change-password", {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword
    });

    showToast(res.data?.message || "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে", "success");
    passwordForm.currentPassword = "";
    passwordForm.newPassword = "";
    passwordForm.confirmPassword = "";
  } catch (err: any) {
    showToast(err.response?.data?.message || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে", "danger");
  } finally {
    changingPassword.value = false;
  }
}

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.company-settings-page {
  animation: fadeIn 0.15s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.nav-tab-btn {
  background-color: var(--app-bg, #f5f5f9);
  color: var(--bs-body-color, #495057);
  border: 1px solid var(--app-border, #dee2e6);
  font-weight: 500;
  transition: all 0.15s ease-in-out;
}

.nav-tab-btn:hover {
  background-color: var(--app-surface, #ffffff);
  border-color: var(--bs-primary, #0d6efd);
  color: var(--bs-primary, #0d6efd);
}

.nav-tab-btn.active {
  background-color: var(--bs-primary, #0d6efd) !important;
  border-color: var(--bs-primary, #0d6efd) !important;
  color: #ffffff !important;
  box-shadow: 0 0.125rem 0.35rem rgba(13, 110, 253, 0.3);
}

.print-format-option {
  background-color: var(--app-bg, #f8f9fa);
  border-color: var(--app-border, #dee2e6) !important;
  transition: all 0.15s ease-in-out;
  cursor: pointer;
  padding: 14px 16px !important;
}

.print-format-option:hover {
  border-color: var(--bs-primary, #0d6efd) !important;
}

.print-format-option.active-format {
  background-color: var(--app-surface, #ffffff);
  border-color: var(--bs-primary, #0d6efd) !important;
  box-shadow: 0 0.125rem 0.35rem rgba(13, 110, 253, 0.15);
}

.format-icon-box {
  width: 36px;
  height: 36px;
  background-color: var(--app-bg, #f1f2f4);
  color: var(--bs-body-color, #495057);
  transition: all 0.15s ease-in-out;
  flex-shrink: 0;
}

.active-format .format-icon-box {
  background-color: rgba(13, 110, 253, 0.12);
  color: var(--bs-primary, #0d6efd);
}

.preview-outer-card {
  background-color: var(--app-bg, #f8f9fa);
  border-color: var(--app-border, #dee2e6) !important;
}

/* Actual Thermal Paper Roll Styling */
.pos-paper-wrapper {
  background-color: transparent;
  min-height: 400px;
}

.actual-pos-paper {
  background-color: #ffffff !important;
  color: #111111 !important;
  font-family: 'Courier New', Courier, monospace !important;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.15);
  border-radius: 0 !important;
  padding: 16px 14px;
  position: relative;
  border-left: 1px dashed #cccccc;
  border-right: 1px dashed #cccccc;
  line-height: 1.35;
}

/* Serrated cutter edge top and bottom */
.actual-pos-paper::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 0;
  right: 0;
  height: 6px;
  background-image: linear-gradient(135deg, #ffffff 50%, transparent 50%), linear-gradient(-135deg, #ffffff 50%, transparent 50%);
  background-size: 10px 6px;
  background-repeat: repeat-x;
}

.actual-pos-paper::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  right: 0;
  height: 6px;
  background-image: linear-gradient(45deg, #ffffff 50%, transparent 50%), linear-gradient(-45deg, #ffffff 50%, transparent 50%);
  background-size: 10px 6px;
  background-repeat: repeat-x;
}

.pos-rule {
  border-top: 1px dashed #666666;
  width: 100%;
}

.pos-header-title {
  color: #000000 !important;
  font-size: 13.5px;
  letter-spacing: 0.5px;
}

.pos-text-muted {
  color: #555555 !important;
}

.pos-table th {
  font-weight: 600;
  color: #222222;
}

.pos-table td {
  color: #111111;
}

/* Actual A4 / A5 Sheet Styling */
.a4-sheet-wrapper {
  background-color: transparent;
}

.actual-a4-sheet {
  background-color: var(--app-surface, #ffffff) !important;
  border-color: var(--app-border, #dee2e6) !important;
  color: var(--bs-body-color);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.password-info-box {
  background-color: var(--app-bg, #f8f9fa) !important;
  border-color: var(--app-border, #dee2e6) !important;
}

.preview-sample-box {
  background-color: var(--app-bg, #f8f9fa) !important;
  border-color: var(--app-border, #dee2e6) !important;
}
</style>
