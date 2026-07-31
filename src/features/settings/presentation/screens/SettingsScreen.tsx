// src/features/settings/presentation/screens/SettingsScreen.tsx
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getContainer } from '@core/di/container';
import type { WeekStart } from '@core/config/preferences';
import { Button, Card, Screen, ScreenHeader } from '@shared/ui';
import { useTheme } from '@theme/ThemeContext';
import type { NotificationPermissionState } from '@features/notifications/domain/NotificationService';
import type { TabScreenProps } from '@app/navigation/types';

export function SettingsScreen() {
  const navigation = useNavigation<TabScreenProps<'Settings'>['navigation']>();
  const { theme, mode, toggleMode } = useTheme();
  const [weekStart, setWeekStartState] = useState<WeekStart>(() =>
    getContainer().preferences.getWeekStart(),
  );
  const [permissions, setPermissions] =
    useState<NotificationPermissionState | null>(null);

  // Se relee al volver de Ajustes del sistema, que es donde se concede.
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      void getContainer()
        .notifications.getPermissionState()
        .then(state => {
          if (mounted) {
            setPermissions(state);
          }
        });
      return () => {
        mounted = false;
      };
    }, []),
  );

  const setWeekStart = (value: WeekStart) => {
    getContainer().preferences.setWeekStart(value);
    setWeekStartState(value);
  };

  return (
    <Screen>
      <ScreenHeader title="Ajustes" emoji="⚙️" />

      <Card>
        <View style={styles.rowBetween}>
          <Text style={[styles.rowLabel, { color: theme.colors.text }]}>
            Tema oscuro
          </Text>
          <Switch value={mode === 'dark'} onValueChange={toggleMode} />
        </View>
      </Card>

      <Card>
        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>
          Primer día de la semana
        </Text>
        <View style={styles.segment}>
          {(
            [
              { value: 1 as WeekStart, label: 'Lunes' },
              { value: 0 as WeekStart, label: 'Domingo' },
            ] as const
          ).map(opt => {
            const selected = weekStart === opt.value;
            return (
              <Pressable
                key={opt.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setWeekStart(opt.value)}
                style={[
                  styles.segmentItem,
                  {
                    backgroundColor: selected
                      ? theme.colors.primary
                      : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <Text
                  style={{
                    color: selected
                      ? theme.colors.primaryText
                      : theme.colors.text,
                    fontWeight: '600',
                  }}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {permissions && !permissions.exactAlarms ? (
        <Card accent={theme.colors.danger}>
          <Text style={[styles.rowLabel, { color: theme.colors.text }]}>
            Recordatorios imprecisos
          </Text>
          <Text style={[styles.note, { color: theme.colors.textMuted }]}>
            Android no está dejando programar alarmas exactas, así que los avisos
            de entrega pueden llegar tarde. Concede el acceso especial para que
            suenen a la hora.
          </Text>
          <Button
            title="Abrir ajustes de alarmas"
            variant="secondary"
            onPress={() =>
              void getContainer().notifications.openExactAlarmSettings()
            }
            style={styles.permissionAction}
          />
        </Card>
      ) : null}

      <Card onPress={() => navigation.navigate('Semesters')}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={[styles.rowLabel, { color: theme.colors.text }]}>
              Semestres
            </Text>
            <Text style={{ color: theme.colors.textMuted, marginTop: 2 }}>
              Crear, activar y archivar periodos
            </Text>
          </View>
          <Text style={{ color: theme.colors.primary, fontSize: 22 }}>›</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: { fontSize: 16, fontWeight: '600' },
  note: { fontSize: 13.5, lineHeight: 20, marginTop: 6 },
  permissionAction: { marginTop: 14 },
  segment: { flexDirection: 'row', gap: 8, marginTop: 12 },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
});
