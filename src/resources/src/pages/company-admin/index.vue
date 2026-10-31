<template>
  <div class="company-admin-page">
    <!-- Toast Notification Component -->
    <Toast ref="toastRef" />

    <!-- Page Header -->
    <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
      <div>
        <h4 class="m-0 fw-bold">কোম্পানীর তালিকা</h4>
      </div>
      <div>
        <button type="button" class="btn btn-primary d-inline-flex align-items-center gap-1 shadow-sm" @click="openCreateModal">
          <i class="bi bi-plus-circle"></i>
          <span>নতুন কোম্পানী</span>
        </button>
      </div>
    </div>

    <!-- Company Admins Table Card -->
    <div class="card border shadow-sm">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div class="text-muted small mt-2">তথ্য লোড হচ্ছে...</div>
        </div>

        <div v-else-if="companyAdmins.length === 0" class="text-center py-5">
          <i class="bi bi-buildings text-muted fs-1 mb-2 d-block"></i>
          <p class="text-muted mb-3">কোনো কোম্পানী পাওয়া যায়নি।</p>
          <button type="button" class="btn btn-sm btn-outline-primary" @click="openCreateModal">
            প্রথম কোম্পানী যোগ করুন
          </button>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col" style="width: 60px;" class="text-center">#</th>
                <th scope="col">কোম্পানীর নাম</th>
                <th scope="col">ইমেইল</th>
                <th scope="col">মোবাইল</th>
                <th scope="col" class="text-center" style="width: 100px;">স্ট্যাটাস</th>
                <th scope="col" class="text-center" style="width: 90px;">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(admin, index) in companyAdmins" :key="admin.id">
                <td class="text-center text-muted small">{{ index + 1 }}</td>
                <td class="fw-semibold text-truncate" style="max-width: 200px;">
                  {{ admin.companyName }}
                </td>
                <td>{{ admin.email }}</td>
                <td>{{ admin.mobile || '-' }}</td>
                <td class="text-center">
                  <div class="form-check form-switch d-inline-flex justify-content-center m-0">
                    <input
                      class="form-check-input my-0"
                      type="checkbox"
                      role="switch"
                      :checked="admin.isActive"
                      :disabled="statusLoadingId === admin.id"
                      @change="toggleStatus(admin)"
                      style="cursor: pointer; width: 2.2rem; height: 1.15rem;" />
                  </div>
                </td>
                <td class="text-center">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger p-1 px-2 border-0"
                    title="কোম্পানী ও এর সকল ডাটা মুছুন"
                    :disabled="deletingId === admin.id"
                    @click="openDeleteModal(admin)">
                    <i class="bi bi-trash fs-6"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Modal Backdrop & Form -->
    <div
      v-if="showModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5);"
      @click.self="closeModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow border-0">
          <div class="modal-header border-bottom">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-building-add text-primary me-2"></i>নতুন কোম্পানী
            </h5>
            <button type="button" class="btn-close" aria-label="Close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="submitForm">
            <div class="modal-body">
              <div v-if="formError" class="alert alert-danger py-2 small mb-3">
                <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ formError }}
              </div>

              <!-- Company Name -->
              <div class="mb-3">
                <label for="companyName" class="form-label fw-medium small">
                  কোম্পানীর নাম <span class="text-danger">*</span>
                </label>
                <input
                  id="companyName"
                  v-model.trim="form.companyName"
                  type="text"
                  class="form-control"
                  placeholder="কোম্পানীর নাম লিখুন"
                  required />
              </div>

              <!-- Email -->
              <div class="mb-3">
                <label for="email" class="form-label fw-medium small">
                  ইমেইল <span class="text-danger">*</span>
                </label>
                <input
                  id="email"
                  v-model.trim="form.email"
                  type="email"
                  class="form-control"
                  placeholder="admin@company.com"
                  required />
                <div class="form-text small">ইমেইল ইউনিক হতে হবে।</div>
              </div>

              <!-- Mobile -->
              <div class="mb-3">
                <label for="mobile" class="form-label fw-medium small">
                  মোবাইল <span class="text-danger">*</span>
                </label>
                <input
                  id="mobile"
                  v-model.trim="form.mobile"
                  type="tel"
                  class="form-control"
                  placeholder="01XXXXXXXXX"
                  required />
              </div>

              <!-- Password -->
              <div class="mb-3">
                <label for="password" class="form-label fw-medium small">
                  পাসওয়ার্ড <span class="text-danger">*</span>
                </label>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  class="form-control"
                  placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                  minlength="6"
                  required />
              </div>
            </div>

            <div class="modal-footer border-top bg-light">
              <button type="button" class="btn btn-secondary" :disabled="submitting" @click="closeModal">
                বাতিল
              </button>
              <button type="submit" class="btn btn-primary d-inline-flex align-items-center gap-1" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm" role="status"></span>
                <i v-else class="bi bi-check-circle"></i>
                <span>সংরক্ষণ করুন</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal Backdrop & Dialog -->
    <div
      v-if="showDeleteModal && adminToDelete"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.65);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header bg-danger text-white py-2">
            <h5 class="modal-title fs-6 fw-bold">
              <i class="bi bi-exclamation-triangle-fill me-1"></i>
              কোম্পানী মুছে ফেলা
            </h5>
            <button type="button" class="btn-close btn-close-white" :disabled="deleting" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body p-4">
            <div class="alert alert-danger py-2 small mb-3">
              <i class="bi bi-exclamation-octagon-fill me-1 fw-bold"></i>
              <strong>চূড়ান্ত সতর্কতা:</strong> এই কোম্পানী মুছে ফেললে এর সাথে সম্পর্কিত সকল পণ্য, স্টক, কাস্টমার, ভেন্ডর, ক্রয়-বিক্রয় ও যাবতীয় সকল তথ্য ডাটাবেজ থেকে স্থায়ীভাবে মুছে যাবে এবং তা আর পুনরুদ্ধার করা সম্ভব হবে না!
            </div>
            <p class="mb-2">
              আপনি কি নিশ্চিত যে <strong>"{{ adminToDelete.companyName }}"</strong> কোম্পানীটি মুছে ফেলতে চান?
            </p>
            <div class="bg-light p-3 rounded small text-muted border">
              <div><strong>ইমেইল:</strong> {{ adminToDelete.email }}</div>
              <div><strong>মোবাইল:</strong> {{ adminToDelete.mobile || '-' }}</div>
            </div>
          </div>
          <div class="modal-footer py-2 bg-light d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-sm btn-secondary" :disabled="deleting" @click="closeDeleteModal">
              বাতিল
            </button>
            <button
              type="button"
              class="btn btn-sm btn-danger d-inline-flex align-items-center gap-1 shadow-sm"
              :disabled="deleting"
              @click="confirmDelete">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i v-else class="bi bi-trash me-1"></i>
              <span>{{ deleting ? 'মুছে ফেলা হচ্ছে...' : 'স্থায়ীভাবে মুছুন' }}</span>
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
import { inject, onMounted, reactive, ref } from "vue";
import Toast from "@/components/Toast.vue";

