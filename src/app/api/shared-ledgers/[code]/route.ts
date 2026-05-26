import {
  getSharedLedger,
  isSharedLedgerConfigured,
  sanitizeSharedLedgerCode,
  updateSharedLedger,
} from "@/lib/db/shared-ledgers";
import { parseStoredData } from "@/lib/kakeibo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SHARED_LEDGER_BODY_BYTES = 256_000;

async function readJsonBody(request: Request) {
  const rawBody = await request.text();
  if (rawBody.length > MAX_SHARED_LEDGER_BODY_BYTES) {
    throw new Error("Request body is too large.");
  }

  return JSON.parse(rawBody || "null") as { data?: unknown } | null;
}

export async function GET(_request: Request, context: RouteContext<"/api/shared-ledgers/[code]">) {
  if (!isSharedLedgerConfigured()) {
    return Response.json({ error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  try {
    const { code } = await context.params;
    const sanitizedCode = sanitizeSharedLedgerCode(code);
    if (!sanitizedCode || sanitizedCode.length !== 8) {
      return Response.json({ error: "Shared ledger not found." }, { status: 404 });
    }

    const ledger = await getSharedLedger(sanitizedCode);
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
    const sanitizedCode = sanitizeSharedLedgerCode(code);
    if (!sanitizedCode || sanitizedCode.length !== 8) {
      return Response.json({ error: "Shared ledger not found." }, { status: 404 });
    }

    const body = await readJsonBody(request);
    const ledger = await updateSharedLedger(sanitizedCode, parseStoredData(JSON.stringify(body?.data ?? null)));
    if (!ledger) {
      return Response.json({ error: "Shared ledger not found." }, { status: 404 });
    }

    return Response.json({ ledger });
  } catch (error) {
    if (error instanceof Error && error.message === "Request body is too large.") {
      return Response.json({ error: "Request body is too large." }, { status: 413 });
    }
    if (error instanceof SyntaxError) {
      return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    console.error("Failed to update shared ledger", error);
    return Response.json({ error: "Failed to update shared ledger." }, { status: 500 });
  }
}
