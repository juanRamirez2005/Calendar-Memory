// src/app/App.tsx
import React from 'react';
import { AppProviders } from './providers';
import { RootNavigator } from './navigation/RootNavigator';

export default function App() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}