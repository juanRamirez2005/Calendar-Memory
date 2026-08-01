// src/features/semesters/presentation/screens/SemestersScreen.tsx
import React, { useCallback } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  Button,
  Card,
  EmptyState,
  Pill,
  Screen,
  ScreenHeader,
  STACK_SCREEN_EDGES,
} from '@shared/ui';
import { formatDate } from '@shared/utils/date';
import { useTheme } from '@theme/ThemeContext';
import type { RootScreenProps } from '@app/navigation/types';
import { useSemestersStore } from '../store/semestersStore';
import type { Semester } from '../../domain/entities/Semester';

export function SemestersScreen() {
  const navigation =
    useNavigation<RootScreenProps<'Semesters'>['navigation']>();
  const { theme } = useTheme();
  const { items, load, setActive, archive, remove } = useSemestersStore();

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const confirmDelete = (semester: Semester) => {
    Alert.alert(
      'Eliminar semestre',
      `Se eliminará "${semester.name}" con todas sus materias y tareas. Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => void remove(semester.id),
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Semester }) => (
    <Card>
      {/*
        Solo la cabecera abre el historial. Hacer tocable la Card entera
        anidaría los botones de abajo dentro de otro Pressable y un toque en
        "Eliminar" dispararía además la navegación.
      */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver historial de ${item.name}`}
        onPress={() =>
          navigation.navigate('SemesterHistory', { semesterId: item.id })
        }
        style={({ pressed }) => (pressed ? styles.pressed : undefined)}>
        <View style={styles.rowBetween}>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          <View style={styles.headerRight}>
            {item.isActive ? (
              <Pill label="Activo" color={theme.colors.success} filled />
            ) : item.isArchived ? (
              <Pill label="Archivado" color={theme.colors.textMuted} />
            ) : null}
            <Text style={[styles.chevron, { color: theme.colors.primary }]}>
              ›
            </Text>
          </View>
        </View>
        <Text style={[styles.dates, { color: theme.colors.textMuted }]}>
          {formatDate(item.startDate)} — {formatDate(item.endDate)}
        </Text>
        <Text style={[styles.hint, { color: theme.colors.primary }]}>
          Ver historial
        </Text>
      </Pressable>
      <View style={styles.actions}>
        {!item.isActive && !item.isArchived ? (
          <Button
            title="Activar"
            variant="secondary"
            onPress={() => void setActive(item.id)}
            style={styles.action}
          />
        ) : null}
        <Button
          title={item.isArchived ? 'Desarchivar' : 'Archivar'}
          variant="secondary"
          onPress={() => void archive(item.id, !item.isArchived)}
          style={styles.action}
        />
        <Button
          title="Editar"
          variant="secondary"
          onPress={() =>
            navigation.navigate('SemesterForm', { semesterId: item.id })
          }
          style={styles.action}
        />
        <Button
          title="Eliminar"
          variant="danger"
          onPress={() => confirmDelete(item)}
          style={styles.action}
        />
      </View>
    </Card>
  );

  return (
    <Screen edges={STACK_SCREEN_EDGES}>
      <ScreenHeader
        title="Semestres"
        emoji="🎓"
        action={{
          label: 'Nuevo',
          icon: '＋',
          onPress: () => navigation.navigate('SemesterForm', {}),
        }}
      />
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            emoji="🎓"
            title="Sin semestres"
            message="Crea tu primer semestre para empezar a registrar materias y tareas."
          />
        }
        contentContainerStyle={items.length === 0 ? styles.grow : undefined}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: { fontSize: 17, fontWeight: '600', flexShrink: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chevron: { fontSize: 24, fontWeight: '700' },
  dates: { fontSize: 13, marginTop: 4 },
  hint: { fontSize: 12.5, fontWeight: '700', marginTop: 8 },
  pressed: { opacity: 0.6 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  action: { flexGrow: 1, minWidth: 96, paddingHorizontal: 12 },
  grow: { flexGrow: 1 },
});
