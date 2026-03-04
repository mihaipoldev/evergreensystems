import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "loading";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastNotificationProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    bg: "bg-success/10 border-success/30",
    iconBg: "gradient-bg-success",
    text: "text-success",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-destructive/10 border-destructive/30",
    iconBg: "bg-destructive",
    text: "text-destructive",
  },
  info: {
    icon: Info,
    bg: "bg-primary/10 border-primary/30",
    iconBg: "gradient-bg-primary",
    text: "text-primary",
  },
  loading: {
    icon: Loader2,
    bg: "bg-secondary/10 border-secondary/30",
    iconBg: "gradient-bg-secondary",
    text: "text-secondary",
  },
};

/**
 * ToastNotification - Animated toast notifications for system feedback
 * Displays in top-right corner with smooth enter/exit animations
 */
export function ToastNotification({ toasts, onDismiss }: ToastNotificationProps) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const config = TOAST_CONFIG[toast.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border-2 bg-card shadow-lg min-w-[320px] max-w-[400px]",
                config.bg
              )}
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {/* Icon */}
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  config.iconBg
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 text-white",
                    toast.type === "loading" && "animate-spin"
                  )}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground">{toast.title}</h4>
                {toast.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{toast.description}</p>
                )}
              </div>

              {/* Dismiss */}
              <button
                onClick={() => onDismiss(toast.id)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
