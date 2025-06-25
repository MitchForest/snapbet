import { Redirect } from 'expo-router';

export default function App() {
  console.log('App index.tsx rendering - redirecting to drawer tabs...');
  // For now, always redirect to the main app
  // In the future, this will check auth status
  return <Redirect href="/(drawer)/(tabs)" />;
}
