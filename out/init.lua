-- roblox-ts imports a package's exports by name, so TopbarPlus's class is
-- exported as `Icon`. Everything under ./TopbarPlus is upstream, unmodified.
return {
	Icon = require(script.TopbarPlus),
}
