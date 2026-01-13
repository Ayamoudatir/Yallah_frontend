import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="sign_up" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="todo" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}