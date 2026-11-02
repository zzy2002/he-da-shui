import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const files = execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" }).split("\0").filter(Boolean);
const blockedPath = /(^|\/)(\.env(?:\..*)?|\.dev\.vars(?:\..*)?|\.wrangler|\.sites-runtime|outputs|node_modules)(\/|$)|\.(?:pem|key|sqlite|sqlite3|db)$/i;
const secret = /gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-[A-Za-z0-9_-]{24,}|AKIA[0-9A-Z]{16}|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/;
const violations = [];
for (const file of files) {
  if (blockedPath.test(file)) { violations.push(`${file}: private or generated path`); continue; }
  const content = readFileSync(new URL(`../${file}`, import.meta.url));
  if (content.includes(0)) continue;
  if (secret.test(content.toString("utf8"))) violations.push(`${file}: credential signature`);
}
if (violations.length) {
  // Report filenames only; never print the potential credential itself.
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log(`Public source check passed (${files.length} tracked files). Review diffs as well; this is not a complete secret detector.`);
