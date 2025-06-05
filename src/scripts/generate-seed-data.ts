#!/usr/bin/env ts-node

import connectDB from '../lib/db/connection'
import { Catalog, SKU, Asset } from '../lib/db/models'

// Seed data configuration
const SEED_CONFIG = {
	catalogs: 5,
	skusPerCatalog: 2,
	assetsPerSku: 10,
}

// Sample data arrays
const manufacturers = ['HP', 'Dell', 'Lenovo', 'Cisco', 'Juniper', 'Arista', 'Fortinet', 'Palo Alto']
const datacenters = ['US-East-1', 'US-West-2', 'EU-Central-1', 'APAC-Southeast-1', 'US-Central-1']
const cities = ['New York', 'San Francisco', 'Frankfurt', 'Singapore', 'Chicago']
const countries = ['USA', 'USA', 'Germany', 'Singapore', 'USA']
const environments = ['production', 'staging', 'development', 'testing', 'backup']

// Sample catalog definitions
const catalogTemplates = [
	{
		name: 'Enterprise Servers',
		category: 'server',
		description: 'High-performance rack-mounted servers for enterprise workloads',
		skus: [
			{
				skuCode: 'HP-DL380-G10',
				name: 'HP ProLiant DL380 Gen10',
				modelName: 'DL380 Gen10',
				manufacturer: 'HP',
				description: 'Versatile 2U rack server with enterprise-class performance',
				specifications: {
					cpu: 'Intel Xeon Silver 4210R',
					memory: '32GB DDR4',
					storage: '2x 1TB SAS',
					networkPorts: 4,
					powerSupply: '800W Redundant',
					dimensions: { height: 8.7, width: 44.5, depth: 84.0, weight: 29.5 },
					operatingSystem: 'VMware vSphere 7.0',
					supportedOS: ['Windows Server', 'Linux', 'VMware vSphere']
				},
				pricing: { msrp: 4500, currency: 'USD' },
				warranty: { standard: 3, support: 'Next Business Day' }
			},
			{
				skuCode: 'DELL-R740-XD',
				name: 'Dell PowerEdge R740xd',
				modelName: 'R740xd',
				manufacturer: 'Dell',
				description: 'High-capacity 2U rack server optimized for storage-intensive workloads',
				specifications: {
					cpu: 'Intel Xeon Gold 6248R',
					memory: '64GB DDR4',
					storage: '4x 2TB NVMe',
					networkPorts: 4,
					powerSupply: '1100W Redundant',
					dimensions: { height: 8.7, width: 44.5, depth: 81.5, weight: 32.2 },
					operatingSystem: 'VMware vSphere 8.0',
					supportedOS: ['Windows Server', 'Linux', 'VMware vSphere']
				},
				pricing: { msrp: 6200, currency: 'USD' },
				warranty: { standard: 3, support: 'Next Business Day' }
			}
		]
	},
	{
		name: 'Network Switches',
		category: 'network-switch',
		description: 'Enterprise-grade network switches for data center and campus networks',
		skus: [
			{
				skuCode: 'CISCO-C9300-48P',
				name: 'Cisco Catalyst 9300 48-Port',
				modelName: 'C9300-48P',
				manufacturer: 'Cisco',
				description: 'High-performance stackable enterprise switch with 48 Gigabit ports',
				specifications: {
					networkPorts: 48,
					powerSupply: '715W',
					dimensions: { height: 4.4, width: 44.5, depth: 40.0, weight: 7.3 },
					supportedOS: ['Cisco IOS XE']
				},
				pricing: { msrp: 8500, currency: 'USD' },
				warranty: { standard: 1, support: 'Next Business Day' }
			},
			{
				skuCode: 'ARISTA-7050X3-32S',
				name: 'Arista 7050X3-32S',
				modelName: '7050X3-32S',
				manufacturer: 'Arista',
				description: 'Ultra-low latency 32-port 100GbE switch for high-frequency trading',
				specifications: {
					networkPorts: 32,
					powerSupply: '460W',
					dimensions: { height: 4.3, width: 44.2, depth: 55.9, weight: 11.8 },
					supportedOS: ['Arista EOS']
				},
				pricing: { msrp: 25000, currency: 'USD' },
				warranty: { standard: 1, support: '4-hour replacement' }
			}
		]
	},
	{
		name: 'Firewalls',
		category: 'firewall',
		description: 'Next-generation firewalls for network security and threat protection',
		skus: [
			{
				skuCode: 'PALO-PA-3220',
				name: 'Palo Alto PA-3220',
				modelName: 'PA-3220',
				manufacturer: 'Palo Alto',
				description: 'High-performance next-generation firewall for medium enterprises',
				specifications: {
					networkPorts: 16,
					powerSupply: '200W',
					dimensions: { height: 4.4, width: 44.0, depth: 46.0, weight: 8.6 },
					supportedOS: ['PAN-OS']
				},
				pricing: { msrp: 12000, currency: 'USD' },
				warranty: { standard: 1, support: 'Next Business Day' }
			},
			{
				skuCode: 'FORTINET-FG-600F',
				name: 'Fortinet FortiGate 600F',
				modelName: 'FG-600F',
				manufacturer: 'Fortinet',
				description: 'Enterprise firewall with integrated security services',
				specifications: {
					networkPorts: 18,
					powerSupply: '120W',
					dimensions: { height: 4.4, width: 44.0, depth: 40.0, weight: 7.2 },
					supportedOS: ['FortiOS']
				},
				pricing: { msrp: 8500, currency: 'USD' },
				warranty: { standard: 1, support: 'Next Business Day' }
			}
		]
	},
	{
		name: 'Storage Arrays',
		category: 'storage',
		description: 'Enterprise storage arrays for high-performance data storage',
		skus: [
			{
				skuCode: 'DELL-ME4024',
				name: 'Dell ME4024',
				modelName: 'ME4024',
				manufacturer: 'Dell',
				description: '2U 24-bay SAS storage array with dual controllers',
				specifications: {
					storage: '24x 1.2TB SAS',
					networkPorts: 8,
					powerSupply: '580W Redundant',
					dimensions: { height: 8.7, width: 44.5, depth: 68.0, weight: 28.0 },
					supportedOS: ['Dell Storage Manager']
				},
				pricing: { msrp: 15000, currency: 'USD' },
				warranty: { standard: 3, support: 'Next Business Day' }
			}
		]
	},
	{
		name: 'Workstations',
		category: 'workstation',
		description: 'High-performance workstations for development and engineering',
		skus: [
			{
				skuCode: 'HP-Z4-G4',
				name: 'HP Z4 G4 Workstation',
				modelName: 'Z4 G4',
				manufacturer: 'HP',
				description: 'Single-socket workstation with professional graphics support',
				specifications: {
					cpu: 'Intel Xeon W-2235',
					memory: '32GB DDR4',
					storage: '1TB NVMe SSD',
					powerSupply: '700W',
					dimensions: { height: 43.0, width: 17.0, depth: 44.5, weight: 18.6 },
					operatingSystem: 'Windows 11 Pro',
					supportedOS: ['Windows', 'Linux']
				},
				pricing: { msrp: 3500, currency: 'USD' },
				warranty: { standard: 3, support: 'Next Business Day' }
			}
		]
	}
]

