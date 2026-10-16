import { BottomSheet, Group, Host, RNHostView } from '@expo/ui/swift-ui';
import { presentationBackground } from '@expo/ui/swift-ui/modifiers';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type SheetHostedContentProps = {
  onRemountHostChild: VoidFunction;
  onClose: VoidFunction;
  hostChildGeneration: number;
};

function SheetHostedContent({
  onRemountHostChild,
  onClose,
  hostChildGeneration,
}: SheetHostedContentProps) {
  return (
    <View style={styles.sheetContent}>
      <Text style={styles.sheetTitle}>
        RNHostView observes the GestureHandlerRootView UIView (generation {hostChildGeneration})
      </Text>
      <View style={styles.tallBlock} />
      <Pressable accessibilityRole="button" onPress={onRemountHostChild} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonLabel}>Replace RNHostView host child (new UIView)</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onClose} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonLabel}>Close sheet</Text>
      </Pressable>
    </View>
  );
}

export function RnHostViewMatchContentsRepro() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  /** Bumps when GestureHandlerRootView remounts — that is the UIView `firstChildUIView` KVO watches. */
  const [hostChildGeneration, setHostChildGeneration] = useState(0);

  if (Platform.OS !== 'ios') {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>This repro is iOS-only. Run: npx expo run:ios</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.instructions}>
        1. Open bottom sheet{'\n'}
        2. Tap Replace RNHostView host child — sheet goes blank (bug){'\n'}
        3. Close and reopen recovers in this minimal app; production may show a sliver on
        re-present instead
      </Text>

      <Host pointerEvents="box-none" style={styles.host}>
        <BottomSheet
          fitToContents
          isPresented={isSheetOpen}
          onIsPresentedChange={setIsSheetOpen}
          anchor={
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsSheetOpen(true)}
              style={styles.primaryButton}>
              <Text style={styles.primaryButtonLabel}>Open bottom sheet</Text>
            </Pressable>
          }>
          <Group modifiers={[presentationBackground('#FFFFFF')]}>
            <RNHostView matchContents>
              <GestureHandlerRootView
                key={`sheet-host-child-${hostChildGeneration}`}
                collapsable={false}
                style={styles.gestureRoot}>
                <SheetHostedContent
                  hostChildGeneration={hostChildGeneration}
                  onRemountHostChild={() => setHostChildGeneration((generation) => generation + 1)}
                  onClose={() => setIsSheetOpen(false)}
                />
              </GestureHandlerRootView>
            </RNHostView>
          </Group>
        </BottomSheet>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  instructions: {
    fontSize: 15,
    lineHeight: 22,
  },
  host: {
    flex: 1,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#208AEF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignSelf: 'stretch',
    backgroundColor: '#E8E8E8',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonLabel: {
    fontSize: 16,
    textAlign: 'center',
  },
  gestureRoot: {
    alignSelf: 'stretch',
  },
  sheetContent: {
    gap: 12,
    padding: 20,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  tallBlock: {
    alignSelf: 'stretch',
    backgroundColor: '#208AEF33',
    borderRadius: 8,
    height: 200,
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  fallbackText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
