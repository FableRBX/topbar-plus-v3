-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- The examples from TopbarPlus's docs (docs/features.md and docs/api.md at the
-- synced tag), written the way a roblox-ts game writes them. main.client.ts runs
-- them in Play; the Luau they compile to is committed beside them, so a typings
-- change that alters the emitted calls shows up in review.
local Icon = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "topbar-plus-v3", "out").Icon
local Players = game:GetService("Players")
-- Any image works; this is the one TopbarPlus uses for its overflow icon.
local SHOP_IMAGE = 6069276526
local function shopFrame()
	local gui = Instance.new("ScreenGui")
	gui.Name = "Shop"
	gui.ResetOnSpawn = false
	local frame = Instance.new("Frame")
	frame.Size = UDim2.fromOffset(200, 120)
	frame.Position = UDim2.fromScale(0.5, 0.5)
	frame.Visible = false
	frame.Parent = gui
	gui.Parent = Players.LocalPlayer:WaitForChild("PlayerGui")
	return frame
end
-- features.md: Images, Labels
local function images()
	return Icon.new():setImage(SHOP_IMAGE)
end
local function labels()
	return Icon.new():setImage(SHOP_IMAGE):setLabel("Shop")
end
-- features.md: Alignments
local function alignments()
	return { Icon.new():setLabel("Left"):align("Left"), Icon.new():setLabel("Center"):align("Center"), Icon.new():setLabel("Right"):align("Right") }
end
-- features.md: Notices, Captions
local function notices()
	return Icon.new():setLabel("Notices"):notify()
end
local function captions()
	return Icon.new():setLabel("Caption"):setCaption("Open Shop")
end
-- features.md: Dropdowns
local function dropdowns()
	return Icon.new():setLabel("Example"):modifyTheme({ "Dropdown", "MaxIcons", 3 }):modifyChildTheme({ "Widget", "MinimumWidth", 158 }):setDropdown({ Icon.new():setLabel("Category 1"), Icon.new():setLabel("Category 2"), Icon.new():setLabel("Category 3"), Icon.new():setLabel("Category 4") })
end
-- features.md: Menus
local function menus()
	return Icon.new():setLabel("Example"):modifyTheme({ "Menu", "MaxIcons", 2 }):setMenu({ Icon.new():setLabel("Item 1"), Icon.new():setLabel("Item 2"), Icon.new():setLabel("Item 3"), Icon.new():setLabel("Item 4") })
end
-- features.md: Fixed Menus. setFixedMenu returns nothing, so it ends the chain.
local function fixedMenus()
	local icon = Icon.new():modifyTheme({ "Menu", "MaxIcons", 3 })
	icon:setFixedMenu({ Icon.new():setLabel("Item 1"), Icon.new():setLabel("Item 2"), Icon.new():setLabel("Item 3"), Icon.new():setLabel("Item 4"), Icon.new():setLabel("Item 5") })
	return icon
end
-- features.md: Modify Theme, both shapes, plus the dropdown speed added in v3.3.0
local function modifyTheme(icon)
	icon:modifyTheme({ "IconLabel", "TextSize", 16 })
	icon:modifyTheme({ { "Widget", "MinimumWidth", 290 }, { "IconCorners", "CornerRadius", UDim.new(0, 0) } })
	icon:modifyTheme({ "IconSpot", "BackgroundColor3", Color3.fromRGB(0, 170, 255), "Selected" })
	icon:modifyTheme({ "DropdownSpeed", "Value", 0.2 })
	Icon.modifyBaseTheme({ "IconLabel", "TextSize", 16 })
end
-- features.md: One Click Icons
local function oneClickIcons(shop)
	return Icon.new():setImage(SHOP_IMAGE):setLabel("Shop"):bindEvent("deselected", function()
		shop.Visible = not shop.Visible
	end):oneClick()
end
-- features.md: Toggle Items, and what it is equivalent to
local function toggleItems(shop)
	local icon = Icon.new():setLabel("Toggle item"):bindToggleItem(shop)
	icon.deselected:Connect(function()
		shop.Visible = false
	end)
	icon.selected:Connect(function()
		shop.Visible = true
	end)
	return icon
end
-- features.md: Toggle Keys
local function toggleKeys()
	return Icon.new():setLabel("Shop"):bindToggleKey(Enum.KeyCode.V):setCaption("Open Shop")
