/**
 * Popula o banco com dados de demonstração.
 *
 * Uso:
 *   npm run db:seed            (só popula se ainda não houver pacientes)
 *   npm run db:seed -- --force (adiciona os dados de exemplo de novo)
 */
import fs from "node:fs";
import path from "node:path";

type AppointmentSeed = {
  dayOffset: number;
  hour: number;
  minute: number;
  status: "scheduled" | "completed" | "no_show" | "canceled";
  priceCents: number;
  notes?: string;
};

function loadEnvFiles(): void {
  for (const file of [".env.local", ".env"]) {
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) continue;

    for (const line of fs.readFileSync(fullPath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;

      const [, key, rawValue] = match;
      let value = rawValue.trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!process.env[key]) process.env[key] = value;
    }
  }
}

loadEnvFiles();

const PATIENTS = [
  {
    name: "Ana Paula Ribeiro",
    phone: "11991234567",
    email: "ana.ribeiro@email.com",
    birthDate: "1988-04-12",
    cpf: "312.456.789-00",
    address: "Rua das Acácias, 214 — Vila Mariana",
    notes: "Lombalgia crônica. Melhora com terapia manual e exercícios de estabilização.",
  },
  {
    name: "Bruno Carvalho Mendes",
    phone: "11988776655",
    email: "bruno.mendes@email.com",
    birthDate: "1995-09-03",
    cpf: null,
    address: "Av. Paulista, 1500 — Bela Vista",
    notes: "Corredor amador. Reabilitação de tendinopatia patelar direita.",
  },
  {
    name: "Carla Nogueira",
    phone: "11977665544",
    email: "carla.nogueira@email.com",
    birthDate: "1979-01-27",
    cpf: null,
    address: "Rua Harmonia, 87 — Vila Madalena",
    notes: "Pós-operatório de fratura de punho. Ganho gradual de mobilidade.",
  },
  {
    name: "Diego Ferreira Lima",
    phone: "11966554433",
    email: null,
    birthDate: "1991-11-18",
    cpf: null,
    address: "Rua do Oratório, 320 — Mooca",
    notes: "Hérnia de disco L4-L5. Sem dor irradiada nas últimas sessões.",
  },
  {
    name: "Elisa Martins Rocha",
    phone: "11955443322",
    email: "elisa.rocha@email.com",
    birthDate: "1967-06-30",
    cpf: null,
    address: "Alameda Santos, 45 — Cerqueira César",
    notes: "Equilíbrio e prevenção de quedas. Trabalha com Pilates clínico.",
  },
  {
    name: "Felipe Andrade Souza",
    phone: "11944332211",
    email: "felipe.souza@email.com",
    birthDate: "2001-03-08",
    cpf: null,
    address: "Rua Clélia, 712 — Lapa",
    notes: "Entorse de tornozelo em jogo de futebol. Retorno esportivo gradual.",
  },
  {
    name: "Gabriela Pires Almeida",
    phone: "11933221100",
    email: "gabriela.almeida@email.com",
    birthDate: "1984-12-05",
    cpf: null,
    address: "Rua Girassol, 129 — Vila Madalena",
    notes: "Cervicalgia por tensão. Orientações de ergonomia no trabalho.",
  },
  {
    name: "Henrique Barros",
    phone: "11922110099",
    email: null,
    birthDate: "1958-08-21",
    cpf: null,
    address: "Rua dos Pinheiros, 940 — Pinheiros",
    notes: "Artrose de joelho. Foco em fortalecimento e analgesia.",
  },
];

