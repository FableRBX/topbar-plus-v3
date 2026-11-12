# @rbxts/topbar-plus-v3

[TopbarPlus](https://github.com/1ForeverHD/TopbarPlus) v3 for roblox-ts. The
package ships TopbarPlus's Luau exactly as upstream released it, plus typings
written against that code.

It isn't on npm. Install a release tag from GitHub:

```sh
npm install "@rbxts/topbar-plus-v3@github:FableRBX/topbar-plus-v3#v3.5.0-ts.0"
```

```ts
import { Icon } from "@rbxts/topbar-plus-v3";

new Icon()
	.setImage(6069276526)
	.setLabel("Shop")
	.bindToggleItem(shopFrame)
	.bindToggleKey(Enum.KeyCode.V)
	.setCaption("Open Shop");
```

Everything in [TopbarPlus's docs](https://nanoblox.com/topbarplus/) is
typed. In the typings, `Icon.new()` is `new Icon()`, and a Luau method
`icon:setLabel(...)` is `icon.setLabel(...)`.

## Versions

The version is the TopbarPlus release plus a `-ts.N` suffix. `3.5.0-ts.0` is
TopbarPlus v3.5.0, and a typings fix to it would be `3.5.0-ts.1`. Each release
is a git tag of the same name with a `v` in front (`v3.5.0-ts.0`); depend on
the tag and move to a newer one when you want it.

## How this differs from the other packages

- [`@rbxts/topbar-plus`](https://www.npmjs.com/package/@rbxts/topbar-plus) is
  still on TopbarPlus v3.2.5.
- [`@rbxts/topbarplus`](https://www.npmjs.com/package/@rbxts/topbarplus) ships
  v3.4.0 with two edits to TopbarPlus's files. Its typings are the v3.2.5 ones,
  so v3.3 and v3.4 additions are untyped, and a few existing signatures are
  wrong. It has no public repo.
- Both packages label themselves MIT. TopbarPlus is MPL-2.0, with credit terms.

## Where the typings follow the code, not the docs

- `setFixedMenu` and `destroy` return nothing, so they can't be chained from.
- `icon.name` is undefined until `setName`. `icon.locked` is undefined until
  `lock` or `unlock` is called.
- `setCornerRadius` takes one `UDim`.
- `setTextFont` takes a family name, a family link, a font id or an
  `Enum.Font`. Passing a `Font` makes TopbarPlus error.
- The overflow event source is `"OverflowStart"`. Selecting a fixed menu uses
  `"FrozenMenu"`. A click outside an open dropdown closes it with
  `"OutsideClick"`.
- `notified` passes the notice's id.
- `highlightKey` and `highlightIcon` are set on `Icon`, not on an icon.
- `modifyTheme` returns two values: the icon and an id for the change. It is
  typed as that pair, so chain through `[0]`
  (`icon.modifyTheme(m)[0].setLabel("Shop")`) or destructure it
  (`const [icon, id] = ...`) and pass the id to `removeModification`.
  Typed as just the icon, a call at the end of an array, or one returned from a
  function, would put the id into the array alongside the icons.

## Upstream behaviour worth knowing

- **Make icons after the viewport has its size.** An icon's widest possible
  width is fixed when it is made: the viewport's width plus 200. A client
  starts with a 1x1 viewport. So icons made on the first frame cap their
  contents at 201px. Wait first:
  ```ts
  while ((Workspace.CurrentCamera?.ViewportSize.X ?? 0) <= 1) task.wait();
  ```
- **Dropdowns overwrite their icons' theme.** An icon that joins a dropdown
  takes the dropdown's corner radius, sizes, text size and padding in place
  of any it set itself, and its image scale unless it set one other than 0.5.
  After `leave()` its own values don't come back.
- **Dropdowns close on a click or tap outside them.** Call
  `setCloseOnOutsideClick(false)` on the icon to keep one open.
- **`Icon.modifyBaseTheme` only changes what the default theme sets.** Any
  other name and property is ignored. Studio warns only when the instance
  name is unknown.
- **Calling `setDropdown` or `setMenu` again leaves some old icons behind.**
  TopbarPlus skips some of the old icons it means to destroy, so destroy them
  yourself. An icon whose last child leaves hides itself.
- **Set `highlightIcon` a frame or more after TopbarPlus loads.** TopbarPlus
  sets it to `false` as it starts up.
- **Players with Reduce Motion on see no movement tweens.** Captions still
  fade.
- **TopbarPlus prints in live games and in Studio.** In live games (never in
  Studio) it prints `Running TopbarPlus`, and it warns when a newer
  TopbarPlus exists. In Studio it asks for a donation unless the developer
  has donated. All three come from its `Attribute` module, which this package
  leaves unchanged.

## Credit and license

TopbarPlus is by [ForeverHD](https://github.com/1ForeverHD). It is licensed
under the Mozilla Public License 2.0, with one extra condition: an experience
using it either leaves its `Attribute` module unchanged or credits TopbarPlus
in its description. This package never edits `Attribute`, so installing it
meets that condition. See [LICENSE-TopbarPlus](LICENSE-TopbarPlus).

This package's own files (the typings, the entry module, the scripts and the
tests) are MIT: see [LICENSE](LICENSE).

## Maintaining

- `npm run sync -- v3.5.0` pulls a TopbarPlus release into `out/TopbarPlus`
  exactly as upstream committed it. It stamps `package.json` with the tag and
  commit and resets the version to `3.5.0-ts.0`. Never edit `out/TopbarPlus` by
  hand.
- `npm run check-api` compares upstream's methods, fields and statics with the
  typings. Every upstream member must be typed or listed in
  `internal-api.json` with a reason. Sync runs it too.
- `npm test` runs the API check. It then packs the package, installs the
  tarball into `test/`, compiles the docs' examples with `rbxtsc`, and checks
  with `tsc` that the misuse in `test/types` is rejected. Commit the Luau that
  lands in `test/out`: its diff shows how a typings change affects the Luau
  that gets emitted.
- `npm run test:place` builds `test/test.rbxl`. Play it in Studio: it runs
  every example and prints `[topbar-plus-v3] PASS`, or a line per failed check.
- To release: set the version in `package.json`, commit, then tag it
  `v<version>` and push the tag. `npm publish` also works (it runs the lint
  and the tests first), but the package isn't on npm today.
