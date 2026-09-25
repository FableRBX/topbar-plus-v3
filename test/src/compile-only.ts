// Usage that compiles but can't run in the test place (there is no
// NumberSpinner, and some calls only matter to the type checker). Nothing
// requires this module, so its Luau never runs.
import { Icon, IconModifications, IconSignal } from "@rbxts/topbar-plus-v3";

export function accepted(icon: Icon, numberSpinner: unknown) {
	// api.md: convertLabelToNumberSpinner, with the ready callback added in v3.3.0
	icon.convertLabelToNumberSpinner(numberSpinner, () => print("ready"));

	// Named instances come back as their class; any other name as an Instance
	const label: TextLabel | undefined = icon.getInstance("IconLabel");
	const speed: NumberValue | undefined = icon.getInstance("DropdownSpeed");
	const custom: Instance | undefined = icon.getInstance("MyOwnFrame");

	// Modifications can be built ahead of time, in either shape
	const one: IconModifications = ["Widget", "BorderSize", 2, "Selected"];
	const many: IconModifications = [
		["Selection", "RotationSpeed", 2],
		["IconImage", "ImageColor3", new Color3(1, 0, 0), "Viewing"],
	];
	icon.modifyTheme(one)[0].modifyChildTheme(many);

	// modifyTheme's id undoes the change; the id can be chosen
	const [themed, modificationId] = icon.modifyTheme(many);
	themed.removeModification(modificationId);
	icon.modifyTheme(one, "hover")[0].removeModification("hover");

	// Font ids, and the optional weight and style
	icon.setTextFont(12187370928).setTextFont("Creepster", Enum.FontWeight.Bold);

	// A notice cleared by a Roblox event, and one by another icon's signal
	icon.notify(new Instance("BindableEvent").Event).notify(icon.selected, "notice-id");

	// Signals connect, fire once, and wait
	const connection = icon.toggled.Connect((isSelected, fromSource, sourceIcon) => {});
	connection.Disconnect();
	icon.viewingStarted.Once(() => {});
	const [isSelected, fromSource] = icon.toggled.Wait();
	const signal: IconSignal<(icon: Icon) => void> = Icon.iconAdded;

	Icon.highlightKey = false;
	Icon.highlightIcon = false;
	return { label, speed, custom, isSelected, fromSource, signal };
}
