---
name: react
description: Guía de React 19 + TypeScript para esta app (hooks, componentes, estado, rendimiento, patrones). Úsala al escribir o refactorizar componentes, hooks personalizados, manejo de estado o efectos, y para evitar errores comunes de renders y dependencias.
---

# React 19 + TypeScript — CalendarMemory

Convenciones de React para este proyecto. Complementa a la skill **react-native** (estilos, navegación, APIs nativas viven allí).

## Componentes

- Componentes de función tipados; nada de clases.
- Un componente por archivo, nombre `PascalCase`, `export function`.
- Tipa props con `type Props = { ... }` (no `interface` salvo que se extienda). `children` → `PropsWithChildren`.
- Deriva valores en el render en lugar de duplicarlos en estado. Si algo se puede calcular de props/estado, no lo guardes en otro `useState`.

## Hooks — reglas

- Llama hooks solo en el nivel superior del componente o de otro hook; nunca dentro de condicionales, loops o callbacks.
- **`useEffect` solo para sincronizar con sistemas externos** (subscripciones, timers, red imperativa). No lo uses para transformar datos para el render — hazlo en el cuerpo del componente o con `useMemo`.
- Declara TODAS las dependencias reales en el array de deps. Si el linter marca una dependencia, la respuesta correcta casi nunca es silenciar la regla.
- Limpia efectos (return de cleanup) para timers, listeners y subscripciones.
- Con React 19, evita memoización prematura (`useMemo`/`useCallback`) — úsala solo ante un costo medido o para estabilizar deps/props de componentes memoizados.

## Hooks personalizados

- Extrae lógica con estado reutilizable a `useAlgo()` en `@shared/hooks` (transversal) o en `presentation/hooks` del feature (específico).
- Un hook devuelve datos y funciones; no renderiza. Nómbralo `use*`.

## Estado

- Local primero: `useState`/`useReducer`. Sube el estado solo cuando dos componentes deban compartirlo.
- Estado global de un feature → su carpeta `store/`. Estado global de app → `@app/store`.
- No pongas en un store lo que puede ser estado local o derivado.
- Para formularios/estado complejo con transiciones, prefiere `useReducer` sobre múltiples `useState`.

## Rendimiento

- Listas: keys estables y únicas (nunca el índice si la lista cambia de orden/tamaño). En RN usa `FlatList` (ver skill react-native).
- `React.memo` solo en componentes que re-renderizan seguido con las mismas props.
- Evita crear objetos/funciones nuevas inline como props de componentes memoizados (romperían el memo); estabilízalas con `useCallback`/`useMemo` cuando importe.

## TypeScript

- Sin `any`. Usa `unknown` + narrowing, genéricos o tipos precisos.
- Tipa eventos y refs correctamente. Deja que TS infiera el retorno cuando sea obvio.
- Tipos compartidos → `@shared/types`; entidades de dominio → `domain/entities` del feature.

## Errores comunes a evitar

- Efecto que hace `setState` provocando loop infinito (deps mal puestas).
- Estado que duplica props (usa el prop directamente).
- Actualizar estado a partir del valor anterior sin la forma funcional: usa `setX(prev => ...)`.
- Faltó cleanup de un listener/timer → fugas y warnings de "update on unmounted component".

## Verificación

Antes de terminar: `npx tsc --noEmit`, `npm run lint` y `npm test`. Sin imports/variables sin usar (ESLint los marca como error en este repo).
