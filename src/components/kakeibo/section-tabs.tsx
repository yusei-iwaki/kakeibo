import type { AppSection } from "@/types/kakeibo";

const sections: { id: AppSection; label: string }[] = [
  { id: "input", label: "入力" },
  { id: "calendar", label: "カレンダー" },
  { id: "charts", label: "グラフ" },
  { id: "settings", label: "設定" },
];

type SectionTabsProps = {
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
};

export function SectionTabs({ activeSection, setActiveSection }: SectionTabsProps) {
  return (
    <nav className="sticky top-2 z-20 -mx-1 overflow-x-auto rounded-2xl border border-[#e4d5bf] bg-[#fffaf2]/95 p-1 shadow-sm backdrop-blur" aria-label="主要メニュー">
      <div className="grid min-w-[420px] grid-cols-4 gap-1 sm:min-w-0">
        {sections.map((section) => (
          <button
            className={`min-h-11 rounded-xl px-3 text-sm font-bold transition active:scale-[0.98] ${
              activeSection === section.id ? "bg-[#c77a3d] text-white shadow-sm" : "text-[#6d5a4a] hover:bg-white"
            }`}
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            type="button"
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
