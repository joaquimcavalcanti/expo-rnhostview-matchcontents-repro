import { RnHostViewMatchContentsRepro } from '@/components/rnhostview-matchcontents-repro';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReproScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <RnHostViewMatchContentsRepro />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
