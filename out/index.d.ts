// Typings for TopbarPlus (https://github.com/1ForeverHD/TopbarPlus), written
// against the Luau beside them in ./TopbarPlus. Where TopbarPlus's docs and its
// code disagree, these follow the code.

/** The states an icon moves between. Appearance can be set per state. */
export type IconState = "Deselected" | "Selected" | "Viewing";

/** The side of the topbar an icon sits on. */
export type IconAlignment = "Left" | "Center" | "Right";

/**
 * What caused an icon to be selected or deselected, as passed to `selected`,
 * `deselected` and `toggled`. Undefined when `select()` or `deselect()` was
 * called without one. `"OutsideClick"` is a click or tap outside an open
 * dropdown closing it.
 */
export type IconEventSource =
	"User" | "OneClick" | "AutoDeselect" | "HideParentFeature" | "OverflowStart" | "FrozenMenu" | "OutsideClick";

/** A connection to one of TopbarPlus's signals. */
export interface IconConnection {
	Disconnect(): void;
}

/** TopbarPlus's signals (GoodSignal), used for icon events and `Icon.iconAdded`. */
export interface IconSignal<T extends Callback> {
	Connect(callback: T): IconConnection;
	Once(callback: T): IconConnection;
	/** Yields until the signal fires, then returns its arguments. */
	Wait(): LuaTuple<Parameters<T>>;
}

/** The icon events, by the name `bindEvent` and `unbindEvent` take. */
export interface IconEvents {
	selected: (fromSource?: IconEventSource, sourceIcon?: Icon) => void;
	deselected: (fromSource?: IconEventSource, sourceIcon?: Icon) => void;
	toggled: (isSelected: boolean, fromSource?: IconEventSource, sourceIcon?: Icon) => void;
	viewingStarted: () => void;
	viewingEnded: () => void;
	/** `noticeId` is the id given to `notify`, or a generated one. */
	notified: (noticeId: string) => void;
}

/**
 * The instances inside an icon, by name, for `getInstance` and `modifyTheme`.
 * Menu, dropdown, notice and gamepad-selection instances exist once the icon
 * uses that feature.
 */
export interface IconInstances {
	Widget: Frame;
	IconButton: Frame;
	IconSpot: Frame;
	IconOverlay: Frame;
	ClickRegion: TextButton;
	Contents: Frame;
	ContentsList: UIListLayout;
	PaddingLeft: Frame;
	PaddingCenter: Frame;
	PaddingRight: Frame;
	IconLabelContainer: Frame;
	IconLabel: TextLabel;
	IconImage: ImageLabel;
	IconImageCorner: UICorner;
	IconImageScale: NumberValue;
	IconImageRatio: UIAspectRatioConstraint;
	IconGradient: UIGradient;
	IconSpotGradient: UIGradient;
	Menu: ScrollingFrame;
	MenuUIListLayout: UIListLayout;
	MenuGap: Frame;
	Dropdown: Frame;
	DropdownCorner: UICorner;
	DropdownScroller: ScrollingFrame;
	/** Scales how long the dropdown takes to open and close. */
	DropdownSpeed: NumberValue;
	DropdownPadding: UIPadding;
	DropdownList: UIListLayout;
	Notice: Frame;
	NoticeLabel: TextLabel;
	SelectionContainer: Frame;
	Selection: Frame;
	SelectionGradient: UIGradient;
}

/**
 * Settings TopbarPlus reads as attributes. `modifyTheme` sets an attribute when
 * the instance has no property of that name.
 */
interface IconThemeAttributes {
	Widget: { DesiredWidth: number; MinimumWidth: number; MinimumHeight: number; BorderSize: number };
	Menu: { MaxIcons: number };
	Dropdown: { MaxIcons: number };
	Selection: { RotationSpeed: number };
}

/** Everything a modification can target: the named instances, and the `IconCorners` collective. */
interface IconThemeTargets extends IconInstances {
	/** Every corner of the icon at once. */
	IconCorners: UICorner;
}

type IconThemeValues<N extends keyof IconThemeTargets> = WritableInstanceProperties<IconThemeTargets[N]> &
	(N extends keyof IconThemeAttributes ? IconThemeAttributes[N] : unknown);

