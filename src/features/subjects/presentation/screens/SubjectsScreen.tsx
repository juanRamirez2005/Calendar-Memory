// src/features/subjects/presentation/screens/SubjectsScreen.tsx
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Card, EmptyState, Screen, ScreenHeader } from '@shared/ui';
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
    <Card
      accent={item.color}
      onPress={() => navigation.navigate('SubjectDetail', { subjectId: item.id })}>
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: item.color }]}>
          <Text style={styles.badgeText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.flex}>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
            {[item.code, item.professor].filter(Boolean).join(' · ') || 'Sin detalles'}
          </Text>
        </View>
        <Text style={[styles.chevron, { color: item.color }]}>›</Text>
      </View>
    </Card>
  );

  return (
    <Screen>
      <ScreenHeader
        title="Materias"
        emoji="📚"
        subtitle={active.name}
        action={{
          label: 'Nueva',
          icon: '＋',
          onPress: () => navigation.navigate('SubjectForm', {}),
        }}
      />
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            emoji="📚"
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
  row: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 19, fontWeight: '800' },
  flex: { flex: 1 },
  name: { fontSize: 16.5, fontWeight: '700' },
  meta: { fontSize: 13, marginTop: 2 },
  chevron: { fontSize: 26, fontWeight: '700', marginLeft: 8 },
  grow: { flexGrow: 1 },
});
