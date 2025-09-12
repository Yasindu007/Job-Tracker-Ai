#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Job Tracker & AI Resume Assistant...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  const envExample = fs.readFileSync(path.join(process.cwd(), 'env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env.local created. Please update it with your configuration.\n');
} else {
  console.log('✅ .env.local already exists.\n');
}

// Install dependencies

console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed.\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

console.log('🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Update your .env.local file with your configuration');
console.log('   - For local PostgreSQL, your DATABASE_URL will look like: "postgresql://USER:PASSWORD@localhost:5432/job_tracker"');
console.log('   - For cloud databases (like Supabase/Neon), it often needs "?sslmode=require" at the end.');
console.log('2. Run `npx prisma migrate dev` to create a migration and apply it to the database.');
console.log('   (Or `npm run db:push` for quick prototyping without migrations)');
console.log('3. Set up your AI service API keys (at least one required)');
console.log('4. Configure OAuth providers (optional)');
console.log('5. Run `npm run dev` to start the development server');
console.log('\nFor detailed setup instructions, see README.md');
