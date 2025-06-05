'use client'

import { useState, useEffect } from 'react'

interface DepreciationSchedule {
	assetId: string
	assetTag: string
	name: string
	sku: Record<string, unknown>
	purchasePrice: number
	monthlyDepreciation: number
	totalDepreciated: number
	remainingValue: number
	goLiveDate: string
	depreciationEndDate: string
	monthsRemaining: number
}

export default function DepreciationScheduleReport() {
	const [scheduleData, setScheduleData] = useState<DepreciationSchedule[]>([])
	const [loading, setLoading] = useState(true)
	const [summary, setSummary] = useState<Record<string, unknown> | null>(null)

	useEffect(() => {
		fetchDepreciationSchedule()
	}, [])

	const fetchDepreciationSchedule = async () => {
		try {
			setLoading(true)
			const params = new URLSearchParams({
				type: 'depreciation-schedule',
			})

			const response = await fetch(`/api/reports/financial?${params}`)
			const data = await response.json()

			if (response.ok) {
				setScheduleData(data.data)
				setSummary(data.summary)
			} else {
				console.error('Error fetching depreciation schedule:', data.error)
			}
		} catch (error) {
			console.error('Error fetching depreciation schedule:', error)
		} finally {
			setLoading(false)
		}
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount)
	}

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString()
	}

	const getDepreciationStatus = (monthsRemaining: number) => {
		if (monthsRemaining <= 0) return { status: 'Fully Depreciated', color: 'text-gray-600 bg-gray-100' }
		if (monthsRemaining <= 12) return { status: 'Final Year', color: 'text-red-600 bg-red-100' }
		if (monthsRemaining <= 24) return { status: 'Late Stage', color: 'text-yellow-600 bg-yellow-100' }
		return { status: 'Active', color: 'text-green-600 bg-green-100' }
	}

	// Group assets by depreciation status
	const groupedAssets = scheduleData.reduce((acc, asset) => {
		const { status } = getDepreciationStatus(asset.monthsRemaining)
		if (!acc[status]) acc[status] = []
		acc[status].push(asset)
		return acc
	}, {} as Record<string, DepreciationSchedule[]>)

	return (
		<div className="p-6">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-gray-900">Depreciation Schedule</h2>
				<p className="text-gray-600">Asset-by-asset depreciation timeline and remaining value</p>
			</div>

			{loading ? (
				<div className="flex items-center justify-center py-12">
					<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					<p className="ml-3 text-gray-600">Loading depreciation schedule...</p>
				</div>
			) : !summary ? (
				<div className="text-center py-12">
					<p className="text-gray-600">No data available</p>
				</div>
			) : (
				<>
					{/* Summary Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<div className="bg-blue-50 p-4 rounded-lg">
							<h3 className="text-sm font-medium text-gray-600">Total Assets</h3>
							<p className="text-2xl font-bold text-blue-600">{String(summary.totalAssets || 0)}</p>
						</div>
						<div className="bg-green-50 p-4 rounded-lg">
							<h3 className="text-sm font-medium text-gray-600">Remaining Value</h3>
							<p className="text-2xl font-bold text-green-600">{formatCurrency(Number(summary.totalRemainingValue) || 0)}</p>
						</div>
						<div className="bg-red-50 p-4 rounded-lg">
							<h3 className="text-sm font-medium text-gray-600">Monthly Depreciation</h3>
							<p className="text-2xl font-bold text-red-600">{formatCurrency(Number(summary.totalMonthlyDepreciation) || 0)}</p>
						</div>
					</div>

					{/* Status Overview */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
						{Object.entries(groupedAssets).map(([status, assets]) => {
							const statusInfo = getDepreciationStatus(assets[0]?.monthsRemaining || 0)
							return (
								<div key={status} className="bg-white border border-gray-200 p-4 rounded-lg">
									<div className="flex items-center justify-between">
										<span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
											{status}
										</span>
										<span className="text-2xl font-bold text-gray-900">{assets.length}</span>
									</div>
								</div>
							)
						})}
					</div>

					{/* Depreciation Schedule Table */}
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
										Remaining Value
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Monthly Depreciation
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Depreciation End
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{scheduleData
									.sort((a, b) => a.monthsRemaining - b.monthsRemaining)
									.map((asset, index) => {
										const statusInfo = getDepreciationStatus(asset.monthsRemaining)
										
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
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
													{formatCurrency(asset.remainingValue)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
													{formatCurrency(asset.monthlyDepreciation)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{formatDate(asset.depreciationEndDate)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
														{statusInfo.status}
													</span>
													{asset.monthsRemaining > 0 && (
														<div className="text-xs text-gray-500 mt-1">
															{asset.monthsRemaining} months left
														</div>
													)}
												</td>
											</tr>
										)
									})}
							</tbody>
						</table>
					</div>

					{/* Timeline View */}
					<div className="mt-8">
						<h3 className="text-lg font-medium text-gray-900 mb-4">Depreciation Timeline</h3>
						<div className="bg-gray-50 p-6 rounded-lg">
							<div className="space-y-4">
								{/* Next 12 months */}
								<div>
									<h4 className="text-md font-medium text-red-600 mb-2">Fully Depreciating in Next 12 Months</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
										{scheduleData
											.filter(asset => asset.monthsRemaining > 0 && asset.monthsRemaining <= 12)
											.sort((a, b) => a.monthsRemaining - b.monthsRemaining)
											.map(asset => (
												<div key={asset.assetId} className="bg-white p-3 rounded border border-red-200">
													<div className="text-sm font-medium text-gray-900">{asset.name}</div>
													<div className="text-xs text-gray-500">{asset.assetTag}</div>
													<div className="text-sm text-red-600 mt-1">
														{asset.monthsRemaining} months • {formatCurrency(asset.remainingValue)}
													</div>
												</div>
											))}
									</div>
									{scheduleData.filter(asset => asset.monthsRemaining > 0 && asset.monthsRemaining <= 12).length === 0 && (
										<p className="text-sm text-gray-500">No assets completing depreciation in the next 12 months</p>
									)}
								</div>

								{/* Next 24 months */}
								<div>
									<h4 className="text-md font-medium text-yellow-600 mb-2">Fully Depreciating in 13-24 Months</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
										{scheduleData
											.filter(asset => asset.monthsRemaining > 12 && asset.monthsRemaining <= 24)
											.sort((a, b) => a.monthsRemaining - b.monthsRemaining)
											.map(asset => (
												<div key={asset.assetId} className="bg-white p-3 rounded border border-yellow-200">
													<div className="text-sm font-medium text-gray-900">{asset.name}</div>
													<div className="text-xs text-gray-500">{asset.assetTag}</div>
													<div className="text-sm text-yellow-600 mt-1">
														{asset.monthsRemaining} months • {formatCurrency(asset.remainingValue)}
													</div>
												</div>
											))}
									</div>
									{scheduleData.filter(asset => asset.monthsRemaining > 12 && asset.monthsRemaining <= 24).length === 0 && (
										<p className="text-sm text-gray-500">No assets completing depreciation in months 13-24</p>
									)}
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	)
}