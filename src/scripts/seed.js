#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')

console.log('🌱 IT Assets Inventory - Seed Data Generator')
console.log('============================================')

try {
  // Change to the project root directory
  const projectRoot = path.join(__dirname, '..', '..')
  process.chdir(projectRoot)
  
  console.log('📦 Installing dependencies (if needed)...')
  
  // Check if node_modules exists, if not run npm install
  const fs = require('fs')
  if (!fs.existsSync('node_modules')) {
    console.log('Installing npm packages...')
    execSync('npm install', { stdio: 'inherit' })
  }
  
  console.log('🚀 Running seed data generation...')
  
  // Run the TypeScript seed script using ts-node
  execSync('npx ts-node src/scripts/generate-seed-data.ts', { 
    stdio: 'inherit',
    env: { 
      ...process.env,
      NODE_ENV: 'development'
    }
  })
  
} catch (error) {
  console.error('❌ Error running seed script:', error.message)
  console.log('\n🔧 Troubleshooting:')
  console.log('1. Make sure MongoDB is running on localhost:27017')
  console.log('2. Set MONGODB_URI environment variable if using a different connection')
  console.log('3. Ensure you have proper database permissions')
  console.log('4. Check that all npm dependencies are installed')
  process.exit(1)
}