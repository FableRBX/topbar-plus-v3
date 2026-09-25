// Usage the typings must reject. roblox-ts refuses @ts-expect-error, so this is
// checked by plain tsc (tsconfig.rejected.json) and never compiled to Luau.
// Each @ts-expect-error fails the check if its line compiles.
import { Icon } from "@rbxts/topbar-plus-v3";

export function rejected(icon: Icon) {
	// @ts-expect-error setCornerRadius takes one UDim, not a scale and an offset
	icon.setCornerRadius(0, 8);
	// @ts-expect-error highlightKey is set on Icon, not on an icon
	icon.highlightKey = Enum.KeyCode.DPadUp;
	// @ts-expect-error setFixedMenu returns nothing, so it can't be chained from
	icon.setFixedMenu([]).setLabel("Menu");
	// @ts-expect-error destroy returns nothing
	icon.destroy().setLabel("Gone");
	// @ts-expect-error setTextFont builds the Font itself and errors on a Font
	icon.setTextFont(Font.fromEnum(Enum.Font.Arial));
	// @ts-expect-error not an instance inside an icon
	icon.modifyTheme(["NotAnInstance", "Size", new UDim2()]);
	// @ts-expect-error TextSize is a number
	icon.modifyTheme(["IconLabel", "TextSize", "big"]);
	// @ts-expect-error MaxIcons is only read from Menu and Dropdown
	icon.modifyTheme(["Widget", "MaxIcons", 3]);
	// @ts-expect-error not an icon state
	icon.setLabel("Shop", "Hovered");
	// @ts-expect-error not an icon event
	icon.bindEvent("clicked", () => {});
	// @ts-expect-error read-only
	icon.isSelected = true;
	// @ts-expect-error getIcons is on Icon, not on an icon
	icon.getIcons();
	// @ts-expect-error modifyTheme returns the icon and an id; chain through [0]
	icon.modifyTheme(["IconLabel", "TextSize", 16]).setLabel("Shop");
	// @ts-expect-error last in an array, the id would land in the array too
	icon.setDropdown([icon, icon.modifyTheme(["IconLabel", "TextSize", 16])]);
}
