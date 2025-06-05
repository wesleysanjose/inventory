import { NextResponse } from 'next/server'
import { seedDatabase } from '@/scripts/seed-data'

export async function POST() {
	try {
		const result = await seedDatabase()
		return NextResponse.json({
			success: true,
			message: 'Seed data created successfully',
			data: result,
		})
	} catch (error) {
		console.error('Error seeding database:', error)
		const errorMessage = error instanceof Error ? error.message : 'Unknown error'
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to seed database',
				details: errorMessage,
			},
			{ status: 500 }
		)
	}
}