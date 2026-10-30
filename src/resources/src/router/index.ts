import { createRouter, createWebHistory } from "vue-router";
import { setupRouteProgress } from "@/plugins/routeProgress";
import { useAuthStore } from "@/stores/auth";

export const routes = [
  {
    path: "/",
    name: "dashlayout",
    component: () => import("@/layouts/Layout/index.vue"),
    children: [
      {
        path: "/",
        name: "dashboard",
        component: () => import("@/pages/dashboard/index.vue"),
        meta: { requiresAuth: true }
      },
      {
        path: "/company-admins",
        name: "company-admins",
        component: () => import("@/pages/company-admin/index.vue"),
        meta: { requiresAuth: true, title: "কোম্পানী এডমিন" }
      },
      {
        path: "/vendors",
        name: "vendors",
        component: () => import("@/pages/vendors/index.vue"),
        meta: { requiresAuth: true, title: "বিক্রেতা ও সাপ্লায়ার" }
      },
      {
        path: "/customers",
        name: "customers",
        component: () => import("@/pages/customers/index.vue"),
        meta: { requiresAuth: true, title: "কাস্টমার লিস্ট" }
      },
      {
        path: "/brands",
        name: "brands",
        component: () => import("@/pages/brands/index.vue"),
        meta: { requiresAuth: true, title: "ব্রান্ড লিস্ট" }
      },
      {
        path: "/items",
        name: "items",
        component: () => import("@/pages/items/index.vue"),
        meta: { requiresAuth: true, title: "পণ্য" }
      },
      {
        path: "/stock",
        name: "stock",
        component: () => import("@/pages/stock/index.vue"),
        meta: { requiresAuth: true, title: "স্টক বিবরণ" }
      },
      {
        path: "/purchases",
        name: "purchases",
        component: () => import("@/pages/purchases/index.vue"),
        meta: { requiresAuth: true, title: "ক্রয় চালান" }
      },
      {
        path: "/pricing",
        name: "pricing",
        component: () => import("@/pages/pricing/index.vue"),
        meta: { requiresAuth: true, title: "পণ্যের মূল্য নির্ধারণ" }
      },
      {
        path: "/barcodes",
        name: "barcodes",
        component: () => import("@/pages/barcodes/index.vue"),
        meta: { requiresAuth: true, title: "বারকোড জেনারেশন ও প্রিন্ট" }
      },
      {
        path: "/sales",
        name: "sales",
        component: () => import("@/pages/sales/index.vue"),
        meta: { requiresAuth: true, title: "পণ্য বিক্রয় ও পিওএস" }
      },
      {
        path: "/sales-list",
        name: "sales-list",
        component: () => import("@/pages/sales/index.vue"),
        meta: { requiresAuth: true, title: "বিক্রয় চালানের তালিকা" }
      },
      {
        path: "/settings",
        name: "settings",
        component: () => import("@/pages/settings/index.vue"),
        meta: { requiresAuth: true, title: "গ্লোবাল সেটিংস" }
      },
      {
        path: "/storage",
        name: "storage",
        component: () => import("@/pages/storage/index.vue"),
        meta: { requiresAuth: true, title: "স্টোরেজ ও ব্যাকআপ" }
      },
      {
        path: "/company-settings",
        name: "company-settings",
        component: () => import("@/pages/company-settings/index.vue"),
        meta: { requiresAuth: true, title: "কোম্পানী সেটিংস" }
      }
    ]
  },
  {
    path: "/login",
    name: "authlayout",
    component: () => import("@/layouts/AuthLayout.vue"),
    children: [
      {
        path: "/register",
        name: "register",
        component: () => import("@/pages/auth/register.vue"),
        meta: { guestOnly: true }
      },
      {
        path: "/login",
        name: "login",
        component: () => import("@/pages/auth/login.vue"),
        meta: { guestOnly: true }
      },
      {
        path: "/forget-password",
        name: "forget-password",
        component: () => import("@/pages/auth/forgetPassword.vue"),
        meta: { guestOnly: true }
      },
      {
        path: "/reset-password",
        name: "reset-password",
        component: () => import("@/pages/auth/resetPassword.vue"),
        meta: { guestOnly: true }
      },
      {
        path: "/verify-email",
        name: "verify-email",
        component: () => import("@/pages/auth/verifyEmail.vue"),
        meta: { guestOnly: true }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (_to, _from, savedPosition) => {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  }
});

setupRouteProgress(router);

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.bootstrap();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { path: "/" };
  }

  return true;
});

export default router;
