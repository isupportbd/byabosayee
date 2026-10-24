<template>
  <div class="storage-page">
    <Toast ref="toastRef" />

    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h4 class="fw-bold mb-1 d-flex align-items-center gap-2">
          <i class="bi bi-hdd-network-fill text-info"></i>
          <span>স্টোরেজ ও ডাটাবেজ ব্যাকআপ</span>
        </h4>
        <p class="text-muted small mb-0">
          PostgreSQL ডাটাবেজের প্রকৃত সাইজ পর্যবেক্ষণ, সম্পূর্ণ ব্যাকআপ ডাউনলোড ও নিরাপদ রিস্টোর ব্যবস্থাপনা।
        </p>
      </div>

      <button
        type="button"
        class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 shadow-sm"
        :disabled="loadingStats"
        @click="fetchStats">
        <i class="bi bi-arrow-clockwise" :class="{ 'spin-anim': loadingStats }"></i>
        <span>রিফ্রেশ করুন</span>
      </button>
    </div>

    <!-- Top 3 Stat Cards Row -->
    <div class="row g-3 mb-4">
      <!-- 1. Real Database Size -->
      <div class="col-12 col-md-4">
        <div class="card border shadow-sm h-100 stat-box-info">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted small fw-medium">প্রকৃত ডাটাবেজ সাইজ</span>
              <div class="stat-icon-wrapper bg-info-subtle text-info">
                <i class="bi bi-database-fill-gear"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline gap-2">
              <span class="fs-3 fw-bold text-info">{{ stats.sizePretty || 'লোড হচ্ছে...' }}</span>
              <span class="badge bg-info-subtle text-info border border-info-subtle" style="font-size: 11px;">PostgreSQL</span>
            </div>
            <p class="text-muted small mb-0 mt-2">
              <i class="bi bi-check-circle-fill text-success me-1"></i>ডিস্কের প্রকৃত সংরক্ষিত মেমরি
            </p>
          </div>
        </div>
      </div>

      <!-- 2. Catalog & Records Summary -->
      <div class="col-12 col-md-4">
        <div class="card border shadow-sm h-100 stat-box-primary">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted small fw-medium">সিস্টেম রেকর্ড সংখ্যা</span>
              <div class="stat-icon-wrapper bg-primary-subtle text-primary">
                <i class="bi bi-table"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline gap-2">
              <span class="fs-3 fw-bold text-primary">{{ toBengaliNumber(totalRecords) }}</span>
              <span class="text-muted small">টি মোট রেকর্ড</span>
            </div>
            <p class="text-muted small mb-0 mt-2">
              <i class="bi bi-diagram-3 text-primary me-1"></i>ক্যাটালগ, কোম্পানী ও কনফিগারেশন
            </p>
          </div>
        </div>
      </div>

      <!-- 3. Superadmin Security Guard -->
      <div class="col-12 col-md-4">
        <div class="card border shadow-sm h-100 stat-box-success">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted small fw-medium">সুপারএডমিন সুরক্ষা</span>
              <div class="stat-icon-wrapper bg-success-subtle text-success">
                <i class="bi bi-shield-lock-fill"></i>
              </div>
            </div>
            <div class="d-flex align-items-baseline gap-2">
              <span class="fs-3 fw-bold text-success">১০০% সংরক্ষিত</span>
            </div>
            <p class="text-muted small mb-0 mt-2">
              <i class="bi bi-lock-fill text-success me-1"></i>রিস্টোরের সময় সুপারএডমিন ডাটা অক্ষত থাকে
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Two Action Cards: Backup & Restore -->
    <div class="row g-3 mb-4">
      <!-- Left Card: Download Backup -->
      <div class="col-12 col-lg-6">
        <div class="card border shadow-sm h-100 action-card">
          <div class="card-header border-bottom py-3 px-3 d-flex align-items-center justify-content-between bg-transparent">
            <span class="fw-bold fs-6 d-flex align-items-center gap-2">
              <i class="bi bi-cloud-arrow-down-fill text-primary fs-5"></i>
              <span>সম্পূর্ণ ডাটাবেজ ব্যাকআপ ডাউনলোড</span>
            </span>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle">JSON Dump</span>
          </div>
          <div class="card-body p-3 d-flex flex-column justify-content-between">
            <div>
              <p class="text-muted small mb-3 leading-relaxed">
                আপনার সিস্টেমের সকল মাস্টার ক্যাটালগ (ক্যাটাগরি, সাব-ক্যাটাগরি, ধরন, সাইজ, রং, পরিমাপের একক),
                কোম্পানী তালিকা, এবং সিস্টেম সেটিংস তাৎক্ষণিকভাবে একটি সুরক্ষিত ব্যাকআপ ফাইলে ডাউনলোড করতে পারবেন।
              </p>

              <div class="bg-body-secondary p-3 rounded-3 mb-3 border">
                <div class="fw-semibold small mb-2 text-secondary">ব্যাকআপে অন্তর্ভুক্ত টেবিলসমূহ:</div>
                <div class="d-flex flex-wrap gap-1">
                  <span class="badge bg-secondary-subtle text-secondary-emphasis">ক্যাটাগরি ({{ toBengaliNumber(stats.counts?.categories || 0) }})</span>
                  <span class="badge bg-secondary-subtle text-secondary-emphasis">সাব-ক্যাটাগরি ({{ toBengaliNumber(stats.counts?.subCategories || 0) }})</span>
                  <span class="badge bg-secondary-subtle text-secondary-emphasis">ধরন ({{ toBengaliNumber(stats.counts?.productTypes || 0) }})</span>
                  <span class="badge bg-secondary-subtle text-secondary-emphasis">সাইজ ({{ toBengaliNumber(stats.counts?.sizes || 0) }})</span>
                  <span class="badge bg-secondary-subtle text-secondary-emphasis">রং ({{ toBengaliNumber(stats.counts?.colors || 0) }})</span>
                  <span class="badge bg-secondary-subtle text-secondary-emphasis">একক ({{ toBengaliNumber(stats.counts?.units || 0) }})</span>
                  <span class="badge bg-secondary-subtle text-secondary-emphasis">কোম্পানী ({{ toBengaliNumber(stats.counts?.companys || 0) }})</span>
                  <span class="badge bg-secondary-subtle text-secondary-emphasis">ইউজার ({{ toBengaliNumber(stats.counts?.users || 0) }})</span>
                </div>
              </div>
            </div>

            <div class="pt-2">
              <button
                type="button"
                class="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2 py-2 shadow-sm"
                :disabled="downloadingBackup"
                @click="triggerBackupDownload">
                <span v-if="downloadingBackup" class="spinner-border spinner-border-sm" role="status"></span>
                <i v-else class="bi bi-download"></i>
                <span>ব্যাকআপ ডাউনলোড করুন (.json)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Card: Upload & Restore Backup -->
      <div class="col-12 col-lg-6">
        <div class="card border shadow-sm h-100 action-card">
          <div class="card-header border-bottom py-3 px-3 d-flex align-items-center justify-content-between bg-transparent">
            <span class="fw-bold fs-6 d-flex align-items-center gap-2">
              <i class="bi bi-cloud-arrow-up-fill text-warning fs-5"></i>
              <span>ডাটাবেজ ব্যাকআপ হতে রিস্টোর</span>
            </span>
            <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">সুপারএডমিন সুরক্ষিত</span>
          </div>
          <div class="card-body p-3 d-flex flex-column justify-content-between">
            <div>
              <!-- Security Notice Alert -->
              <div class="alert alert-warning border border-warning-subtle py-2 px-3 small mb-3">
                <div class="fw-bold mb-1 d-flex align-items-center gap-1 text-warning-emphasis">
                  <i class="bi bi-shield-exclamation"></i>
                  <span>সুপারএডমিন ডাটা সুরক্ষা নীতি:</span>
                </div>
                <div class="text-secondary small">
                  ডাটা আপলোড বা রিস্টোর করার সময় আপনার বর্তমান <strong>সুপারএডমিনের ইউজার ও লগইন ডাটা সম্পূর্ণ বাদ দিয়ে</strong> রিস্টোর করা হবে। ফলে সুপারএডমিন কখনো মুছে যাবে না বা পরিবর্তন হবে না।
                </div>
              </div>

              <!-- File Input Area -->
              <div class="mb-3">
                <label for="backupFileInput" class="form-label small fw-semibold">
                  ব্যাকআপ ফাইল নির্বাচন করুন (.json) <span class="text-danger">*</span>
                </label>
                <input
                  id="backupFileInput"
                  ref="fileInputRef"
                  type="file"
                  accept=".json,application/json"
                  class="form-control"
                  @change="onFileSelected" />
              </div>

              <!-- Selected File Summary -->
              <div v-if="selectedFile" class="p-2.5 bg-body-tertiary rounded-3 border small mb-2 d-flex justify-content-between align-items-center">
                <div class="text-truncate me-2">
                  <i class="bi bi-filetype-json text-primary me-1 fs-6"></i>
                  <strong class="text-truncate">{{ selectedFile.name }}</strong>
                  <span class="text-muted ms-2">({{ formatBytes(selectedFile.size) }})</span>
                </div>
                <button type="button" class="btn btn-sm btn-link text-danger p-0" title="ফাইল মুছুন" @click="clearSelectedFile">
                  <i class="bi bi-x-circle-fill"></i>
                </button>
              </div>
            </div>

            <div class="pt-2">
              <button
                type="button"
                class="btn btn-warning w-100 d-inline-flex align-items-center justify-content-center gap-2 py-2 shadow-sm text-dark fw-semibold"
                :disabled="!selectedFile || restoringBackup"
                @click="confirmRestoreModal = true">
                <span v-if="restoringBackup" class="spinner-border spinner-border-sm" role="status"></span>
                <i v-else class="bi bi-arrow-repeat"></i>
                <span>ডাটাবেজ রিস্টোর শুরু করুন</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal before restoring -->
    <div
      v-if="confirmRestoreModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.55);"
      @click.self="confirmRestoreModal = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow border-0">
          <div class="modal-header border-bottom py-2.5">
            <h6 class="modal-title fw-bold text-danger d-flex align-items-center gap-2 m-0">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <span>ডাটাবেজ রিস্টোর নিশ্চিতকরণ</span>
            </h6>
            <button type="button" class="btn-close" aria-label="Close" @click="confirmRestoreModal = false"></button>
          </div>
          <div class="modal-body p-3">
            <p class="mb-2">
              আপনি কি নিশ্চিত যে আপনি এই ব্যাকআপ ফাইলটি রিস্টোর করতে চান?
            </p>
            <div class="alert alert-secondary py-2 px-3 small mb-3">
              <i class="bi bi-info-circle-fill text-info me-1"></i>
              বর্তমান ক্যাটালগ ও সেটিংস ডাটা এই ব্যাকআপ ফাইলের ডাটা দিয়ে প্রতিস্থাপিত হবে।
              <strong>তবে সুপারএডমিন অ্যাকাউন্ট সম্পূর্ণ সুরক্ষিত থাকবে।</strong>
            </div>
            <div class="text-muted small">
              ফাইল: <strong>{{ selectedFile?.name }}</strong>
            </div>
          </div>
          <div class="modal-footer border-top py-2">
            <button type="button" class="btn btn-secondary btn-sm" :disabled="restoringBackup" @click="confirmRestoreModal = false">
              বাতিল
            </button>
            <button
              type="button"
              class="btn btn-danger btn-sm d-inline-flex align-items-center gap-1 shadow-sm"
              :disabled="restoringBackup"
              @click="executeRestore">
              <span v-if="restoringBackup" class="spinner-border spinner-border-sm" role="status"></span>
              <i v-else class="bi bi-check2-circle"></i>
              <span>হ্যাঁ, রিস্টোর নিশ্চিত করুন</span>
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
import { computed, inject, onMounted, ref } from "vue";
import Toast from "@/components/Toast.vue";

