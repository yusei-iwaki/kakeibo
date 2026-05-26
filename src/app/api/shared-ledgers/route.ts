import { createSharedLedger, isSharedLedgerConfigured } from "@/lib/db/shared-ledgers";
import { parseStoredData } from "@/lib/kakeibo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SHARED_LEDGER_BODY_BYTES = 256_000;

async function readJsonBody(request: Request) {
  const rawBody = await request.text();
  if (rawBody.length > MAX_SHARED_LEDGER_BODY_BYTES) {
    throw new Error("Request body is too large.");
  }

  return JSON.parse(rawBody || "null") as { data?: unknown; name?: unknown } | null;
}

export async function GET() {
  return Response.json({ configured: isSharedLedgerConfigured() });
}

export async function POST(request: Request) {
  if (!isSharedLedgerConfigured()) {
    return Response.json({ error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  try {
    const body = await readJsonBody(request);
    const data = parseStoredData(JSON.stringify(body?.data ?? null));
    const name = typeof body?.name === "string" ? body.name : undefined;
    const ledger = await createSharedLedger(data, name);

    return Response.json({ ledger }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Request body is too large.") {
      return Response.json({ error: "Request body is too large." }, { status: 413 });
    }
    if (error instanceof SyntaxError) {
      return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    console.error("Failed to create shared ledger", error);
    return Response.json({ error: "Failed to create shared ledger." }, { status: 500 });
  }
}
