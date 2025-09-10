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

// Generate Prisma client
console.log('🗄️  Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated.\n');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}

// Push database schema
console.log('🗄️  Setting up database...');
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database schema pushed.\n');
} catch (error) {
  console.error('❌ Failed to push database schema:', error.message);
  console.log('Please make sure your DATABASE_URL is correct in .env.local\n');
  process.exit(1);
}

console.log('🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Update your .env.local file with your configuration');
console.log('2. Set up your AI service API keys (at least one required)');
console.log('3. Configure OAuth providers (optional)');
console.log('4. Run "npm run dev" to start the development server');
console.log('\nFor detailed setup instructions, see README.md');
