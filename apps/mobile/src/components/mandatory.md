1) snapshot.md → the frozen list we will sign
Append this block at the end of your snapshot.md (keep your nice narrative up top—this fenced block is the only part we parse and lock):
# -------- ROOT (configs you want frozen) ----------
package.json
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
tsconfig.json
tsconfig.eslint.json
eslint.config.cjs
eslint.config.js
.prettierrc
babel.config.cjs
jest.config.base.js
jest.config.js
jest.comprehensive.config.js
jest.monorepo.config.js
lighthouse.config.js
lighthouserc.json
.gitleaks.toml
.husky/pre-commit
.github/workflows/strict-prod.yml
.github/workflows/resign-config-lock.yml
.sops.yaml

# -------- WEB APP ----------
apps/web/.babelrc
apps/web/cypress.config.ts
apps/web/playwright.config.ts
apps/web/eslint.config.js
apps/web/jest.api.config.js
apps/web/jest.config.enhanced.js
apps/web/jest.config.js
apps/web/jest.setup.js
apps/web/jest.setup.ts
apps/web/next.config.js
apps/web/next.config.mjs
apps/web/postcss.config.js
apps/web/tailwind.config.js
apps/web/tailwind.config.mjs
apps/web/tsconfig.base.json
apps/web/tsconfig.e2e.json
apps/web/tsconfig.eslint.json
apps/web/tsconfig.json
apps/web/tsconfig.test.json
apps/web/middleware.ts
apps/web/.env.production.enc

# -------- MOBILE APP ----------
apps/mobile/.detoxrc.cjs
apps/mobile/app.config.cjs
apps/mobile/app.json
apps/mobile/babel.config.cjs
apps/mobile/detox.config.cjs
apps/mobile/eas.json
apps/mobile/jest.config.js
apps/mobile/metro.config.cjs
apps/mobile/tsconfig.base.json
apps/mobile/tsconfig.eslint.json
apps/mobile/tsconfig.json
apps/mobile/tsconfig.test.json
apps/mobile/.env.production.enc

# -------- SERVER ----------
server/Dockerfile
server/babel.jest.config.cjs
server/eslint.config.js
server/jest.config.js
server/tsconfig.test.json
server/.env.production.enc

# -------- AI SERVICE ----------
ai-service/Dockerfile
ai-service/requirements.txt
ai-service/.env.production.enc

# -------- PACKAGES ----------
packages/tsconfig.json
packages/ai/eslint.config.js
packages/ai/jest.config.js
packages/ai/tsconfig.json
packages/core/tsconfig.json
packages/design-tokens/build.js
packages/design-tokens/tsconfig.json
packages/security/eslint.config.js
packages/security/jest.config.js
packages/security/tsconfig.json
packages/ui/eslint.config.js
packages/ui/tsconfig.json
Notes
• I’m not locking pnpm-lock.yaml (you want to be able to update deps); if you want it frozen, add it.
• I’m encrypting only secrets (.env.production*). Regular configs are signed (tamper-proof) rather than encrypted so your repo remains buildable and reviewable.
2) Config-Lock: sign + verify (Ed25519, no deps)
Create the folder and two scripts:
tools/config-lock/gen-lock.mjs
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
tools/config-lock/verify-lock.mjs
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
Key material (one-time, done by you):
# Make folder
mkdir -p tools/config-lock

# Generate Ed25519 keypair (PEM). Keep private PEM OUT of the repo.
node -e "const {generateKeyPairSync}=require('crypto');const {privateKey,publicKey}=generateKeyPairSync('ed25519');console.log(publicKey.export({type:'spki',format:'pem'}));console.error(privateKey.export({type:'pkcs8',format:'pem'}));" \
  1> tools/config-lock/public.pem \
  2> /tmp/pawfectmatch-config-lock-private.pem

# Create CI secret CONFIG_LOCK_PRIVATE_KEY with the FULL private PEM
# (Settings → Secrets and variables → Actions → New repository secret)
Update root package.json (add scripts only—don’t remove your existing ones):
{
  "scripts": {
    "config:gen": "node tools/config-lock/gen-lock.mjs",
    "config:verify": "node tools/config-lock/verify-lock.mjs"
  }
}
Add a Husky gate (yours exists; replace its contents with this):
.husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔒 Verifying config lock..."
pnpm -s config:verify || { echo "❌ Config lock failed"; exit 1; }

echo "🧹 Lint-staged..."
pnpm -s lint-staged || exit 1