useHead({ title: "স্টোরেজ ও ব্যাকআপ - Fashion" });

const setPageTitle = inject<((title: string) => void) | undefined>("setPageTitle");
if (setPageTitle) {
  setPageTitle("স্টোরেজ ও ব্যাকআপ");
}

const toastRef = ref<InstanceType<typeof Toast> | null>(null);
const loadingStats = ref(true);
const downloadingBackup = ref(false);
const restoringBackup = ref(false);
const confirmRestoreModal = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);

interface DbStats {
  sizePretty: string;
  sizeBytes: number;
  counts: {
    categories?: number;
    subCategories?: number;
    productTypes?: number;
    sizes?: number;
    colors?: number;
    units?: number;
    companys?: number;
    users?: number;
  };
}

const stats = ref<DbStats>({
  sizePretty: "",
  sizeBytes: 0,
  counts: {}
});

const totalRecords = computed(() => {
  const c = stats.value.counts || {};
  return (
    (c.categories || 0) +
    (c.subCategories || 0) +
    (c.productTypes || 0) +
    (c.sizes || 0) +
    (c.colors || 0) +
    (c.units || 0) +
    (c.companys || 0) +
    (c.users || 0)
  );
});

function showToast(message: string, type: "success" | "danger" = "success") {
  toastRef.value?.toastme(message, type);
}

function toBengaliNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null) return "০";
  const numStr = String(val);
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return numStr.replace(/[0-9]/g, (w) => bengaliDigits[+w]);
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

async function fetchStats() {
  loadingStats.value = true;
  try {
    const res = await axios.get("/api/backup/stats");
    stats.value = res.data?.data || { sizePretty: "N/A", sizeBytes: 0, counts: {} };
  } catch (error: any) {
    showToast(error.response?.data?.message || "স্ট্যাটিসটিক্স লোড করতে ব্যর্থ হয়েছে", "danger");
  } finally {
    loadingStats.value = false;
  }
}

async function triggerBackupDownload() {
  downloadingBackup.value = true;
  try {
    const res = await axios.get("/api/backup/download", {
      responseType: "blob"
    });
    const blob = new Blob([res.data], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fashion-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showToast("ডাটাবেজ ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে", "success");
  } catch (error: any) {
    showToast(error.response?.data?.message || "ব্যাকআপ ডাউনলোড করতে ব্যর্থ হয়েছে", "danger");
  } finally {
    downloadingBackup.value = false;
  }
}

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  }
}

function clearSelectedFile() {
  selectedFile.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
}

async function executeRestore() {
  if (!selectedFile.value) return;
  restoringBackup.value = true;

  try {
    const formData = new FormData();
    formData.append("file", selectedFile.value);

    const res = await axios.post("/api/backup/restore", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    confirmRestoreModal.value = false;
    clearSelectedFile();
    showToast(res.data?.message || "ডাটাবেজ সফলভাবে রিস্টোর হয়েছে!", "success");
    await fetchStats();
  } catch (error: any) {
    showToast(error.response?.data?.message || "ব্যাকআপ রিস্টোর করতে ব্যর্থ হয়েছে", "danger");
  } finally {
    restoringBackup.value = false;
  }
}

onMounted(() => {
  fetchStats();
});
</script>

<style lang="scss" scoped>
.storage-page {
  animation: fadeIn 0.15s ease-in-out;
}

.stat-icon-wrapper {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
}

.stat-box-info {
  border-top: 3px solid #0dcaf0 !important;
}

.stat-box-primary {
  border-top: 3px solid #0d6efd !important;
}

.stat-box-success {
  border-top: 3px solid #198754 !important;
}

.action-card {
  transition: box-shadow 0.2s ease;
  &:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
  }
}

.spin-anim {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