// Utility functions
function randomChoice<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)]
}

function randomDate(start: Date, end: Date): Date {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function generateAssetTag(prefix: string, index: number): string {
	return `${prefix}-${String(index).padStart(6, '0')}`
}

function generateSerialNumber(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	let result = ''
	for (let i = 0; i < 10; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return result
}

function generateHostname(category: string, index: number): string {
	const prefixes: Record<string, string> = {
		'server': 'srv',
		'network-switch': 'sw',
		'firewall': 'fw',
		'storage': 'san',
		'workstation': 'ws'
	}
	const prefix = prefixes[category] || 'dev'
	return `${prefix}-${String(index).padStart(3, '0')}`
}

// Warranty and maintenance contract generators
function generateWarrantyContracts() {
	const contracts = []
	const warrantyTypes = ['Standard', 'Extended', 'Premium', 'Critical']
	const vendors = ['HP Enterprise Services', 'Dell Technologies', 'Cisco TAC', 'Third Party Maintainer']
	
	for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
		const startDate = randomDate(new Date(2023, 0, 1), new Date())
		const endDate = new Date(startDate)
		endDate.setFullYear(endDate.getFullYear() + Math.floor(Math.random() * 3) + 1)
		
		contracts.push({
			vendor: randomChoice(vendors),
			type: randomChoice(warrantyTypes),
			startDate,
			endDate,
			cost: Math.floor(Math.random() * 1000) + 200,
			currency: 'USD'
		})
	}
	return contracts
}

function generateMaintenanceContracts() {
	const contracts = []
	const maintenanceTypes = ['Hardware Support', 'Software Support', 'Full Coverage', 'Parts Only']
	const vendors = ['HP Enterprise Services', 'Dell ProSupport', 'Cisco SMARTnet', 'Third Party Support']
	
	for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
		const startDate = randomDate(new Date(2023, 0, 1), new Date())
		const endDate = new Date(startDate)
		endDate.setFullYear(endDate.getFullYear() + 1)
		
		contracts.push({
			vendor: randomChoice(vendors),
			type: randomChoice(maintenanceTypes),
			startDate,
			endDate,
			cost: Math.floor(Math.random() * 500) + 100,
			currency: 'USD'
		})
	}
	return contracts
}