echo "🧪 Fast type-check..."
pnpm -w turbo run type-check || exit 1
Result: nobody can commit a changed locked file unless the lock is re-signed by CI.
3) Encrypt secrets with SOPS (age)
.sops.yaml
# Encrypt only real secrets. Keep configs readable; they are signed above.
creation_rules:
  - paths_regex: '(^|/)\.env\.production(\..*)?$'
    encrypted_regex: '^(.*)$'
    age: ['AGE-PUBLIC-KEY-GOES-HERE']
Generate an age key and set the private half in CI:
age-keygen -o tools/config-lock/age.key
# Show public key → paste into .sops.yaml (the line starting with "age1...")
grep "public key" -n tools/config-lock/age.key; cat tools/config-lock/age.key

# Put private key into GH secret AGE_PRIVATE_KEY  (contents of tools/config-lock/age.key)
Encrypt your plaintext envs and commit only the .enc files:
# Root env
mv .env.production .env.production.plain
sops -e .env.production.plain > .env.production.enc && rm .env.production.plain

# Web env
( cd apps/web && mv .env.production .env.production.plain && sops -e .env.production.plain > .env.production.enc && rm .env.production.plain )

# Mobile env (create if you keep prod vars)
( cd apps/mobile && [ -f .env.production ] && mv .env.production .env.production.plain && sops -e .env.production.plain > .env.production.enc && rm .env.production.plain || true )

# Server env
( cd server && mv .env.production .env.production.plain && sops -e .env.production.plain > .env.production.enc && rm .env.production.plain )

# AI service env (if used)
( cd ai-service && [ -f .env.production ] && mv .env.production .env.production.plain && sops -e .env.production.plain > .env.production.enc && rm .env.production.plain || true )
4) Strict CI: fail PRs if anything is off
.github/workflows/strict-prod.yml
name: strict-prod
on:
  pull_request:
  push:
    branches: [ main ]

permissions:
  contents: read

jobs:
  verify-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }

      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install deps
        run: pnpm i --frozen-lockfile

      - name: Verify config-lock
        env:
          # Force verify-only; no private key on this job
          CONFIG_LOCK_PRIVATE_KEY_FILE: /dev/null
        run: pnpm -s config:verify

      - name: Install sops
        run: sudo apt-get update && sudo apt-get install -y sops

      - name: Decrypt .env.production files
        env:
          SOPS_AGE_KEY: ${{ secrets.AGE_PRIVATE_KEY }}
        shell: bash
        run: |
          set -e
          for f in ".env.production.enc" \
                   "apps/web/.env.production.enc" \
                   "apps/mobile/.env.production.enc" \
                   "server/.env.production.enc" \
                   "ai-service/.env.production.enc"; do
            if [ -f "$f" ]; then
              sops -d "$f" > "${f%.enc}"
              echo "Decrypted $f"
            fi
          done

      - name: Gitleaks (secrets scan)
        uses: gitleaks/gitleaks-action@v2
        with:
          config-path: .gitleaks.toml
        env:
          GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE_KEY || '' }}

      - name: Lint (no warnings), Type-check
        run: |
          pnpm -w turbo run lint -- --max-warnings 0
          pnpm -w turbo run type-check

      - name: Unit/Integration tests (monorepo)
        run: pnpm -w turbo run test:ci

      - name: Build web (Next.js)
        run: pnpm -C apps/web build

      - name: Security audit
        run: pnpm audit --audit-level=moderate

  # Optional, but great to gate UX scores (uses your lighthouserc)
  lighthouse:
    needs: verify-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm i --frozen-lockfile
      - run: pnpm -C apps/web build && pnpm -C apps/web start & sleep 5
      - name: Run Lighthouse CI
        run: pnpm lighthouse
This job fails fast if: signature invalid, any hash changed, secrets not decryptable, lint warnings, types, tests, web build, or audit fail. No green → no merge.
5) “Re-sign Lock” (manual, Security-only)
Use this to approve legit config changes. It regenerates hashes and signs with the CI private key, then commits the updated config-lock.json.
.github/workflows/resign-config-lock.yml
name: resign-config-lock
on:
  workflow_dispatch:
    inputs:
      reason:
        description: "Why are we re-signing?"
        required: true
        default: "Approved config change"

permissions:
  contents: write

jobs:
  resign:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { persist-credentials: true, fetch-depth: 0 }

      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }

      - run: pnpm i --frozen-lockfile

      - name: Generate & sign lock
        env:
          CONFIG_LOCK_PRIVATE_KEY: ${{ secrets.CONFIG_LOCK_PRIVATE_KEY }}
        run: pnpm -s config:gen

      - name: Commit lock
        run: |
          if git diff --quiet config-lock.json; then
            echo "No changes in config-lock.json"
            exit 0
          fi
          git config user.name  "security-bot"
          git config user.email "security-bot@users.noreply.github.com"
          git add config-lock.json
          git commit -m "chore(security): re-sign config-lock – ${{ github.event.inputs.reason }}"
          git push
