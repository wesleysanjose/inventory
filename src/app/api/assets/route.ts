import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connection'
import { Asset } from '@/lib/db/models'
import { handleApiError } from '@/lib/utils/api-errors'

export async function GET(request: NextRequest) {
	try {
		await connectDB()

		const { searchParams } = new URL(request.url)
		const page = parseInt(searchParams.get('page') || '1')
		const limit = parseInt(searchParams.get('limit') || '10')
		const search = searchParams.get('search') || ''
		const skuId = searchParams.get('skuId') || ''
		const status = searchParams.get('status') || ''
		const datacenter = searchParams.get('datacenter') || ''
		const environment = searchParams.get('environment') || ''

		const skip = (page - 1) * limit

		// Build filter object
		const filter: Record<string, unknown> = {}
		if (search) {
			filter.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ assetTag: { $regex: search, $options: 'i' } },
				{ serialNumber: { $regex: search, $options: 'i' } },
				{ 'specifications.hostname': { $regex: search, $options: 'i' } },
			]
		}
		if (skuId) filter.skuId = skuId
		if (status) filter.status = status
		if (datacenter) filter['location.datacenter'] = { $regex: datacenter, $options: 'i' }
		if (environment) filter['deployment.environment'] = environment

		const [assets, total] = await Promise.all([
			Asset.find(filter)
				.populate({
					path: 'skuId',
					populate: {
						path: 'catalogId',
						select: 'name category',
					},
					select: 'name skuCode modelName catalogId',
				})
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			Asset.countDocuments(filter),
		])

		return NextResponse.json({
			assets,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		})
	} catch (error) {
		console.error('Error fetching assets:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		await connectDB()

		const body = await request.json()
		const asset = new Asset(body)
		await asset.save()

		const populatedAsset = await Asset.findById(asset._id)
			.populate({
				path: 'skuId',
				populate: {
					path: 'catalogId',
					select: 'name category',
				},
				select: 'name skuCode modelName catalogId',
			})
			.lean()

		return NextResponse.json(populatedAsset, { status: 201 })
	} catch (error) {
		return handleApiError(error)
	}
}