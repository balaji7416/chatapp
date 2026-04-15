import { useToastStore } from "../store/toastStore.js";
import { useEffect } from "react";
import clsx from "clsx";
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
    <div className="toast toast-end">
      {toasts.map((toast) => (
        <div
          key={toast?.id}
          className={clsx(
            "alert shadow-md",
            toast?.type === "error" && "alert-error",
            toast?.type === "success" && "alert-success",
            toast?.type === "info" && "alert-info",
          )}
        >
          <div className="flex justify-between items-center w-full gap-2">
            <span className="text-sm font-semibold">{toast?.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="btn btn-ghost btn-md"
            >
              x
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Toast;
