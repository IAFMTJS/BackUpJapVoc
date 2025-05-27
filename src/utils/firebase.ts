import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User as FirebaseUser,
  type UserCredential,
  type AuthError,
  type Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator, 
  enableIndexedDbPersistence,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  onSnapshot,
  type DocumentReference,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Firestore
} from 'firebase/firestore';
import { 
  getFunctions, 
  connectFunctionsEmulator,
  type Functions 
} from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAj3ekprS0FDdSKLvC1vmfY1J1nhF8k4pE",
  authDomain: "jappylaunch.firebaseapp.com",
  projectId: "jappylaunch",
  storageBucket: "jappylaunch.firebasestorage.app",
  messagingSenderId: "833726317843",
  appId: "1:833726317843:web:9dcf49af8b5cf5843946e6"
};

// Debug log to check configuration
console.log('Starting Firebase initialization...', {
  config: {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey ? '***' : undefined // Hide API key in logs
  },
  environment: process.env.NODE_ENV,
  timestamp: new Date().toISOString()
});

let app;
let auth;
let db: ReturnType<typeof getFirestore>;
let functions: ReturnType<typeof getFunctions>;

try {
  // Initialize Firebase
  console.log('Attempting to initialize Firebase app...');
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');

  // Initialize services
  console.log('Initializing Firebase services...');
  auth = getAuth(app);
  console.log('Firebase Auth initialized');
  
  db = getFirestore(app);
  console.log('Firestore initialized');
  
  functions = getFunctions(app);
  console.log('Firebase Functions initialized');

  // Enable persistence for offline support (modular API)
  console.log('Attempting to enable Firestore persistence...');
  enableIndexedDbPersistence(db)
    .then(() => console.log('Firestore persistence enabled successfully'))
    .catch((err: unknown) => {
      const code = typeof err === 'object' && err !== null && 'code' in err ? (err as any).code : undefined;
      const message = err instanceof Error ? err.message : undefined;
      const name = typeof err === 'object' && err !== null && 'name' in err ? (err as any).name : undefined;
      console.warn('Firestore persistence setup warning:', {
        code,
        message,
        name
      });
      if (code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (code === 'unimplemented') {
        console.warn('The current browser does not support persistence.');
      } else {
        console.error('Error enabling persistence:', err);
      }
    });

  // Development environment setup
  if (process.env.NODE_ENV === 'development') {
    console.log('Development environment detected');
    // Connect to emulators if running locally
    if (process.env.REACT_APP_USE_EMULATORS === 'true') {
      console.log('Connecting to Firebase emulators...');
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectFunctionsEmulator(functions, 'localhost', 5001);
      console.log('Connected to Firebase emulators successfully');
    }
  }

  // Security settings for auth
  console.log('Configuring Firebase Auth settings...');
  auth.useDeviceLanguage();
  auth.settings.appVerificationDisabledForTesting = process.env.NODE_ENV === 'development';
  console.log('Firebase Auth settings configured');

} catch (error) {
  console.error('Critical error during Firebase initialization:', {
    error,
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });
  throw error;
}

export { 
  auth, 
  db, 
  functions,
  // Auth exports
  signInWithEmailAndPassword as signInWithEmailAndPassword,
  createUserWithEmailAndPassword as createUserWithEmailAndPassword,
  signOut as signOut,
  onAuthStateChanged as onAuthStateChanged,
  updateProfile as updateProfile,
  sendPasswordResetEmail as sendPasswordResetEmail,
  updatePassword as updatePassword,
  deleteUser as deleteUser,
  reauthenticateWithCredential as reauthenticateWithCredential,
  EmailAuthProvider as EmailAuthProvider,
  // Firestore exports
  doc as doc,
  getDoc as getDoc,
  getDocs as getDocs,
  setDoc as setDoc,
  updateDoc as updateDoc,
  collection as collection,
  query as query,
  where as where,
  orderBy as orderBy,
  limit as limit,
  startAfter as startAfter,
  Timestamp as Timestamp,
  increment as increment,
  arrayUnion as arrayUnion,
  arrayRemove as arrayRemove,
  deleteDoc as deleteDoc,
  onSnapshot as onSnapshot,
};

// Re-export types with type keyword
export type {
  FirebaseUser,
  UserCredential,
  AuthError,
  Auth,
  DocumentReference,
  DocumentData,
  QueryDocumentSnapshot,
  Firestore,
  Functions
};

export default app; 