end
-- features.md: Gamepad & Console Support. Set before TopbarPlus finishes starting up.
local function gamepad()
	Icon.highlightKey = Enum.KeyCode.ButtonY
end
-- v3.3.0 release notes: overflow menus can have their close toggle back
local function overflows()
	Icon.closeableOverflowMenus = true
end
-- api.md: Functions
local function functions()
	local icons = Icon.getIcons()
	local shop = Icon.getIcon("Shop")
	Icon.setTopbarEnabled(true)
	Icon.setDisplayOrder(10)
	return {
		icons = icons,
		shop = shop,
	}
end
-- api.md: Events
local function events(icon)
	icon.selected:Connect(function(fromSource)
		local sourceName = fromSource or "Unknown"
		print(`The icon was selected by the {sourceName}`)
	end)
	icon.deselected:Connect(function(fromSource)
		local sourceName = fromSource or "Unknown"
		print(`The icon was deselected by the {sourceName}`)
	end)
	icon.toggled:Connect(function(isSelected, fromSource)
		local stateName = if isSelected then "selected" else "deselected"
		print(`The icon was {stateName}!`)
	end)
	icon.viewingStarted:Connect(function()
		print("A mouse, long-pressed finger or gamepad selection is hovering over the icon")
	end)
	icon.viewingEnded:Connect(function()
		print("The input is no longer viewing (hovering over) the icon")
	end)
	icon.notified:Connect(function()
		print("New notice")
	end)
end
-- api.md: Properties
local function properties(icon)
	return {
		name = icon.name,
		isSelected = icon.isSelected,
		isEnabled = icon.isEnabled,
		totalNotices = icon.totalNotices,
		locked = icon.locked,
		UID = icon.UID,
	}
end
-- api.md: Methods, each called at least once
local function methods(item, onCall)
	local dropdownParent = Icon.new():setLabel("Dropdown parent")
	local menuParent = Icon.new():setLabel("Menu parent")
	local icon = Icon.new():setName("Methods"):setEnabled(true):setImage("rbxassetid://6069276526", "Selected"):setLabel("Methods"):setLabel("Selected!", "Selected"):setOrder(2):align("Right"):setWidth(80):setImageScale(0.6):setImageRatio(1):setTextSize(18):setTextFont("Creepster"):setTextFont(Enum.Font.Bangers):setTextFont("rbxasset://fonts/families/Sarpanch.json", Enum.FontWeight.Bold, Enum.FontStyle.Italic):setTextColor(Color3.fromRGB(255, 200, 0)):disableOverlay(true):bindToggleItem(item):unbindToggleItem(item):bindEvent("toggled", function(icon, isSelected, fromSource)
		return print(icon.UID, isSelected, fromSource)
	end):unbindEvent("toggled"):bindToggleKey(Enum.KeyCode.M):unbindToggleKey(Enum.KeyCode.M):setCaptionHint(Enum.KeyCode.M):setCaption("Methods"):setCaption(nil):call(function(icon, greeting)
		return onCall(`{greeting} from {icon.name}`)
	end, "hello"):addToJanitor(function()
		return print("cleaned up")
	end):addToJanitor(Instance.new("Folder")):lock():unlock():autoDeselect(false):autoDeselect():oneClick(false):select():deselect():notify(dropdownParent.deselected):clearNotices():joinDropdown(dropdownParent):leave():joinMenu(menuParent):leave():setCornerRadius(UDim.new(0, 8))
	task.spawn(function()
		return icon:debounce(0.1)
	end)
	return icon
end
local function destroying()
	local destroyed = Icon.new():setLabel("Destroyed")
	destroyed:destroy()
	local janitored = Icon.new():setLabel("Destroyed by a cleanup library")
	janitored:Destroy()
	return { destroyed, janitored }
end
return {
	shopFrame = shopFrame,
	images = images,
	labels = labels,
	alignments = alignments,
	notices = notices,
	captions = captions,
	dropdowns = dropdowns,
	menus = menus,
	fixedMenus = fixedMenus,
	modifyTheme = modifyTheme,
	oneClickIcons = oneClickIcons,
	toggleItems = toggleItems,
	toggleKeys = toggleKeys,
	gamepad = gamepad,
	overflows = overflows,
	functions = functions,
	events = events,
	properties = properties,
	methods = methods,
	destroying = destroying,
}
