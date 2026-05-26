import postgres from "postgres";
import { parseStoredData } from "@/lib/kakeibo";
import type { StoredData } from "@/types/kakeibo";

type SharedLedgerRecord = {
  code: string;
  data: StoredData;
  editCode?: string;
  name: string;
  permission: "viewer" | "editor";
  readCode?: string;
  updatedAt: string;
};

type SharedLedgerRow = {
  code: string;
  data: StoredData;
  edit_code: string | null;
  name: string;
  read_code: string | null;
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
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS shared_ledgers (
          code text PRIMARY KEY,
          name text NOT NULL DEFAULT '共有家計簿',
          data jsonb NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`ALTER TABLE shared_ledgers ADD COLUMN IF NOT EXISTS read_code text`;
      await sql`ALTER TABLE shared_ledgers ADD COLUMN IF NOT EXISTS edit_code text`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS shared_ledgers_read_code_idx ON shared_ledgers (read_code)`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS shared_ledgers_edit_code_idx ON shared_ledgers (edit_code)`;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
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

function toRecord(row: SharedLedgerRow, permission: "viewer" | "editor"): SharedLedgerRecord {
  const readCode = row.read_code ?? row.code;
  const editCode = row.edit_code ?? row.code;
  return {
    code: permission === "editor" ? editCode : readCode,
    data: normalizeStoredData(row.data),
    editCode: permission === "editor" ? editCode : undefined,
    name: row.name,
    permission,
    readCode,
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

export async function checkSharedLedgerConnection() {
  if (!isSharedLedgerConfigured()) {
    return { configured: false, message: "DATABASE_URL is not configured." };
  }

  try {
    await ensureSchema();
    return { configured: true, message: "" };
  } catch (error) {
    console.error("Shared ledger database is not reachable", error);
    return {
      configured: false,
      message: "DATABASE_URL is configured, but the database connection failed.",
    };
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
    const readCode = createLedgerCode();
    const editCode = createLedgerCode();
    const rows = await sql<SharedLedgerRow[]>`
      INSERT INTO shared_ledgers (code, read_code, edit_code, name, data)
      VALUES (${editCode}, ${readCode}, ${editCode}, ${name.trim() || "共有家計簿"}, ${sql.json(normalizedData)})
      ON CONFLICT DO NOTHING
      RETURNING code, read_code, edit_code, name, data, updated_at
    `;

    if (rows[0]) return toRecord(rows[0], "editor");
  }

  throw new Error("Could not create a unique shared ledger code.");
}

export async function getSharedLedger(code: string) {
  await ensureSchema();
  const sql = getSql();
  const normalizedCode = normalizeCode(code);
  if (!normalizedCode) return null;

  const rows = await sql<SharedLedgerRow[]>`
    SELECT code, read_code, edit_code, name, data, updated_at
    FROM shared_ledgers
    WHERE code = ${normalizedCode}
      OR read_code = ${normalizedCode}
      OR edit_code = ${normalizedCode}
    LIMIT 1
  `;

  if (!rows[0]) return null;
  const permission = [rows[0].code, rows[0].edit_code].includes(normalizedCode) ? "editor" : "viewer";
  return toRecord(rows[0], permission);
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
      OR edit_code = ${normalizedCode}
    RETURNING code, read_code, edit_code, name, data, updated_at
  `;

  return rows[0] ? toRecord(rows[0], "editor") : null;
}
