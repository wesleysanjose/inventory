#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

// Simple connection function
async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-mgmt'
  
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

async function exportCurrentData() {
  console.log('📤 Exporting current database data...')
  
  try {
    await connectDB()

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray()
    const exportData = {}
    
    for (const collection of collections) {
      const collectionName = collection.name
      console.log(`📋 Exporting ${collectionName}...`)
      
      const data = await mongoose.connection.db.collection(collectionName).find({}).toArray()
      exportData[collectionName] = data
      console.log(`  ✅ Exported ${data.length} documents from ${collectionName}`)
    }

    // Write to file
    const exportPath = path.join(__dirname, 'exported-seed-data.json')
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2))
    
    console.log('\n🎉 Export completed!')
    console.log(`📁 Data saved to: ${exportPath}`)
    
    // Show summary
    let totalDocs = 0
    for (const [collectionName, data] of Object.entries(exportData)) {
      console.log(`  📊 ${collectionName}: ${data.length} documents`)
      totalDocs += data.length
    }
    console.log(`📈 Total documents exported: ${totalDocs}`)

  } catch (error) {
    console.error('❌ Error exporting data:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
  }
}

// Run the export
exportCurrentData()
  .then(() => {
    console.log('✅ Export finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Export failed:', error)
    process.exit(1)
  })