import { auth, createUserWithEmailAndPassword } from '../utils/firebase';
import { createAdminUser } from '../utils/admin';

async function createAdmin(email: string, password: string) {
  try {
    // Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Set up admin role in Firestore
    await createAdminUser(user.uid, email);
    
    console.log('Admin user created successfully:', {
      uid: user.uid,
      email: user.email
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

// Example usage:
// createAdmin('admin@example.com', 'your-secure-password')
//   .then(() => console.log('Admin creation complete'))
//   .catch(console.error);

export default createAdmin; 