/**
 * One appearance change: an instance (or collective) name, a property, its
 * value, and optionally the state it applies to (all states when left out).
 * See [themes](https://nanoblox.com/topbarplus/features/#modify-theme).
 */
export type IconModification = {
	[N in keyof IconThemeTargets]: {
		[P in keyof IconThemeValues<N>]: [name: N, property: P, value: IconThemeValues<N>[P], iconState?: IconState];
	}[keyof IconThemeValues<N>];
}[keyof IconThemeTargets];

/** A single modification, or a list of them. */
export type IconModifications = IconModification | ReadonlyArray<IconModification>;

/** Anything an icon's janitor can clean up when the icon is destroyed. */
type IconCleanup = Callback | RBXScriptConnection | IconConnection | Instance | { Destroy(): void };

export interface Icon {
	/** Generated when the icon is constructed; `Icon.getIcon` accepts it. */
	readonly UID: string;
	/** Set by `setName`; undefined until then. */
	readonly name?: string;
	readonly isSelected: boolean;
	readonly isEnabled: boolean;
	readonly totalNotices: number;
	/** Set by `lock` and `unlock`; undefined until either is called. */
	readonly locked?: boolean;

	readonly selected: IconSignal<IconEvents["selected"]>;
	readonly deselected: IconSignal<IconEvents["deselected"]>;
	readonly toggled: IconSignal<IconEvents["toggled"]>;
	/** A mouse, long-pressed finger or gamepad selection started hovering over the icon. */
	readonly viewingStarted: IconSignal<IconEvents["viewingStarted"]>;
	readonly viewingEnded: IconSignal<IconEvents["viewingEnded"]>;
	readonly notified: IconSignal<IconEvents["notified"]>;

