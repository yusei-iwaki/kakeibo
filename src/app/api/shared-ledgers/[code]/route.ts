import {
  getSharedLedger,
  isSharedLedgerConfigured,
  sanitizeSharedLedgerCode,
  updateSharedLedger,
} from "@/lib/db/shared-ledgers";
import { parseStoredData } from "@/lib/kakeibo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext<"/api/shared-ledgers/[code]">) {
  if (!isSharedLedgerConfigured()) {
    return Response.json({ error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  try {
    const { code } = await context.params;
    const ledger = await getSharedLedger(code);
    if (!ledger) {
      return Response.json({ error: "Shared ledger not found." }, { status: 404 });
    }

    return Response.json({ ledger });
  } catch (error) {
    console.error("Failed to load shared ledger", error);
    return Response.json({ error: "Failed to load shared ledger." }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext<"/api/shared-ledgers/[code]">) {
  if (!isSharedLedgerConfigured()) {
    return Response.json({ error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  try {
    const { code } = await context.params;
    const body = await request.json().catch(() => null);
    const ledger = await updateSharedLedger(sanitizeSharedLedgerCode(code), parseStoredData(JSON.stringify(body?.data ?? null)));
    if (!ledger) {
      return Response.json({ error: "Shared ledger not found." }, { status: 404 });
    }

    return Response.json({ ledger });
  } catch (error) {
    console.error("Failed to update shared ledger", error);
    return Response.json({ error: "Failed to update shared ledger." }, { status: 500 });
  }
}
