import axios from "axios";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

const THEME_KEY = "app-theme";
const FONT_KEY = "app-bangla-font";
const SIDEBAR_COLLAPSE_KEY = "sidebar-open-collapses";
const SIDEBAR_SCROLL_KEY = "sidebar-scroll-top";
type ThemeMode = "light" | "dark" | "auto";

export interface BanglaFontOption {
  id: string;
  name: string;
  englishName: string;
  fontFamily: string;
  description: string;
  badge?: string;
}

export const BANGLA_FONTS: BanglaFontOption[] = [
  {
    id: "noto-sans-bengali",
    name: "নোতো সান্স (Noto Sans Bengali)",
    englishName: "Noto Sans Bengali",
    fontFamily: '"Noto Sans Bengali", sans-serif',
    description: "গুগলের অফিসিয়াল সার্বজনীন পরিচ্ছন্ন ফন্ট। ফরমাল ও প্রফেশনাল ব্যবহারের জন্য সেরা।",
    badge: "Official Standard"
  },
  {
    id: "hind-siliguri",
    name: "হিন্দ শিলিগুড়ি (Hind Siliguri)",
    englishName: "Hind Siliguri",
    fontFamily: '"Hind Siliguri", sans-serif',
    description: "সবচেয়ে জনপ্রিয়, আধুনিক ও দৃষ্টিনন্দন UI ফন্ট। ড্যাশবোর্ড ও অ্যাপের জন্য সেরা।",
    badge: "Popular"
  },
  {
    id: "anek-bangla",
    name: "অনেক বাংলা (Anek Bangla)",
    englishName: "Anek Bangla",
    fontFamily: '"Anek Bangla", sans-serif',
    description: "স্মার্ট, আধুনিক ও ইউনিক কার্ভ স্টাইলের চমৎকার ফন্ট।",
    badge: "Modern"
  }
];

