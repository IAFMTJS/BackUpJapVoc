const { createSimpleAdmin } = require('../dist/utils/admin');

createSimpleAdmin()
  .then(() => {
    console.log('Admin user created!');
    console.log('Email: admin@jappylaunch.com');
    console.log('Password: admin123');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create admin user:', error);
    process.exit(1);
  }); 