import type { SharedLedger, StoredData } from "@/types/kakeibo";

type SharedLedgerResponse = {
  ledger: SharedLedger;
};

type SharedLedgerConfigResponse = {
  configured: boolean;
  message?: string;
};

async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error ?? "共有家計簿の通信に失敗しました。");
  }

  return payload as T;
}

export async function fetchSharedLedgerConfig() {
  const response = await fetch("/api/shared-ledgers/", { cache: "no-store" });
  return readJson<SharedLedgerConfigResponse>(response);
}

export async function createSharedLedger(data: StoredData) {
  const response = await fetch("/api/shared-ledgers/", {
    body: JSON.stringify({ data }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  return readJson<SharedLedgerResponse>(response);
}

export async function loadSharedLedger(code: string) {
  const response = await fetch(`/api/shared-ledgers/${encodeURIComponent(code)}/`, { cache: "no-store" });
  return readJson<SharedLedgerResponse>(response);
}

export async function saveSharedLedger(code: string, data: StoredData) {
  const response = await fetch(`/api/shared-ledgers/${encodeURIComponent(code)}/`, {
    body: JSON.stringify({ data }),
    headers: { "Content-Type": "application/json" },
    method: "PUT",
  });
  return readJson<SharedLedgerResponse>(response);
}
