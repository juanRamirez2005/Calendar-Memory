// src/features/subjects/presentation/screens/SubjectsScreen.tsx
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Button, Card, EmptyState, Screen } from '@shared/ui';
import { useActiveSemester } from '@shared/hooks/useActiveSemester';
import { useTheme } from '@theme/ThemeContext';
import type { TabScreenProps } from '@app/navigation/types';
import { useSubjectsStore } from '../store/subjectsStore';
import type { Subject } from '../../domain/entities/Subject';

export function SubjectsScreen() {
  const navigation = useNavigation<TabScreenProps<'Subjects'>['navigation']>();
  const { theme } = useTheme();
  const active = useActiveSemester();
  const { items, load } = useSubjectsStore();

  useFocusEffect(
    useCallback(() => {
      if (active) {
        void load(active.id);
      }
    }, [active, load]),
  );

  if (!active) {
    return (
      <Screen>
        <EmptyState
          title="Sin semestre activo"
          message="Activa o crea un semestre en Ajustes → Semestres para registrar materias."
        />
      </Screen>
    );
  }

  const renderItem = ({ item }: { item: Subject }) => (
    <Card onPress={() => navigation.navigate('SubjectDetail', { subjectId: item.id })}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: item.color }]} />
        <View style={styles.flex}>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
            {[item.code, item.professor].filter(Boolean).join(' · ') || 'Sin detalles'}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Materias
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            {active.name}
          </Text>
        </View>
        <Button
          title="Nueva"
          onPress={() => navigation.navigate('SubjectForm', {})}
        />
      </View>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            title="Sin materias"
            message="Agrega las materias que estás cursando este semestre."
          />
        }
        contentContainerStyle={items.length === 0 ? styles.grow : undefined}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 12 },
  flex: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 13, marginTop: 2 },
  grow: { flexGrow: 1 },
});
