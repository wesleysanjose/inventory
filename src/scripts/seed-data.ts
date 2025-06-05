import connectDB from '@/lib/db/connection'
import { Catalog, SKU, Asset } from '@/lib/db/models'

const sampleCatalogs = [
	{
		name: 'Enterprise Servers',
		description: 'High-performance rack-mounted servers for data center environments',
		category: 'server',
		manufacturer: 'Generic',
		status: 'active',
		attributes: {
			formFactor: 'Rack Mount',
			powerConsumption: 750,
			rackUnits: 2,
			warranty: '3 years',
			certifications: ['ENERGY STAR', 'EPEAT Silver'],
		},
	},
	{
		name: 'Network Switches',
		description: 'Managed Layer 2/3 network switches for enterprise networking',
		category: 'network-switch',
		manufacturer: 'Generic',
		status: 'active',
		attributes: {
			formFactor: 'Rack Mount',
			powerConsumption: 150,
			rackUnits: 1,
			warranty: '5 years',
			certifications: ['IEEE 802.3', 'RoHS'],
		},
	},
	{
		name: 'Enterprise Firewalls',
		description: 'Next-generation firewalls with advanced threat protection',
		category: 'firewall',
		manufacturer: 'Generic',
		status: 'active',
		attributes: {
			formFactor: 'Rack Mount',
			powerConsumption: 200,
			rackUnits: 1,
			warranty: '3 years',
			certifications: ['Common Criteria', 'FIPS 140-2'],
		},
	},
	{
		name: 'Storage Arrays',
		description: 'High-capacity SAN storage arrays with redundancy',
		category: 'storage',
		manufacturer: 'Generic',
		status: 'active',
		attributes: {
			formFactor: 'Rack Mount',
			powerConsumption: 500,
			rackUnits: 4,
			warranty: '5 years',
			certifications: ['ENERGY STAR'],
		},
	},
	{
		name: 'Business Laptops',
		description: 'Professional laptops for business users',
		category: 'laptop',
		manufacturer: 'Generic',
		status: 'active',
		attributes: {
			formFactor: 'Laptop',
			powerConsumption: 65,
			warranty: '3 years',
			certifications: ['ENERGY STAR', 'EPEAT Gold'],
		},
	},
]

