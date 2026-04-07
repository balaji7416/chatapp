import { useToastStore } from "../store/toastStore.js";
import { useEffect } from "react";

function Toast() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  useEffect(() => {
    const timers = toasts.map((toast) => {
      return setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
    });
    return () => {
      timers.forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-3">
      {toasts.map((toast) => (
        <div key={toast?.id}>
          <div>
            <span>{toast?.message}</span>
            <button onClick={() => removeToast(toast.id)}>x</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Toast;
