// src/app/navigation/RootNavigator.tsx
import React from 'react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@theme/ThemeContext';
import { SemestersScreen } from '@features/semesters/presentation/screens/SemestersScreen';
import { SemesterFormScreen } from '@features/semesters/presentation/screens/SemesterFormScreen';
import { SemesterHistoryScreen } from '@features/semesters/presentation/screens/SemesterHistoryScreen';
import { SubjectDetailScreen } from '@features/subjects/presentation/screens/SubjectDetailScreen';
import { SubjectFormScreen } from '@features/subjects/presentation/screens/SubjectFormScreen';
import { TaskDetailScreen } from '@features/tasks/presentation/screens/TaskDetailScreen';
import { TaskFormScreen } from '@features/tasks/presentation/screens/TaskFormScreen';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { theme } = useTheme();
  const navTheme = theme.mode === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer
      theme={{
        ...navTheme,
        colors: {
          ...navTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          primary: theme.colors.primary,
        },
      }}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          contentStyle: { backgroundColor: theme.colors.background },
        }}>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Semesters"
          component={SemestersScreen}
          options={{ title: 'Semestres' }}
        />
        <Stack.Screen
          name="SemesterHistory"
          component={SemesterHistoryScreen}
          options={{ title: 'Historial' }}
        />
        <Stack.Screen
          name="SubjectDetail"
          component={SubjectDetailScreen}
          options={{ title: 'Materia' }}
        />
        <Stack.Screen
          name="TaskDetail"
          component={TaskDetailScreen}
          options={{ title: 'Tarea' }}
        />
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen
            name="SemesterForm"
            component={SemesterFormScreen}
            options={{ title: 'Semestre' }}
          />
          <Stack.Screen
            name="SubjectForm"
            component={SubjectFormScreen}
            options={{ title: 'Materia' }}
          />
          <Stack.Screen
            name="TaskForm"
            component={TaskFormScreen}
            options={{ title: 'Tarea' }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
