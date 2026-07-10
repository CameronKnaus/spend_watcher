import { useSyncExternalStore } from 'react';
import AlertMessage from 'Components/AlertMessage/AlertMessage';
import { dismissToast, getToastsSnapshot, subscribeToasts } from './toastStore';
import styles from './ToastContainer.module.css';

export default function ToastContainer() {
  const toasts = useSyncExternalStore(subscribeToasts, getToastsSnapshot);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <AlertMessage
          key={toast.id}
          variant="error"
          title={toast.title}
          message={toast.message}
          className={styles.toast}
          role="button"
          tabIndex={0}
          onClick={() => dismissToast(toast.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              dismissToast(toast.id);
            }
          }}
        />
      ))}
    </div>
  );
}
