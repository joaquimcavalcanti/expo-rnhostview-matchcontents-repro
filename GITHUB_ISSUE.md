# Paste into Expo SDK Bug Report

**Title:** `[expo-ui] RNHostView matchContents uses stale UIView after Fabric remounts hosted child`

## Minimal reproducible example

`https://github.com/YOUR_USER/expo-rnhostview-matchcontents-repro`

## Steps to reproduce

1. Clone the repo above and run `npm install`.
2. Run `npx expo run:ios` on the iOS Simulator (development build; not Expo Go).
3. Tap **Open bottom sheet** — the sheet sizes to the hosted content (tall blue block + buttons).
4. Tap **Replace RNHostView host child** while the sheet is still open.

**Platform:** iOS only (SwiftUI `@expo/ui`).

**Expected:** The sheet keeps the same height and the hosted React Native content stays visible.

**Actual:** The sheet body goes **blank** immediately. `ApplySizeFromYogaNode` in `RNHostView.swift` stores the child `UIView` in a `@StateObject` `Observer` at first composition; when Fabric mounts a new `GestureHandlerRootView` `UIView`, SwiftUI does not recreate that subtree, so KVO keeps reporting bounds on the detached view (often zero).

**Note:** Dismissing and re-opening the sheet recovers in this minimal repro because presented content unmounts. In app code that keeps hosts alive or re-presents without a full teardown, the same stale observer can surface as a **collapsed sheet on the next present** instead of an immediate blank.

## Environment

```
  expo-env-info 2.2.1 environment info:
    System:
      OS: macOS 26.6.2
    Binaries:
      Node: 24.15.0
      npm: 11.12.1
    SDKs:
      iOS SDK: iOS 26.5
    IDEs:
      Xcode: 26.5/17F42
    npmPackages:
      @expo/ui: 57.0.21
      expo: ~57.0.30 => 57.0.30
      expo-router: ~57.0.28 => 57.0.28
      react: 19.2.3
      react-native: 0.86.3
    Expo Workflow: managed
```

## Expo Doctor Diagnostics

Re-run locally before filing: `npx expo-doctor@latest`

Notable: `expo-router` may nest a second `@expo/ui` copy; the app depends on `@expo/ui@57.0.21` and iOS links `ExpoUI` from that version (`npm overrides` in `package.json`).

## Suggested fix

In `packages/expo-ui/ios/RNHostView.swift`, on the `matchContents` + `firstChildUIView` branch, after `ApplySizeFromYogaNode`:

```swift
.id(ObjectIdentifier(childUIView))
```

so SwiftUI recreates the measuring subtree when the hosted `UIView` instance changes.

**Test plan:** Repeat steps 3–4; sheet should remain visible and correctly sized.
