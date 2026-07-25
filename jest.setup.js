/* Mocks de módulos nativos para que los tests corran en Node (sin device). */

// op-sqlite: base en memoria trivial; devuelve resultados vacíos.
jest.mock('@op-engineering/op-sqlite', () => {
  const makeQueryable = () => ({
    execute: jest.fn(async () => ({ rows: [], rowsAffected: 0 })),
  });
  return {
    open: jest.fn(() => ({
      execute: jest.fn(async () => ({ rows: [], rowsAffected: 0 })),
      transaction: jest.fn(async fn => {
        await fn(makeQueryable());
      }),
      close: jest.fn(),
    })),
  };
});

// notifee: no-op en tests (sin módulo nativo).
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    requestPermission: jest.fn(async () => ({})),
    createChannel: jest.fn(async () => 'ch'),
    createTriggerNotification: jest.fn(async () => 'id'),
    cancelTriggerNotification: jest.fn(async () => undefined),
  },
  AndroidImportance: { LOW: 2, DEFAULT: 3, HIGH: 4 },
  TriggerType: { TIMESTAMP: 0 },
}));

// safe-area-context trae su propio mock oficial (export default).
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
