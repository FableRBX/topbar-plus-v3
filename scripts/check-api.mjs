// Compares TopbarPlus's API, read from the Luau in out/TopbarPlus, with what
// out/index.d.ts types. Every upstream member must be typed or listed in
// internal-api.json with the reason it isn't; every typed member must exist
// upstream. Names only: signatures are checked by the test project.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("..", import.meta.url));
const luauRoot = join(root, "out", "TopbarPlus");

function luauFiles(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return luauFiles(path);
		return /\.luau?$/.test(entry.name) ? [path] : [];
	});
}

function names(source, pattern) {
	return new Set([...source.matchAll(pattern)].map((match) => match[1]));
}

// Upstream: methods, fields every icon is built with, and statics.
const init = readFileSync(join(luauRoot, "init.lua"), "utf8");
const methods = names(init, /^function Icon:(\w+)\(/gm);
// Aliases such as `Icon.Destroy = Icon.destroy` are methods when their target is.
for (const [, alias, target] of init.matchAll(/^Icon\.(\w+) = Icon\.(\w+)\s*$/gm)) {
	if (methods.has(target)) methods.add(alias);
}
const constructorStart = init.indexOf("function Icon.new()");
const constructor = init.slice(constructorStart, init.indexOf("\nend", constructorStart));
const fields = names(constructor, /^\tself\.(\w+) = /gm);
// Some fields (name, locked) only appear once a method sets them.
const assignedFields = names(init, /\bself\.(\w+) = /g);
const statics = new Set();
for (const file of luauFiles(luauRoot)) {
	for (const name of names(readFileSync(file, "utf8"), /\bIcon\.(\w+)/g)) {
		if (!methods.has(name)) statics.add(name);
	}
}
const upstream = {
	instance: { surface: new Set([...methods, ...fields]), exists: new Set([...methods, ...assignedFields]) },
	static: { surface: statics, exists: statics },
};

// Typings: the members of `interface Icon` and `interface IconConstructor`.
const typingsPath = join(root, "out", "index.d.ts");
const typings = ts.createSourceFile(typingsPath, readFileSync(typingsPath, "utf8"), ts.ScriptTarget.Latest);
function interfaceMembers(name) {
	const declaration = typings.statements.find((node) => ts.isInterfaceDeclaration(node) && node.name.text === name);
	if (!declaration) throw new Error(`out/index.d.ts has no interface ${name}`);
	return new Set(
		declaration.members.map((member) => (ts.isConstructSignatureDeclaration(member) ? "new" : member.name.text)),
	);
}
const typed = { instance: interfaceMembers("Icon"), static: interfaceMembers("IconConstructor") };

const internal = JSON.parse(readFileSync(join(root, "internal-api.json"), "utf8"));
const problems = [];
for (const side of ["instance", "static"]) {
	const prefix = side === "instance" ? "icon:" : "Icon.";
	const listed = new Set(Object.keys(internal[side]));
	for (const name of upstream[side].surface) {
		if (!typed[side].has(name) && !listed.has(name)) {
			problems.push(`${prefix}${name} is upstream but neither typed nor listed in internal-api.json`);
		}
	}
	for (const name of typed[side]) {
		if (!upstream[side].exists.has(name)) problems.push(`${prefix}${name} is typed but not in upstream's Luau`);
		if (listed.has(name)) problems.push(`${prefix}${name} is both typed and listed as internal`);
	}
	for (const name of listed) {
		if (!upstream[side].exists.has(name)) problems.push(`${prefix}${name} is listed as internal but not upstream`);
	}
}

if (problems.length > 0) {
	for (const problem of problems) console.error(`api: ${problem}`);
	process.exit(1);
}
const count = (side) => `${typed[side].size} typed, ${Object.keys(internal[side]).length} internal`;
console.log(`api: covered. icon: ${count("instance")}; Icon: ${count("static")}`);
