// src/features/semesters/presentation/screens/SemestersScreen.tsx
import React, { useCallback } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Button, Card, EmptyState, Pill, Screen } from '@shared/ui';
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
      <View style={styles.rowBetween}>
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {item.name}
        </Text>
        {item.isActive ? (
          <Pill label="Activo" color={theme.colors.success} filled />
        ) : item.isArchived ? (
          <Pill label="Archivado" color={theme.colors.textMuted} />
        ) : null}
      </View>
      <Text style={[styles.dates, { color: theme.colors.textMuted }]}>
        {formatDate(item.startDate)} — {formatDate(item.endDate)}
      </Text>
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
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Semestres
        </Text>
        <Button
          title="Nuevo"
          onPress={() => navigation.navigate('SemesterForm', {})}
        />
      </View>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700' },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: { fontSize: 17, fontWeight: '600', flexShrink: 1 },
  dates: { fontSize: 13, marginTop: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  action: { flexGrow: 1, minWidth: 96, paddingHorizontal: 12 },
  grow: { flexGrow: 1 },
});
