import type { Persistor } from 'redux-persist';

let authPersistor: Persistor | undefined;

export function configureAuthPersistence(persistor: Persistor) {
  authPersistor = persistor;
}

export async function flushAuthPersistence() {
  await authPersistor?.flush();
}
