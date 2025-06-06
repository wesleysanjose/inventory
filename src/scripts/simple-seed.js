#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const mongoose = require('mongoose')

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

async function createSeedData() {
  console.log('🌱 Starting simple seed data generation...')
  
  try {
    await connectDB()

    // Clear existing collections
    console.log('🧹 Clearing existing data...')
    const collections = await mongoose.connection.db.listCollections().toArray()
    
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({})
    }
    console.log('✅ Existing data cleared')

    // Create some basic catalogs
    console.log('📁 Creating catalogs...')
    const catalogsCollection = mongoose.connection.db.collection('catalogs')
    
    const catalogs = [
      {
        name: 'Enterprise Servers',
        category: 'server',
        description: 'High-performance rack-mounted servers',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Network Switches',
        category: 'network-switch',
        description: 'Enterprise network switches',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Firewalls',
        category: 'firewall',
        description: 'Network security appliances',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    
    const catalogResult = await catalogsCollection.insertMany(catalogs)
    console.log(`✅ Created ${catalogResult.insertedCount} catalogs`)

    // Create some basic SKUs
    console.log('🏷️ Creating SKUs...')
    const skusCollection = mongoose.connection.db.collection('skus')
    
    const skus = [
      {
        catalogId: catalogResult.insertedIds[0],
        skuCode: 'HP-DL380-G10',
        name: 'HP ProLiant DL380 Gen10',
        modelName: 'DL380 Gen10',
        description: 'Enterprise rack server',
        manufacturer: 'HP',
        status: 'active',
        specifications: {
          cpu: 'Intel Xeon Silver 4210R',
          memory: '32GB DDR4',
          storage: '2x 1TB SAS'
        },
        pricing: {
          msrp: 4500,
          currency: 'USD',
          effectiveDate: new Date('2024-01-01')
        },
        warranty: {
          standard: 3,
          support: 'Next Business Day'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalogId: catalogResult.insertedIds[1],
        skuCode: 'CISCO-C9300-48P',
        name: 'Cisco Catalyst 9300 48-Port',
        modelName: 'C9300-48P',
        description: 'Enterprise switch',
        manufacturer: 'Cisco',
        status: 'active',
        specifications: {
          networkPorts: 48,
          powerSupply: '715W'
        },
        pricing: {
          msrp: 8500,
          currency: 'USD',
          effectiveDate: new Date('2024-01-01')
        },
        warranty: {
          standard: 1,
          support: 'Next Business Day'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalogId: catalogResult.insertedIds[2],
        skuCode: 'PALO-PA-3220',
        name: 'Palo Alto PA-3220',
        modelName: 'PA-3220',
        description: 'Next-generation firewall',
        manufacturer: 'Palo Alto',
        status: 'active',
        specifications: {
          networkPorts: 16,
          powerSupply: '200W'
        },
        pricing: {
          msrp: 12000,
          currency: 'USD',
          effectiveDate: new Date('2024-01-01')
        },
        warranty: {
          standard: 1,
          support: 'Next Business Day'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    
    const skuResult = await skusCollection.insertMany(skus)
    console.log(`✅ Created ${skuResult.insertedCount} SKUs`)

    // Create some basic assets
    console.log('💻 Creating assets...')
    const assetsCollection = mongoose.connection.db.collection('assets')
    
    const datacenters = ['US-East-1', 'US-West-2', 'EU-Central-1']
    const cities = ['New York', 'San Francisco', 'Frankfurt']
    const countries = ['USA', 'USA', 'Germany']
    const environments = ['production', 'staging', 'development']
    
    const assets = []
    let assetCounter = 1
    
    // Create 10 assets per SKU
    for (let i = 0; i < skus.length; i++) {
      const sku = skus[i]
      const skuId = skuResult.insertedIds[i]
      
      for (let j = 0; j < 10; j++) {
        const dcIndex = Math.floor(Math.random() * datacenters.length)
        const purchaseDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        const goLiveDate = new Date(purchaseDate)
        goLiveDate.setDate(goLiveDate.getDate() + Math.floor(Math.random() * 14) + 1)
        
        const asset = {
          skuId: skuId,
          assetTag: `AST-${String(assetCounter).padStart(6, '0')}`,
          name: `${sku.name} #${assetCounter}`,
          serialNumber: `SN${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          status: Math.random() > 0.8 ? 'inactive' : 'active',
          location: {
            datacenter: datacenters[dcIndex],
            rack: `R${Math.floor(Math.random() * 20) + 1}`,
            rackUnit: Math.floor(Math.random() * 42) + 1,
            city: cities[dcIndex],
            country: countries[dcIndex]
          },
          deployment: {
            environment: environments[Math.floor(Math.random() * environments.length)],
            goLiveDate: goLiveDate
          },
          specifications: {
            hostname: `${sku.category === 'server' ? 'srv' : sku.category === 'network-switch' ? 'sw' : 'fw'}-${String(assetCounter).padStart(3, '0')}`,
            ipAddress: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`
          },
          financial: {
            capex: {
              purchasePrice: Math.round(sku.pricing.msrp * (0.8 + Math.random() * 0.4)),
              currency: 'USD',
              purchaseDate: purchaseDate,
              vendor: sku.manufacturer,
              poNumber: `PO-${Math.floor(Math.random() * 900000) + 100000}`,
              depreciationPeriodYears: 4
            },
            opex: {
              warranty: [],
              maintenance: []
            }
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        assets.push(asset)
        assetCounter++
      }
    }
    
    const assetResult = await assetsCollection.insertMany(assets)
    console.log(`✅ Created ${assetResult.insertedCount} assets`)

    // Calculate totals
    const totalValue = assets.reduce((sum, asset) => sum + asset.financial.capex.purchasePrice, 0)
    
    console.log('\n🎉 Seed data generation completed!')
    console.log('📊 Summary:')
    console.log(`  📁 Catalogs: ${catalogs.length}`)
    console.log(`  🏷️  SKUs: ${skus.length}`)
    console.log(`  💻 Assets: ${assets.length}`)
    console.log(`  💰 Total Value: $${totalValue.toLocaleString()}`)
    console.log(`  🏢 Datacenters: ${datacenters.join(', ')}`)
    console.log(`  🌍 Locations: ${cities.join(', ')}`)

  } catch (error) {
    console.error('❌ Error generating seed data:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
  }
}

// Run the seed script
createSeedData()
  .then(() => {
    console.log('✅ Seed data generation finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seed data generation failed:', error)
    process.exit(1)
  })