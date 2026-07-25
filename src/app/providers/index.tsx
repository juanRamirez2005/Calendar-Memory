// src/app/providers/index.tsx
import React from 'react';
import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Agrupa todos los providers globales de la app (contextos, temas, etc.).
 * Por ahora solo incluye SafeAreaProvider; agrega aquí los que necesites.
 */
export function AppProviders({ children }: PropsWithChildren) {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
}
