// src/features/subjects/presentation/screens/SubjectFormScreen.tsx
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, Screen, STACK_SCREEN_EDGES, TextField } from '@shared/ui';
import { useActiveSemester } from '@shared/hooks/useActiveSemester';
import { useTheme } from '@theme/ThemeContext';
import { SUBJECT_COLORS } from '@theme/index';
import type { RootScreenProps } from '@app/navigation/types';
import { useSubjectsStore } from '../store/subjectsStore';

export function SubjectFormScreen() {
  const navigation =
    useNavigation<RootScreenProps<'SubjectForm'>['navigation']>();
  const route = useRoute<RootScreenProps<'SubjectForm'>['route']>();
  const { theme } = useTheme();
  const active = useActiveSemester();
  const { items, create, update } = useSubjectsStore();

  const editing = useMemo(
    () => items.find(s => s.id === route.params?.subjectId),
    [items, route.params?.subjectId],
  );

  const [name, setName] = useState(editing?.name ?? '');
  const [code, setCode] = useState(editing?.code ?? '');
  const [professor, setProfessor] = useState(editing?.professor ?? '');
  const [credits, setCredits] = useState(
    editing?.credits != null ? String(editing.credits) : '',
  );
  const [color, setColor] = useState(editing?.color ?? SUBJECT_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    const creditsNum = credits.trim() ? Number(credits) : undefined;
    const base = {
      name,
      code: code.trim() || undefined,
      professor: professor.trim() || undefined,
      credits: Number.isNaN(creditsNum) ? undefined : creditsNum,
      color,
    };
    let ok = false;
    if (editing) {
      ok = await update(editing.id, base);
    } else if (active) {
      ok = await create({ ...base, semesterId: active.id });
    }
    if (ok) {
      navigation.goBack();
    } else {
      setError(useSubjectsStore.getState().error);
    }
  };

  return (
    <Screen edges={STACK_SCREEN_EDGES}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {editing ? 'Editar materia' : 'Nueva materia'}
        </Text>
        <TextField
          label="Nombre"
          value={name}
          onChangeText={setName}
          placeholder="Cálculo I"
        />
        <TextField
          label="Código (opcional)"
          value={code}
          onChangeText={setCode}
          placeholder="MAT101"
        />
        <TextField
          label="Docente (opcional)"
          value={professor}
          onChangeText={setProfessor}
        />
        <TextField
          label="Créditos (opcional)"
          value={credits}
          onChangeText={setCredits}
          keyboardType="number-pad"
        />

        <Text style={[styles.label, { color: theme.colors.textMuted }]}>
          Color
        </Text>
        <View style={styles.colors}>
          {SUBJECT_COLORS.map(c => (
            <Pressable
              key={c}
              accessibilityRole="button"
              accessibilityLabel={`Color ${c}`}
              onPress={() => setColor(c)}
              style={[
                styles.swatch,
                { backgroundColor: c },
                color === c && {
                  borderColor: theme.colors.text,
                  borderWidth: 3,
                },
              ]}
            />
          ))}
        </View>

        {error ? (
          <Text style={[styles.error, { color: theme.colors.danger }]}>
            {error}
          </Text>
        ) : null}

        <Button
          title={editing ? 'Guardar cambios' : 'Crear materia'}
          onPress={onSubmit}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  swatch: { width: 40, height: 40, borderRadius: 20 },
  error: { fontSize: 13, marginBottom: 12 },
});
