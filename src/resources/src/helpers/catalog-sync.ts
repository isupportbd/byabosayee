/**
 * Catalog & Inventory Realtime Cross-tab and Websocket Synchronization
 *
 * Enables seamless realtime synchronization between:
 * - Products / Items page
 * - Brands page
 * - Vendors / Suppliers / Manufacturers page
 * - Settings (Categories, Subcategories, Sizes, Units, Vendor Types)
 * AND
 * - Purchases (নতুন পণ্য ক্রয়) page
 *
 * Ensures all dropdowns update instantly in realtime with NO PAGE RELOAD.
 */
import { pulse } from "@/plugins/pulse";

const CHANNEL_NAME = "nexgen_catalog_sync";
const STORAGE_KEY = "nexgen_catalog_updated_at";

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch {
  broadcastChannel = null;
}

/**
 * Call this function whenever an entity (item, brand, size, unit, vendor, etc.)
 * is created, updated, or deleted anywhere in the application.
 */
export function notifyCatalogUpdated(entity?: string) {
  const timestamp = Date.now();
  const payload = { entity: entity || "general", timestamp };

  // 1. BroadcastChannel (Cross-tab instant sync)
  try {
    broadcastChannel?.postMessage(payload);
  } catch {
    // Ignore error
  }

  // 2. localStorage fallback for browsers / storage events
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
  } catch {
    // Ignore error
  }
}

/**
 * Register a reactive listener for catalog & inventory updates.
 * Fires whenever:
 * 1. An update is broadcast from another tab/window via BroadcastChannel
 * 2. An update is detected via localStorage storage event
 * 3. The user focuses or returns to this tab (window.focus / visibilitychange)
 * 4. A realtime websocket event arrives from the server via pulse
 *
 * Returns a cleanup function to remove all listeners on unmount.
 */
export function onCatalogUpdated(callback: (entity?: string) => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  let lastTriggerTime = 0;
  const trigger = (entity?: string) => {
    const now = Date.now();
    // Debounce to at most once every 300ms
    if (now - lastTriggerTime < 300) return;
    lastTriggerTime = now;
    callback(entity);
  };

  // 1. BroadcastChannel message listener
  const onBroadcastMessage = (event: MessageEvent) => {
    if (event?.data?.timestamp) {
      trigger(event.data.entity);
    }
  };
  broadcastChannel?.addEventListener("message", onBroadcastMessage);

  // 2. localStorage storage event listener
  const onStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        trigger(parsed.entity);
      } catch {
        trigger();
      }
    }
  };
  window.addEventListener("storage", onStorageChange);

  // 3. Tab focus & visibility change listener
  const onFocus = () => {
    trigger("focus");
  };
  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      trigger("visibility");
    }
  };
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onVisibilityChange);

  // 4. Socket.IO pulse realtime listener
  let pulseChannel: any = null;
  try {
    pulseChannel = pulse.channel("catalog");
    pulseChannel.listen("catalog.updated", (data: any) => {
      trigger(data?.entity);
    });
  } catch {
    // Pulse not enabled or in test mode
  }

  // Return comprehensive unmount cleanup
  return () => {
    broadcastChannel?.removeEventListener("message", onBroadcastMessage);
    window.removeEventListener("storage", onStorageChange);
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    try {
      pulseChannel?.stopListening("catalog.updated");
    } catch {
      // Ignore
    }
  };
}
