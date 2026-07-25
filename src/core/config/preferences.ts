// src/core/config/preferences.ts
import type { KeyValueStore } from '@core/storage/keyValue';
import type { ThemeMode } from '@theme/index';

/** 0 = domingo, 1 = lunes. */
export type WeekStart = 0 | 1;

const KEYS = {
  themeMode: 'pref.themeMode',
  weekStart: 'pref.weekStart',
} as const;

/** Fachada tipada sobre el almacén clave-valor para las preferencias. */
export class Preferences {
  constructor(private readonly kv: KeyValueStore) {}

  getThemeMode(): ThemeMode {
    return this.kv.getString(KEYS.themeMode) === 'dark' ? 'dark' : 'light';
  }

  setThemeMode(mode: ThemeMode): void {
    this.kv.set(KEYS.themeMode, mode);
  }

  getWeekStart(): WeekStart {
    return this.kv.getNumber(KEYS.weekStart) === 0 ? 0 : 1;
  }

  setWeekStart(value: WeekStart): void {
    this.kv.set(KEYS.weekStart, value);
  }
}
