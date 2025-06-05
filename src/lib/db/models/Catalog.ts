import mongoose, { Schema, Document } from 'mongoose'

export interface ICatalog extends Document {
	name: string
	description: string
	category: 'server' | 'network-switch' | 'firewall' | 'storage' | 'laptop' | 'desktop' | 'monitor' | 'printer' | 'other'
	manufacturer: string
	status: 'active' | 'inactive' | 'discontinued'
	attributes: {
		formFactor?: string
		powerConsumption?: number
		rackUnits?: number
		warranty?: string
		certifications?: string[]
	}
	createdAt: Date
	updatedAt: Date
}

const CatalogSchema = new Schema<ICatalog>(
	{
		name: {
			type: String,
			required: [true, 'Catalog name is required'],
			trim: true,
			maxlength: [100, 'Catalog name cannot exceed 100 characters'],
		},
		description: {
			type: String,
			required: [true, 'Description is required'],
			trim: true,
			maxlength: [500, 'Description cannot exceed 500 characters'],
		},
		category: {
			type: String,
			required: [true, 'Category is required'],
			enum: {
				values: [
					'server',
					'network-switch',
					'firewall',
					'storage',
					'laptop',
					'desktop',
					'monitor',
					'printer',
					'other',
				],
				message: 'Invalid category',
			},
		},
		manufacturer: {
			type: String,
			required: [true, 'Manufacturer is required'],
			trim: true,
			maxlength: [100, 'Manufacturer name cannot exceed 100 characters'],
		},
		status: {
			type: String,
			required: true,
			enum: ['active', 'inactive', 'discontinued'],
			default: 'active',
		},
		attributes: {
			formFactor: {
				type: String,
				trim: true,
			},
			powerConsumption: {
				type: Number,
				min: [0, 'Power consumption cannot be negative'],
			},
			rackUnits: {
				type: Number,
				min: [0, 'Rack units cannot be negative'],
			},
			warranty: {
				type: String,
				trim: true,
			},
			certifications: [
				{
					type: String,
					trim: true,
				},
			],
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
)

// Create indexes
CatalogSchema.index({ name: 1, manufacturer: 1 }, { unique: true })
CatalogSchema.index({ category: 1 })
CatalogSchema.index({ status: 1 })

// Virtual to get SKU count
CatalogSchema.virtual('skuCount', {
	ref: 'SKU',
	localField: '_id',
	foreignField: 'catalogId',
	count: true,
})

export default mongoose.models.Catalog || mongoose.model<ICatalog>('Catalog', CatalogSchema)