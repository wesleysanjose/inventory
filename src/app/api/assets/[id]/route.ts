import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connection'
import { Asset } from '@/lib/db/models'
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
			return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 })
		}

		const asset = await Asset.findById(params.id)
			.populate({
				path: 'skuId',
				populate: {
					path: 'catalogId',
					select: 'name category',
				},
				select: 'name skuCode modelName catalogId',
			})
			.lean()

		if (!asset) {
			return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
		}

		return NextResponse.json(asset)
	} catch (error) {
		console.error('Error fetching asset:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function PUT(request: NextRequest, context: RouteParams) {
	const params = await context.params
	try {
		await connectDB()

		if (!mongoose.Types.ObjectId.isValid(params.id)) {
			return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 })
		}

		const body = await request.json()
		const asset = await Asset.findByIdAndUpdate(params.id, body, {
			new: true,
			runValidators: true,
		})
			.populate({
				path: 'skuId',
				populate: {
					path: 'catalogId',
					select: 'name category',
				},
				select: 'name skuCode modelName catalogId',
			})
			.lean()

		if (!asset) {
			return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
		}

		return NextResponse.json(asset)
	} catch (error) {
		return handleApiError(error)
	}
}

export async function DELETE(request: NextRequest, context: RouteParams) {
	const params = await context.params
	try {
		await connectDB()

		if (!mongoose.Types.ObjectId.isValid(params.id)) {
			return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 })
		}

		const asset = await Asset.findByIdAndDelete(params.id).lean()

		if (!asset) {
			return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
		}

		return NextResponse.json({ message: 'Asset deleted successfully' })
	} catch (error) {
		console.error('Error deleting asset:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}