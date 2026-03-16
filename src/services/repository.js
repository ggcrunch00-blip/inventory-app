import { isFirebaseConfigured } from './firebase';
import { createFirebaseRepository } from './firebaseRepository';
import { createMockRepository } from './mockRepository';

export function createRepository() {
  return isFirebaseConfigured ? createFirebaseRepository() : createMockRepository();
}
