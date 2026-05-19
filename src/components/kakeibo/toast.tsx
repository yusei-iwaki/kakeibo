import type { ToastState } from "@/types/kakeibo";

type ToastProps = {
  toast: ToastState;
};

export function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  const toneClass = {
    success: "border-[#cfe0c8] bg-[#f4fbf0] text-[#355f37]",
    info: "border-[#d8c8af] bg-[#fffaf2] text-[#5b4a3c]",
    warning: "border-[#efc5b8] bg-[#fff3ef] text-[#9b3f2e]",
  }[toast.tone];

  return (
    <div className={`toast-message ${toneClass}`}>
      {toast.message}
    </div>
  );
}
