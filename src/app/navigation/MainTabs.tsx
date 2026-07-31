// src/app/navigation/MainTabs.tsx
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@theme/ThemeContext';
import { useSemestersStore } from '@features/semesters/presentation/store/semestersStore';
import { CalendarScreen } from '@features/calendar/presentation/screens/CalendarScreen';
import { SubjectsScreen } from '@features/subjects/presentation/screens/SubjectsScreen';
import { TasksScreen } from '@features/tasks/presentation/screens/TasksScreen';
import { SettingsScreen } from '@features/settings/presentation/screens/SettingsScreen';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, string> = {
  Calendar: '📅',
  Subjects: '📚',
  Tasks: '✓',
  Settings: '⚙',
};

/** Alto útil de la barra, sin contar el área reservada al sistema. */
const TAB_BAR_HEIGHT = 64;

export function MainTabs() {
  const { theme } = useTheme();
  // Con targetSdk 35+ el edge-to-edge es obligatorio desde Android 15, así que la
  // app dibuja detrás de la barra de navegación. React Navigation solo aplica el
  // inset inferior por su cuenta si no le fijamos height/paddingBottom, cosa que
  // aquí sí hacemos: hay que sumarlo a mano o los tres botones tapan las tabs.
  const insets = useSafeAreaInsets();
  const loadSemesters = useSemestersStore(s => s.load);

  // Carga inicial del semestre activo, del que dependen las demás pestañas.
  useEffect(() => {
    void loadSemesters();
  }, [loadSemesters]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingTop: 8,
          paddingBottom: 10 + insets.bottom,
          ...theme.shadow.md,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color, focused }) => (
          <Text style={{ fontSize: focused ? 20 : 18, color }}>
            {ICONS[route.name as keyof TabParamList]}
          </Text>
        ),
      })}>
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: 'Calendario' }}
      />
      <Tab.Screen
        name="Subjects"
        component={SubjectsScreen}
        options={{ title: 'Materias' }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{ title: 'Tareas' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Ajustes' }}
      />
    </Tab.Navigator>
  );
}
