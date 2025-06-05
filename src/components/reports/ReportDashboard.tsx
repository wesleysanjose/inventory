'use client'

import { useState, useEffect } from 'react'
import ForecastReport from './ForecastReport'
import CurrentValueReport from './CurrentValueReport'
import DepreciationScheduleReport from './DepreciationScheduleReport'
import OpexBreakdownReport from './OpexBreakdownReport'

type ReportType = 'forecast' | 'current-value' | 'depreciation-schedule' | 'opex-breakdown'

export default function ReportDashboard() {
	const [activeReport, setActiveReport] = useState<ReportType>('forecast')
	const [totalAssets, setTotalAssets] = useState(0)
	const [totalValue, setTotalValue] = useState(0)
	const [monthlyOpex, setMonthlyOpex] = useState(0)
	const [monthlyDepreciation, setMonthlyDepreciation] = useState(0)

	useEffect(() => {
		fetchSummaryData()
	}, [])

	const fetchSummaryData = async () => {
		try {
			const response = await fetch('/api/reports/financial?type=current-value')
			const data = await response.json()

			if (response.ok) {
				setTotalAssets(data.summary.totalAssets)
				setTotalValue(data.summary.totalCurrentValue)
				setMonthlyOpex(data.summary.totalMonthlyOpex)

				// Calculate monthly depreciation
				const totalMonthlyDepreciation = data.data.reduce(
					(sum: number, asset: Record<string, unknown>) => sum + (asset.monthlyDepreciation as number),
					0
				)
				setMonthlyDepreciation(totalMonthlyDepreciation)
			}
		} catch (error) {
			console.error('Error fetching summary data:', error)
		}
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount)
	}

	const reports = [
		{
			id: 'forecast' as ReportType,
			name: 'Financial Forecast',
			description: 'Monthly projections for depreciation and OPEX',
			icon: '📈',
		},
		{
			id: 'current-value' as ReportType,
			name: 'Current Asset Values',
			description: 'Real-time asset valuation and depreciation status',
			icon: '💰',
		},
		{
			id: 'depreciation-schedule' as ReportType,
			name: 'Depreciation Schedule',
			description: 'Asset-by-asset depreciation timeline and remaining value',
			icon: '📅',
		},
		{
			id: 'opex-breakdown' as ReportType,
			name: 'OPEX Breakdown',
			description: 'Detailed operational expense analysis by category',
			icon: '📊',
		},
	]

	return (
		<div className="space-y-8">
			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="bg-white p-6 rounded-lg shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Total Assets</p>
							<p className="text-2xl font-bold text-gray-900">{totalAssets}</p>
						</div>
						<div className="p-3 bg-blue-50 rounded-full">
							<span className="text-2xl">💻</span>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Total Current Value</p>
							<p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
						</div>
						<div className="p-3 bg-green-50 rounded-full">
							<span className="text-2xl">💰</span>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Monthly Depreciation</p>
							<p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyDepreciation)}</p>
						</div>
						<div className="p-3 bg-red-50 rounded-full">
							<span className="text-2xl">📉</span>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Monthly OPEX</p>
							<p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyOpex)}</p>
						</div>
						<div className="p-3 bg-purple-50 rounded-full">
							<span className="text-2xl">📊</span>
						</div>
					</div>
				</div>
			</div>

			{/* Report Navigation */}
			<div className="bg-white rounded-lg shadow p-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Reports</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{reports.map((report) => (
						<button
							key={report.id}
							onClick={() => setActiveReport(report.id)}
							className={`p-4 border rounded-lg text-left transition-colors ${
								activeReport === report.id
									? 'border-blue-500 bg-blue-50'
									: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
							}`}
						>
							<div className="flex items-center space-x-3">
								<span className="text-2xl">{report.icon}</span>
								<div>
									<h3 className="font-medium text-gray-900">{report.name}</h3>
									<p className="text-sm text-gray-600">{report.description}</p>
								</div>
							</div>
						</button>
					))}
				</div>
			</div>

			{/* Active Report */}
			<div className="bg-white rounded-lg shadow">
				{activeReport === 'forecast' && <ForecastReport />}
				{activeReport === 'current-value' && <CurrentValueReport />}
				{activeReport === 'depreciation-schedule' && <DepreciationScheduleReport />}
				{activeReport === 'opex-breakdown' && <OpexBreakdownReport />}
			</div>
		</div>
	)
}