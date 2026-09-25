-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Runs every docs example in Play, then checks that what the typings promise is
-- what TopbarPlus does at runtime. Prints one PASS line, or a warning per failed
-- check and an error.
local Icon = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "topbar-plus-v3", "out").Icon
local examples = TS.import(script, script.Parent, "examples")
local failures = {}
local checks = 0
local function check(label, ok)
	checks += 1
	if not ok then
		local _label = label
		table.insert(failures, _label)
	end
end
local added = {}
local removed = {}
Icon.iconAdded:Connect(function(icon)
	local _icon = icon
	table.insert(added, _icon)
	return #added
end)
Icon.iconRemoved:Connect(function(icon)
	local _icon = icon
	table.insert(removed, _icon)
	return #removed
end)
-- TopbarPlus reads these when it finishes starting up, a frame after require.
examples.gamepad()
examples.overflows()
-- An icon's widest possible width is fixed when it is made, at the viewport's
-- width plus 200. The viewport is 1x1 as a client starts, so icons made then
-- cap at 201px and a larger MinimumWidth (the theme example's 290) errors on
-- every resize. Wait for the real viewport first.
local Workspace = game:GetService("Workspace")
while true do
	local _result = Workspace.CurrentCamera
	if _result ~= nil then
		_result = _result.ViewportSize.X
	end
	local _condition = _result
	if _condition == nil then
		_condition = 0
	end
	if not (_condition <= 1) then
		break
	end
	task.wait()
end
local shop = examples.shopFrame()
local fresh = Icon.new()
local freshProperties = examples.properties(fresh)
examples.images()
local labelled = examples.labels()
examples.alignments()
local noticed = examples.notices()
examples.captions()
local dropdown = examples.dropdowns()
local menu = examples.menus()
local fixedMenu = examples.fixedMenus()
examples.modifyTheme(Icon.new():setLabel("Themed"))
examples.oneClickIcons(shop)
local toggler = examples.toggleItems(shop)
examples.toggleKeys()
examples.events(toggler)
local greeting
local methods = examples.methods(shop, function(text)
	greeting = text
	return greeting
end)
local _binding = examples.destroying()
local destroyed = _binding[1]
local janitored = _binding[2]
-- modifyTheme last in an array: the id must stay out of it. And its id undoes
-- the change, back to the base theme's TextSize.
local listParent = Icon.new():setLabel("List parent")
local listed = { Icon.new():setLabel("A"), (Icon.new():setLabel("B"):modifyTheme({ "IconLabel", "TextSize", 30 })) }
listParent:setDropdown(listed)
local sized, sizeChange = Icon.new():setLabel("Sized"):modifyTheme({ "IconLabel", "TextSize", 30 })
local sizedLabel = sized:getInstance("IconLabel")
local _sizeWhileModified = sizedLabel
if _sizeWhileModified ~= nil then
	_sizeWhileModified = _sizeWhileModified.TextSize
end
local sizeWhileModified = _sizeWhileModified
sized:removeModification(sizeChange)
local toggles = 0
toggler.toggled:Connect(function()
	toggles += 1
	return toggles
end)
toggler:select()
toggler:deselect()
task.wait(1.5)
local _binding_1 = examples.functions()
local icons = _binding_1.icons
local _uID = fresh.UID
check("a new icon has a string UID", type(_uID) == "string")
check("name is undefined until setName", freshProperties.name == nil)
check("locked is undefined until lock or unlock", freshProperties.locked == nil)
check("a new icon is enabled and deselected", fresh.isEnabled and not fresh.isSelected)
check("setName sets name", methods.name == "Methods")
check("getIcon finds an icon by name", Icon.getIcon("Methods") == methods)
check("getIcon finds an icon by UID", Icon.getIcon(labelled.UID) == labelled)
check("getIcon misses as undefined", Icon.getIcon("No such icon") == nil)
local _uID_1 = methods.UID
check("getIcons is keyed by UID", icons[_uID_1] == methods)
check("iconAdded fired for every icon", table.find(added, methods) ~= nil and table.find(added, labelled) ~= nil)
check("destroy removes the icon", Icon.getIcon(destroyed.UID) == nil and table.find(removed, destroyed) ~= nil)
check("Destroy is destroy", Icon.getIcon(janitored.UID) == nil and table.find(removed, janitored) ~= nil)
check("call passes the icon and extra arguments", greeting == "hello from Methods")
check("unlock leaves locked false", methods.locked == false)
check("toggled fires on select and deselect", toggles == 2)
check("notify counts a notice", noticed.totalNotices == 1)
check("clearNotices empties the count", methods.totalNotices == 0)
check("highlightKey is static and survives startup", Icon.highlightKey == Enum.KeyCode.ButtonY)
check("closeableOverflowMenus is static", Icon.closeableOverflowMenus == true)
local label = methods:getInstance("IconLabel")
check("getInstance returns the named TextLabel", label ~= nil and label:IsA("TextLabel"))
local _result = label
if _result ~= nil then
	_result = _result.TextColor3:ToHex()
end
check("setTextColor colours the label", _result == "ffc800")
check("getInstance misses as undefined", methods:getInstance("No such instance") == nil)
local _corner = methods:getInstance("IconButton")
if _corner ~= nil then
	_corner = _corner:FindFirstChildWhichIsA("UICorner")
end
local corner = _corner
local _result_1 = corner
if _result_1 ~= nil then
	_result_1 = _result_1.CornerRadius
end
check("setCornerRadius takes a UDim", _result_1 == UDim.new(0, 8))
local _result_2 = dropdown:getInstance("Dropdown")
if _result_2 ~= nil then
	_result_2 = _result_2:GetAttribute("MaxIcons")
end
check("Dropdown MaxIcons lands as an attribute", _result_2 == 3)
local _result_3 = menu:getInstance("Menu")
if _result_3 ~= nil then
	_result_3 = _result_3:GetAttribute("MaxIcons")
end
check("Menu MaxIcons lands as an attribute", _result_3 == 2)
check("a fixed menu stays selected", fixedMenu.isSelected)
check("modifyTheme last in an array adds no id to it", #listed == 2)
check("modifyTheme applies", sizeWhileModified == 30)
local _result_4 = sizedLabel
if _result_4 ~= nil then
	_result_4 = _result_4.TextSize
end
check("removeModification undoes by id", _result_4 == 16)
-- Set after startup: TopbarPlus resets highlightIcon to false as it starts.
Icon.highlightIcon = methods
check("highlightIcon is static", Icon.highlightIcon == methods)
if #failures == 0 then
	print(`[topbar-plus-v3] PASS {checks} checks`)
else
	for _, failure in failures do
		warn(`[topbar-plus-v3] FAIL {failure}`)
	end
	error(`[topbar-plus-v3] {#failures} of {checks} checks failed`)
end
