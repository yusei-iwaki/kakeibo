import { createSharedLedger, isSharedLedgerConfigured } from "@/lib/db/shared-ledgers";
import { parseStoredData } from "@/lib/kakeibo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ configured: isSharedLedgerConfigured() });
}

export async function POST(request: Request) {
  if (!isSharedLedgerConfigured()) {
    return Response.json({ error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  try {
    const body = await request.json().catch(() => null);
    const data = parseStoredData(JSON.stringify(body?.data ?? null));
    const ledger = await createSharedLedger(data, body?.name);

    return Response.json({ ledger }, { status: 201 });
  } catch (error) {
    console.error("Failed to create shared ledger", error);
    return Response.json({ error: "Failed to create shared ledger." }, { status: 500 });
  }
}
