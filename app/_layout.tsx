import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="welcome"   // ✅ OBLIGATOIRE
      screenOptions={{
        headerShown: false,

        // 🔥 Cache totalement la tab bar Expo
        tabBarStyle: { display: 'none' },
        tabBarItemStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="welcome" />
      <Tabs.Screen name="todo" />
      <Tabs.Screen name="settings" />

      {/* ⚠️ index DOIT ÊTRE EN DERNIER ou supprimé */}
      <Tabs.Screen name="index" />
    </Tabs>
  );
}