const HISTORY: AppointmentSeed[] = [
  // Semana passada
  { dayOffset: -28, hour: 8, minute: 0, status: "completed", priceCents: 22000, notes: "Avaliação inicial e plano de tratamento." },
  { dayOffset: -26, hour: 9, minute: 0, status: "completed", priceCents: 16000 },
  { dayOffset: -25, hour: 10, minute: 0, status: "completed", priceCents: 17000 },
  { dayOffset: -24, hour: 14, minute: 0, status: "completed", priceCents: 14000 },
  { dayOffset: -22, hour: 8, minute: 30, status: "no_show", priceCents: 16000 },
  { dayOffset: -21, hour: 11, minute: 0, status: "completed", priceCents: 15000 },
  { dayOffset: -20, hour: 15, minute: 0, status: "canceled", priceCents: 16000 },
  { dayOffset: -19, hour: 9, minute: 30, status: "completed", priceCents: 16000 },
  { dayOffset: -18, hour: 16, minute: 0, status: "completed", priceCents: 14000 },
  { dayOffset: -15, hour: 8, minute: 0, status: "completed", priceCents: 16000 },
  { dayOffset: -14, hour: 10, minute: 30, status: "completed", priceCents: 17000 },
  { dayOffset: -13, hour: 13, minute: 30, status: "completed", priceCents: 16000 },
  { dayOffset: -12, hour: 17, minute: 0, status: "completed", priceCents: 14000 },
  { dayOffset: -11, hour: 9, minute: 0, status: "completed", priceCents: 15000 },
  { dayOffset: -8, hour: 8, minute: 30, status: "completed", priceCents: 16000 },
  { dayOffset: -7, hour: 11, minute: 30, status: "completed", priceCents: 16000 },
  { dayOffset: -6, hour: 14, minute: 30, status: "completed", priceCents: 14000 },
  { dayOffset: -5, hour: 15, minute: 30, status: "completed", priceCents: 17000 },
  { dayOffset: -4, hour: 10, minute: 0, status: "completed", priceCents: 16000 },
  { dayOffset: -3, hour: 9, minute: 0, status: "completed", priceCents: 15000 },
  { dayOffset: -2, hour: 16, minute: 30, status: "completed", priceCents: 16000 },
  { dayOffset: -1, hour: 8, minute: 0, status: "completed", priceCents: 16000 },

  // Hoje
  { dayOffset: 0, hour: 8, minute: 0, status: "completed", priceCents: 16000 },
  { dayOffset: 0, hour: 9, minute: 0, status: "completed", priceCents: 14000 },
  { dayOffset: 0, hour: 10, minute: 0, status: "scheduled", priceCents: 17000 },
  { dayOffset: 0, hour: 14, minute: 0, status: "scheduled", priceCents: 16000 },
  { dayOffset: 0, hour: 15, minute: 0, status: "scheduled", priceCents: 15000 },
  { dayOffset: 0, hour: 16, minute: 30, status: "scheduled", priceCents: 16000 },

  // Próximos dias
  { dayOffset: 1, hour: 8, minute: 30, status: "scheduled", priceCents: 16000 },
  { dayOffset: 1, hour: 10, minute: 0, status: "scheduled", priceCents: 22000, notes: "Avaliação de novo paciente." },
  { dayOffset: 2, hour: 9, minute: 0, status: "scheduled", priceCents: 14000 },
  { dayOffset: 2, hour: 13, minute: 30, status: "scheduled", priceCents: 16000 },
  { dayOffset: 3, hour: 11, minute: 0, status: "scheduled", priceCents: 17000 },
  { dayOffset: 3, hour: 15, minute: 0, status: "scheduled", priceCents: 16000 },
  { dayOffset: 4, hour: 8, minute: 0, status: "scheduled", priceCents: 15000 },
  { dayOffset: 4, hour: 16, minute: 0, status: "scheduled", priceCents: 16000 },
  { dayOffset: 5, hour: 9, minute: 30, status: "scheduled", priceCents: 14000 },
  { dayOffset: 6, hour: 10, minute: 30, status: "scheduled", priceCents: 16000 },
  { dayOffset: 8, hour: 8, minute: 0, status: "scheduled", priceCents: 17000 },
  { dayOffset: 9, hour: 14, minute: 0, status: "scheduled", priceCents: 16000 },
  { dayOffset: 10, hour: 9, minute: 0, status: "scheduled", priceCents: 15000 },
];

async function main() {
  const force = process.argv.includes("--force");
  const { getDb, closeDb } = await import("../lib/db");
  const { patients, serviceTypes, appointments, settings } = await import("../db/schema");
  const { formatInTimeZone, fromZonedTime } = await import("date-fns-tz");
  const { sql } = await import("drizzle-orm");

  const db = await getDb();

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(patients);

  if (count > 0 && !force) {
    console.log(
      `[seed] O banco já tem ${count} paciente(s). Nada foi alterado. Use "npm run db:seed -- --force" para adicionar os exemplos novamente.`,
    );
    await closeDb();
    return;
  }

  const types = await db.select().from(serviceTypes);
  if (types.length === 0) {
    console.error("[seed] Nenhum tipo de atendimento encontrado. Rode o app uma vez antes.");
    await closeDb();
    process.exitCode = 1;
    return;
  }

  await db
    .update(settings)
    .set({
      clinicName: "Clínica Movimento",
      professionalName: "Marina Alves",
      phone: "(11) 3555-8080",
      address: "Rua Harmonia, 152 — Vila Madalena, São Paulo",
      updatedAt: new Date(),
    })
    .where(sql`id = 1`);

  const insertedPatients = await db
    .insert(patients)
    .values(
      PATIENTS.map((patient) => ({
        name: patient.name,
        phone: patient.phone,
        email: patient.email,
        birthDate: patient.birthDate,
        cpf: patient.cpf,
        address: patient.address,
        notes: patient.notes,
      })),
    )
    .returning({ id: patients.id, name: patients.name });

  const today = formatInTimeZone(new Date(), "America/Sao_Paulo", "yyyy-MM-dd");

  const rows = HISTORY.map((seed, index) => {
    const patient = insertedPatients[index % insertedPatients.length];
    const type = types[index % types.length];

    const [year, month, day] = today.split("-").map(Number);
    const base = new Date(year, month - 1, day + seed.dayOffset);
    const dateOnly = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(
      base.getDate(),
    ).padStart(2, "0")}`;
    const scheduledAt = fromZonedTime(
      `${dateOnly}T${String(seed.hour).padStart(2, "0")}:${String(seed.minute).padStart(2, "0")}:00`,
      "America/Sao_Paulo",
    );

    return {
      patientId: patient.id,
      serviceTypeId: type.id,
      scheduledAt,
      status: seed.status,
      priceCents: type.priceCents,
      notes: seed.notes ?? null,
    };
  });

  await db.insert(appointments).values(rows);

  console.log(`[seed] ${insertedPatients.length} pacientes e ${rows.length} atendimentos criados.`);
  console.log("[seed] Entre com o usuário configurado em ADMIN_EMAIL / ADMIN_PASSWORD.");
  await closeDb();
}

main().catch(async (error) => {
  console.error("[seed] Falhou:", error);
  process.exitCode = 1;
});
