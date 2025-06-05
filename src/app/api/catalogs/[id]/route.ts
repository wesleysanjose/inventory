import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connection'
import { Catalog, SKU } from '@/lib/db/models'
import { handleApiError } from '@/lib/utils/api-errors'
import mongoose from 'mongoose'

interface RouteParams {
	params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteParams) {
	const params = await context.params
	try {
		await connectDB()

		if (!mongoose.Types.ObjectId.isValid(params.id)) {
			return NextResponse.json({ error: 'Invalid catalog ID' }, { status: 400 })
		}

		const catalog = await Catalog.findById(params.id).populate('skuCount').lean()

		if (!catalog) {
			return NextResponse.json({ error: 'Catalog not found' }, { status: 404 })
		}

		return NextResponse.json(catalog)
	} catch (error) {
		console.error('Error fetching catalog:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function PUT(request: NextRequest, context: RouteParams) {
	const params = await context.params
	try {
		await connectDB()

		if (!mongoose.Types.ObjectId.isValid(params.id)) {
			return NextResponse.json({ error: 'Invalid catalog ID' }, { status: 400 })
		}

		const body = await request.json()
		const catalog = await Catalog.findByIdAndUpdate(params.id, body, {
			new: true,
			runValidators: true,
		}).lean()

		if (!catalog) {
			return NextResponse.json({ error: 'Catalog not found' }, { status: 404 })
		}

		return NextResponse.json(catalog)
	} catch (error) {
		return handleApiError(error)
	}
}

export async function DELETE(request: NextRequest, context: RouteParams) {
	const params = await context.params
	try {
		await connectDB()

		if (!mongoose.Types.ObjectId.isValid(params.id)) {
			return NextResponse.json({ error: 'Invalid catalog ID' }, { status: 400 })
		}

		// Check if catalog has associated SKUs
		const skuCount = await SKU.countDocuments({ catalogId: params.id })
		if (skuCount > 0) {
			return NextResponse.json(
				{ error: 'Cannot delete catalog with associated SKUs' },
				{ status: 400 }
			)
		}

		const catalog = await Catalog.findByIdAndDelete(params.id).lean()

		if (!catalog) {
			return NextResponse.json({ error: 'Catalog not found' }, { status: 404 })
		}

		return NextResponse.json({ message: 'Catalog deleted successfully' })
	} catch (error) {
		console.error('Error deleting catalog:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}