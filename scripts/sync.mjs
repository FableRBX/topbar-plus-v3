// Pulls a TopbarPlus release into out/TopbarPlus exactly as upstream committed
// it, then stamps the package with the release: `npm run sync -- v3.5.0`.
// Nothing under out/TopbarPlus is ever edited by hand; the git diff after a
// sync is upstream's change and nothing else.
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const UPSTREAM = "https://github.com/1ForeverHD/TopbarPlus.git";
const root = fileURLToPath(new URL("..", import.meta.url));

const tag = process.argv[2];
if (!tag || !/^v\d+\.\d+\.\d+$/.test(tag)) {
	console.error("usage: npm run sync -- <tag>   (for example v3.4.0)");
	process.exit(1);
}

const clone = mkdtempSync(join(tmpdir(), "topbarplus-"));
let commit;
try {
	// autocrlf off, or Windows checkouts rewrite upstream's line endings.
	execFileSync(
		"git",
		[
			"-c",
			"core.autocrlf=false",
			"-c",
			"advice.detachedHead=false",
			"clone",
			"--quiet",
			"--depth",
			"1",
			"--branch",
			tag,
			UPSTREAM,
			clone,
		],
		{ stdio: "inherit" },
	);
	commit = execFileSync("git", ["-C", clone, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
	rmSync(join(root, "out", "TopbarPlus"), { recursive: true, force: true });
	cpSync(join(clone, "src"), join(root, "out", "TopbarPlus"), { recursive: true });
	cpSync(join(clone, "LICENSE"), join(root, "LICENSE-TopbarPlus"));
} finally {
	rmSync(clone, { recursive: true, force: true });
}

// The version follows upstream with a -ts.N suffix; a new release restarts N.
// Re-syncing the release already in the package keeps the version.
const packagePath = join(root, "package.json");
const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
if (pkg.topbarPlus?.tag !== tag) {
	pkg.version = `${tag.slice(1)}-ts.0`;
}
pkg.topbarPlus = { tag, commit };
writeFileSync(packagePath, JSON.stringify(pkg, undefined, "\t") + "\n");
console.log(`synced TopbarPlus ${tag} (${commit}) as ${pkg.name}@${pkg.version}`);

// New or removed upstream API shows up here; the typings follow it by hand.
try {
	execFileSync(process.execPath, [join(root, "scripts", "check-api.mjs")], { stdio: "inherit" });
} catch {
	console.error("\nThe typings no longer cover upstream's API. Update out/index.d.ts or internal-api.json.");
	process.exit(1);
}
