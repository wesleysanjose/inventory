'use client'

import { useState, useEffect, useCallback } from 'react'
// Chart.js will be implemented in next update

interface AssetValue {
	assetId: string
	assetTag: string
	name: string
	sku: Record<string, unknown>
	purchasePrice: number
	currentValue: number
	monthlyDepreciation: number
	monthlyOpex: number
	warrantyOpex: number
	maintenanceOpex: number
}

interface ReportSummary {
	totalAssets: number
	totalCurrentValue: number
	totalPurchaseValue: number
	totalMonthlyOpex: number
	opexBreakdown: {
		warranty: number
		maintenance: number
	}
	asOfDate: string
}

export default function CurrentValueReport() {
	const [assetValues, setAssetValues] = useState<AssetValue[]>([])
	const [summary, setSummary] = useState<ReportSummary | null>(null)
	const [loading, setLoading] = useState(true)
	const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0])

	const fetchCurrentValueData = useCallback(async () => {
		try {
			setLoading(true)
			const params = new URLSearchParams({
				type: 'current-value',
				targetDate,
			})

			const response = await fetch(`/api/reports/financial?${params}`)
			const data = await response.json()

			if (response.ok) {
				setAssetValues(data.data)
				setSummary(data.summary)
			} else {
				console.error('Error fetching current value data:', data.error)
			}
		} catch (error) {
			console.error('Error fetching current value data:', error)
		} finally {
			setLoading(false)
		}
	}, [targetDate])

	useEffect(() => {
		fetchCurrentValueData()
	}, [fetchCurrentValueData])

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount)
	}

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString()
	}

	const calculateDepreciationPercentage = (current: number, original: number) => {
		if (original === 0) return 0
		return ((original - current) / original) * 100
	}

	return (
		<div className="p-6">
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
				<div>
					<h2 className="text-xl font-semibold text-gray-900">Current Asset Values</h2>
					<p className="text-gray-600">Real-time asset valuation and depreciation status</p>
				</div>
				<div>
					<label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">
						As of Date
					</label>
					<input
						type="date"
						id="targetDate"
						value={targetDate}
						onChange={(e) => setTargetDate(e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
			</div>

			{loading ? (
				<div className="flex items-center justify-center py-12">
					<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					<p className="ml-3 text-gray-600">Loading asset values...</p>
				</div>
			) : !summary ? (
				<div className="text-center py-12">
					<p className="text-gray-600">No data available</p>
				</div>
			) : (
				<>
					{/* Summary Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
						<div className="bg-blue-50 p-4 rounded-lg">
							<h3 className="text-sm font-medium text-gray-600">Total Assets</h3>
							<p className="text-2xl font-bold text-blue-600">{summary.totalAssets}</p>
						</div>
						<div className="bg-green-50 p-4 rounded-lg">
							<h3 className="text-sm font-medium text-gray-600">Current Value</h3>
							<p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalCurrentValue)}</p>
						</div>
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="text-sm font-medium text-gray-600">Original Value</h3>
							<p className="text-2xl font-bold text-gray-600">{formatCurrency(summary.totalPurchaseValue)}</p>
						</div>
						<div className="bg-purple-50 p-4 rounded-lg">
							<h3 className="text-sm font-medium text-gray-600">Monthly OPEX</h3>
							<p className="text-2xl font-bold text-purple-600">{formatCurrency(summary.totalMonthlyOpex)}</p>
						</div>
					</div>

					{/* Depreciation Summary */}
					<div className="bg-gray-50 p-4 rounded-lg mb-6">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-medium text-gray-900">Portfolio Depreciation</h3>
								<p className="text-sm text-gray-600">As of {formatDate(summary.asOfDate)}</p>
							</div>
							<div className="text-right">
								<p className="text-2xl font-bold text-red-600">
									{formatCurrency(summary.totalPurchaseValue - summary.totalCurrentValue)}
								</p>
								<p className="text-sm text-gray-600">
									{calculateDepreciationPercentage(summary.totalCurrentValue, summary.totalPurchaseValue).toFixed(1)}% depreciated
								</p>
							</div>
						</div>
					</div>

					{/* Asset Values Table */}
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Asset
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										SKU
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Purchase Price
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Current Value
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Depreciation
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Monthly OPEX
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{assetValues.map((asset, index) => {
									const depreciationAmount = asset.purchasePrice - asset.currentValue
									const depreciationPercentage = calculateDepreciationPercentage(asset.currentValue, asset.purchasePrice)
									
									return (
										<tr key={asset.assetId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
											<td className="px-6 py-4 whitespace-nowrap">
												<div>
													<div className="text-sm font-medium text-gray-900">{asset.name}</div>
													<div className="text-sm text-gray-500">{asset.assetTag}</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div>
													<div className="text-sm font-medium text-gray-900">{String(asset.sku?.name || '')}</div>
													<div className="text-sm text-gray-500">{String(asset.sku?.skuCode || '')}</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{formatCurrency(asset.purchasePrice)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
												{formatCurrency(asset.currentValue)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div>
													<div className="text-sm text-red-600 font-medium">
														{formatCurrency(depreciationAmount)}
													</div>
													<div className="text-xs text-gray-500">
														{depreciationPercentage.toFixed(1)}%
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div>
													<div className="text-sm text-purple-600 font-medium">
														{formatCurrency(asset.monthlyOpex)}
													</div>
													<div className="text-xs text-gray-500">
														W: {formatCurrency(asset.warrantyOpex)} | M: {formatCurrency(asset.maintenanceOpex)}
													</div>
												</div>
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>

					{/* OPEX Breakdown */}
					<div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-purple-50 p-6 rounded-lg">
							<h3 className="text-lg font-medium text-gray-900 mb-4">OPEX Breakdown</h3>
							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Warranty Costs</span>
									<span className="text-sm font-medium text-gray-900">
										{formatCurrency(summary.opexBreakdown.warranty)}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Maintenance Costs</span>
									<span className="text-sm font-medium text-gray-900">
										{formatCurrency(summary.opexBreakdown.maintenance)}
									</span>
								</div>
								<hr className="border-gray-200" />
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium text-gray-900">Total Monthly OPEX</span>
									<span className="text-lg font-bold text-purple-600">
										{formatCurrency(summary.totalMonthlyOpex)}
									</span>
								</div>
							</div>
						</div>

						<div className="bg-gray-50 p-6 rounded-lg">
							<h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio Health</h3>
							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Retention Rate</span>
									<span className="text-sm font-medium text-green-600">
										{((summary.totalCurrentValue / summary.totalPurchaseValue) * 100).toFixed(1)}%
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Average Asset Age</span>
									<span className="text-sm font-medium text-gray-900">
										{((summary.totalPurchaseValue - summary.totalCurrentValue) / summary.totalPurchaseValue * 4).toFixed(1)} years
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Monthly Cost per Asset</span>
									<span className="text-sm font-medium text-gray-900">
										{formatCurrency((summary.totalMonthlyOpex) / summary.totalAssets)}
									</span>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	)
}