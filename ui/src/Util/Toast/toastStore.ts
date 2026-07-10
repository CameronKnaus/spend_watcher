// Module-scoped so the MutationCache's onError (outside the React tree) can push a toast the same
// way a component would. useSyncExternalStore in ToastContainer subscribes to this store.
export type Toast = {
  id: string;
  title: string;
  message?: string;
};

const AUTO_DISMISS_MS = 6000;

let toasts: Toast[] = [];
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeToasts(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToastsSnapshot() {
  return toasts;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emitChange();
}

export function showErrorToast(toast: Omit<Toast, 'id'>) {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, ...toast }];
  emitChange();

  setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
}

// The store is module-scoped (by design, so the non-React MutationCache can reach it), which means
// it outlives any single test. Tests that trigger a toast must reset it in afterEach so state
// doesn't leak into the next test.
export function clearAllToasts() {
  toasts = [];
  emitChange();
}