	/** Sets the name of the icon's Widget instance, which `Icon.getIcon` can then find it by. */
	setName(name: string): this;
	/** The first instance inside the icon with this name, if there is one. */
	getInstance<N extends keyof IconInstances>(instanceName: N): IconInstances[N] | undefined;
	getInstance(instanceName: string): Instance | undefined;
	/**
	 * Changes the icon's appearance.
	 * See [themes](https://nanoblox.com/topbarplus/features/#modify-theme).
	 *
	 * Returns two values, the icon and an id for the change, which
	 * `removeModification` takes. Chain through `[0]`, or destructure. (Typed as
	 * just the icon, a call at the end of an array or a return would let the id
	 * into the array.) Pass `modificationId` to choose the id. Don't pass an
	 * empty array: TopbarPlus records it as a broken change.
	 */
	modifyTheme(
		modifications: IconModifications,
		modificationId?: string,
	): LuaTuple<[icon: this, modificationId: string]>;
	/**
	 * Undoes a `modifyTheme` change, by the id it returned. A property the base
	 * theme doesn't set keeps its changed value.
	 */
	removeModification(modificationId: string): this;
	/** Changes the appearance of the icons in this icon's menu or dropdown. */
	modifyChildTheme(modifications: IconModifications): this;
	/** When false the icon is hidden and disabled. */
	setEnabled(enabled: boolean): this;
	/** Selects the icon, as if clicked once. */
	select(fromSource?: IconEventSource, sourceIcon?: Icon): this;
	/** Deselects the icon, as if clicked twice. */
	deselect(fromSource?: IconEventSource, sourceIcon?: Icon): this;
	/**
	 * Adds to the notice bubble. Each notice clears when `clearNoticeEvent`
	 * fires, or when the icon is deselected if none is given. In a dropdown or
	 * menu the notice shows on the parent icon while it is deselected.
	 */
	notify(clearNoticeEvent?: RBXScriptSignal | IconSignal<Callback>, noticeId?: string): this;
	clearNotices(): this;
	/** When true, the shade shown while the icon is pressed is not shown. */
	disableOverlay(disabled: boolean): this;
	/**
	 * An asset id, a full content string such as "rbxassetid://123", or a
	 * `Content` (an EditableImage's, for one).
	 */
	setImage(imageId: string | number | Content, iconState?: IconState): this;
	setLabel(text: string, iconState?: IconState): this;
	setOrder(order: number, iconState?: IconState): this;
	setCornerRadius(radius: UDim, iconState?: IconState): this;
	/** "Left" (the default), "Center" or "Right". See [alignments](https://nanoblox.com/topbarplus/features/#alignments). */
	align(alignment?: IconAlignment): this;
	/** The icon's minimum width; a long label can make it wider. Defaults to 44. */
	setWidth(minimumWidth: number, iconState?: IconState): this;
	/** The image's size relative to the icon. Defaults to 0.5. */
	setImageScale(scale: number, iconState?: IconState): this;
	/** The image's width over its height. Defaults to 1. */
	setImageRatio(ratio: number, iconState?: IconState): this;
	/** Defaults to 16. */
	setTextSize(size: number, iconState?: IconState): this;
	setTextColor(color: Color3, iconState?: IconState): this;
	/**
	 * Sets the label's FontFace from a font family name ("Creepster"), a font
	 * family link ("rbxasset://fonts/families/Sarpanch.json"), a font asset id
	 * or an `Enum.Font`. Weight and style don't apply to an `Enum.Font`.
	 */
	setTextFont(
		font: string | number | Enum.Font,
		fontWeight?: Enum.FontWeight,
		fontStyle?: Enum.FontStyle,
		iconState?: IconState,
	): this;
	/** Shows the GuiObject or LayerCollector while the icon is selected and hides it otherwise. */
	bindToggleItem(item: GuiObject | LayerCollector): this;
	unbindToggleItem(item: GuiObject | LayerCollector): this;
	/** Connects to an icon event by name. The callback receives the icon first. */
	bindEvent<E extends keyof IconEvents>(
		eventName: E,
		callback: (icon: this, ...args: Parameters<IconEvents[E]>) => void,
	): this;
	unbindEvent(eventName: keyof IconEvents): this;
	/**
	 * Toggles the icon when the key is pressed, and adds the key to its caption.
	 * See [toggle keys](https://nanoblox.com/topbarplus/features/#toggle-keys).
	 */
	bindToggleKey(key: Enum.KeyCode): this;
	unbindToggleKey(key: Enum.KeyCode): this;
	/** Calls the function in a new thread with the icon and the extra arguments, and carries on the chain. */
	call<A extends unknown[]>(callback: (icon: this, ...args: A) => void, ...args: A): this;
	/** Cleans the item up when the icon is destroyed: calls a function, disconnects a connection, destroys anything else. */
	addToJanitor(item: IconCleanup): this;
	/** Stops the user toggling the icon. `select` and `deselect` still work. */
	lock(): this;
	unlock(): this;
	/** Locks the icon, waits, then unlocks it. Yields. */
	debounce(seconds: number): this;
	/**
	 * Whether the icon deselects when another icon (with autoDeselect on) is
	 * selected. On by default; the argument defaults to true.
	 */
	autoDeselect(enabled?: boolean): this;
	/** Makes the icon deselect as soon as it is selected, like a button. The argument defaults to true. */
	oneClick(enabled?: boolean): this;
	/**
	 * Whether the icon's open dropdown closes, with `"OutsideClick"` as the
	 * source, when the player clicks or taps outside the icon and its dropdown.
	 * On by default; the argument defaults to true. A locked icon stays open.
	 */
	setCloseOnOutsideClick(enabled?: boolean): this;
	/**
	 * Whether an icon made by a script under a ScreenGui with `ResetOnSpawn` is
	 * destroyed when the player respawns, since that script runs again. On by
	 * default; the argument defaults to true. Turn it off when the code that
	 * made the icon won't run again.
	 */
	setDestroyOnRespawn(enabled?: boolean): this;
	/**
	 * Shows this text (such as "!") in the notice instead of the number of
	 * notices. The notice still shows only while there are notices. Undefined
	 * shows the count again.
	 */
	setNoticeLabel(text?: string): this;
	/**
	 * Puts your own GuiObject inside the icon, to the "Left" or "Right" (the
	 * default) of its image and label, and the icon resizes around it. Give it an
	 * offset or automatic width: a scale width follows the icon's own width. It
	 * is destroyed with the icon. TopbarPlus can theme it by name, but
	 * `modifyTheme` here only takes TopbarPlus's own instance names, so set its
	 * properties directly.
	 */
	addInstance(instance: GuiObject, side?: "Left" | "Right"): this;
	/** Shows text on hover. Undefined removes it. See [captions](https://nanoblox.com/topbarplus/features/#captions). */
	setCaption(text?: string): this;
	/** Shows a key in the caption without binding it. */
	setCaptionHint(key: Enum.KeyCode): this;
	/**
	 * Gives the icon a vertical dropdown of these icons.
	 * See [dropdowns](https://nanoblox.com/topbarplus/features/#dropdowns).
	 *
	 * Calling it again is meant to destroy the icons from the last call, but
	 * TopbarPlus skips some of them, so destroy those yourself. An icon hides
	 * itself once its last dropdown or menu icon leaves.
	 */
	setDropdown(icons: ReadonlyArray<Icon>): this;
	joinDropdown(parentIcon: Icon): this;
	/**
	 * Gives the icon a horizontal menu of these icons.
	 * See [menus](https://nanoblox.com/topbarplus/features/#menus).
	 *
	 * Calling it again has the same problem as `setDropdown`: some of the old
	 * icons survive.
	 */
	setMenu(icons: ReadonlyArray<Icon>): this;
	/**
	 * A menu that is always open, with its close button hidden. Unlike the other
	 * methods this returns nothing, so it has to end a chain.
	 */
	setFixedMenu(icons: ReadonlyArray<Icon>): void;
	joinMenu(parentIcon: Icon): this;
	/** Takes the icon out of the dropdown or menu it joined. */
	leave(): this;
	/**
	 * Replaces the label with a [NumberSpinner](https://devforum.roblox.com/t/numberspinner-module/1105961).
	 * Change the spinner only inside `readyCallback`, which runs once it is in place.
	 */
	convertLabelToNumberSpinner(numberSpinner: unknown, readyCallback?: () => void): this;
	/** Disconnects everything and destroys the icon's instances. Returns nothing. */
	destroy(): void;
	/** The same as `destroy`, for cleanup libraries that call `Destroy`. */
	Destroy(): void;
}

