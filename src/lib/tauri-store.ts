//? Wrapper around Tauri's secure store plugin....
//? Falls back to localStorage in browser/dev mode.....
import type { Store } from "@tauri-apps/plugin-store";

let tauriStore: Store | null = null;

async function getStore() {
  if (tauriStore) return tauriStore;

  try {
    //? dynamically import so it doesn't break in browser....
    const { Store } = await import("@tauri-apps/plugin-store");
    tauriStore = await Store.load("secure.json");
    return tauriStore;
  } catch {
    //? not in Tauri — fall back to localStorage....
    return null;
  }
}

export async function secureSet(key: string, value: string): Promise<void> {
  const store = await getStore();
  if (store) {
    await store.set(key, value);
    await store.save();
  } else {
    localStorage.setItem(key, value);
  }
}

export async function secureGet(key: string): Promise<string | null> {
  const store = await getStore();
  if (store) {
    return (await store.get<string>(key)) ?? null;
  }
  return localStorage.getItem(key);
}

export async function secureDelete(key: string): Promise<void> {
  const store = await getStore();
  if (store) {
    await store.delete(key);
    await store.save();
  } else {
    localStorage.removeItem(key);
  }
}
