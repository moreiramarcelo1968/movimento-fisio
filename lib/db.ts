import path from "node:path";
import bcrypt from "bcryptjs";
import { PGlite } from "@electric-sql/pglite";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import { DDL_STATEMENTS } from "../db/ddl";
import * as schema from "../db/schema";

export type Database = PgliteDatabase<typeof schema>;

export type { schema };

const globalStore = globalThis as unknown as {
  __movimentoDb?: Database;
  __movimentoInit?: Promise<void>;
};

const DEFAULT_SERVICE_TYPES = [
  {
    name: "Avaliação inicial",
    description: "Anamnese, avaliação funcional e plano de tratamento.",
    durationMin: 60,
    priceCents: 22000,
    color: "teal",
  },
  {
    name: "Sessão de fisioterapia",
    description: "Atendimento individual com terapia manual e exercícios.",
    durationMin: 50,
    priceCents: 16000,
    color: "sage",
  },
  {
    name: "Pilates clínico",
    description: "Sessão em aparelhos, no máximo três alunos.",
    durationMin: 50,
    priceCents: 14000,
    color: "amber",
  },
  {
    name: "RPG",
    description: "Reeducação postural global.",
    durationMin: 50,
    priceCents: 17000,
    color: "clay",
  },
  {
    name: "Liberação miofascial",
    description: "Técnica manual para alívio de tensões musculares.",
    durationMin: 40,
    priceCents: 15000,
    color: "sky",
  },
];

function createInstance(): Database {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (connectionString) {
    const client = neon(connectionString);
    return drizzleNeon(client, { schema }) as unknown as Database;
  }

  const dataDir = process.env.PGLITE_DIR?.trim() || path.join(process.cwd(), ".pglite");
  const client = new PGlite(dataDir);
  return drizzlePglite(client, { schema }) as unknown as Database;
}

async function bootstrap(instance: Database) {
  for (const statement of DDL_STATEMENTS) {
    await instance.execute(sql.raw(statement));
  }

  const existingUsers = await instance.select({ id: schema.users.id }).from(schema.users).limit(1);

  if (existingUsers.length === 0 && process.env.AUTO_CREATE_ADMIN !== "false") {
    const email = (process.env.ADMIN_EMAIL || "fisio@movimento.app").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "movimento123";
    const name = process.env.ADMIN_NAME || "Fisioterapeuta";

    await instance.insert(schema.users).values({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
    });

    console.log(`[movimento] Usuário inicial criado: ${email}`);
  }

  const existingTypes = await instance
    .select({ id: schema.serviceTypes.id })
    .from(schema.serviceTypes)
    .limit(1);

  if (existingTypes.length === 0) {
    await instance.insert(schema.serviceTypes).values(DEFAULT_SERVICE_TYPES);
  }

  await instance.insert(schema.settings).values({ id: 1 }).onConflictDoNothing();
}

export async function getDb(): Promise<Database> {
  if (!globalStore.__movimentoInit) {
    const instance = createInstance();
    globalStore.__movimentoDb = instance;
    globalStore.__movimentoInit = bootstrap(instance).catch((error) => {
      globalStore.__movimentoInit = undefined;
      globalStore.__movimentoDb = undefined;
      throw error;
    });
  }

  await globalStore.__movimentoInit;
  return globalStore.__movimentoDb as Database;
}

/**
 * Encerra a conexão local embutida. Usado apenas por scripts de linha de comando,
 * para que o processo termine sozinho depois do seed.
 */
export async function closeDb(): Promise<void> {
  if (!globalStore.__movimentoDb) return;

  const client = (globalStore.__movimentoDb as unknown as {
    $client?: { close?: () => Promise<void> };
  }).$client;

  try {
    await client?.close?.();
  } catch {
    /* ignora erros ao fechar uma conexão que já caiu */
  }

  globalStore.__movimentoDb = undefined;
  globalStore.__movimentoInit = undefined;
}
