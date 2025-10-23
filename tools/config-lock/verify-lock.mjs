import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = path.resolve(process.cwd());
const LOCK = path.join(ROOT, "config-lock.json");

function sha256File(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) throw new Error(`Missing frozen file: ${rel}`);
  return crypto.createHash("sha256").update(fs.readFileSync(abs)).digest("hex");
}
function canonical(obj) {
  const clone = structuredClone(obj);
  if (Array.isArray(clone.entries)) {
    clone.entries.sort((a, b) => a.path.localeCompare(b.path));
  }
  return JSON.stringify(clone);
}

function main() {
  if (!fs.existsSync(LOCK)) throw new Error("config-lock.json missing");
  const lock = JSON.parse(fs.readFileSync(LOCK, "utf8"));

  const { version, createdAt, entries, publicKeyPem, signature } = lock;
  if (!publicKeyPem || !signature) throw new Error("config-lock: missing publicKeyPem/signature");

  // Verify signature first
  const payload = { version, createdAt, entries };
  const ok = crypto.verify(
    null,
    Buffer.from(canonical(payload)),
    publicKeyPem,
    Buffer.from(signature, "base64url")
  );
  if (!ok) throw new Error("config-lock signature INVALID");

  // Then verify file hashes
  for (const e of entries) {
    const got = sha256File(e.path);
    if (got !== e.sha256) {
      throw new Error(
        `Config tamper detected:\n  ${e.path}\n  expected: ${e.sha256}\n  got:      ${got}`
      );
    }
  }
  console.log("config-lock verified ✓");
}

main();