Lock down who can run it using a code owners review rule (see next), or repo ⇒ Actions ⇒ Workflow permissions.
6) CODEOWNERS: security owns frozen files
.github/CODEOWNERS
# Frozen configs require Security approval
/snapshot.md                                   @your-org/security
/config-lock.json                               @your-org/security
/tools/config-lock/**                           @your-org/security
/.sops.yaml                                     @your-org/security
/.github/workflows/strict-prod.yml              @your-org/security
/.github/workflows/resign-config-lock.yml       @your-org/security
/pnpm-workspace.yaml                            @your-org/security
/turbo.json                                     @your-org/security
/tsconfig*.json                                 @your-org/security
/eslint.config.*                                @your-org/security
/babel.config.*                                 @your-org/security
/jest.config.*                                  @your-org/security
/jest.*.config.*                                @your-org/security
/lighthouse.config.js                           @your-org/security
/lighthouserc.json                              @your-org/security
/.gitleaks.toml                                 @your-org/security

/apps/web/**/next.config.*                      @your-org/security
/apps/web/**/tailwind.config.*                  @your-org/security
/apps/web/**/postcss.config.js                  @your-org/security
/apps/web/**/tsconfig*.json                     @your-org/security
/apps/web/**/jest*.config.*                     @your-org/security
/apps/web/**/.env.production.enc                @your-org/security

/apps/mobile/app.*                              @your-org/security
/apps/mobile/*.config.*                         @your-org/security
/apps/mobile/eas.json                           @your-org/security
/apps/mobile/tsconfig*.json                     @your-org/security
/apps/mobile/jest.config.js                     @your-org/security
/apps/mobile/.env.production.enc                @your-org/security

/server/**/eslint.config.js                     @your-org/security
/server/jest.config.js                          @your-org/security
/server/babel.jest.config.cjs                   @your-org/security
/server/Dockerfile                              @your-org/security
/server/.env.production.enc                     @your-org/security

/ai-service/Dockerfile                          @your-org/security
/ai-service/requirements.txt                    @your-org/security
/ai-service/.env.production.enc                 @your-org/security

/packages/**/tsconfig.json                      @your-org/security
/packages/**/eslint.config.js                   @your-org/security
/packages/**/jest.config.js                     @your-org/security
/packages/design-tokens/build.js                @your-org/security
Then enable Branch protection for main:
Require PRs
Require status checks: strict-prod (both jobs)
Require CODEOWNERS review
7) (Optional) runtime tamper check for Next.js
If you want the web build to crash immediately when configs differ from the signed lock, add at the top of apps/web/next.config.mjs:
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function verifyLockAtBuild() {
  if (process.env.NODE_ENV !== "production") return;
  const root = path.resolve(__dirname, "..", "..");
  const lock = JSON.parse(fs.readFileSync(path.join(root, "config-lock.json"), "utf8"));
  for (const e of lock.entries) {
    const p = path.join(root, e.path);
    const got = crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
    if (got !== e.sha256) throw new Error(`Config tamper: ${e.path}`);
  }
  console.log("config-lock verified at Next build ✓");
}
verifyLockAtBuild();

/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  swcMinify: true,
};
8) One-time bootstrap checklist (copy/paste)
# 1) Add files
mkdir -p tools/config-lock .github/workflows .husky
# (create the two .mjs files, the two workflows, CODEOWNERS, .sops.yaml as above)
# (append the ```snapshot block to snapshot.md)

# 2) Keys/secrets
# - Generate Ed25519 keys → commit public.pem, put private PEM into CONFIG_LOCK_PRIVATE_KEY (repo secret)
# - Generate age key → put private into AGE_PRIVATE_KEY (repo secret), put public into .sops.yaml

# 3) Encrypt env files (commands in section 3)

# 4) Update package.json scripts and Husky pre-commit (section 2)

# 5) Create initial lock (locally unsigned is fine), then use the workflow to sign:
pnpm config:gen
git add snapshot.md config-lock.json tools/config-lock/public.pem .sops.yaml .github .husky
git commit -m "chore(security): add config-lock + sops + strict CI"
git push origin -u main

# 6) In GitHub → Actions → run “resign-config-lock” workflow (sets the signature with CI private key)

# 7) Turn on Branch Protection for main (require status checks + CODEOWNERS)