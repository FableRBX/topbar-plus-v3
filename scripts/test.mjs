// Checks the typings cover upstream's API, then compiles the test project
// against the package exactly as npm would publish it: packed, then installed.
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const test = join(root, "test");
// `npm publish --dry-run` runs this through prepublishOnly and hands its
// dry-run setting to every npm command below; a dry pack writes no tarball.
const env = Object.fromEntries(
	Object.entries(process.env).filter(([name]) => name.toLowerCase() !== "npm_config_dry_run"),
);
const run = (command, cwd = root) => execSync(command, { cwd, env, stdio: "inherit" });

run(`node ${JSON.stringify(join(root, "scripts", "check-api.mjs"))}`);

const packDir = join(test, ".pack");
rmSync(packDir, { recursive: true, force: true });
mkdirSync(packDir);
const [packed] = JSON.parse(
	execSync(`npm pack --silent --json --pack-destination ${JSON.stringify(packDir)}`, {
		cwd: root,
		env,
		encoding: "utf8",
	}),
);

if (!existsSync(join(test, "node_modules"))) run("npm ci", test);
run(`npm install --no-save --no-audit --no-fund ${JSON.stringify(join(packDir, packed.filename))}`, test);

// A clean emit: rbxtsc leaves files behind for sources that no longer exist.
rmSync(join(test, "out"), { recursive: true, force: true });
run("npx rbxtsc", test);
run("npx tsc -p tsconfig.rejected.json", test);
console.log(`test: ${packed.filename} (${packed.entryCount} files) compiles the examples and rejects the misuse`);
