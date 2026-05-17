import type { ReactNode } from "react";

type ChartPanelProps = {
  children: ReactNode;
  subtitle: string;
  title: string;
};

export function ChartPanel({ children, subtitle, title }: ChartPanelProps) {
  return (
    <div className="rounded-[22px] border border-[#eadfcd] bg-[#fffaf2]/90 p-4 shadow-sm">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-[#78685c]">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}
