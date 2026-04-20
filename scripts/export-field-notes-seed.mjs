import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { fieldNotes } = await import(
  resolve(__dirname, "../src/data/field-notes.js")
);

const withIds = fieldNotes.map((n) => ({ id: n.id || randomUUID(), ...n }));

const outPath = resolve(__dirname, "../netlify/functions/field-notes-seed.json");
writeFileSync(outPath, JSON.stringify(withIds, null, 2), "utf8");

console.log(`Wrote ${withIds.length} field notes to ${outPath}`);
