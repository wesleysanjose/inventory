import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connection'
import { SKU } from '@/lib/db/models'
import { handleApiError } from '@/lib/utils/api-errors'

export async function GET(request: NextRequest) {
	try {
		await connectDB()

		const { searchParams } = new URL(request.url)
		const page = parseInt(searchParams.get('page') || '1')
		const limit = parseInt(searchParams.get('limit') || '10')
		const search = searchParams.get('search') || ''
		const catalogId = searchParams.get('catalogId') || ''
		const manufacturer = searchParams.get('manufacturer') || ''
		const status = searchParams.get('status') || ''

		const skip = (page - 1) * limit

		// Build filter object
		const filter: Record<string, unknown> = {}
		if (search) {
			filter.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ skuCode: { $regex: search, $options: 'i' } },
				{ model: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } },
			]
		}
		if (catalogId) filter.catalogId = catalogId
		if (manufacturer) filter.manufacturer = { $regex: manufacturer, $options: 'i' }
		if (status) filter.status = status

		const [skus, total] = await Promise.all([
			SKU.find(filter)
				.populate('catalogId', 'name category')
				.populate('assetCount')
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			SKU.countDocuments(filter),
		])

		return NextResponse.json({
			skus,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		})
	} catch (error) {
		console.error('Error fetching SKUs:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		await connectDB()

		const body = await request.json()
		const sku = new SKU(body)
		await sku.save()

		const populatedSku = await SKU.findById(sku._id).populate('catalogId', 'name category').lean()

		return NextResponse.json(populatedSku, { status: 201 })
	} catch (error) {
		return handleApiError(error)
	}
}