const sampleSKUs = [
	// Server SKUs
	{
		catalogIndex: 0,
		skuCode: 'HP-DL360-G10',
		name: 'HP ProLiant DL360 Gen10',
		modelName: 'DL360 Gen10',
		manufacturer: 'HP Enterprise',
		description: '1U rack server with Intel Xeon processors, ideal for virtualization and cloud computing',
		specifications: {
			cpu: 'Intel Xeon Silver 4210R (2.4GHz, 10-core)',
			memory: '32GB DDR4 ECC',
			storage: '2 x 300GB SAS HDD',
			networkPorts: 4,
			powerSupply: '800W Redundant',
			dimensions: { height: 1, width: 19, depth: 27.5, weight: 16.8 },
			operatingSystem: 'VMware vSphere',
			supportedOS: ['Windows Server', 'Linux', 'VMware vSphere'],
		},
		pricing: { msrp: 4500, currency: 'USD', effectiveDate: new Date('2023-01-01') },
		warranty: { standard: 3, extended: 5, support: 'Next Business Day' },
	},
	{
		catalogIndex: 0,
		skuCode: 'DELL-R740',
		name: 'Dell PowerEdge R740',
		modelName: 'R740',
		manufacturer: 'Dell Technologies',
		description: '2U rack server with dual processors, perfect for demanding workloads',
		specifications: {
			cpu: 'Intel Xeon Gold 6248R (3.0GHz, 24-core)',
			memory: '64GB DDR4 ECC',
			storage: '4 x 1TB SAS HDD',
			networkPorts: 4,
			powerSupply: '1100W Redundant',
			dimensions: { height: 2, width: 19, depth: 28.5, weight: 29.5 },
			operatingSystem: 'VMware vSphere',
			supportedOS: ['Windows Server', 'Linux', 'VMware vSphere'],
		},
		pricing: { msrp: 8500, currency: 'USD', effectiveDate: new Date('2023-01-01') },
		warranty: { standard: 3, extended: 5, support: 'Next Business Day' },
	},
	{
		catalogIndex: 0,
		skuCode: 'LEN-SR650',
		name: 'Lenovo ThinkSystem SR650',
		modelName: 'SR650',
		manufacturer: 'Lenovo',
		description: '2U rack server optimized for performance and efficiency',
		specifications: {
			cpu: 'Intel Xeon Silver 4214R (2.4GHz, 12-core)',
			memory: '128GB DDR4 ECC',
			storage: '6 x 2TB SAS HDD',
			networkPorts: 4,
			powerSupply: '930W Redundant',
			dimensions: { height: 2, width: 19, depth: 30, weight: 32 },
			operatingSystem: 'Red Hat Enterprise Linux',
			supportedOS: ['Windows Server', 'Linux', 'VMware vSphere'],
		},
		pricing: { msrp: 12000, currency: 'USD', effectiveDate: new Date('2023-01-01') },
		warranty: { standard: 3, extended: 5, support: '4-hour Response' },
	},
	// Network Switch SKUs
	{
		catalogIndex: 1,
		skuCode: 'CISCO-2960X',
		name: 'Cisco Catalyst 2960-X',
		modelName: '2960-X-48TS-L',
		manufacturer: 'Cisco Systems',
		description: '48-port Gigabit Ethernet switch with Layer 2 capabilities',
		specifications: {
			networkPorts: 48,
			powerSupply: '124W',
			dimensions: { height: 1, width: 19, depth: 16, weight: 5.4 },
		},
		pricing: { msrp: 2800, currency: 'USD', effectiveDate: new Date('2023-01-01') },
		warranty: { standard: 5, support: 'Next Business Day' },
	},
	{
		catalogIndex: 1,
		skuCode: 'HP-5406R',
		name: 'HP Aruba 5406R',
		modelName: '5406R-zl2',
		manufacturer: 'HP Enterprise',
		description: 'Modular Layer 3 switch for enterprise networks',
		specifications: {
			networkPorts: 144,
			powerSupply: '1440W Redundant',
			dimensions: { height: 6, width: 19, depth: 18, weight: 27 },
		},
		pricing: { msrp: 15000, currency: 'USD', effectiveDate: new Date('2023-01-01') },
		warranty: { standard: 5, support: '4-hour Response' },
	},
	// Firewall SKUs
	{
		catalogIndex: 2,
		skuCode: 'PALO-PA-3220',
		name: 'Palo Alto PA-3220',
		modelName: 'PA-3220',
		manufacturer: 'Palo Alto Networks',
		description: 'Next-generation firewall with advanced threat prevention',
		specifications: {
			networkPorts: 16,
			powerSupply: '250W',
			dimensions: { height: 1, width: 19, depth: 16, weight: 8.2 },
		},
		pricing: { msrp: 18000, currency: 'USD', effectiveDate: new Date('2023-01-01') },
		warranty: { standard: 3, support: 'Next Business Day' },
	},
	// Storage SKUs
	{
		catalogIndex: 3,
		skuCode: 'NETAPP-FAS2720',
		name: 'NetApp FAS2720',
		modelName: 'FAS2720',
		manufacturer: 'NetApp',
		description: 'All-flash storage array for mid-range environments',
		specifications: {
			storage: '24 x 1.8TB SSD',
			networkPorts: 8,
			powerSupply: '440W Redundant',
			dimensions: { height: 2, width: 19, depth: 24, weight: 35 },
		},
		pricing: { msrp: 45000, currency: 'USD', effectiveDate: new Date('2023-01-01') },
		warranty: { standard: 5, support: '4-hour Response' },
	},
	// Laptop SKUs
	{
		catalogIndex: 4,
		skuCode: 'DELL-LAT5520',
		name: 'Dell Latitude 5520',
		modelName: 'Latitude 5520',
		manufacturer: 'Dell Technologies',
		description: '15.6" business laptop with Intel processors',
		specifications: {
			cpu: 'Intel Core i7-1165G7',
			memory: '16GB DDR4',
			storage: '512GB NVMe SSD',
			dimensions: { height: 0.8, width: 14.1, depth: 9.3, weight: 1.6 },
			operatingSystem: 'Windows 11 Pro',
			supportedOS: ['Windows 10', 'Windows 11', 'Linux'],
		},
		pricing: { msrp: 1800, currency: 'USD', effectiveDate: new Date('2023-01-01') },
		warranty: { standard: 3, support: 'Next Business Day' },
	},
]

const datacenters = [
	'US-East-1 (Virginia)',
	'US-West-1 (California)',
	'EU-West-1 (Ireland)',
	'AP-Southeast-1 (Singapore)',
]

