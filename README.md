# @rbxts/topbar-plus-v3

[TopbarPlus](https://github.com/1ForeverHD/TopbarPlus) v3 for roblox-ts. The
package ships TopbarPlus's Luau exactly as upstream released it, plus typings
written against that code.

```sh
npm install @rbxts/topbar-plus-v3
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

Everything in [TopbarPlus's docs](https://1foreverhd.github.io/TopbarPlus/) is
typed. In the typings, `Icon.new()` is `new Icon()`, and a Luau method
`icon:setLabel(...)` is `icon.setLabel(...)`.

## Versions

The version is the TopbarPlus release plus a `-ts.N` suffix. `3.4.0-ts.0` is
TopbarPlus v3.4.0, and a typings fix to it would be `3.4.0-ts.1`. A caret range
doesn't carry a prerelease suffix from one release to the next, so pin an exact
version and bump it when you want a new release.

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
  `"FrozenMenu"`.
- `notified` passes the notice's id.
- `highlightKey` and `highlightIcon` are set on `Icon`, not on an icon.
- `modifyTheme` returns the icon so it can chain. The modification id it also
  returns is left out of the typings.

## Upstream behaviour worth knowing

- **Make icons after the viewport has its size.** An icon's widest possible
  width is fixed when it is made: the viewport's width plus 200. A client
  starts with a 1x1 viewport. So icons made on the first frame cap at 201px,
  and a `MinimumWidth` above that errors on every resize. Wait first:
  ```ts
  while ((Workspace.CurrentCamera?.ViewportSize.X ?? 0) <= 1) task.wait();
  ```
- **Dropdowns overwrite their icons' theme.** An icon that joins a dropdown
  takes the dropdown's corner radius, sizes, text size and padding in place
  of any it set itself. After `leave()` its own values don't come back.
- **Set `highlightIcon` a frame or more after TopbarPlus loads.** TopbarPlus
  sets it to `false` as it starts up.
- **TopbarPlus prints one line in live games and warns when outdated.** It
  prints `Running TopbarPlus` in live games (never in Studio), and warns when a
  newer TopbarPlus exists. Both come from its `Attribute` module, which this
  package leaves unchanged.

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
- To publish: `npm publish`. It runs the lint and the tests first.