useHead({ title: "কোম্পানীর তালিকা - Fashion" });

const setPageTitle = inject<((title: string) => void) | undefined>("setPageTitle");
if (setPageTitle) {
  setPageTitle("কোম্পানীর তালিকা");
}

interface CompanyAdmin {
  id: number;
  companyName: string;
  email: string;
  mobile: string;
  isActive: boolean;
  createdAt?: string;
}

const companyAdmins = ref<CompanyAdmin[]>([]);
const loading = ref(true);
const submitting = ref(false);
const statusLoadingId = ref<number | null>(null);
const showModal = ref(false);
const formError = ref("");
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const showDeleteModal = ref(false);
const adminToDelete = ref<CompanyAdmin | null>(null);
const deletingId = ref<number | null>(null);
const deleting = ref(false);

const form = reactive({
  companyName: "",
  email: "",
  mobile: "",
  password: ""
});

function showToast(message: string, type: "success" | "danger" = "success") {
  toastRef.value?.toastme(message, type);
}

async function fetchCompanyAdmins() {
  loading.value = true;
  try {
    const res = await axios.get("/api/company");
    companyAdmins.value = res.data?.data || [];
  } catch (error: any) {
    showToast(error.response?.data?.message || "কোম্পানী তালিকা লোড করা সম্ভব হয়নি", "danger");
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  form.companyName = "";
  form.email = "";
  form.mobile = "";
  form.password = "";
  formError.value = "";
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  formError.value = "";
}

async function submitForm() {
  formError.value = "";
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
    await fetchCompanyAdmins();
  } catch (error: any) {
    formError.value = error.response?.data?.message || "কোম্পানী তৈরি ব্যর্থ হয়েছে";
  } finally {
    submitting.value = false;
  }
}

async function toggleStatus(admin: CompanyAdmin) {
  statusLoadingId.value = admin.id;
  try {
    const targetStatus = !admin.isActive;
    const res = await axios.patch(`/api/company/${admin.id}/status`, {
      isActive: targetStatus
    });

    admin.isActive = targetStatus;
    showToast(
      `"${admin.companyName}" এর স্ট্যাটাস ${targetStatus ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`,
      "success"
    );
  } catch (error: any) {
    showToast(error.response?.data?.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে", "danger");
  } finally {
    statusLoadingId.value = null;
  }
}

function openDeleteModal(admin: CompanyAdmin) {
  adminToDelete.value = admin;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  if (deleting.value) return;
  showDeleteModal.value = false;
  adminToDelete.value = null;
}

async function confirmDelete() {
  if (!adminToDelete.value) return;
  const target = adminToDelete.value;
  deleting.value = true;
  deletingId.value = target.id;
  try {
    const res = await axios.delete(`/api/company/${target.id}`);
    showToast(res.data?.message || `"${target.companyName}" সফলভাবে মুছে ফেলা হয়েছে`, "success");
    closeDeleteModal();
    await fetchCompanyAdmins();
  } catch (error: any) {
    showToast(error.response?.data?.message || "কোম্পানী মুছে ফেলা সম্ভব হয়নি", "danger");
  } finally {
    deleting.value = false;
    deletingId.value = null;
  }
}

onMounted(() => {
  fetchCompanyAdmins();
});
</script>

<style scoped>
.company-admin-page {
  animation: fadeIn 0.15s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
