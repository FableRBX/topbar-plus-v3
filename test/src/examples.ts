// The examples from TopbarPlus's docs (docs/features.md and docs/api.md at the
// synced tag), written the way a roblox-ts game writes them. main.client.ts runs
// them in Play; the Luau they compile to is committed beside them, so a typings
// change that alters the emitted calls shows up in review.
import { Icon } from "@rbxts/topbar-plus-v3";

const Players = game.GetService("Players");

// Any image works; this is the one TopbarPlus uses for its overflow icon.
const SHOP_IMAGE = 6069276526;

export function shopFrame(): Frame {
	const gui = new Instance("ScreenGui");
	gui.Name = "Shop";
	gui.ResetOnSpawn = false;
	const frame = new Instance("Frame");
	frame.Size = UDim2.fromOffset(200, 120);
	frame.Position = UDim2.fromScale(0.5, 0.5);
	frame.Visible = false;
	frame.Parent = gui;
	gui.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");
	return frame;
}

// features.md: Images, Labels
export function images() {
	return new Icon().setImage(SHOP_IMAGE);
}

export function labels() {
	return new Icon().setImage(SHOP_IMAGE).setLabel("Shop");
}

// features.md: Alignments
export function alignments() {
	return [
		new Icon().setLabel("Left").align("Left"),
		new Icon().setLabel("Center").align("Center"),
		new Icon().setLabel("Right").align("Right"),
	];
}

// features.md: Notices, Captions
export function notices() {
	return new Icon().setLabel("Notices").notify();
}

export function captions() {
	return new Icon().setLabel("Caption").setCaption("Open Shop");
}

// features.md: Dropdowns
export function dropdowns() {
	return new Icon()
		.setLabel("Example")
		.modifyTheme(["Dropdown", "MaxIcons", 3])[0]
		.modifyChildTheme(["Widget", "MinimumWidth", 158])
		.setDropdown([
			new Icon().setLabel("Category 1"),
			new Icon().setLabel("Category 2"),
			new Icon().setLabel("Category 3"),
			new Icon().setLabel("Category 4"),
		]);
}

// features.md: Menus
export function menus() {
	return new Icon()
		.setLabel("Example")
		.modifyTheme(["Menu", "MaxIcons", 2])[0]
		.setMenu([
			new Icon().setLabel("Item 1"),
			new Icon().setLabel("Item 2"),
			new Icon().setLabel("Item 3"),
			new Icon().setLabel("Item 4"),
		]);
}

// features.md: Fixed Menus. setFixedMenu returns nothing, so it ends the chain.
export function fixedMenus() {
	const [icon] = new Icon().modifyTheme(["Menu", "MaxIcons", 3]);
	icon.setFixedMenu([
		new Icon().setLabel("Item 1"),
		new Icon().setLabel("Item 2"),
		new Icon().setLabel("Item 3"),
		new Icon().setLabel("Item 4"),
		new Icon().setLabel("Item 5"),
	]);
	return icon;
}

// features.md: Modify Theme, both shapes, plus the dropdown speed added in v3.3.0
export function modifyTheme(icon: Icon) {
	icon.modifyTheme(["IconLabel", "TextSize", 16]);
	icon.modifyTheme([
		["Widget", "MinimumWidth", 290],
		["IconCorners", "CornerRadius", new UDim(0, 0)],
	]);
	icon.modifyTheme(["IconSpot", "BackgroundColor3", Color3.fromRGB(0, 170, 255), "Selected"]);
	icon.modifyTheme(["DropdownSpeed", "Value", 0.2]);
	Icon.modifyBaseTheme(["IconLabel", "TextSize", 16]);
}

// features.md: One Click Icons
export function oneClickIcons(shop: Frame) {
	return new Icon()
		.setImage(SHOP_IMAGE)
		.setLabel("Shop")
		.bindEvent("deselected", () => {
			shop.Visible = !shop.Visible;
		})
		.oneClick();
}

// features.md: Toggle Items, and what it is equivalent to
export function toggleItems(shop: Frame) {
	const icon = new Icon().setLabel("Toggle item").bindToggleItem(shop);
	icon.deselected.Connect(() => {
		shop.Visible = false;
	});
	icon.selected.Connect(() => {
		shop.Visible = true;
	});
	return icon;
}

