// src/shared/utils/id.ts

/**
 * Genera un UUID v4. Suficiente para identificadores locales de un solo
 * dispositivo; no depende de módulos nativos de criptografía.
 */
export function createId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const rand = (Math.random() * 16) | 0;
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}
