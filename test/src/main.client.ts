// Runs every docs example in Play, then checks that what the typings promise is
// what TopbarPlus does at runtime. Prints one PASS line, or a warning per failed
// check and an error.
import { Icon } from "@rbxts/topbar-plus-v3";
import * as examples from "./examples";

const failures = new Array<string>();
let checks = 0;
function check(label: string, ok: boolean) {
	checks += 1;
	if (!ok) failures.push(label);
}

const added = new Array<Icon>();
const removed = new Array<Icon>();
Icon.iconAdded.Connect((icon) => added.push(icon));
Icon.iconRemoved.Connect((icon) => removed.push(icon));

// TopbarPlus reads these when it finishes starting up, a frame after require.
examples.gamepad();
examples.overflows();

// An icon's widest possible width is fixed when it is made, at the viewport's
// width plus 200. The viewport is 1x1 as a client starts, so icons made then
// cap their contents at 201px. Wait for the real viewport first.
const Workspace = game.GetService("Workspace");
while ((Workspace.CurrentCamera?.ViewportSize.X ?? 0) <= 1) task.wait();

const shop = examples.shopFrame();
const fresh = new Icon();
const freshProperties = examples.properties(fresh);
examples.images();
const labelled = examples.labels();
examples.alignments();
const noticed = examples.notices();
examples.captions();
const dropdown = examples.dropdowns();
const menu = examples.menus();
const fixedMenu = examples.fixedMenus();
examples.modifyTheme(new Icon().setLabel("Themed"));
examples.oneClickIcons(shop);
const toggler = examples.toggleItems(shop);
examples.toggleKeys();
examples.events(toggler);
let greeting: string | undefined;
const methods = examples.methods(shop, (text) => (greeting = text));
const [destroyed, janitored] = examples.destroying();
const noticeLabelled = examples.noticeLabels();
const [withInstances, leftAdded, rightAdded] = examples.addedInstances();
const addedThenDestroyed = examples.addedInstances();
addedThenDestroyed[0].destroy();

// modifyTheme last in an array: the id must stay out of it. And its id undoes
// the change, back to the base theme's TextSize.
const listParent = new Icon().setLabel("List parent");
const listed = [new Icon().setLabel("A"), new Icon().setLabel("B").modifyTheme(["IconLabel", "TextSize", 30])[0]];
listParent.setDropdown(listed);
const [sized, sizeChange] = new Icon().setLabel("Sized").modifyTheme(["IconLabel", "TextSize", 30]);
const sizedLabel = sized.getInstance("IconLabel");
const sizeWhileModified = sizedLabel?.TextSize;
sized.removeModification(sizeChange);

let toggles = 0;
toggler.toggled.Connect(() => (toggles += 1));
toggler.select();
toggler.deselect();

task.wait(1.5);

const { icons } = examples.functions();
check("a new icon has a string UID", typeIs(fresh.UID, "string"));
check("name is undefined until setName", freshProperties.name === undefined);
check("locked is undefined until lock or unlock", freshProperties.locked === undefined);
check("a new icon is enabled and deselected", fresh.isEnabled && !fresh.isSelected);
check("setName sets name", methods.name === "Methods");
check("getIcon finds an icon by name", Icon.getIcon("Methods") === methods);
check("getIcon finds an icon by UID", Icon.getIcon(labelled.UID) === labelled);
check("getIcon misses as undefined", Icon.getIcon("No such icon") === undefined);
check("getIcons is keyed by UID", icons.get(methods.UID) === methods);
check("iconAdded fired for every icon", added.includes(methods) && added.includes(labelled));
check("destroy removes the icon", Icon.getIcon(destroyed.UID) === undefined && removed.includes(destroyed));
check("Destroy is destroy", Icon.getIcon(janitored.UID) === undefined && removed.includes(janitored));
check("call passes the icon and extra arguments", greeting === "hello from Methods");
check("unlock leaves locked false", methods.locked === false);
check("toggled fires on select and deselect", toggles === 2);
check("notify counts a notice", noticed.totalNotices === 1);
check("clearNotices empties the count", methods.totalNotices === 0);
check("setNoticeLabel shows its text", noticeLabelled.getInstance("NoticeLabel")?.Text === "!");
check("setNoticeLabel keeps the count", noticeLabelled.totalNotices === 1);
const contents = withInstances.getInstance("Contents");
check("addInstance puts it in Contents", leftAdded.Parent === contents && rightAdded.Parent === contents);
check("addInstance orders the sides", leftAdded.LayoutOrder < rightAdded.LayoutOrder);
check("addInstance destroys it with the icon", addedThenDestroyed[1].Parent === undefined);
check("highlightKey is static and survives startup", Icon.highlightKey === Enum.KeyCode.ButtonY);
check("closeableOverflowMenus is static", Icon.closeableOverflowMenus === true);

const label = methods.getInstance("IconLabel");
check("getInstance returns the named TextLabel", label !== undefined && label.IsA("TextLabel"));
check("setTextColor colours the label", label?.TextColor3.ToHex() === "ffc800");
check("getInstance misses as undefined", methods.getInstance("No such instance") === undefined);
const corner = methods.getInstance("IconButton")?.FindFirstChildWhichIsA("UICorner");
check("setCornerRadius takes a UDim", corner?.CornerRadius === new UDim(0, 8));
check("Dropdown MaxIcons lands as an attribute", dropdown.getInstance("Dropdown")?.GetAttribute("MaxIcons") === 3);
check("Menu MaxIcons lands as an attribute", menu.getInstance("Menu")?.GetAttribute("MaxIcons") === 2);
check("a fixed menu stays selected", fixedMenu.isSelected);
check("modifyTheme last in an array adds no id to it", listed.size() === 2);
check("modifyTheme applies", sizeWhileModified === 30);
check("removeModification undoes by id", sizedLabel?.TextSize === 16);

// Set after startup: TopbarPlus resets highlightIcon to false as it starts.
Icon.highlightIcon = methods;
check("highlightIcon is static", Icon.highlightIcon === methods);

if (failures.isEmpty()) {
	print(`[topbar-plus-v3] PASS ${checks} checks`);
} else {
	for (const failure of failures) warn(`[topbar-plus-v3] FAIL ${failure}`);
	error(`[topbar-plus-v3] ${failures.size()} of ${checks} checks failed`);
}