// Main seed generation function
async function generateSeedData() {
	console.log('🌱 Starting seed data generation...')
	
	try {
		// Connect to database
		await connectDB()
		console.log('✅ Connected to MongoDB')

		// Clear existing data
		console.log('🧹 Clearing existing data...')
		await Promise.all([
			Asset.deleteMany({}),
			SKU.deleteMany({}),
			Catalog.deleteMany({})
		])
		console.log('✅ Existing data cleared')

		// Generate catalogs and SKUs
		console.log('📁 Creating catalogs and SKUs...')
		const createdSKUs: any[] = []
		
		for (const template of catalogTemplates) {
			// Create catalog
			const catalog = new Catalog({
				name: template.name,
				category: template.category,
				description: template.description,
				specifications: {
					powerRequirements: '110-240V AC',
					environmentalSpecs: {
						operatingTemp: '10-35°C',
						humidity: '10-80% RH',
						altitude: '0-3000m'
					}
				}
			})
			await catalog.save()
			console.log(`  ✅ Created catalog: ${catalog.name}`)

			// Create SKUs for this catalog
			for (const skuTemplate of template.skus) {
				const pricing = {
					...skuTemplate.pricing,
					effectiveDate: new Date('2024-01-01'),
					endDate: undefined
				}

				const sku = new SKU({
					catalogId: catalog._id,
					...skuTemplate,
					pricing,
					status: 'active'
				})
				await sku.save()
				createdSKUs.push({ sku, catalogCategory: template.category })
				console.log(`    ✅ Created SKU: ${sku.name}`)
			}
		}

		// Generate assets
		console.log('💻 Creating assets...')
		let assetCounter = 1
		
		for (const { sku, catalogCategory } of createdSKUs) {
			const numAssets = SEED_CONFIG.assetsPerSku
			
			for (let i = 0; i < numAssets; i++) {
				const datacenterIndex = Math.floor(Math.random() * datacenters.length)
				const goLiveDate = randomDate(new Date(2022, 0, 1), new Date())
				const purchaseDate = new Date(goLiveDate)
				purchaseDate.setDate(purchaseDate.getDate() - Math.floor(Math.random() * 30) - 7)
				
				// Calculate purchase price with some variation
				const baseMsrp = sku.pricing.msrp
				const priceVariation = 0.8 + Math.random() * 0.4 // 80% to 120% of MSRP
				const purchasePrice = Math.round(baseMsrp * priceVariation)

				const asset = new Asset({
					skuId: sku._id,
					assetTag: generateAssetTag(catalogCategory.toUpperCase().substring(0, 3), assetCounter),
					name: `${sku.name} #${assetCounter}`,
					serialNumber: generateSerialNumber(),
					status: randomChoice(['active', 'active', 'active', 'inactive', 'maintenance']), // Bias toward active
					
					location: {
						datacenter: datacenters[datacenterIndex],
						rack: `R${Math.floor(Math.random() * 20) + 1}`,
						rackUnit: Math.floor(Math.random() * 42) + 1,
						city: cities[datacenterIndex],
						country: countries[datacenterIndex]
					},
					
					deployment: {
						environment: randomChoice(environments),
						goLiveDate,
						retirementDate: undefined // Most assets are not retired yet
					},
					
					specifications: {
						hostname: generateHostname(catalogCategory, assetCounter),
						ipAddress: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`,
						operatingSystem: sku.specifications.operatingSystem || 'Not Specified',
						customFields: {
							businessUnit: randomChoice(['Engineering', 'Sales', 'Marketing', 'IT', 'Finance']),
							costCenter: `CC-${Math.floor(Math.random() * 9000) + 1000}`,
							owner: randomChoice(['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Lisa Chen', 'David Brown'])
						}
					},
					
					financial: {
						capex: {
							purchasePrice,
							currency: 'USD',
							purchaseDate,
							vendor: sku.manufacturer,
							poNumber: `PO-${Math.floor(Math.random() * 900000) + 100000}`,
							depreciationMethod: 'straight-line',
							depreciationPeriod: 48 // 4 years in months
						},
						opex: {
							warranties: generateWarrantyContracts(),
							maintenance: generateMaintenanceContracts()
						}
					}
				})
				
				await asset.save()
				
				if (assetCounter % 10 === 0) {
					console.log(`    ✅ Created ${assetCounter} assets...`)
				}
				assetCounter++
			}
		}

		// Generate summary
		const catalogCount = await Catalog.countDocuments()
		const skuCount = await SKU.countDocuments()
		const assetCount = await Asset.countDocuments()
		const totalValue = await Asset.aggregate([
			{ $group: { _id: null, total: { $sum: '$financial.capex.purchasePrice' } } }
		])

		console.log('\n🎉 Seed data generation completed!')
		console.log('📊 Summary:')
		console.log(`  📁 Catalogs: ${catalogCount}`)
		console.log(`  🏷️  SKUs: ${skuCount}`)
		console.log(`  💻 Assets: ${assetCount}`)
		console.log(`  💰 Total Value: $${totalValue[0]?.total?.toLocaleString() || 0}`)
		console.log(`  🏢 Datacenters: ${datacenters.join(', ')}`)
		console.log(`  🌍 Locations: ${cities.join(', ')}`)

	} catch (error) {
		console.error('❌ Error generating seed data:', error)
		process.exit(1)
	}
}

// Run if called directly
if (require.main === module) {
	generateSeedData()
		.then(() => {
			console.log('✅ Seed data generation finished successfully')
			process.exit(0)
		})
		.catch((error) => {
			console.error('❌ Seed data generation failed:', error)
			process.exit(1)
		})
}

export default generateSeedData