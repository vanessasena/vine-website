const fs = require('fs');
const path = require('path');

// Directory paths
const checkInsDir = path.join(__dirname, 'src', 'app', 'api', 'check-ins');
const visitorChildrenDir = path.join(__dirname, 'src', 'app', 'api', 'visitor-children');

// Create directories
console.log('Creating API route directories...');
fs.mkdirSync(checkInsDir, { recursive: true });
fs.mkdirSync(visitorChildrenDir, { recursive: true });
console.log('✓ Directories created');

// Move/copy check-ins route
console.log('Setting up check-ins route...');
const checkInsSource = path.join(__dirname, 'src', 'app', 'api', 'check-ins.ts');
const checkInsDest = path.join(checkInsDir, 'route.ts');
if (fs.existsSync(checkInsSource)) {
  fs.copyFileSync(checkInsSource, checkInsDest);
  fs.unlinkSync(checkInsSource);
  console.log('✓ check-ins route.ts created');
} else {
  console.log('⚠ check-ins.ts not found, skipping');
}

// Move/copy visitor-children route
console.log('Setting up visitor-children route...');
const visitorSource = path.join(__dirname, 'src', 'app', 'api', 'visitor-children-route.ts');
const visitorDest = path.join(visitorChildrenDir, 'route.ts');
if (fs.existsSync(visitorSource)) {
  fs.copyFileSync(visitorSource, visitorDest);
  fs.unlinkSync(visitorSource);
  console.log('✓ visitor-children route.ts created');
} else {
  console.log('⚠ visitor-children-route.ts not found, skipping');
}

console.log('\n✓ Setup complete!');
console.log('\nNext steps:');
console.log('1. Run the database schema: supabase-checkin-schema.sql');
console.log('2. Assign teacher role to users who should manage check-ins');
console.log('3. Implement UI components for the check-in interface');
