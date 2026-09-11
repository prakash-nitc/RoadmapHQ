import { useSyncExternalStore } from "react";

// localStorage as an external store. Components read it during render instead of
// copying it into state from an effect, and the server render (plus hydration)
// sees `undefined`, so the markup always matches. Writes go through
// writeLocalStorage so every reader re-renders.
const CHANGE_EVENT = "dsa-local-storage-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // storage blocked (private mode, disabled site data)
  }
}

/** The stored value, `null` when unset, or `undefined` before hydration. */
export function useLocalStorage(key: string): string | null | undefined {
  return useSyncExternalStore(subscribe, () => read(key), () => undefined);
}

export function writeLocalStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // storage blocked — nothing persists, but readers are still notified
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
