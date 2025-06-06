#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const mongoose = require('mongoose')

async function checkFullDatabase() {
  console.log('🔍 Checking FULL current database state...')
  
  try {
    await mongoose.connect('mongodb://localhost:27017/inventory-mgmt')
    console.log('✅ Connected to MongoDB')

    // Check all collections
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('\n📋 Available collections:')
    collections.forEach(col => console.log(`  - ${col.name}`))

    // Count all documents
    console.log('\n📊 Document counts:')
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments()
      console.log(`  ${collection.name}: ${count} documents`)
    }

    // Get detailed asset information
    const assets = await mongoose.connection.db.collection('assets').find({}).toArray()
    const totalValue = assets.reduce((sum, asset) => {
      const price = asset.financial?.capex?.purchasePrice || 0
      return sum + price
    }, 0)
    
    // Get current depreciated value
    const now = new Date()
    let currentValue = 0
    assets.forEach(asset => {
      const purchasePrice = asset.financial?.capex?.purchasePrice || 0
      const depreciationYears = asset.financial?.capex?.depreciationPeriodYears || 4
      const goLiveDate = asset.deployment?.goLiveDate ? new Date(asset.deployment.goLiveDate) : new Date(asset.financial?.capex?.purchaseDate || now)
      
      const monthsElapsed = Math.max(0, (now.getTime() - goLiveDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
      const monthlyDepreciation = purchasePrice / (depreciationYears * 12)
      const totalDepreciation = Math.min(purchasePrice, monthlyDepreciation * monthsElapsed)
      const assetCurrentValue = Math.max(0, purchasePrice - totalDepreciation)
      
      currentValue += assetCurrentValue
    })
    
    console.log('\n💰 Financial Summary:')
    console.log(`  💻 Total Assets: ${assets.length}`)
    console.log(`  💵 Total Purchase Value: $${totalValue.toLocaleString()}`)
    console.log(`  📉 Current Depreciated Value: $${currentValue.toLocaleString(2)}`)
    
    // Show asset distribution by SKU
    const skuCounts = {}
    assets.forEach(asset => {
      const skuId = asset.skuId?.toString() || 'unknown'
      skuCounts[skuId] = (skuCounts[skuId] || 0) + 1
    })
    
    console.log('\n📈 Asset distribution by SKU:')
    const skus = await mongoose.connection.db.collection('skus').find({}).toArray()
    skus.forEach(sku => {
      const count = skuCounts[sku._id.toString()] || 0
      console.log(`  ${sku.skuCode}: ${count} assets`)
    })
    
    await mongoose.connection.close()
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
    process.exit(1)
  }
}

checkFullDatabase()
  .then(() => {
    console.log('✅ Full database check completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Database check failed:', error)
    process.exit(1)
  })