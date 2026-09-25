-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Usage that compiles but can't run in the test place (there is no
-- NumberSpinner, and some calls only matter to the type checker). Nothing
-- requires this module, so its Luau never runs.
local Icon = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "topbar-plus-v3", "out").Icon
local function accepted(icon, numberSpinner)
	-- api.md: convertLabelToNumberSpinner, with the ready callback added in v3.3.0
	icon:convertLabelToNumberSpinner(numberSpinner, function()
		return print("ready")
	end)
	-- Named instances come back as their class; any other name as an Instance
	local label = icon:getInstance("IconLabel")
	local speed = icon:getInstance("DropdownSpeed")
	local custom = icon:getInstance("MyOwnFrame")
	-- Modifications can be built ahead of time, in either shape
	local one = { "Widget", "BorderSize", 2, "Selected" }
	local many = { { "Selection", "RotationSpeed", 2 }, { "IconImage", "ImageColor3", Color3.new(1, 0, 0), "Viewing" } }
	(icon:modifyTheme(one)):modifyChildTheme(many)
	-- modifyTheme's id undoes the change; the id can be chosen
	local themed, modificationId = icon:modifyTheme(many)
	themed:removeModification(modificationId);
	(icon:modifyTheme(one, "hover")):removeModification("hover")
	-- Font ids, and the optional weight and style
	icon:setTextFont(12187370928):setTextFont("Creepster", Enum.FontWeight.Bold)
	-- A notice cleared by a Roblox event, and one by another icon's signal
	icon:notify(Instance.new("BindableEvent").Event):notify(icon.selected, "notice-id")
	-- Signals connect, fire once, and wait
	local connection = icon.toggled:Connect(function(isSelected, fromSource, sourceIcon) end)
	connection:Disconnect()
	icon.viewingStarted:Once(function() end)
	local isSelected, fromSource = icon.toggled:Wait()
	local signal = Icon.iconAdded
	Icon.highlightKey = false
	Icon.highlightIcon = false
	return {
		label = label,
		speed = speed,
		custom = custom,
		isSelected = isSelected,
		fromSource = fromSource,
		signal = signal,
	}
end
return {
	accepted = accepted,
}
