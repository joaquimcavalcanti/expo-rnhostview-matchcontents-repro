# RNHostView `matchContents` repro (@expo/ui)

Minimal iOS repro for an Expo SDK bug report: when the hosted child `UIView` of `RNHostView` is replaced, `ApplySizeFromYogaNode` keeps KVO on the detached view, so `matchContents` sizing breaks inside a SwiftUI `BottomSheet`.

**Package:** `@expo/ui` at the SDK 57–compatible version from `npx expo install @expo/ui` (unpatched).

## Setup

```bash
npm install
```

## Run (iOS development build)

Expo Go does not cover this SwiftUI integration — use a dev build:

```bash
npx expo run:ios
```

## Reproduce

1. Tap **Open bottom sheet** — height fits the blue block and buttons.
2. Tap **Replace RNHostView host child** (remounts `GestureHandlerRootView`, the direct `UIView` that `firstChildUIView` observes).

**Expected:** Sheet still shows content at the same height.

**Actual:** Sheet body goes **blank** (SwiftUI frame driven by stale zero bounds on the old `UIView`).

3. Close and open again — in this minimal app the sheet **recovers** because presented content fully unmounts. Larger apps (navigation inside the sheet, hosts kept alive across dismiss) may instead show a **collapsed sliver on re-present**; same root cause in `RNHostView.swift`.

Remounting inner `View`s only does **not** trigger the bug — the direct child of `RNHostView` must be replaced (as production code does when Fabric remounts the layout root).

## Verify the fix

After applying `.id(ObjectIdentifier(childUIView))` on the `matchContents` branch in `node_modules/@expo/ui/ios/RNHostView.swift` (see [GITHUB_ISSUE.md](./GITHUB_ISSUE.md)), step 2 should leave the sheet sized correctly instead of blank.

## Issue filing

See [GITHUB_ISSUE.md](./GITHUB_ISSUE.md) for a paste-ready Expo SDK bug report (update the repro URL after publishing this repo).
# expo-rnhostview-matchcontents-repro
