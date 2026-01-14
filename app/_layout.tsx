import { ImageProvider } from '@/contexts/ImageContext';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <ImageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="sign_up" />
        <Stack.Screen name="welcome" />
        <Stack.Screen 
          name="todo" 
          options={{
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen name="profil" />
      </Stack>
    </ImageProvider>
  );
}