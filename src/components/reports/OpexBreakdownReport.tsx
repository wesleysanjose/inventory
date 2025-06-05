'use client'

import { useState, useEffect, useCallback } from 'react'

interface OpexBreakdown {
	assetId: string
	assetTag: string
	name: string
	sku: Record<string, unknown>
	warrantyMonthlyCost: number
	maintenanceMonthlyCost: number
	totalMonthlyCost: number
	warranties: Record<string, unknown>[]
	maintenance: Record<string, unknown>[]
}

export default function OpexBreakdownReport() {
	const [opexData, setOpexData] = useState<OpexBreakdown[]>([])
	const [loading, setLoading] = useState(true)
	const [summary, setSummary] = useState<Record<string, unknown> | null>(null)
	const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0])

	const fetchOpexBreakdown = useCallback(async () => {
		try {
			setLoading(true)
			const params = new URLSearchParams({
				type: 'opex-breakdown',
				targetDate,
			})

			const response = await fetch(`/api/reports/financial?${params}`)
			const data = await response.json()

			if (response.ok) {
				setOpexData(data.data)
				setSummary(data.summary)
			} else {
				console.error('Error fetching OPEX breakdown:', data.error)
			}
		} catch (error) {
			console.error('Error fetching OPEX breakdown:', error)
		} finally {
			setLoading(false)
		}
	}, [targetDate])

	useEffect(() => {
		fetchOpexBreakdown()
	}, [fetchOpexBreakdown])

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount)
	}

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString()
	}

	// Calculate category totals
	const categoryTotals = opexData.reduce(
		(acc, asset) => ({
			warranty: acc.warranty + asset.warrantyMonthlyCost,
			maintenance: acc.maintenance + asset.maintenanceMonthlyCost,
		}),
		{ warranty: 0, maintenance: 0 }
	)

	// Group assets by cost levels
	const getOpexLevel = (monthlyCost: number) => {
		if (monthlyCost === 0) return 'No OPEX'
		if (monthlyCost < 50) return 'Low Cost'
		if (monthlyCost < 200) return 'Medium Cost'
		return 'High Cost'
	}

	const groupedByCost = opexData.reduce((acc, asset) => {
		const level = getOpexLevel(asset.totalMonthlyCost)
		if (!acc[level]) acc[level] = []
		acc[level].push(asset)
		return acc
	}, {} as Record<string, OpexBreakdown[]>)

	return (
		<div className="p-6">
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
				<div>
					<h2 className="text-xl font-semibold text-gray-900">OPEX Breakdown</h2>
					<p className="text-gray-600">Detailed operational expense analysis by category</p>
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
					<p className="ml-3 text-gray-600">Loading OPEX breakdown...</p>
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
							<h3 className="text-sm font-medium text-gray-600">Total Monthly OPEX</h3>
							<p className="text-2xl font-bold text-blue-600">{formatCurrency(Number(summary.totalMonthlyOpex) || 0)}</p>
							<p className="text-xs text-gray-500 mt-1">As of {formatDate(String(summary.asOfDate))}</p>
						</div>
						<div className="bg-green-50 p-4 rounded-lg">
							<h3 className="text-sm font-medium text-gray-600">Warranty Costs</h3>
							<p className="text-2xl font-bold text-green-600">{formatCurrency(categoryTotals.warranty)}</p>
							<p className="text-xs text-gray-500 mt-1">
								{categoryTotals.warranty > 0 ? ((categoryTotals.warranty / (Number(summary.totalMonthlyOpex) || 1)) * 100).toFixed(1) : 0}% of total
							</p>
						</div>
						<div className="bg-purple-50 p-4 rounded-lg">
							<h3 className="text-sm font-medium text-gray-600">Maintenance Costs</h3>
							<p className="text-2xl font-bold text-purple-600">{formatCurrency(categoryTotals.maintenance)}</p>
							<p className="text-xs text-gray-500 mt-1">
								{categoryTotals.maintenance > 0 ? ((categoryTotals.maintenance / (Number(summary.totalMonthlyOpex) || 1)) * 100).toFixed(1) : 0}% of total
							</p>
						</div>
					</div>

					{/* Cost Level Distribution */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
						{Object.entries(groupedByCost).map(([level, assets]) => {
							const totalCost = assets.reduce((sum, asset) => sum + asset.totalMonthlyCost, 0)
							const color = level === 'High Cost' ? 'red' : level === 'Medium Cost' ? 'yellow' : level === 'Low Cost' ? 'green' : 'gray'
							
							return (
								<div key={level} className={`bg-${color}-50 border border-${color}-200 p-4 rounded-lg`}>
									<h4 className={`text-sm font-medium text-${color}-600`}>{level}</h4>
									<p className={`text-2xl font-bold text-${color}-600`}>{assets.length}</p>
									<p className={`text-xs text-${color}-500 mt-1`}>{formatCurrency(totalCost)}/month</p>
								</div>
							)
						})}
					</div>

					{/* OPEX Table */}
					<div className="overflow-x-auto mb-8">
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
										Warranty
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Maintenance
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Total OPEX
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Contracts
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{opexData
									.sort((a, b) => b.totalMonthlyCost - a.totalMonthlyCost)
									.map((asset, index) => (
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
											<td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
												{formatCurrency(asset.warrantyMonthlyCost)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">
												{formatCurrency(asset.maintenanceMonthlyCost)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
												{formatCurrency(asset.totalMonthlyCost)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-xs text-gray-500">
													{asset.warranties.length > 0 && (
														<div>
															W: {asset.warranties.length} contracts
														</div>
													)}
													{asset.maintenance.length > 0 && (
														<div>
															M: {asset.maintenance.length} contracts
														</div>
													)}
													{asset.warranties.length === 0 && asset.maintenance.length === 0 && (
														<span className="text-gray-400">No active contracts</span>
													)}
												</div>
											</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>

					{/* Contract Details */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Warranty Contracts */}
						<div className="bg-green-50 p-6 rounded-lg">
							<h3 className="text-lg font-medium text-gray-900 mb-4">Active Warranty Contracts</h3>
							<div className="space-y-3 max-h-64 overflow-y-auto">
								{opexData
									.filter(asset => asset.warranties.length > 0)
									.flatMap(asset => 
										asset.warranties.map(warranty => ({
											...warranty,
											assetName: asset.name,
											assetTag: asset.assetTag,
										}))
									)
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									.sort((a, b) => new Date((a as any).endDate).getTime() - new Date((b as any).endDate).getTime())
									.map((warranty, index) => (
										<div key={index} className="bg-white p-3 rounded border border-green-200">
											<div className="flex justify-between items-start">
												<div>
													<div className="text-sm font-medium text-gray-900">
														{warranty.assetName} ({warranty.assetTag})
													</div>
													<div className="text-xs text-gray-500">
														{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
														{(warranty as any).vendor} • {(warranty as any).type}
													</div>
												</div>
												<div className="text-right">
													<div className="text-sm font-medium text-green-600">
														{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
														{formatCurrency((warranty as any).cost)}/year
													</div>
													<div className="text-xs text-gray-500">
														{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
														Expires: {formatDate((warranty as any).endDate)}
													</div>
												</div>
											</div>
										</div>
									))}
								{opexData.filter(asset => asset.warranties.length > 0).length === 0 && (
									<p className="text-sm text-gray-500">No active warranty contracts</p>
								)}
							</div>
						</div>

						{/* Maintenance Contracts */}
						<div className="bg-purple-50 p-6 rounded-lg">
							<h3 className="text-lg font-medium text-gray-900 mb-4">Active Maintenance Contracts</h3>
							<div className="space-y-3 max-h-64 overflow-y-auto">
								{opexData
									.filter(asset => asset.maintenance.length > 0)
									.flatMap(asset => 
										asset.maintenance.map(maintenance => ({
											...maintenance,
											assetName: asset.name,
											assetTag: asset.assetTag,
										}))
									)
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									.sort((a, b) => new Date((a as any).endDate).getTime() - new Date((b as any).endDate).getTime())
									.map((maintenance, index) => (
										<div key={index} className="bg-white p-3 rounded border border-purple-200">
											<div className="flex justify-between items-start">
												<div>
													<div className="text-sm font-medium text-gray-900">
														{maintenance.assetName} ({maintenance.assetTag})
													</div>
													<div className="text-xs text-gray-500">
														{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
														{(maintenance as any).vendor} • {(maintenance as any).type}
													</div>
												</div>
												<div className="text-right">
													<div className="text-sm font-medium text-purple-600">
														{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
														{formatCurrency((maintenance as any).cost)}
													</div>
													<div className="text-xs text-gray-500">
														{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
														Expires: {formatDate((maintenance as any).endDate)}
													</div>
												</div>
											</div>
										</div>
									))}
								{opexData.filter(asset => asset.maintenance.length > 0).length === 0 && (
									<p className="text-sm text-gray-500">No active maintenance contracts</p>
								)}
							</div>
						</div>
					</div>

					{/* OPEX Analytics */}
					<div className="mt-8 bg-gray-50 p-6 rounded-lg">
						<h3 className="text-lg font-medium text-gray-900 mb-4">OPEX Analytics</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div>
								<h4 className="text-sm font-medium text-gray-600 mb-2">Cost Distribution</h4>
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>Warranty</span>
										<span>{(Number(summary.totalMonthlyOpex) || 0) > 0 ? ((categoryTotals.warranty / (Number(summary.totalMonthlyOpex) || 1)) * 100).toFixed(1) : 0}%</span>
									</div>
									<div className="flex justify-between text-sm">
										<span>Maintenance</span>
										<span>{(Number(summary.totalMonthlyOpex) || 0) > 0 ? ((categoryTotals.maintenance / (Number(summary.totalMonthlyOpex) || 1)) * 100).toFixed(1) : 0}%</span>
									</div>
								</div>
							</div>
							<div>
								<h4 className="text-sm font-medium text-gray-600 mb-2">Average Costs</h4>
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>Per Asset</span>
										<span>{formatCurrency((Number(summary.totalMonthlyOpex) || 0) / Number(summary.totalAssets) || 0)}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span>Annual Total</span>
										<span>{formatCurrency((Number(summary.totalMonthlyOpex) || 0) * 12)}</span>
									</div>
								</div>
							</div>
							<div>
								<h4 className="text-sm font-medium text-gray-600 mb-2">Contract Summary</h4>
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>Warranty Contracts</span>
										<span>{opexData.reduce((sum, asset) => sum + asset.warranties.length, 0)}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span>Maintenance Contracts</span>
										<span>{opexData.reduce((sum, asset) => sum + asset.maintenance.length, 0)}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	)
}