import mongoose, { Schema, Document } from 'mongoose'
import { ISKU } from './SKU'

export interface IAsset extends Document {
	skuId: mongoose.Types.ObjectId | ISKU
	assetTag: string
	serialNumber: string
	name: string
	status: 'active' | 'inactive' | 'maintenance' | 'retired' | 'disposed'
	location: {
		datacenter: string
		rack?: string
		rackUnit?: string
		floor?: string
		building?: string
		city: string
		country: string
	}
	financial: {
		capex: {
			purchasePrice: number
			currency: string
			purchaseDate: Date
			vendor: string
			poNumber?: string
			depreciationPeriodYears: number
		}
		opex: {
			warranty: {
				cost: number
				currency: string
				startDate: Date
				endDate: Date
				vendor: string
				type: 'basic' | 'premium' | 'onsite' | 'next-business-day'
			}[]
			maintenance?: {
				cost: number
				currency: string
				startDate: Date
				endDate: Date
				vendor: string
				type: string
			}[]
		}
	}
	deployment: {
		goLiveDate: Date
		installationDate?: Date
		commissioningDate?: Date
		assignedTo?: string
		purpose?: string
		environment: 'production' | 'staging' | 'development' | 'testing' | 'backup'
	}
	specifications: {
		hostname?: string
		ipAddresses?: string[]
		macAddresses?: string[]
		configuredMemory?: string
		configuredStorage?: string
		installedOS?: string
		customSpecs?: Record<string, unknown>
	}
	createdAt: Date
	updatedAt: Date
}

const AssetSchema = new Schema<IAsset>(
	{
		skuId: {
			type: Schema.Types.ObjectId,
			ref: 'SKU',
			required: [true, 'SKU ID is required'],
		},
		assetTag: {
			type: String,
			required: [true, 'Asset tag is required'],
			unique: true,
			trim: true,
			uppercase: true,
			maxlength: [50, 'Asset tag cannot exceed 50 characters'],
		},
		serialNumber: {
			type: String,
			required: [true, 'Serial number is required'],
			trim: true,
			maxlength: [100, 'Serial number cannot exceed 100 characters'],
		},
		name: {
			type: String,
			required: [true, 'Asset name is required'],
			trim: true,
			maxlength: [150, 'Asset name cannot exceed 150 characters'],
		},
		status: {
			type: String,
			required: true,
			enum: ['active', 'inactive', 'maintenance', 'retired', 'disposed'],
			default: 'active',
		},
		location: {
			datacenter: {
				type: String,
				required: [true, 'Datacenter is required'],
				trim: true,
			},
			rack: {
				type: String,
				trim: true,
			},
			rackUnit: {
				type: String,
				trim: true,
			},
			floor: {
				type: String,
				trim: true,
			},
			building: {
				type: String,
				trim: true,
			},
			city: {
				type: String,
				required: [true, 'City is required'],
				trim: true,
			},
			country: {
				type: String,
				required: [true, 'Country is required'],
				trim: true,
			},
		},
		financial: {
			capex: {
				purchasePrice: {
					type: Number,
					required: [true, 'Purchase price is required'],
					min: [0, 'Purchase price cannot be negative'],
				},
				currency: {
					type: String,
					required: true,
					default: 'USD',
					uppercase: true,
					maxlength: [3, 'Currency code must be 3 characters'],
				},
				purchaseDate: {
					type: Date,
					required: [true, 'Purchase date is required'],
				},
				vendor: {
					type: String,
					required: [true, 'Vendor is required'],
					trim: true,
				},
				poNumber: {
					type: String,
					trim: true,
				},
				depreciationPeriodYears: {
					type: Number,
					required: true,
					default: 4,
					min: [1, 'Depreciation period must be at least 1 year'],
				},
			},
			opex: {
				warranty: [
					{
						cost: {
							type: Number,
							required: true,
							min: [0, 'Warranty cost cannot be negative'],
						},
						currency: {
							type: String,
							required: true,
							default: 'USD',
							uppercase: true,
						},
						startDate: {
							type: Date,
							required: true,
						},
						endDate: {
							type: Date,
							required: true,
						},
						vendor: {
							type: String,
							required: true,
							trim: true,
						},
						type: {
							type: String,
							required: true,
							enum: ['basic', 'premium', 'onsite', 'next-business-day'],
						},
					},
				],
				maintenance: [
					{
						cost: {
							type: Number,
							required: true,
							min: [0, 'Maintenance cost cannot be negative'],
						},
						currency: {
							type: String,
							required: true,
							default: 'USD',
							uppercase: true,
						},
						startDate: {
							type: Date,
							required: true,
						},
						endDate: {
							type: Date,
							required: true,
						},
						vendor: {
							type: String,
							required: true,
							trim: true,
						},
						type: {
							type: String,
							required: true,
							trim: true,
						},
					},
				],
			},
		},
		deployment: {
			goLiveDate: {
				type: Date,
				required: [true, 'Go live date is required'],
			},
			installationDate: Date,
			commissioningDate: Date,
			assignedTo: {
				type: String,
				trim: true,
			},
			purpose: {
				type: String,
				trim: true,
			},
			environment: {
				type: String,
				required: true,
				enum: ['production', 'staging', 'development', 'testing', 'backup'],
				default: 'production',
			},
		},
		specifications: {
			hostname: {
				type: String,
				trim: true,
			},
			ipAddresses: [
				{
					type: String,
					trim: true,
				},
			],
			macAddresses: [
				{
					type: String,
					trim: true,
					uppercase: true,
				},
			],
			configuredMemory: {
				type: String,
				trim: true,
			},
			configuredStorage: {
				type: String,
				trim: true,
			},
			installedOS: {
				type: String,
				trim: true,
			},
			customSpecs: Schema.Types.Mixed,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
)

// Create indexes
AssetSchema.index({ skuId: 1 })
AssetSchema.index({ assetTag: 1 })
AssetSchema.index({ serialNumber: 1 })
AssetSchema.index({ status: 1 })
AssetSchema.index({ 'location.datacenter': 1 })
AssetSchema.index({ 'deployment.goLiveDate': 1 })
AssetSchema.index({ 'financial.capex.purchaseDate': 1 })

// Virtual for current depreciation value
AssetSchema.virtual('currentDepreciationValue').get(function (this: IAsset) {
	const purchasePrice = this.financial.capex.purchasePrice
	const depreciationPeriodYears = this.financial.capex.depreciationPeriodYears
	const goLiveDate = this.deployment.goLiveDate
	const now = new Date()

	const monthsLive = Math.max(
		0,
		(now.getFullYear() - goLiveDate.getFullYear()) * 12 + (now.getMonth() - goLiveDate.getMonth())
	)
	const totalDepreciationMonths = depreciationPeriodYears * 12
	const monthlyDepreciation = purchasePrice / totalDepreciationMonths

	const totalDepreciated = Math.min(monthsLive * monthlyDepreciation, purchasePrice)
	return Math.max(0, purchasePrice - totalDepreciated)
})

// Virtual for total monthly depreciation
AssetSchema.virtual('monthlyDepreciation').get(function (this: IAsset) {
	const purchasePrice = this.financial.capex.purchasePrice
	const depreciationPeriodYears = this.financial.capex.depreciationPeriodYears
	return purchasePrice / (depreciationPeriodYears * 12)
})

export default mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema)