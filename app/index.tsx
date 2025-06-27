import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/theme';

export default function App() {
  // All redirect logic is handled by useAuthRedirector in AuthProvider
  // This component just shows a loading state while the redirect happens
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