export const useAdminUiStore = defineStore("admin-ui", () => {
  const sidebarOpen = ref(false);
  const themeMode = ref<ThemeMode>("auto");
  const currentFontId = ref<string>("noto-sans-bengali");
  const sidebarOpenCollapseIds = ref<string[]>([]);
  const sidebarScrollTop = ref(0);
  let sidebarAccordionEl: HTMLElement | null = null;
  let sidebarScrollListener: (() => void) | null = null;

  const activeFont = computed(() => {
    return BANGLA_FONTS.find((f) => f.id === currentFontId.value) || BANGLA_FONTS[0];
  });

  const applyFont = (fontId: string) => {
    const font = BANGLA_FONTS.find((f) => f.id === fontId) || BANGLA_FONTS[0];
    currentFontId.value = font.id;

    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty("--app-font-family", font.fontFamily);
      root.style.setProperty("--bs-body-font-family", font.fontFamily);
      root.style.setProperty("--bs-font-sans-serif", font.fontFamily);

      if (document.body) {
        document.body.style.setProperty("--app-font-family", font.fontFamily);
        document.body.style.setProperty("--bs-body-font-family", font.fontFamily);
        document.body.style.setProperty("--bs-font-sans-serif", font.fontFamily);
      }

      let styleEl = document.getElementById("app-bangla-font-style") as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "app-bangla-font-style";
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `
        :root, html, body, #app,
        table, .table, th, td, tr, .settings-table, .settings-table td, .settings-table th,
        button, input, select, textarea,
        .btn, .badge, .form-control, .form-select,
        h1, h2, h3, h4, h5, h6, .card-title, .card-header,
        p, span, div, a, label {
          font-family: ${font.fontFamily} !important;
        }
      `;
    }

    try {
      localStorage.setItem(FONT_KEY, font.id);
    } catch {
      /* ignore */
    }
  };

  const initFont = async () => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(FONT_KEY);
    } catch {
      saved = null;
    }

    if (saved && BANGLA_FONTS.some((f) => f.id === saved)) {
      applyFont(saved);
    } else {
      applyFont("noto-sans-bengali");
    }

    try {
      const res = await axios.get("/api/settings/public");
      const found = res.data?.data?.find((s: any) => s.key === "system_bangla_font");
      if (found?.value && BANGLA_FONTS.some((f) => f.id === found.value)) {
        applyFont(found.value);
      }
    } catch {
      /* ignore */
    }
  };

  const themeIcon = computed(() => {
    if (themeMode.value === "light") return "bi-brightness-high-fill";
    return "bi-moon-stars";
  });

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
  };

  const closeSidebar = () => {
    sidebarOpen.value = false;
  };

  const applyTheme = (mode: ThemeMode) => {
    themeMode.value = mode;
    if (typeof document !== "undefined") {
      document.body.classList.remove("theme-light", "theme-dark", "theme-auto");
      document.body.classList.add(`theme-${mode}`);

      const effectiveTheme = mode === "auto"
        ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : mode;
      document.documentElement.setAttribute("data-bs-theme", effectiveTheme);
      document.body.setAttribute("data-bs-theme", effectiveTheme);
    }
    try {
      localStorage.setItem(THEME_KEY, mode);
    } catch {
      /* ignore */
    }
  };

  const cycleTheme = () => {
    const order: ThemeMode[] = ["light", "dark"];
    const index = order.indexOf(themeMode.value);
    applyTheme(order[(index + 1) % order.length]);
  };

  const initTheme = () => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark" || saved === "auto") {
        applyTheme(saved as ThemeMode);
        return;
      }
    } catch {
      /* ignore */
    }

    applyTheme("light");
  };

  const cleanupTheme = () => {};

  const loadSidebarCollapseIds = () => {
    try {
      const raw = localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
      sidebarOpenCollapseIds.value = raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      sidebarOpenCollapseIds.value = [];
    }
  };

  const persistSidebarCollapseIds = () => {
    localStorage.setItem(SIDEBAR_COLLAPSE_KEY, JSON.stringify(sidebarOpenCollapseIds.value));
  };

  const setSidebarCollapseOpen = (id: string, open: boolean) => {
    const ids = new Set(sidebarOpenCollapseIds.value);
    if (open) ids.add(id);
    else ids.delete(id);
    sidebarOpenCollapseIds.value = Array.from(ids);
    persistSidebarCollapseIds();
  };

  const restoreSidebarCollapseState = () => {
    sidebarOpenCollapseIds.value.forEach((id) => {
      const collapse = document.getElementById(id);
      if (!collapse) return;
      collapse.classList.add("show");
      const trigger = document.querySelector(`[data-bs-target="#${id}"]`);
      if (trigger instanceof HTMLElement) {
        trigger.classList.remove("collapsed");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  };

  const onSidebarCollapseShown = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!target?.id) return;
    setSidebarCollapseOpen(target.id, true);
  };

  const onSidebarCollapseHidden = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!target?.id) return;
    setSidebarCollapseOpen(target.id, false);
  };

  const initSidebarCollapsePersistence = () => {
    loadSidebarCollapseIds();
    restoreSidebarCollapseState();

    const sidebarAccordion = document.querySelector(".sidebar .accordion");
    if (sidebarAccordion instanceof HTMLElement) {
      const storedTop = Number(localStorage.getItem(SIDEBAR_SCROLL_KEY) || "0");
      sidebarScrollTop.value = Number.isFinite(storedTop) ? storedTop : 0;
      sidebarAccordion.scrollTop = sidebarScrollTop.value;

      sidebarAccordionEl = sidebarAccordion;
      sidebarScrollListener = () => {
        sidebarScrollTop.value = sidebarAccordion.scrollTop;
        localStorage.setItem(SIDEBAR_SCROLL_KEY, String(sidebarScrollTop.value));
      };

      sidebarAccordion.addEventListener("scroll", sidebarScrollListener, { passive: true });
    }

    document.addEventListener("shown.bs.collapse", onSidebarCollapseShown);
    document.addEventListener("hidden.bs.collapse", onSidebarCollapseHidden);
  };

  const cleanupSidebarCollapsePersistence = () => {
    if (sidebarAccordionEl && sidebarScrollListener) {
      sidebarAccordionEl.removeEventListener("scroll", sidebarScrollListener);
    }
    sidebarAccordionEl = null;
    sidebarScrollListener = null;
    document.removeEventListener("shown.bs.collapse", onSidebarCollapseShown);
    document.removeEventListener("hidden.bs.collapse", onSidebarCollapseHidden);
  };

  return {
    sidebarOpen,
    themeMode,
    themeIcon,
    toggleSidebar,
    closeSidebar,
    applyTheme,
    cycleTheme,
    initTheme,
    cleanupTheme,
    sidebarOpenCollapseIds,
    initSidebarCollapsePersistence,
    cleanupSidebarCollapsePersistence,
    currentFontId,
    activeFont,
    applyFont,
    initFont
  };
});
