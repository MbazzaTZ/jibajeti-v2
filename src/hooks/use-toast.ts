import { useState } from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (props: Omit<Toast, "id">) => {
    const id = Math.random().toString(36);
    const newToast = { ...props, id };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const dismiss = (toastId?: string) => {
    if (toastId) {
      setToasts(prev => prev.filter(toast => toast.id !== toastId));
    } else {
      setToasts([]);
    }
  };

  return {
    toasts,
    toast,
    dismiss,
  };
}
