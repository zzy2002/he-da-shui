import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
const expected = /^(?:https:\/\/github\.com\/|git@github\.com:)zzy2002\/he-da-shui(?:\.git)?$/;
try {
  const urls = git("remote", "get-url", "--push", "--all", "origin").split("\n");
  if (urls.length !== 1 || !expected.test(urls[0]) || !expected.test(git("remote", "get-url", "origin"))) {
    throw new Error("origin must point only to zzy2002/he-da-shui. Fork contributors should push their own branch directly.");
  }
  if (git("branch", "--show-current") !== "main") throw new Error("Switch to reviewed main before synchronizing. Push feature branches normally for PRs.");
  if (git("status", "--porcelain")) throw new Error("Review and commit changes first. This command does not stage or commit files.");
  execFileSync(process.execPath, [fileURLToPath(new URL("./check-public-source.mjs", import.meta.url))], { cwd: root, stdio: "inherit" });
  git("fetch", "origin", "main");
  git("merge-base", "--is-ancestor", "FETCH_HEAD", "HEAD");
  execFileSync("git", ["push", "--set-upstream", "origin", "HEAD:main"], { cwd: root, stdio: "inherit" });
  const remote = git("ls-remote", "origin", "refs/heads/main").split(/\s/)[0];
  if (remote !== git("rev-parse", "HEAD")) throw new Error("Remote verification differs from local HEAD; inspect concurrent updates.");
  console.log(`GitHub synchronized: https://github.com/zzy2002/he-da-shui/commit/${remote}`);
} catch (error) {
  console.error("GitHub sync stopped. Check the remote, credentials and divergence; merge remote changes before retrying. No force push was used.");
  console.error(error.message);
  process.exit(1);
}
