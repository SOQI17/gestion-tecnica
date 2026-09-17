import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut as authSignOut } from "firebase/auth";

// Configuración de Firebase provista directamente por el usuario
export const firebaseConfig = {
  apiKey: "AIzaSyD8dazEcOdDSyyzRmlMu2O46jsObsAuZjo",
  authDomain: "mtorimec.firebaseapp.com",
  projectId: "mtorimec",
  storageBucket: "mtorimec.firebasestorage.app",
  messagingSenderId: "927102023453",
  appId: "1:927102023453:web:5af9acce750582a25b13f4"
};

import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from "firebase/firestore";

// Inicialización
const app = initializeApp(firebaseConfig);

// Inicializar Firestore con persistencia de caché local IndexedDB multi-pestaña para máxima velocidad.
// En navegación privada (Safari/algunas configs de Chrome) IndexedDB puede estar bloqueado o
// restringido, y esta inicialización puede fallar de forma síncrona ANTES de que React monte la
// app -- sin este try/catch, ese fallo deja la página completamente en blanco. Si falla, seguimos
// con Firestore en memoria (sin caché offline, pero totalmente funcional).
function initDb() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (e) {
    console.warn("No se pudo habilitar la persistencia local de Firestore (posible navegación privada). Continuando sin caché offline.", e);
    return getFirestore(app);
  }
}

export const db = initDb();
export const auth = getAuth(app);

/**
 * Crea un nuevo usuario en Firebase Auth sin cerrar la sesión del usuario actual (Admin).
 * Utiliza una instancia secundaria efímera de Firebase App.
 */
export async function registerFirebaseUserSecondary(email: string, password: string): Promise<string> {
  const secondaryAppName = `SecondaryApp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  try {
    const secondaryAuth = getAuth(secondaryApp);
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = userCredential.user.uid;
    await authSignOut(secondaryAuth);
    return uid;
  } finally {
    try {
      await deleteApp(secondaryApp);
    } catch (e) {
      console.warn("Error deleting secondary app:", e);
    }
  }
}

// Tipos de operaciones según los requerimientos del sistema
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Controlador de errores de Firestore para diagnóstico robusto
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
