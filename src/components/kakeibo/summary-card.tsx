import { formatYen } from "@/lib/kakeibo";

type SummaryCardProps = {
  label: string;
  tone: "income" | "expense";
  value: number;
};

export function SummaryCard({ label, tone, value }: SummaryCardProps) {
  return (
    <div className="min-w-[72vw] snap-start rounded-[22px] border border-[#eadfcd] bg-[#fffaf2]/90 p-4 shadow-sm sm:min-w-0">
      <p className="text-sm font-bold text-[#78685c]">{label}</p>
      <strong className={`mt-2 block text-2xl ${tone === "income" ? "text-[#33745f]" : "text-[#b8523e]"}`}>
        {formatYen(value)}
      </strong>
    </div>
  );
}