interface IconConstructor {
	/** Creates an empty icon on the topbar. */
	new (): Icon;

	/** Every icon, keyed by UID. This is TopbarPlus's own table: read it, don't change it. */
	getIcons: () => ReadonlyMap<string, Icon>;
	/** The icon with this UID, or the first with this name. */
	getIcon: (nameOrUID: string) => Icon | undefined;
	/** False hides every TopbarPlus ScreenGui. Roblox's own topbar is unaffected. */
	setTopbarEnabled: (enabled: boolean) => void;
	/**
	 * Changes the base theme every icon is drawn from. It only changes a name and
	 * property that TopbarPlus's default theme already sets; any other
	 * modification is silently ignored. A state given here applies to every
	 * state when the default sets that property for all states.
	 */
	modifyBaseTheme: (modifications: IconModifications) => void;
	/** Sets the base DisplayOrder of TopbarPlus's ScreenGuis. */
	setDisplayOrder: (order: number) => void;

	/**
	 * When true, overflow menus keep a close button. Off by default. Read when an
	 * overflow first appears.
	 */
	closeableOverflowMenus?: boolean;
	/**
	 * The gamepad key that highlights the topbar, or false for none. DPadUp by
	 * default. Set it within a second of TopbarPlus loading.
	 */
	highlightKey?: Enum.KeyCode | false;
	/**
	 * The icon a gamepad highlights first, or false for the last-selected (else
	 * left-most) icon. TopbarPlus sets this to false as it starts up, so set it
	 * a frame or more after TopbarPlus loads.
	 */
	highlightIcon?: Icon | false;

	/** Fires when an icon is created. */
	readonly iconAdded: IconSignal<(icon: Icon) => void>;
	/** Fires when an icon is destroyed. */
	readonly iconRemoved: IconSignal<(icon: Icon) => void>;
}

export declare const Icon: IconConstructor;
