const { createAdmin } = require('../dist/scripts/createAdmin');

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node create-admin.js <email> <password>');
  process.exit(1);
}

createAdmin(email, password)
  .then(() => {
    console.log('Admin user created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create admin user:', error);
    process.exit(1);
  }); 