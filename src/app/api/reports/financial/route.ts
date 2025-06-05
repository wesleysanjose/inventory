import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connection'
import { Asset, type IAsset } from '@/lib/db/models'
import {
	generateFinancialForecast,
	calculateAssetDepreciation,
	calculateAssetOpex,
	calculateTotalAssetValue,
	calculateMonthlyOpexByCategory,
} from '@/lib/utils/financial'

export async function GET(request: NextRequest) {
	try {
		await connectDB()

		const { searchParams } = new URL(request.url)
		const reportType = searchParams.get('type') || 'forecast'
		const startDate = searchParams.get('startDate')
		const endDate = searchParams.get('endDate')
		const assetIds = searchParams.get('assetIds')?.split(',') || []

		// Build filter for assets
		const filter: Record<string, unknown> = {}
		if (assetIds.length > 0 && assetIds[0] !== '') {
			filter._id = { $in: assetIds }
		}

		// Fetch assets with populated relationships
		const assets = await Asset.find(filter)
			.populate({
				path: 'skuId',
				populate: {
					path: 'catalogId',
					select: 'name category',
				},
				select: 'name skuCode modelName catalogId',
			})
			.lean() as unknown as IAsset[]

		switch (reportType) {
			case 'forecast': {
				if (!startDate || !endDate) {
					return NextResponse.json(
						{ error: 'Start date and end date are required for forecast report' },
						{ status: 400 }
					)
				}

				const forecast = generateFinancialForecast(
					assets,
					new Date(startDate),
					new Date(endDate)
				)

				return NextResponse.json({
					type: 'forecast',
					data: forecast,
					summary: {
						totalAssets: assets.length,
						forecastPeriod: {
							start: startDate,
							end: endDate,
						},
					},
				})
			}

			case 'current-value': {
				const targetDate = searchParams.get('targetDate')
					? new Date(searchParams.get('targetDate')!)
					: new Date()

				const assetValues = assets.map((asset) => {
					const depreciation = calculateAssetDepreciation(asset, targetDate)
					const opex = calculateAssetOpex(asset, targetDate)

					return {
						assetId: asset._id,
						assetTag: asset.assetTag,
						name: asset.name,
						sku: asset.skuId,
						purchasePrice: depreciation.purchasePrice,
						currentValue: depreciation.remainingValue,
						monthlyDepreciation: depreciation.monthlyDepreciation,
						monthlyOpex: opex.totalMonthlyCost,
						warrantyOpex: opex.warrantyMonthlyCost,
						maintenanceOpex: opex.maintenanceMonthlyCost,
					}
				})

				const totalValue = calculateTotalAssetValue(assets, targetDate)
				const opexByCategory = calculateMonthlyOpexByCategory(assets, targetDate)

				return NextResponse.json({
					type: 'current-value',
					data: assetValues,
					summary: {
						totalAssets: assets.length,
						totalCurrentValue: totalValue,
						totalPurchaseValue: assets.reduce(
							(sum, asset) => sum + asset.financial.capex.purchasePrice,
							0
						),
						totalMonthlyOpex: opexByCategory.warranty + opexByCategory.maintenance,
						opexBreakdown: opexByCategory,
						asOfDate: targetDate.toISOString(),
					},
				})
			}

			case 'depreciation-schedule': {
				const depreciationSchedule = assets.map((asset) => {
					const depreciation = calculateAssetDepreciation(asset)
					const goLiveDate = new Date(asset.deployment.goLiveDate)
					const endDate = new Date(goLiveDate)
					endDate.setMonth(endDate.getMonth() + depreciation.totalDepreciationMonths)

					return {
						assetId: asset._id,
						assetTag: asset.assetTag,
						name: asset.name,
						sku: asset.skuId,
						purchasePrice: depreciation.purchasePrice,
						monthlyDepreciation: depreciation.monthlyDepreciation,
						totalDepreciated: depreciation.totalDepreciated,
						remainingValue: depreciation.remainingValue,
						goLiveDate: goLiveDate.toISOString(),
						depreciationEndDate: endDate.toISOString(),
						monthsRemaining: Math.max(
							0,
							depreciation.totalDepreciationMonths - depreciation.monthsLive
						),
					}
				})

				return NextResponse.json({
					type: 'depreciation-schedule',
					data: depreciationSchedule,
					summary: {
						totalAssets: assets.length,
						totalRemainingValue: depreciationSchedule.reduce(
							(sum, item) => sum + item.remainingValue,
							0
						),
						totalMonthlyDepreciation: depreciationSchedule.reduce(
							(sum, item) => sum + item.monthlyDepreciation,
							0
						),
					},
				})
			}

			case 'opex-breakdown': {
				const targetDate = searchParams.get('targetDate')
					? new Date(searchParams.get('targetDate')!)
					: new Date()

				const opexBreakdown = assets.map((asset) => {
					const opex = calculateAssetOpex(asset, targetDate)
					const warrantyDetails = asset.financial.opex.warranty.filter(
						(w) => targetDate >= new Date(w.startDate) && targetDate <= new Date(w.endDate)
					)
					const maintenanceDetails = asset.financial.opex.maintenance?.filter(
						(m) => targetDate >= new Date(m.startDate) && targetDate <= new Date(m.endDate)
					)

					return {
						assetId: asset._id,
						assetTag: asset.assetTag,
						name: asset.name,
						sku: asset.skuId,
						warrantyMonthlyCost: opex.warrantyMonthlyCost,
						maintenanceMonthlyCost: opex.maintenanceMonthlyCost,
						totalMonthlyCost: opex.totalMonthlyCost,
						warranties: warrantyDetails,
						maintenance: maintenanceDetails || [],
					}
				})

				return NextResponse.json({
					type: 'opex-breakdown',
					data: opexBreakdown,
					summary: {
						totalAssets: assets.length,
						totalMonthlyOpex: opexBreakdown.reduce((sum, item) => sum + item.totalMonthlyCost, 0),
						asOfDate: targetDate.toISOString(),
					},
				})
			}

			default:
				return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
		}
	} catch (error) {
		console.error('Error generating financial report:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}