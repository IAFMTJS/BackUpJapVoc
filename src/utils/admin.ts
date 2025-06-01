import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, createUserWithEmailAndPassword } from './firebase';

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin';
  createdAt: string;
  lastLogin: string;
}

export async function createAdminUser(uid: string, email: string): Promise<void> {
  const adminRef = doc(db, 'users', uid);
  
  // Create admin user document
  await setDoc(adminRef, {
    email,
    role: 'admin',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  });
}

export async function isAdmin(uid: string): Promise<boolean> {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    return false;
  }
  
  const userData = userDoc.data();
  return userData.role === 'admin';
}

export async function createSimpleAdmin() {
  try {
    // Create admin user with simple credentials
    const userCredential = await createUserWithEmailAndPassword(auth, 'admin@jappylaunch.com', 'admin123');
    const user = userCredential.user;
    
    // Set admin role in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });

    console.log('Admin user created successfully:', {
      email: 'admin@jappylaunch.com',
      password: 'admin123'
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
} 