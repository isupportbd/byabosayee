<template>
  <div class="capital-form-page">
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
          <h5 class="m-0 fw-bold">{{ isEditing ? 'মূলধন বিনিয়োগ তথ্য সম্পাদন' : 'নতুন মূলধন / পুঁজি যোগ' }}</h5>
          <small class="text-muted">ব্যবসায় নতুন মূলধন অথবা শেয়ারহোল্ডারের পুঁজি অন্তর্ভুক্তিকরণ</small>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <router-link
          to="/accounts/capital"
          class="btn btn-sm btn-outline-emerald d-inline-flex align-items-center gap-1.5 px-3 py-1.5 shadow-sm fw-medium">
          <i class="bi bi-card-list"></i>
          <span>মূলধন তালিকা</span>
        </router-link>
        <router-link
          to="/accounts/withdrawals/create"
          class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1.5 px-3 py-1.5 shadow-sm fw-medium">
          <i class="bi bi-dash-circle"></i>
          <span>উত্তোলন এন্ট্রি</span>
        </router-link>
      </div>
    </div>

    <!-- Form Card -->
    <div class="card border shadow-sm mb-4">
      <div class="card-header bg-transparent border-bottom py-2.5 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <h6 class="m-0 fw-bold d-flex align-items-center gap-2 text-emerald">
          <i :class="isEditing ? 'bi bi-pencil-square' : 'bi bi-plus-circle-fill'"></i>
          <span>{{ isEditing ? 'বিনিয়োগের বিবরণ সংশোধন' : 'মূলধন এন্ট্রি ফরম' }}</span>
        </h6>
        <span class="badge bg-emerald-subtle text-emerald border border-emerald-subtle small">
          একাউন্টস ও মূলধন লেজার
        </span>
      </div>

      <div class="card-body p-3 p-md-4">
        <form @submit.prevent="submitForm">
          <!-- Row 1: তারিখ, শেয়ারহোল্ডার নির্বাচন, পদবী ও টাকার পরিমাণ -->
          <div class="row g-3 mb-3">
            <!-- 1. Date -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1" for="capitalDate">
                বিনিয়োগের তারিখ <span class="text-danger">*</span>
              </label>
              <input
                id="capitalDate"
                v-model="form.date"
                type="date"
                class="form-control form-control-sm"
                required />
            </div>

            <!-- 2. Shareholder Selection -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1" for="shareholderSelect">
                শেয়ারহোল্ডার / বিনিয়োগকারী <span class="text-danger">*</span>
              </label>
              <select
                id="shareholderSelect"
                v-model="selectedShareholderId"
                class="form-select form-select-sm"
                @change="onShareholderSelect">
                <option value="" disabled>-- বিনিয়োগকারী নির্বাচন করুন --</option>
                <option
                  v-for="sh in shareholders"
                  :key="sh.id"
                  :value="sh.id">
                  {{ sh.name }} ({{ sh.ownershipType || 'মালিক' }})
                </option>
                <option value="__custom__">+ অন্য কোনো নাম যোগ করুন</option>
              </select>
            </div>

            <!-- 3. Shareholder Name (Editable if custom or default) -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1" for="shareholderNameInput">
                বিনিয়োগকারীর নাম <span class="text-danger">*</span>
              </label>
              <input
                id="shareholderNameInput"
                v-model.trim="form.shareholderName"
                type="text"
                class="form-control form-control-sm"
                placeholder="যেমন: মোঃ মিজানুর রহমান"
                required />
            </div>

            <!-- 4. Ownership Type -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1" for="ownershipTypeInput">
                মালিকানার ধরন / পদবী
              </label>
              <select
                id="ownershipTypeInput"
                v-model="form.ownershipType"
                class="form-select form-select-sm">
                <option value="মালিক">মালিক (Owner)</option>
                <option value="অংশীদার">অংশীদার (Partner)</option>
                <option value="শেয়ারহোল্ডার">শেয়ারহোল্ডার (Shareholder)</option>
                <option value="বিনিয়োগকারী">বিনিয়োগকারী (Investor)</option>
                <option value="অন্যান্য">অন্যান্য</option>
              </select>
            </div>
          </div>

          <!-- Row 2: টাকার পরিমাণ, পেমেন্ট মাধ্যম, রসিদ নম্বর ও ব্যাংক/ট্রানজেকশন তথ্য -->
          <div class="row g-3 mb-3">
            <!-- 5. Amount -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1" for="capitalAmount">
                টাকার পরিমাণ (৳) <span class="text-danger">*</span>
              </label>
              <div class="input-group input-group-sm">
                <span class="input-group-text fw-bold">৳</span>
                <input
                  id="capitalAmount"
                  v-model.number="form.amount"
                  type="number"
                  step="0.01"
                  min="1"
                  class="form-control form-control-sm text-end fw-bold text-success fs-6"
                  placeholder="0.00"
                  required />
              </div>
            </div>

            <!-- 6. Payment Method -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1" for="paymentMethodSelect">
                পেমেন্ট মাধ্যম <span class="text-danger">*</span>
              </label>
              <select
                id="paymentMethodSelect"
                v-model="form.paymentMethod"
                class="form-select form-select-sm"
                required>
                <option v-for="m in paymentMethodsList" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>

            <!-- 7. Receipt / Voucher No -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1" for="receiptNoInput">
                রসিদ / ভাউচার নং
              </label>
              <input
                id="receiptNoInput"
                v-model.trim="form.receiptNo"
                type="text"
                class="form-control form-control-sm"
                placeholder="যেমন: CAP-2026-001" />
            </div>

            <!-- 8. Account / Txn Details -->
            <div class="col-12 col-sm-6 col-lg-3">
              <label class="form-label small fw-semibold mb-1" for="accountDetailsInput">
                ব্যাংক বা ট্রানজেকশন বিবরণ
              </label>
              <input
                id="accountDetailsInput"
                v-model.trim="form.accountDetails"
                type="text"
                class="form-control form-control-sm"
                placeholder="যেমন: ডাচ-বাংলা ব্যাংক, চেক নং ১২৩৪" />
            </div>
          </div>

          <!-- Row 3: মন্তব্য / বিবরণ -->
          <div class="row g-3 mb-4">
            <div class="col-12">
              <label class="form-label small fw-semibold mb-1" for="capitalNotes">
                মন্তব্য / অতিরিক্ত বিবরণ
              </label>
              <textarea
                id="capitalNotes"
                v-model.trim="form.notes"
                rows="2"
                class="form-control form-control-sm"
                placeholder="পুঁজি যোগ সংক্রান্ত কোনো বিবরণ বা নোট থাকলে লিখুন..."></textarea>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="d-flex align-items-center justify-content-end gap-2 pt-3 border-top">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary px-3"
              @click="resetForm">
              <i class="bi bi-arrow-counterclockwise me-1"></i>
              রিসেট
            </button>
            <button
              type="submit"
              class="btn btn-sm btn-emerald text-white px-4 d-inline-flex align-items-center gap-1.5 shadow-sm fw-medium"
              :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm" role="status"></span>
              <i v-else :class="isEditing ? 'bi bi-check2-circle' : 'bi bi-save'"></i>
              <span>{{ isEditing ? 'আপডেট সম্পন্ন করুন' : 'মূলধন সংরক্ষণ করুন' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const isEditing = ref(false);
const editingId = ref<number | null>(null);
const submitting = ref(false);

const paymentMethodsList = [
  "নগদ",
  "ব্যাংক একাউন্ট",
  "বিকাশ",
  "নগদ (MFS)",
  "রকেট",
  "চেক",
  "অন্যান্য"
];

const shareholders = ref<any[]>([]);
const selectedShareholderId = ref<string>("");

const form = reactive({
  date: new Date().toISOString().split("T")[0],
  shareholderId: "",
  shareholderName: "",
  ownershipType: "মালিক",
  amount: null as number | null,
  paymentMethod: "নগদ",
  accountDetails: "",
  receiptNo: "",
  notes: ""
});

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

async function fetchShareholders() {
  try {
    const res = await axios.get("/api/accounts/shareholders");
    shareholders.value = res.data?.data || [];
    if (!isEditing.value && shareholders.value.length > 0 && !form.shareholderName) {
      selectedShareholderId.value = shareholders.value[0].id;
      form.shareholderId = shareholders.value[0].id;
      form.shareholderName = shareholders.value[0].name;
      form.ownershipType = shareholders.value[0].ownershipType || "মালিক";
    }
  } catch (err) {
    console.warn("Failed to load shareholders:", err);
  }
}

function onShareholderSelect() {
  if (selectedShareholderId.value === "__custom__") {
    form.shareholderId = "";
    form.shareholderName = "";
    form.ownershipType = "বিনিয়োগকারী";
    return;
  }
  const match = shareholders.value.find((sh) => sh.id === selectedShareholderId.value);
  if (match) {
    form.shareholderId = match.id;
    form.shareholderName = match.name;
    form.ownershipType = match.ownershipType || "মালিক";
  }
}

async function loadEditData(id: number) {
  try {
    const res = await axios.get(`/api/accounts/capitals/${id}`);
    const data = res.data?.data;
    if (data) {
      isEditing.value = true;
      editingId.value = id;
      form.date = data.date;
      form.shareholderId = data.shareholderId || "";
      form.shareholderName = data.shareholderName || "";
      form.ownershipType = data.ownershipType || "মালিক";
      form.amount = Number(data.amount) || null;
      form.paymentMethod = data.paymentMethod || "নগদ";
      form.accountDetails = data.accountDetails || "";
      form.receiptNo = data.receiptNo || "";
      form.notes = data.notes || "";
      selectedShareholderId.value = data.shareholderId || "__custom__";
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || "তথ্য লোড করতে ব্যর্থ হয়েছে", "danger");
  }
}

function resetForm() {
  form.date = new Date().toISOString().split("T")[0];
  form.amount = null;
  form.paymentMethod = "নগদ";
  form.accountDetails = "";
  form.receiptNo = "";
  form.notes = "";
  if (shareholders.value.length > 0) {
    selectedShareholderId.value = shareholders.value[0].id;
    form.shareholderId = shareholders.value[0].id;
    form.shareholderName = shareholders.value[0].name;
    form.ownershipType = shareholders.value[0].ownershipType || "মালিক";
  } else {
    selectedShareholderId.value = "";
    form.shareholderId = "";
    form.shareholderName = "";
    form.ownershipType = "মালিক";
  }
}

async function submitForm() {
  if (!form.shareholderName.trim()) {
    showToast("বিনিয়োগকারীর নাম লিখুন", "warning");
    return;
  }
  if (!form.amount || form.amount <= 0) {
    showToast("সঠিক টাকার পরিমাণ প্রদান করুন", "warning");
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      shareholderId: form.shareholderId || null,
      shareholderName: form.shareholderName.trim(),
      ownershipType: form.ownershipType || "মালিক",
      amount: form.amount,
      date: form.date,
      paymentMethod: form.paymentMethod,
      accountDetails: form.accountDetails.trim() || null,
      receiptNo: form.receiptNo.trim() || null,
      notes: form.notes.trim() || null
    };

    if (isEditing.value && editingId.value) {
      const res = await axios.put(`/api/accounts/capitals/${editingId.value}`, payload);
      showToast(res.data?.message || "মূলধন তথ্য আপডেট করা হয়েছে", "success");
      setTimeout(() => {
        router.push("/accounts/capital");
      }, 800);
    } else {
      const res = await axios.post("/api/accounts/capitals", payload);
      showToast(res.data?.message || "মূলধন সফলভাবে যোগ করা হয়েছে", "success");
      resetForm();
      setTimeout(() => {
        router.push("/accounts/capital");
      }, 800);
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || "সংরক্ষণ করতে ব্যর্থ হয়েছে", "danger");
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  await fetchShareholders();
  const queryId = route.query.id;
  if (queryId) {
    await loadEditData(Number(queryId));
  }
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
</style>
