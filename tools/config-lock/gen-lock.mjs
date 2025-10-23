import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = path.resolve(process.cwd());
const SNAPSHOT = path.join(ROOT, "snapshot.md");
const LOCK = path.join(ROOT, "config-lock.json");
const PUB_PEM = path.join(ROOT, "tools/config-lock/public.pem");
// Private key is CI-only (PEM string or file path)
const PRIV_PEM_FILE = process.env.CONFIG_LOCK_PRIVATE_KEY_FILE || "";
const PRIV_PEM_INLINE = process.env.CONFIG_LOCK_PRIVATE_KEY || "";

function readSnapshotList() {
  const md = fs.readFileSync(SNAPSHOT, "utf8");
  const m = md.match(/```snapshot([\s\S]*?)```/);
  if (!m) throw new Error("No ```snapshot ...``` fenced block found in snapshot.md");
  return m[1]
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean)
    .filter(s => !s.startsWith("#"));
}

function sha256File(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) throw new Error(`Missing frozen file: ${rel}`);
  const buf = fs.readFileSync(abs);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function canonical(obj) {
  // sort object keys & entries by path for stable signing
  const clone = structuredClone(obj);
  if (Array.isArray(clone.entries)) {
    clone.entries.sort((a, b) => a.path.localeCompare(b.path));
  }
  return JSON.stringify(clone);
}

function main() {
  const files = readSnapshotList();
  const entries = files.map(rel => ({ path: rel, sha256: sha256File(rel) }));

  const pubPem = fs.readFileSync(PUB_PEM, "utf8");
  const payload = {
    version: 1,
    createdAt: new Date().toISOString(),
    entries,
  };
  const data = Buffer.from(canonical(payload));

  // Only CI should sign. Locally you can regenerate but signature will be blank.
  let signature = "";
  const privPem =
    PRIV_PEM_INLINE ||
    (PRIV_PEM_FILE && fs.existsSync(PRIV_PEM_FILE) ? fs.readFileSync(PRIV_PEM_FILE, "utf8") : "");
  if (privPem) {
    signature = crypto.sign(null, data, privPem).toString("base64url"); // Ed25519
  }

  const lock = { ...payload, publicKeyPem: pubPem, signature };
  fs.writeFileSync(LOCK, JSON.stringify(lock, null, 2));
  console.log(`Wrote ${path.relative(ROOT, LOCK)} (${entries.length} entries)`);
}

main();
