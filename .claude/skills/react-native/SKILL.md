---
name: react-native
description: Guía para trabajar en esta app React Native (v0.86, TypeScript, arquitectura por capas). Úsala al crear pantallas, componentes, navegación, estilos, listas, o al depurar Metro, el bundler, permisos nativos o problemas de build de Android/iOS.
---

# React Native — CalendarMemory

App **React Native 0.86 + React 19 + TypeScript**, con arquitectura por capas (feature-first / clean architecture) bajo `src/`.

## Estructura y alias de importación

Importa **siempre por alias**, nunca con rutas relativas largas (`../../../`). Los alias están definidos en `babel.config.js` (runtime) y `tsconfig.json` (tipos) — deben mantenerse sincronizados:

| Alias | Carpeta | Contenido |
|-------|---------|-----------|
| `@app/*` | `src/app` | Entrada, providers globales, navegación raíz, store raíz |
| `@features/*` | `src/features` | Módulos de negocio (cada uno con `data/`, `domain/`, `presentation/`) |
| `@core/*` | `src/core` | Infra transversal: `api`, `config`, `di`, `errors`, `storage` |
| `@shared/*` | `src/shared` | Reutilizable sin lógica de negocio: `ui`, `hooks`, `utils`, `constants`, `types` |
| `@theme/*` | `src/theme` | Colores, tipografías, espaciados, tema |
| `@assets/*` | `src/assets` | `fonts`, `icons`, `images` |

**Regla de dependencias:** `features` puede usar `core`, `shared`, `theme`. `shared`/`core` NO importan de `features`. Dentro de un feature, `presentation → domain → data`; `domain` no importa de `presentation` ni de RN.

## Convenciones de código

- **Componentes**: funciones con `export function Nombre()`. Un componente por archivo, `PascalCase.tsx`.
- **Estilos**: `StyleSheet.create` al pie del archivo. No estilos inline salvo valores dinámicos. Toma colores/espaciados de `@theme`, no hardcodees hex.
- **Props**: tipa con `type Props = { ... }`. Para `children`, usa `PropsWithChildren`.
- **Listas**: `FlatList`/`SectionList` con `keyExtractor`; nunca `.map()` para listas largas. Memoiza `renderItem` e ítems con `React.memo`.
- **Safe area**: usa `react-native-safe-area-context` (`SafeAreaView`/`useSafeAreaInsets`), ya instalado. No uses el `SafeAreaView` de `react-native`.
- **Plataforma**: `Platform.select`/`Platform.OS` para diferencias; sufijos `.ios.tsx`/`.android.tsx` para divergencias grandes.
- **Texto**: todo string visible dentro de `<Text>` (RN no renderiza texto suelto).

## Navegación

`@app/navigation/RootNavigator` es el punto único de navegación. Hoy es un stub. Si se agrega una librería de navegación, la elección por defecto es **React Navigation** (`@react-navigation/native` + native-stack): instala el core, `react-native-screens` y `react-native-safe-area-context` (ya está), y envuelve en `NavigationContainer` dentro de `@app/providers`.

## Providers globales

`@app/providers` (`AppProviders`) es donde se anidan TODOS los contextos globales (safe area, tema, query client, store). Agrega nuevos providers aquí, no en `App.tsx`.

## Comandos

```bash
npm start              # Metro bundler
npm run android        # correr en Android
npm run ios            # correr en iOS
npm test               # Jest
npm run lint           # ESLint
npx tsc --noEmit       # chequeo de tipos
```

## Depuración frecuente

- **"Unable to resolve module @xxx"**: alias faltante o desincronizado entre `babel.config.js` y `tsconfig.json`, o falta reiniciar Metro con caché limpia: `npm start -- --reset-cache`.
- **Cambios de `babel.config.js` no aplican**: siempre reinicia Metro con `--reset-cache`.
- **Nuevo paquete nativo no funciona**: en iOS corre `cd ios && pod install`. Rebuild completo tras añadir dependencias nativas.
- **Type-check limpio pero Metro falla**: TS y Babel resuelven distinto; verifica que el alias exista en AMBOS archivos.

## Al terminar un cambio

Corre `npx tsc --noEmit`, `npm run lint` y `npm test` antes de dar por terminado. No dejes imports sin usar (ESLint los marca como error).
