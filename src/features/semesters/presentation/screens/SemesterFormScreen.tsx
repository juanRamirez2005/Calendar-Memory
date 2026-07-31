// src/features/semesters/presentation/screens/SemesterFormScreen.tsx
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, Screen, STACK_SCREEN_EDGES, TextField } from '@shared/ui';
import { todayKey } from '@shared/utils/date';
import { useTheme } from '@theme/ThemeContext';
import type { RootScreenProps } from '@app/navigation/types';
import { useSemestersStore } from '../store/semestersStore';

export function SemesterFormScreen() {
  const navigation =
    useNavigation<RootScreenProps<'SemesterForm'>['navigation']>();
  const route = useRoute<RootScreenProps<'SemesterForm'>['route']>();
  const { theme } = useTheme();
  const { items, create, update } = useSemestersStore();

  const editing = useMemo(
    () => items.find(s => s.id === route.params?.semesterId),
    [items, route.params?.semesterId],
  );

  const [name, setName] = useState(editing?.name ?? '');
  const [startDate, setStartDate] = useState(editing?.startDate ?? todayKey());
  const [endDate, setEndDate] = useState(editing?.endDate ?? '');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    const ok = editing
      ? await update(editing.id, { name, startDate, endDate })
      : await create({ name, startDate, endDate });
    if (ok) {
      navigation.goBack();
    } else {
      setError(useSemestersStore.getState().error);
    }
  };

  return (
    <Screen edges={STACK_SCREEN_EDGES}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {editing ? 'Editar semestre' : 'Nuevo semestre'}
        </Text>
        <TextField
          label="Nombre"
          value={name}
          onChangeText={setName}
          placeholder="2026-1"
        />
        <TextField
          label="Inicio (YYYY-MM-DD)"
          value={startDate}
          onChangeText={setStartDate}
          placeholder="2026-01-20"
        />
        <TextField
          label="Fin (YYYY-MM-DD)"
          value={endDate}
          onChangeText={setEndDate}
          placeholder="2026-06-10"
          error={error ?? undefined}
        />
        <Button
          title={editing ? 'Guardar cambios' : 'Crear semestre'}
          onPress={onSubmit}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
});
