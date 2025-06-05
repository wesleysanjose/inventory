import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connection'
import { Catalog } from '@/lib/db/models'
import { handleApiError } from '@/lib/utils/api-errors'

export async function GET(request: NextRequest) {
	try {
		await connectDB()

		const { searchParams } = new URL(request.url)
		const page = parseInt(searchParams.get('page') || '1')
		const limit = parseInt(searchParams.get('limit') || '10')
		const search = searchParams.get('search') || ''
		const category = searchParams.get('category') || ''
		const status = searchParams.get('status') || ''

		const skip = (page - 1) * limit

		// Build filter object
		const filter: Record<string, unknown> = {}
		if (search) {
			filter.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } },
				{ manufacturer: { $regex: search, $options: 'i' } },
			]
		}
		if (category) filter.category = category
		if (status) filter.status = status

		const [catalogs, total] = await Promise.all([
			Catalog.find(filter)
				.populate('skuCount')
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			Catalog.countDocuments(filter),
		])

		return NextResponse.json({
			catalogs,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		})
	} catch (error) {
		console.error('Error fetching catalogs:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		await connectDB()

		const body = await request.json()
		const catalog = new Catalog(body)
		await catalog.save()

		return NextResponse.json(catalog, { status: 201 })
	} catch (error) {
		return handleApiError(error)
	}
}