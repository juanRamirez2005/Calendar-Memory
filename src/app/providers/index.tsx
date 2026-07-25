// src/app/providers/index.tsx
import React, { useCallback, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getContainer, initContainer } from '@core/di/container';
import { ThemeProvider } from '@theme/ThemeContext';
import type { ThemeMode } from '@theme/index';

type BootState =
  | { status: 'loading' }
  | { status: 'ready'; themeMode: ThemeMode }
  | { status: 'error'; message: string };

/** Inicializa la base y el contenedor DI antes de montar el árbol de la app. */
function Bootstrap({ children }: PropsWithChildren) {
  const [state, setState] = useState<BootState>({ status: 'loading' });

  useEffect(() => {
    let mounted = true;
    initContainer()
      .then(container => {
        if (mounted) {
          setState({
            status: 'ready',
            themeMode: container.preferences.getThemeMode(),
          });
        }
      })
      .catch((error: unknown) => {
        if (mounted) {
          const message =
            error instanceof Error ? error.message : String(error);
          setState({ status: 'error', message });
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleModeChange = useCallback((mode: ThemeMode) => {
    getContainer().preferences.setThemeMode(mode);
  }, []);

  if (state.status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>No se pudo iniciar la app</Text>
        <Text style={styles.errorDetail}>{state.message}</Text>
      </View>
    );
  }

  return (
    <ThemeProvider
      initialMode={state.themeMode}
      onModeChange={handleModeChange}>
      {children}
    </ThemeProvider>
  );
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <Bootstrap>{children}</Bootstrap>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F5F6F8',
  },
  error: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  errorDetail: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
});