// features.md: Toggle Keys
export function toggleKeys() {
	return new Icon().setLabel("Shop").bindToggleKey(Enum.KeyCode.V).setCaption("Open Shop");
}

// features.md: Gamepad & Console Support. Set before TopbarPlus finishes starting up.
export function gamepad() {
	Icon.highlightKey = Enum.KeyCode.ButtonY;
}

// v3.3.0 release notes: overflow menus can have their close toggle back
export function overflows() {
	Icon.closeableOverflowMenus = true;
}

// api.md: Functions
export function functions() {
	const icons = Icon.getIcons();
	const shop = Icon.getIcon("Shop");
	Icon.setTopbarEnabled(true);
	Icon.setDisplayOrder(10);
	return { icons, shop };
}

// api.md: Events
export function events(icon: Icon) {
	icon.selected.Connect((fromSource) => {
		const sourceName = fromSource ?? "Unknown";
		print(`The icon was selected by the ${sourceName}`);
	});
	icon.deselected.Connect((fromSource) => {
		const sourceName = fromSource ?? "Unknown";
		print(`The icon was deselected by the ${sourceName}`);
	});
	icon.toggled.Connect((isSelected, fromSource) => {
		const stateName = isSelected ? "selected" : "deselected";
		print(`The icon was ${stateName}!`);
	});
	icon.viewingStarted.Connect(() => {
		print("A mouse, long-pressed finger or gamepad selection is hovering over the icon");
	});
	icon.viewingEnded.Connect(() => {
		print("The input is no longer viewing (hovering over) the icon");
	});
	icon.notified.Connect(() => {
		print("New notice");
	});
}

// api.md: Properties
export function properties(icon: Icon) {
	return {
		name: icon.name,
		isSelected: icon.isSelected,
		isEnabled: icon.isEnabled,
		totalNotices: icon.totalNotices,
		locked: icon.locked,
		UID: icon.UID,
	};
}

// api.md: Methods, each called at least once
export function methods(item: Frame, onCall: (greeting: string) => void) {
	const dropdownParent = new Icon().setLabel("Dropdown parent");
	const menuParent = new Icon().setLabel("Menu parent");
	const icon = new Icon()
		.setName("Methods")
		.setEnabled(true)
		.setImage("rbxassetid://6069276526", "Selected")
		.setLabel("Methods")
		.setLabel("Selected!", "Selected")
		.setOrder(2)
		.align("Right")
		.setWidth(80)
		.setImageScale(0.6)
		.setImageRatio(1)
		.setTextSize(18)
		.setTextFont("Creepster")
		.setTextFont(Enum.Font.Bangers)
		.setTextFont("rbxasset://fonts/families/Sarpanch.json", Enum.FontWeight.Bold, Enum.FontStyle.Italic)
		.setTextColor(Color3.fromRGB(255, 200, 0))
		.disableOverlay(true)
		.bindToggleItem(item)
		.unbindToggleItem(item)
		.bindEvent("toggled", (icon, isSelected, fromSource) => print(icon.UID, isSelected, fromSource))
		.unbindEvent("toggled")
		.bindToggleKey(Enum.KeyCode.M)
		.unbindToggleKey(Enum.KeyCode.M)
		.setCaptionHint(Enum.KeyCode.M)
		.setCaption("Methods")
		.setCaption(undefined)
		.call((icon, greeting: string) => onCall(`${greeting} from ${icon.name}`), "hello")
		.addToJanitor(() => print("cleaned up"))
		.addToJanitor(new Instance("Folder"))
		.lock()
		.unlock()
		.autoDeselect(false)
		.autoDeselect()
		.oneClick(false)
		.select()
		.deselect()
		.notify(dropdownParent.deselected)
		.clearNotices()
		.joinDropdown(dropdownParent)
		.leave()
		.joinMenu(menuParent)
		.leave()
		// A dropdown replaces its icons' corner radius, and leaving doesn't give
		// the icon's own back, so set it after leaving.
		.setCornerRadius(new UDim(0, 8));
	task.spawn(() => icon.debounce(0.1));
	return icon;
}

export function destroying() {
	const destroyed = new Icon().setLabel("Destroyed");
	destroyed.destroy();
	const janitored = new Icon().setLabel("Destroyed by a cleanup library");
	janitored.Destroy();
	return [destroyed, janitored];
}
