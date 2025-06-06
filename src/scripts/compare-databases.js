#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const mongoose = require('mongoose')

async function compareDatabases() {
  console.log('🔍 Comparing original and test databases...')
  
  try {
    // Connect to original database
    const originalDB = mongoose.createConnection('mongodb://localhost:27017/inventory')
    await originalDB.asPromise()
    console.log('✅ Connected to original database')
    
    // Connect to test database
    const testDB = mongoose.createConnection('mongodb://localhost:27017/inventory_test')
    await testDB.asPromise()
    console.log('✅ Connected to test database')

    // Compare catalogs
    console.log('\n📁 Comparing Catalogs:')
    const originalCatalogs = await originalDB.db.collection('catalogs').find({}, {projection: {name: 1, category: 1}}).sort({name: 1}).toArray()
    const testCatalogs = await testDB.db.collection('catalogs').find({}, {projection: {name: 1, category: 1}}).sort({name: 1}).toArray()
    
    console.log(`  Original: ${originalCatalogs.length} catalogs`)
    console.log(`  Test: ${testCatalogs.length} catalogs`)
    originalCatalogs.forEach(cat => console.log(`    - ${cat.name} (${cat.category})`))
    
    // Compare SKUs
    console.log('\n🏷️ Comparing SKUs:')
    const originalSKUs = await originalDB.db.collection('skus').find({}, {projection: {skuCode: 1, name: 1, manufacturer: 1}}).sort({skuCode: 1}).toArray()
    const testSKUs = await testDB.db.collection('skus').find({}, {projection: {skuCode: 1, name: 1, manufacturer: 1}}).sort({skuCode: 1}).toArray()
    
    console.log(`  Original: ${originalSKUs.length} SKUs`)
    console.log(`  Test: ${testSKUs.length} SKUs`)
    originalSKUs.forEach(sku => console.log(`    - ${sku.skuCode}: ${sku.name} (${sku.manufacturer})`))
    
    // Compare Assets counts and total value
    console.log('\n💻 Comparing Assets:')
    const originalAssets = await originalDB.db.collection('assets').find({}).toArray()
    const testAssets = await testDB.db.collection('assets').find({}).toArray()
    
    const originalValue = originalAssets.reduce((sum, asset) => sum + (asset.financial?.capex?.purchasePrice || 0), 0)
    const testValue = testAssets.reduce((sum, asset) => sum + (asset.financial?.capex?.purchasePrice || 0), 0)
    
    console.log(`  Original: ${originalAssets.length} assets, $${originalValue.toLocaleString()} total value`)
    console.log(`  Test: ${testAssets.length} assets, $${testValue.toLocaleString()} total value`)
    
    // Sample a few assets to compare details
    console.log('\n🔍 Sample Asset Comparison:')
    for (let i = 0; i < Math.min(3, originalAssets.length); i++) {
      const orig = originalAssets[i]
      const test = testAssets[i]
      console.log(`  Asset ${i + 1}:`)
      console.log(`    Original: ${orig.assetTag} - ${orig.name} ($${orig.financial?.capex?.purchasePrice})`)
      console.log(`    Test:     ${test.assetTag} - ${test.name} ($${test.financial?.capex?.purchasePrice})`)
      console.log(`    Match: ${orig.assetTag === test.assetTag && orig.name === test.name ? '✅' : '❌'}`)
    }
    
    // Check if data matches
    const catalogsMatch = originalCatalogs.length === testCatalogs.length
    const skusMatch = originalSKUs.length === testSKUs.length
    const assetsMatch = originalAssets.length === testAssets.length && originalValue === testValue
    
    console.log('\n🎯 Comparison Result:')
    console.log(`  Catalogs match: ${catalogsMatch ? '✅' : '❌'}`)
    console.log(`  SKUs match: ${skusMatch ? '✅' : '❌'}`)
    console.log(`  Assets match: ${assetsMatch ? '✅' : '❌'}`)
    console.log(`  Overall: ${catalogsMatch && skusMatch && assetsMatch ? '✅ DATABASES MATCH' : '❌ DATABASES DIFFER'}`)

    await originalDB.close()
    await testDB.close()
    
  } catch (error) {
    console.error('❌ Error comparing databases:', error)
    process.exit(1)
  }
}

compareDatabases()
  .then(() => {
    console.log('✅ Database comparison completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Database comparison failed:', error)
    process.exit(1)
  })