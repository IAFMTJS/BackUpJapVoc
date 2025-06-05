import { resetDatabase } from '../src/utils/indexedDB';

async function main() {
  try {
    console.log('Starting database reset...');
    await resetDatabase();
    console.log('Database reset completed successfully');
  } catch (error) {
    console.error('Error during database reset:', error);
    process.exit(1);
  }
}

main(); 