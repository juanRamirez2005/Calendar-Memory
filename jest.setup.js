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
const notifeeSettings = { authorizationStatus: 1, android: { alarm: 1 } };
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    requestPermission: jest.fn(async () => notifeeSettings),
    getNotificationSettings: jest.fn(async () => notifeeSettings),
    openAlarmPermissionSettings: jest.fn(async () => undefined),
    createChannel: jest.fn(async () => 'ch'),
    createTriggerNotification: jest.fn(async () => 'id'),
    cancelTriggerNotification: jest.fn(async () => undefined),
  },
  AndroidImportance: { LOW: 2, DEFAULT: 3, HIGH: 4 },
  AndroidNotificationSetting: { NOT_SUPPORTED: -1, DISABLED: 0, ENABLED: 1 },
  AuthorizationStatus: { NOT_DETERMINED: -1, DENIED: 0, AUTHORIZED: 1 },
  TriggerType: { TIMESTAMP: 0 },
}));

// safe-area-context trae su propio mock oficial (export default).
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
