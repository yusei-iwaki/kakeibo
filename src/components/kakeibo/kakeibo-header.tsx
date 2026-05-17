"use client";

import { ChangeEvent, RefObject } from "react";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import type { AppSection } from "@/types/kakeibo";

type KakeiboHeaderProps = {
  exportData: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  importData: (event: ChangeEvent<HTMLInputElement>) => void;
  setActiveSection: (section: AppSection) => void;
};

export function KakeiboHeader({ exportData, fileInputRef, importData, setActiveSection }: KakeiboHeaderProps) {
  return (
    <header className="rounded-[22px] border border-[#eadfcd] bg-[#fffaf2]/92 p-4 shadow-[0_18px_60px_rgba(83,60,36,0.10)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#b36b35]">ひとり用の家計簿</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">暮らしのお金</h1>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-[#78685c]">
            今日の入力、月の流れ、固定費をスマホで素早く確認できます。
          </p>
        </div>
        <button
          className="min-h-10 shrink-0 rounded-full bg-[#342820] px-4 text-xs font-bold text-white shadow-sm active:scale-[0.98]"
          onClick={() => setActiveSection("input")}
          type="button"
        >
          入力
        </button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button className="touch-button" onClick={exportData} type="button">
          書き出し
        </button>
        <button className="touch-button" onClick={() => fileInputRef.current?.click()} type="button">
          読み込み
        </button>
        <PwaInstallPrompt />
        <input ref={fileInputRef} className="hidden" accept="application/json" onChange={importData} type="file" />
      </div>
    </header>
  );
}
