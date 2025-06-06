#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

// Simple connection function
async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory'
  
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(uri)
      console.log('✅ Connected to MongoDB')
    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message)
      throw error
    }
  }
}

async function seedFromExportedData() {
  console.log('🌱 Starting seed from exported data...')
  
  try {
    await connectDB()

    // Check if exported data file exists
    const exportPath = path.join(__dirname, 'exported-seed-data.json')
    if (!fs.existsSync(exportPath)) {
      console.error('❌ Exported data file not found!')
      console.log('💡 Please run: npm run export-data first')
      process.exit(1)
    }

    // Load exported data
    console.log('📖 Loading exported data...')
    const exportedData = JSON.parse(fs.readFileSync(exportPath, 'utf8'))
    
    // Clear existing collections
    console.log('🧹 Clearing existing data...')
    const collections = await mongoose.connection.db.listCollections().toArray()
    
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({})
    }
    console.log('✅ Existing data cleared')

    // Import data
    let totalImported = 0
    for (const [collectionName, data] of Object.entries(exportedData)) {
      if (data && data.length > 0) {
        console.log(`📥 Importing ${data.length} documents to ${collectionName}...`)
        
        // Convert string IDs back to ObjectIds for proper relationships
        const processedData = data.map(doc => {
          const processed = { ...doc }
          
          // Convert _id back to ObjectId
          if (processed._id && typeof processed._id === 'string') {
            processed._id = new mongoose.Types.ObjectId(processed._id)
          }
          
          // Convert reference fields back to ObjectIds
          if (processed.catalogId && typeof processed.catalogId === 'string') {
            processed.catalogId = new mongoose.Types.ObjectId(processed.catalogId)
          }
          if (processed.skuId && typeof processed.skuId === 'string') {
            processed.skuId = new mongoose.Types.ObjectId(processed.skuId)
          }
          
          // Convert date strings back to Date objects
          if (processed.createdAt && typeof processed.createdAt === 'string') {
            processed.createdAt = new Date(processed.createdAt)
          }
          if (processed.updatedAt && typeof processed.updatedAt === 'string') {
            processed.updatedAt = new Date(processed.updatedAt)
          }
          
          // Convert nested date fields
          if (processed.pricing?.effectiveDate && typeof processed.pricing.effectiveDate === 'string') {
            processed.pricing.effectiveDate = new Date(processed.pricing.effectiveDate)
          }
          if (processed.pricing?.endDate && typeof processed.pricing.endDate === 'string') {
            processed.pricing.endDate = new Date(processed.pricing.endDate)
          }
          
          if (processed.deployment?.goLiveDate && typeof processed.deployment.goLiveDate === 'string') {
            processed.deployment.goLiveDate = new Date(processed.deployment.goLiveDate)
          }
          if (processed.deployment?.retirementDate && typeof processed.deployment.retirementDate === 'string') {
            processed.deployment.retirementDate = new Date(processed.deployment.retirementDate)
          }
          
          if (processed.financial?.capex?.purchaseDate && typeof processed.financial.capex.purchaseDate === 'string') {
            processed.financial.capex.purchaseDate = new Date(processed.financial.capex.purchaseDate)
          }
          
          // Convert warranty and maintenance contract dates
          if (processed.financial?.opex?.warranty) {
            processed.financial.opex.warranty = processed.financial.opex.warranty.map(contract => ({
              ...contract,
              startDate: contract.startDate ? new Date(contract.startDate) : contract.startDate,
              endDate: contract.endDate ? new Date(contract.endDate) : contract.endDate
            }))
          }
          
          if (processed.financial?.opex?.maintenance) {
            processed.financial.opex.maintenance = processed.financial.opex.maintenance.map(contract => ({
              ...contract,
              startDate: contract.startDate ? new Date(contract.startDate) : contract.startDate,
              endDate: contract.endDate ? new Date(contract.endDate) : contract.endDate
            }))
          }
          
          return processed
        })
        
        await mongoose.connection.db.collection(collectionName).insertMany(processedData)
        console.log(`  ✅ Imported ${processedData.length} documents to ${collectionName}`)
        totalImported += processedData.length
      }
    }

    // Calculate summary
    const catalogCount = await mongoose.connection.db.collection('catalogs').countDocuments()
    const skuCount = await mongoose.connection.db.collection('skus').countDocuments()
    const assetCount = await mongoose.connection.db.collection('assets').countDocuments()
    
    // Calculate total value
    const assets = await mongoose.connection.db.collection('assets').find({}).toArray()
    const totalValue = assets.reduce((sum, asset) => {
      return sum + (asset.financial?.capex?.purchasePrice || 0)
    }, 0)

    console.log('\n🎉 Seed from exported data completed!')
    console.log('📊 Summary:')
    console.log(`  📁 Catalogs: ${catalogCount}`)
    console.log(`  🏷️  SKUs: ${skuCount}`)
    console.log(`  💻 Assets: ${assetCount}`)
    console.log(`  💰 Total Value: $${totalValue.toLocaleString()}`)
    console.log(`📈 Total documents imported: ${totalImported}`)

  } catch (error) {
    console.error('❌ Error seeding from exported data:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
  }
}

// Run the seed script
seedFromExportedData()
  .then(() => {
    console.log('✅ Seed from exported data finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seed from exported data failed:', error)
    process.exit(1)
  })