// Run Seed Script
// This file makes seedDatabase available globally in the browser

import { seedDatabase } from './seedData';

/**
 * Run the seed script
 * Call this function to populate your Firestore with sample data
 */
export const runSeed = async () => {
  console.log('🚀 Starting database seed...');
  try {
    await seedDatabase();
    alert('✅ Database seeded successfully! Check the console for details.');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    alert('❌ Error seeding database. Check the console for details.');
  }
};

// Make it available globally in browser for console access
if (typeof window !== 'undefined') {
  window.runSeed = runSeed;
  window.seedDatabase = seedDatabase; // Also expose the direct function
  console.log('💡 To seed the database, run: window.runSeed() or window.seedDatabase()');
}

