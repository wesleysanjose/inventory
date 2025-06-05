import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connection'
import { SKU, Asset } from '@/lib/db/models'
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
			return NextResponse.json({ error: 'Invalid SKU ID' }, { status: 400 })
		}

		const sku = await SKU.findById(params.id)
			.populate('catalogId', 'name category')
			.populate('assetCount')
			.lean()

		if (!sku) {
			return NextResponse.json({ error: 'SKU not found' }, { status: 404 })
		}

		return NextResponse.json(sku)
	} catch (error) {
		console.error('Error fetching SKU:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function PUT(request: NextRequest, context: RouteParams) {
	const params = await context.params
	try {
		await connectDB()

		if (!mongoose.Types.ObjectId.isValid(params.id)) {
			return NextResponse.json({ error: 'Invalid SKU ID' }, { status: 400 })
		}

		const body = await request.json()
		const sku = await SKU.findByIdAndUpdate(params.id, body, {
			new: true,
			runValidators: true,
		})
			.populate('catalogId', 'name category')
			.lean()

		if (!sku) {
			return NextResponse.json({ error: 'SKU not found' }, { status: 404 })
		}

		return NextResponse.json(sku)
	} catch (error) {
		return handleApiError(error)
	}
}

export async function DELETE(request: NextRequest, context: RouteParams) {
	const params = await context.params
	try {
		await connectDB()

		if (!mongoose.Types.ObjectId.isValid(params.id)) {
			return NextResponse.json({ error: 'Invalid SKU ID' }, { status: 400 })
		}

		// Check if SKU has associated assets
		const assetCount = await Asset.countDocuments({ skuId: params.id })
		if (assetCount > 0) {
			return NextResponse.json({ error: 'Cannot delete SKU with associated assets' }, { status: 400 })
		}

		const sku = await SKU.findByIdAndDelete(params.id).lean()

		if (!sku) {
			return NextResponse.json({ error: 'SKU not found' }, { status: 404 })
		}

		return NextResponse.json({ message: 'SKU deleted successfully' })
	} catch (error) {
		console.error('Error deleting SKU:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}