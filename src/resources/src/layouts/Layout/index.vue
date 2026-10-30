<template>
  <!-- main start -->
  <div class="main no-sidebar" :class="{ 'no-transition': disableTransition }">
    <div class="content-wrapper container-xxl px-0">
      <Header
        :is-scrolled="headerScrolled"
        :theme-mode="themeMode"
        :on-logout="logout"
        :on-toggle-theme="ui.cycleTheme" />

      <!-- Breadcrumb / Page Links below App Header -->
      <div class="pagebar-container my-1 px-1">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-0 small fst-italic align-items-center" style="font-size: 0.85rem;">
            <li class="breadcrumb-item d-flex align-items-center">
              <template v-if="isHome">
                <i class="bi bi-house-door me-1 text-primary"></i>
                <span class="active-item text-primary fw-medium" style="color: #0d6efd !important;">হোম</span>
              </template>
              <template v-else>
                <router-link to="/" class="text-decoration-none text-muted d-flex align-items-center">
                  <i class="bi bi-house-door me-1"></i>হোম
                </router-link>
              </template>
            </li>
            <!-- Custom multi-item breadcrumbs if provided -->
            <template v-if="!isHome && customBreadcrumbs && customBreadcrumbs.length > 0">
              <li
                v-for="(crumb, idx) in customBreadcrumbs"
                :key="idx"
                class="breadcrumb-item d-flex align-items-center"
                :class="{ 'active fw-medium': idx === customBreadcrumbs.length - 1 }"
                :style="idx === customBreadcrumbs.length - 1 ? 'color: #0d6efd !important;' : ''"
                :aria-current="idx === customBreadcrumbs.length - 1 ? 'page' : undefined">
                <router-link
                  v-if="crumb.to && idx !== customBreadcrumbs.length - 1"
                  :to="crumb.to"
                  class="text-decoration-none text-muted">
                  {{ crumb.label }}
                </router-link>
                <a
                  v-else-if="crumb.onClick && idx !== customBreadcrumbs.length - 1"
                  href="javascript:void(0)"
                  class="text-decoration-none text-muted"
                  role="button"
                  @click.prevent="crumb.onClick">
                  {{ crumb.label }}
                </a>
                <span v-else>{{ crumb.label }}</span>
              </li>
            </template>
            <li
              v-else-if="!isHome && currentPageTitle && currentPageTitle.toLowerCase() !== 'dashboard' && currentPageTitle !== 'হোম'"
              class="breadcrumb-item active fw-medium"
              style="color: #0d6efd !important;"
              aria-current="page">
              {{ currentPageTitle }}
            </li>
          </ol>
        </nav>
      </div>

      <!-- content start -->
      <div class="content">
        <router-view />
      </div>
      <!-- content end -->
      <Footer />
    </div>
  </div>
  <!-- main end -->
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onBeforeUnmount, onMounted, provide, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Footer from "@/layouts/Layout/Footer.vue";
import Header from "@/layouts/Layout/Header.vue";
import { useAdminUiStore } from "@/stores/admin-ui";
import { useAuthStore } from "@/stores/auth";

const ui = useAdminUiStore();
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const { themeMode } = storeToRefs(ui);
const headerScrolled = ref(false);
const disableTransition = ref(true);

const isHome = computed(() => route.path === "/" || route.path === "/dashboard");

export interface BreadcrumbItem {
  label: string;
  to?: string;
  onClick?: () => void;
}

const customBreadcrumbs = ref<BreadcrumbItem[] | null>(null);
provide("setBreadcrumbs", (crumbs: BreadcrumbItem[] | null) => {
  customBreadcrumbs.value = crumbs;
});

const customTitle = ref("");
provide("setPageTitle", (t: string) => {
  customTitle.value = t;
  customBreadcrumbs.value = null;
});

watch(
  () => route.path,
  () => {
    customTitle.value = "";
    customBreadcrumbs.value = null;
  }
);

const currentPageTitle = computed(() => {
  if (customTitle.value) return customTitle.value;
  if (route.meta?.title) return String(route.meta.title);
  if (route.path.startsWith("/company-admins")) return "কোম্পানীর তালিকা";
  if (route.path === "/settings") return "Settings";
  if (route.path === "/profile") return "Profile";
  if (route.name && typeof route.name === "string" && route.name !== "dashboard") {
    return route.name.charAt(0).toUpperCase() + route.name.slice(1);
  }
  const clean = route.path.replace(/^\//, "").split("/")[0];
  if (!clean) return "";
  return clean.charAt(0).toUpperCase() + clean.slice(1);
});

const featureButtons = reactive<
  Array<{
    id: symbol;
    icon?: string;
    label: string;
    title: string;
    attrs?: Record<string, string>;
    onClick: () => void;
  }>
>([]);
provide("featureButtons", featureButtons);

async function logout() {
  await auth.logout();
  await router.push("/login");
}

function onScroll() {
  const y = window.scrollY;
  if (y > 20) {
    headerScrolled.value = true;
  } else if (y < 5) {
    headerScrolled.value = false;
  }
}

onMounted(() => {
  ui.initTheme();
  ui.initFont();

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Force reflow then enable transitions on next frame
  void document.body.offsetHeight;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      disableTransition.value = false;
    });
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  ui.cleanupTheme();
});
</script>

<style lang="scss" scoped>
.main {
  padding-left: 0 !important;
}

.pagebar-container {
  padding-top: 4px;
  padding-bottom: 4px;
}

.breadcrumb {
  --bs-breadcrumb-item-padding-x: 0.25rem;
  --bs-breadcrumb-divider: "/";
  font-size: 0.85rem;
}

.breadcrumb-item + .breadcrumb-item {
  padding-left: 0.25rem !important;

  &::before {
    padding-right: 0.25rem !important;
    color: var(--bs-secondary-color, #94a3b8);
  }
}

.breadcrumb-item a {
  color: var(--bs-secondary-color, #64748b) !important;
  transition: color 0.15s ease-in-out;

  &:hover {
    color: #0d6efd !important;
    text-decoration: underline;
  }
}

/* এক্টিভ পেইজ নীলকালার (Active page item is BLUE) */
.breadcrumb-item.active,
.active-item {
  color: #0d6efd !important;
}
</style>

