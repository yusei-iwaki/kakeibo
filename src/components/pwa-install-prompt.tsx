"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

export function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      }).catch(() => undefined);
    }

    queueMicrotask(() => {
      const navigatorWithStandalone = navigator as NavigatorWithStandalone;
      setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
      setIsStandalone(
        window.matchMedia("(display-mode: standalone)").matches || Boolean(navigatorWithStandalone.standalone),
      );
    });

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  if (isStandalone) return null;

  if (installPrompt) {
    return (
      <button
        className="min-h-11 rounded-full border border-[#d8c8af] bg-white px-3 py-2 text-xs font-semibold text-[#5b4a3c] shadow-sm hover:bg-[#fff4df] sm:px-4 sm:text-sm"
        onClick={install}
        type="button"
      >
        ホーム画面に追加
      </button>
    );
  }

  if (!isIOS) return null;

  return (
    <p className="col-span-2 rounded-2xl border border-[#eadfcd] bg-white/80 px-3 py-2 text-xs leading-5 text-[#78685c] md:col-span-1">
      iPhoneでは共有メニューから「ホーム画面に追加」を選びます。
    </p>
  );
}
