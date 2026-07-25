// src/app/navigation/RootNavigator.tsx
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Navegador raíz de la app. Es un stub temporal: reemplázalo por tu
 * librería de navegación (p. ej. @react-navigation/native) cuando la agregues.
 */
export function RootNavigator() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Calendar Memory</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});
