/**
 * Apaga o banco local embutido (PGlite) para começar do zero.
 * Não afeta o Neon: se DATABASE_URL estiver configurada, este script só avisa.
 */
import fs from "node:fs";
import path from "node:path";

const dir = process.env.PGLITE_DIR?.trim() || path.join(process.cwd(), ".pglite");

if (process.env.DATABASE_URL?.trim()) {
  console.log(
    "[reset] DATABASE_URL está configurada. O banco de produção (Neon) não é apagado por este script.",
  );
  process.exit(0);
}

if (!fs.existsSync(dir)) {
  console.log("[reset] Nada para apagar: o banco local ainda não existe.");
  process.exit(0);
}

fs.rmSync(dir, { recursive: true, force: true });
console.log(`[reset] Banco local removido de ${dir}.`);
console.log("[reset] Na próxima vez que o app abrir, o banco será criado com o usuário e os tipos padrão.");
