import { NextResponse } from 'next/server'

interface ValidationError extends Error {
	name: 'ValidationError'
	errors: Record<string, { message: string }>
}

interface DuplicateKeyError {
	code: 11000
	keyPattern?: Record<string, number>
	keyValue?: Record<string, unknown>
}

export function handleApiError(error: unknown): NextResponse {
	console.error('API Error:', error)

	if (error instanceof Error && error.name === 'ValidationError') {
		const validationError = error as ValidationError
		return NextResponse.json(
			{
				error: 'Validation error',
				details: Object.values(validationError.errors).map((err) => err.message),
			},
			{ status: 400 }
		)
	}

	if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
		const duplicateError = error as DuplicateKeyError
		let message = 'A record with this information already exists'
		
		if (duplicateError.keyValue) {
			const keys = Object.keys(duplicateError.keyValue)
			if (keys.includes('assetTag')) {
				message = 'Asset tag already exists'
			} else if (keys.includes('skuCode')) {
				message = 'SKU code already exists'
			} else if (keys.includes('name') && keys.includes('manufacturer')) {
				message = 'A catalog with this name and manufacturer already exists'
			}
		}

		return NextResponse.json({ error: message }, { status: 409 })
	}

	return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}