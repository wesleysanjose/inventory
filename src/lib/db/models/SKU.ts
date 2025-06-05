import mongoose, { Schema, Document } from 'mongoose'
import { ICatalog } from './Catalog'

export interface ISKU extends Document {
	catalogId: mongoose.Types.ObjectId | ICatalog
	skuCode: string
	name: string
	modelName: string
	description: string
	manufacturer: string
	status: 'active' | 'inactive' | 'discontinued'
	specifications: {
		cpu?: string
		memory?: string
		storage?: string
		networkPorts?: number
		powerSupply?: string
		dimensions?: {
			height?: number
			width?: number
			depth?: number
			weight?: number
		}
		operatingSystem?: string
		supportedOS?: string[]
	}
	pricing: {
		msrp?: number
		currency: string
		effectiveDate: Date
		endDate?: Date
	}
	warranty: {
		standard: number // years
		extended?: number // years
		support?: string
	}
	createdAt: Date
	updatedAt: Date
}

const SKUSchema = new Schema<ISKU>(
	{
		catalogId: {
			type: Schema.Types.ObjectId,
			ref: 'Catalog',
			required: [true, 'Catalog ID is required'],
		},
		skuCode: {
			type: String,
			required: [true, 'SKU code is required'],
			unique: true,
			trim: true,
			uppercase: true,
			maxlength: [50, 'SKU code cannot exceed 50 characters'],
		},
		name: {
			type: String,
			required: [true, 'SKU name is required'],
			trim: true,
			maxlength: [150, 'SKU name cannot exceed 150 characters'],
		},
		modelName: {
			type: String,
			required: [true, 'Model is required'],
			trim: true,
			maxlength: [100, 'Model cannot exceed 100 characters'],
		},
		description: {
			type: String,
			required: [true, 'Description is required'],
			trim: true,
			maxlength: [1000, 'Description cannot exceed 1000 characters'],
		},
		manufacturer: {
			type: String,
			required: [true, 'Manufacturer is required'],
			trim: true,
			maxlength: [100, 'Manufacturer cannot exceed 100 characters'],
		},
		status: {
			type: String,
			required: true,
			enum: ['active', 'inactive', 'discontinued'],
			default: 'active',
		},
		specifications: {
			cpu: {
				type: String,
				trim: true,
			},
			memory: {
				type: String,
				trim: true,
			},
			storage: {
				type: String,
				trim: true,
			},
			networkPorts: {
				type: Number,
				min: [0, 'Network ports cannot be negative'],
			},
			powerSupply: {
				type: String,
				trim: true,
			},
			dimensions: {
				height: {
					type: Number,
					min: [0, 'Height cannot be negative'],
				},
				width: {
					type: Number,
					min: [0, 'Width cannot be negative'],
				},
				depth: {
					type: Number,
					min: [0, 'Depth cannot be negative'],
				},
				weight: {
					type: Number,
					min: [0, 'Weight cannot be negative'],
				},
			},
			operatingSystem: {
				type: String,
				trim: true,
			},
			supportedOS: [
				{
					type: String,
					trim: true,
				},
			],
		},
		pricing: {
			msrp: {
				type: Number,
				min: [0, 'MSRP cannot be negative'],
			},
			currency: {
				type: String,
				required: true,
				default: 'USD',
				uppercase: true,
				maxlength: [3, 'Currency code must be 3 characters'],
			},
			effectiveDate: {
				type: Date,
				required: true,
				default: Date.now,
			},
			endDate: Date,
		},
		warranty: {
			standard: {
				type: Number,
				required: true,
				min: [0, 'Standard warranty cannot be negative'],
				default: 1,
			},
			extended: {
				type: Number,
				min: [0, 'Extended warranty cannot be negative'],
			},
			support: {
				type: String,
				trim: true,
			},
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
)

// Create indexes
SKUSchema.index({ catalogId: 1 })
SKUSchema.index({ skuCode: 1 })
SKUSchema.index({ manufacturer: 1 })
SKUSchema.index({ status: 1 })
SKUSchema.index({ 'pricing.msrp': 1 })

// Virtual to get asset count
SKUSchema.virtual('assetCount', {
	ref: 'Asset',
	localField: '_id',
	foreignField: 'skuId',
	count: true,
})

export default mongoose.models.SKU || mongoose.model<ISKU>('SKU', SKUSchema)