#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const mongoose = require('mongoose')

async function checkCurrentValue() {
  console.log('💰 Checking current database total value...')
  
  try {
    await mongoose.connect('mongodb://localhost:27017/inventory')
    console.log('✅ Connected to MongoDB')

    const assets = await mongoose.connection.db.collection('assets').find({}).toArray()
    const totalValue = assets.reduce((sum, asset) => {
      const price = asset.financial?.capex?.purchasePrice || 0
      return sum + price
    }, 0)
    
    console.log(`📊 Current Database Stats:`)
    console.log(`  💻 Total Assets: ${assets.length}`)
    console.log(`  💰 Total Value: $${totalValue.toLocaleString()}`)
    
    // Show some sample assets with values
    console.log('\n🔍 Sample Assets:')
    assets.slice(0, 5).forEach((asset, i) => {
      console.log(`  ${i + 1}. ${asset.assetTag} - ${asset.name}: $${(asset.financial?.capex?.purchasePrice || 0).toLocaleString()}`)
    })
    
    console.log(`\n📈 Total count: ${assets.length} assets`)
    console.log(`💵 Grand Total: $${totalValue.toLocaleString()}`)
    
    await mongoose.connection.close()
    
  } catch (error) {
    console.error('❌ Error checking current value:', error)
    process.exit(1)
  }
}

checkCurrentValue()
  .then(() => {
    console.log('✅ Current value check completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Current value check failed:', error)
    process.exit(1)
  })