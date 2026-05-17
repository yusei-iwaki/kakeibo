"use client";

import { AppShell } from "@/components/kakeibo/app-shell";
import { useKakeibo } from "@/hooks/use-kakeibo";

export function KakeiboApp() {
  const kakeibo = useKakeibo();
  return <AppShell kakeibo={kakeibo} />;
}
