import postgres from "postgres";
import { parseStoredData } from "@/lib/kakeibo";
import type { StoredData } from "@/types/kakeibo";

type SharedLedgerRecord = {
  code: string;
  data: StoredData;
  name: string;
  updatedAt: string;
};

type SharedLedgerRow = {
  code: string;
  data: StoredData;
  name: string;
  updated_at: Date;
};

let sqlClient: ReturnType<typeof postgres> | null = null;
let schemaReady: Promise<void> | null = null;

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL?.trim().replace(/^['"]|['"]$/g, "") ?? "";
  if (!value || (!value.startsWith("postgres://") && !value.startsWith("postgresql://"))) {
    return null;
  }

  try {
    const url = new URL(value);
    decodeURIComponent(url.username);
    decodeURIComponent(url.password);
  } catch {
    throw new Error("DATABASE_URL is malformed. URL-encode special characters in the username or password.");
  }

  return value;
}

function getSql() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured correctly.");
  }

  sqlClient ??= postgres(databaseUrl, {
    max: 3,
    prepare: false,
  });

  return sqlClient;
}

async function ensureSchema() {
  if (!schemaReady) {
    const sql = getSql();
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS shared_ledgers (
        code text PRIMARY KEY,
        name text NOT NULL DEFAULT '共有家計簿',
        data jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }

  return schemaReady;
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function createLedgerCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function normalizeStoredData(data: unknown): StoredData {
  return parseStoredData(JSON.stringify(data ?? null));
}

function toRecord(row: SharedLedgerRow): SharedLedgerRecord {
  return {
    code: row.code,
    data: normalizeStoredData(row.data),
    name: row.name,
    updatedAt: row.updated_at.toISOString(),
  };
}

export function isSharedLedgerConfigured() {
  try {
    return Boolean(getDatabaseUrl());
  } catch (error) {
    console.error("Invalid DATABASE_URL", error);
    return false;
  }
}

export function sanitizeSharedLedgerCode(code: string) {
  return normalizeCode(code);
}

export async function createSharedLedger(data: StoredData, name = "共有家計簿") {
  await ensureSchema();
  const sql = getSql();
  const normalizedData = normalizeStoredData(data);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = createLedgerCode();
    const rows = await sql<SharedLedgerRow[]>`
      INSERT INTO shared_ledgers (code, name, data)
      VALUES (${code}, ${name.trim() || "共有家計簿"}, ${sql.json(normalizedData)})
      ON CONFLICT (code) DO NOTHING
      RETURNING code, name, data, updated_at
    `;

    if (rows[0]) return toRecord(rows[0]);
  }

  throw new Error("Could not create a unique shared ledger code.");
}

export async function getSharedLedger(code: string) {
  await ensureSchema();
  const sql = getSql();
  const normalizedCode = normalizeCode(code);
  if (!normalizedCode) return null;

  const rows = await sql<SharedLedgerRow[]>`
    SELECT code, name, data, updated_at
    FROM shared_ledgers
    WHERE code = ${normalizedCode}
    LIMIT 1
  `;

  return rows[0] ? toRecord(rows[0]) : null;
}

export async function updateSharedLedger(code: string, data: StoredData) {
  await ensureSchema();
  const sql = getSql();
  const normalizedCode = normalizeCode(code);
  if (!normalizedCode) return null;

  const rows = await sql<SharedLedgerRow[]>`
    UPDATE shared_ledgers
    SET data = ${sql.json(normalizeStoredData(data))}, updated_at = now()
    WHERE code = ${normalizedCode}
    RETURNING code, name, data, updated_at
  `;

  return rows[0] ? toRecord(rows[0]) : null;
}
