// Custom storage helper to safely coordinate between window.storage, localStorage, and in-memory fallback.

export interface StorageResult {
  value: string;
}

export async function storeGet(key: string, fallback: any): Promise<any> {
  try {
    const win = window as any;
    if (win.storage && typeof win.storage.get === "function") {
      const r = await win.storage.get(key, false);
      return r ? JSON.parse(r.value) : fallback;
    }
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    console.warn("Storage read failed, returning fallback", e);
    return fallback;
  }
}

export async function storeSet(key: string, value: any, onWarning?: () => void): Promise<boolean> {
  try {
    const strVal = JSON.stringify(value);
    const win = window as any;
    if (win.storage && typeof win.storage.set === "function") {
      const r = await win.storage.set(key, strVal, false);
      if (!r && onWarning) onWarning();
      return !!r;
    }
    localStorage.setItem(key, strVal);
    return true;
  } catch (e) {
    console.error("Storage write failed", e);
    if (onWarning) onWarning();
    return false;
  }
}

export async function storeDelete(key: string): Promise<boolean> {
  try {
    const win = window as any;
    if (win.storage && typeof win.storage.delete === "function") {
      await win.storage.delete(key, false);
      return true;
    }
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.warn("Storage deletion failed", e);
    return false;
  }
}

export async function testStorageSupport(onWarning: () => void): Promise<boolean> {
  try {
    const win = window as any;
    if (!win.storage || typeof win.storage.set !== "function" || typeof win.storage.get !== "function") {
      // If we fall back to standard localStorage, let's verify if localStorage works.
      // In some sandboxed iframes, localStorage might throw a SecurityError.
      const probe = "ok-" + Date.now();
      localStorage.setItem("_probe", probe);
      const val = localStorage.getItem("_probe");
      localStorage.removeItem("_probe");
      if (val !== probe) {
        onWarning();
        return false;
      }
      return true;
    }
    
    const probe = "ok-" + Date.now();
    await win.storage.set("_probe", probe, false);
    const r = await win.storage.get("_probe", false);
    if (!r || r.value !== probe) {
      onWarning();
      return false;
    }
    return true;
  } catch (e) {
    onWarning();
    return false;
  }
}
