import { IAsset } from '../db/models/Asset'

export interface DepreciationCalculation {
	assetId: string
	assetTag: string
	purchasePrice: number
	monthlyDepreciation: number
	totalDepreciated: number
	remainingValue: number
	monthsLive: number
	totalDepreciationMonths: number
}

export interface OpexCalculation {
	assetId: string
	assetTag: string
	warrantyMonthlyCost: number
	maintenanceMonthlyCost: number
	totalMonthlyCost: number
}

export interface MonthlyForecast {
	month: string
	year: number
	totalDepreciation: number
	totalOpex: number
	totalCost: number
	assetCount: number
}

export function calculateAssetDepreciation(asset: IAsset, targetDate?: Date): DepreciationCalculation {
	const purchasePrice = asset.financial.capex.purchasePrice
	const depreciationPeriodYears = asset.financial.capex.depreciationPeriodYears
	const goLiveDate = asset.deployment.goLiveDate
	const calculationDate = targetDate || new Date()

	const monthsLive = Math.max(
		0,
		(calculationDate.getFullYear() - goLiveDate.getFullYear()) * 12 +
			(calculationDate.getMonth() - goLiveDate.getMonth())
	)

	const totalDepreciationMonths = depreciationPeriodYears * 12
	const monthlyDepreciation = purchasePrice / totalDepreciationMonths

	const totalDepreciated = Math.min(monthsLive * monthlyDepreciation, purchasePrice)
	const remainingValue = Math.max(0, purchasePrice - totalDepreciated)

	return {
		assetId: String(asset._id),
		assetTag: asset.assetTag,
		purchasePrice,
		monthlyDepreciation,
		totalDepreciated,
		remainingValue,
		monthsLive,
		totalDepreciationMonths,
	}
}

export function calculateAssetOpex(asset: IAsset, targetDate?: Date): OpexCalculation {
	const calculationDate = targetDate || new Date()
	let warrantyMonthlyCost = 0
	let maintenanceMonthlyCost = 0

	// Calculate warranty costs
	for (const warranty of asset.financial.opex.warranty) {
		if (calculationDate >= warranty.startDate && calculationDate <= warranty.endDate) {
			// Annual warranty cost converted to monthly
			warrantyMonthlyCost += warranty.cost / 12
		}
	}

	// Calculate maintenance costs
	if (asset.financial.opex.maintenance) {
		for (const maintenance of asset.financial.opex.maintenance) {
			if (calculationDate >= maintenance.startDate && calculationDate <= maintenance.endDate) {
				const durationMonths =
					(maintenance.endDate.getFullYear() - maintenance.startDate.getFullYear()) * 12 +
					(maintenance.endDate.getMonth() - maintenance.startDate.getMonth())
				maintenanceMonthlyCost += maintenance.cost / Math.max(1, durationMonths)
			}
		}
	}

	return {
		assetId: String(asset._id),
		assetTag: asset.assetTag,
		warrantyMonthlyCost,
		maintenanceMonthlyCost,
		totalMonthlyCost: warrantyMonthlyCost + maintenanceMonthlyCost,
	}
}

export function generateFinancialForecast(
	assets: IAsset[],
	startDate: Date,
	endDate: Date
): MonthlyForecast[] {
	const forecast: MonthlyForecast[] = []
	const current = new Date(startDate)

	while (current <= endDate) {
		const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
		let totalDepreciation = 0
		let totalOpex = 0
		let activeAssetCount = 0

		for (const asset of assets) {
			// Only include assets that are deployed by this date
			if (asset.deployment.goLiveDate <= current) {
				// Calculate depreciation
				const depreciation = calculateAssetDepreciation(asset, current)
				if (depreciation.monthsLive < depreciation.totalDepreciationMonths) {
					totalDepreciation += depreciation.monthlyDepreciation
				}

				// Calculate opex
				const opex = calculateAssetOpex(asset, current)
				totalOpex += opex.totalMonthlyCost

				activeAssetCount++
			}
		}

		forecast.push({
			month: monthKey,
			year: current.getFullYear(),
			totalDepreciation,
			totalOpex,
			totalCost: totalDepreciation + totalOpex,
			assetCount: activeAssetCount,
		})

		// Move to next month
		current.setMonth(current.getMonth() + 1)
	}

	return forecast
}

export function calculateTotalAssetValue(assets: IAsset[], targetDate?: Date): number {
	return assets.reduce((total, asset) => {
		const depreciation = calculateAssetDepreciation(asset, targetDate)
		return total + depreciation.remainingValue
	}, 0)
}

export function calculateMonthlyOpexByCategory(
	assets: IAsset[],
	targetDate?: Date
): Record<string, number> {
	const categories: Record<string, number> = {
		warranty: 0,
		maintenance: 0,
	}

	for (const asset of assets) {
		const opex = calculateAssetOpex(asset, targetDate)
		categories.warranty += opex.warrantyMonthlyCost
		categories.maintenance += opex.maintenanceMonthlyCost
	}

	return categories
}