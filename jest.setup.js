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

// safe-area-context trae su propio mock oficial (export default).
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
