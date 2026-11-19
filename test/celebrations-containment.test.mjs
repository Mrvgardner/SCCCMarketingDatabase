import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { birthdays, anniversaries, generatedAt } from "../src/data/celebrations.js";

test("the shipped celebrations defaults contain no staff data", () => {
  assert.deepEqual(birthdays, []);
  assert.deepEqual(anniversaries, []);
  assert.equal(generatedAt, null);
});

test("there is no upstream calendar ingestion from build or development", async () => {
  const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.deepEqual(Object.entries(manifest.scripts).filter(([,cmd]) => /fetch-celebrations|celebrations\.generated/.test(cmd)), []);
  assert.equal(Object.hasOwn(manifest.scripts, "prebuild"), false);
  assert.equal(Object.hasOwn(manifest.scripts, "predev"), false);
  await assert.rejects(readFile(new URL("../scripts/fetch-celebrations.mjs", import.meta.url)), { code: "ENOENT" });
});

test("no checked-in workflow publishes Pages artifacts", async () => {
  const workflows = new URL("../.github/workflows/", import.meta.url);
  const files = await readdir(workflows).catch(e => {
    if (e.code === "ENOENT") return [];
    throw e;
  });
  for (const file of files.filter(f => /\.ya?ml$/.test(f))) {
    assert.doesNotMatch(await readFile(new URL(file, workflows), "utf8"), /actions\/(?:upload-pages-artifact|deploy-pages)@/i, file);
  }
});
