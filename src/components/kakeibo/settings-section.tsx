import { ChangeEvent, RefObject } from "react";

type SettingsSectionProps = {
  exportData: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  importData: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function SettingsSection({ exportData, fileInputRef, importData }: SettingsSectionProps) {
  return (
    <section className="rounded-[22px] border border-[#eadfcd] bg-[#fffaf2]/90 p-4 shadow-sm">
      <h2 className="text-lg font-bold">設定</h2>
      <p className="mt-1 text-sm leading-6 text-[#78685c]">
        データはこのブラウザに保存されています。機種変更やバックアップ用に、定期的にJSONを書き出してください。
      </p>
      <div className="mt-4 grid gap-2">
        <button className="primary-action" onClick={exportData} type="button">
          JSONを書き出す
        </button>
        <button className="touch-button min-h-12" onClick={() => fileInputRef.current?.click()} type="button">
          JSONを読み込む
        </button>
        <input ref={fileInputRef} className="hidden" accept="application/json" onChange={importData} type="file" />
      </div>
    </section>
  );
}