const cities = ['Ashburn', 'San Jose', 'Dublin', 'Singapore']
const countries = ['USA', 'USA', 'Ireland', 'Singapore']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateRandomAssets(skus: any[], count: number) {
	const assets = []
	
	for (let i = 0; i < count; i++) {
		const sku = skus[Math.floor(Math.random() * skus.length)]
		const dcIndex = Math.floor(Math.random() * datacenters.length)
		const purchaseDate = new Date(2022, Math.floor(Math.random() * 24), Math.floor(Math.random() * 28))
		const goLiveDate = new Date(purchaseDate)
		goLiveDate.setDate(goLiveDate.getDate() + Math.floor(Math.random() * 30) + 7)
		
		const warrantyStartDate = new Date(goLiveDate)
		const warrantyEndDate = new Date(warrantyStartDate)
		warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + sku.warranty.standard)
		
		const basePrice = sku.pricing.msrp
		const actualPrice = basePrice * (0.8 + Math.random() * 0.4) // 80% to 120% of MSRP
		const warrantyPrice = actualPrice * 0.15 // 15% of purchase price for warranty
		
		const asset = {
			skuId: sku._id,
			assetTag: `AST${String(i + 1).padStart(6, '0')}`,
			serialNumber: `SN${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
			name: `${sku.name} #${i + 1}`,
			status: Math.random() > 0.1 ? 'active' : 'maintenance',
			location: {
				datacenter: datacenters[dcIndex],
				rack: `R${Math.floor(Math.random() * 50) + 1}`,
				rackUnit: `U${Math.floor(Math.random() * 42) + 1}`,
				floor: `Floor ${Math.floor(Math.random() * 3) + 1}`,
				building: 'Building A',
				city: cities[dcIndex],
				country: countries[dcIndex],
			},
			financial: {
				capex: {
					purchasePrice: Math.round(actualPrice),
					currency: 'USD',
					purchaseDate,
					vendor: sku.manufacturer,
					poNumber: `PO${String(i + 1).padStart(6, '0')}`,
					depreciationPeriodYears: 4,
				},
				opex: {
					warranty: [
						{
							cost: Math.round(warrantyPrice),
							currency: 'USD',
							startDate: warrantyStartDate,
							endDate: warrantyEndDate,
							vendor: sku.manufacturer,
							type: 'premium',
						},
					],
					maintenance: [],
				},
			},
			deployment: {
				goLiveDate,
				installationDate: new Date(goLiveDate.getTime() - 2 * 24 * 60 * 60 * 1000),
				commissioningDate: new Date(goLiveDate.getTime() - 1 * 24 * 60 * 60 * 1000),
				assignedTo: `Team ${Math.floor(Math.random() * 5) + 1}`,
				purpose: `Production Workload ${Math.floor(Math.random() * 100) + 1}`,
				environment: Math.random() > 0.2 ? 'production' : 'staging',
			},
			specifications: {
				hostname: `${sku.skuCode.toLowerCase()}-${String(i + 1).padStart(3, '0')}`,
				ipAddresses: [`10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`],
				configuredMemory: sku.specifications.memory,
				configuredStorage: sku.specifications.storage,
				installedOS: sku.specifications.operatingSystem,
			},
		}
		
		assets.push(asset)
	}
	
	return assets
}

export async function seedDatabase() {
	try {
		console.log('Connecting to database...')
		await connectDB()
		
		console.log('Clearing existing data...')
		await Asset.deleteMany({})
		await SKU.deleteMany({})
		await Catalog.deleteMany({})
		
		console.log('Creating catalogs...')
		const createdCatalogs = await Catalog.insertMany(sampleCatalogs)
		console.log(`Created ${createdCatalogs.length} catalogs`)
		
		console.log('Creating SKUs...')
		const skusToCreate = sampleSKUs.map((sku) => ({
			...sku,
			catalogId: createdCatalogs[sku.catalogIndex]._id,
			catalogIndex: undefined,
		}))
		const createdSKUs = await SKU.insertMany(skusToCreate)
		console.log(`Created ${createdSKUs.length} SKUs`)
		
		console.log('Creating assets...')
		const assetsToCreate = generateRandomAssets(createdSKUs, 100)
		const createdAssets = await Asset.insertMany(assetsToCreate)
		console.log(`Created ${createdAssets.length} assets`)
		
		console.log('Seed data creation completed successfully!')
		
		return {
			catalogs: createdCatalogs.length,
			skus: createdSKUs.length,
			assets: createdAssets.length,
		}
	} catch (error) {
		console.error('Error creating seed data:', error)
		throw error
	}
}

// Run if called directly
if (require.main === module) {
	seedDatabase()
		.then((result) => {
			console.log('Seed data summary:', result)
			process.exit(0)
		})
		.catch((error) => {
			console.error('Failed to seed database:', error)
			process.exit(1)
		})
}