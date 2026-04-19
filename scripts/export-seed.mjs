// One-time: convert src/data/products-tagged.js -> netlify/functions/products-seed.json
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

const { products } = await import(
  resolve(__dirname, "../src/data/products-tagged.js")
);

const withIds = products.map((p) => ({ id: randomUUID(), ...p }));

const outPath = resolve(__dirname, "../netlify/functions/products-seed.json");
writeFileSync(outPath, JSON.stringify(withIds, null, 2), "utf8");

console.log(`Wrote ${withIds.length} products to ${outPath}`);
