'use client'

import { useState, useEffect, useCallback } from 'react'
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	Filler
)

interface ForecastData {
	month: string
	year: number
	totalDepreciation: number
	totalOpex: number
	totalCost: number
	assetCount: number
}

export default function ForecastReport() {
	const [forecastData, setForecastData] = useState<ForecastData[]>([])
	const [loading, setLoading] = useState(true)
	const [startDate, setStartDate] = useState(() => {
		const now = new Date()
		return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
	})
	const [endDate, setEndDate] = useState(() => {
		const now = new Date()
		const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), 0)
		return oneYearLater.toISOString().split('T')[0]
	})

	const fetchForecastData = useCallback(async () => {
		try {
			setLoading(true)
			const params = new URLSearchParams({
				type: 'forecast',
				startDate,
				endDate,
			})

			const response = await fetch(`/api/reports/financial?${params}`)
			const data = await response.json()

			if (response.ok) {
				setForecastData(data.data)
			} else {
				console.error('Error fetching forecast data:', data.error)
			}
		} catch (error) {
			console.error('Error fetching forecast data:', error)
		} finally {
			setLoading(false)
		}
	}, [startDate, endDate])

	useEffect(() => {
		fetchForecastData()
	}, [fetchForecastData])

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount)
	}

	const formatMonth = (monthStr: string) => {
		const [year, month] = monthStr.split('-')
		const date = new Date(parseInt(year), parseInt(month) - 1)
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
	}

	const totals = forecastData.reduce(
		(acc, item) => ({
			depreciation: acc.depreciation + item.totalDepreciation,
			opex: acc.opex + item.totalOpex,
			total: acc.total + item.totalCost,
		}),
		{ depreciation: 0, opex: 0, total: 0 }
	)

	return (
		<div className="p-6">
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
				<div>
					<h2 className="text-xl font-semibold text-gray-900">Financial Forecast</h2>
					<p className="text-gray-600">Monthly projections for depreciation and operational expenses</p>
				</div>
				<div className="flex gap-4 mt-4 lg:mt-0">
					<div>
						<label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
							Start Date
						</label>
						<input
							type="date"
							id="startDate"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
					<div>
						<label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
							End Date
						</label>
						<input
							type="date"
							id="endDate"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
				</div>
			</div>

			{loading ? (
				<div className="flex items-center justify-center py-12">
					<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					<p className="ml-3 text-gray-600">Loading forecast data...</p>
				</div>
			) : forecastData.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-600">No forecast data available for the selected date range</p>
				</div>
			) : (
				<>
					{/* Summary Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="text-sm font-medium text-gray-600">Total Depreciation</h3>
							<p className="text-2xl font-bold text-red-600">{formatCurrency(totals.depreciation)}</p>
						</div>
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="text-sm font-medium text-gray-600">Total OPEX</h3>
							<p className="text-2xl font-bold text-blue-600">{formatCurrency(totals.opex)}</p>
						</div>
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="text-sm font-medium text-gray-600">Total Cost</h3>
							<p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.total)}</p>
						</div>
					</div>

					{/* Forecast Table */}
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Month
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Assets
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Depreciation
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										OPEX
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Total Cost
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{forecastData.map((item, index) => (
									<tr key={item.month} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{formatMonth(item.month)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{item.assetCount}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
											{formatCurrency(item.totalDepreciation)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
											{formatCurrency(item.totalOpex)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{formatCurrency(item.totalCost)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Chart Visualization */}
					<div className="mt-8 p-6 bg-gray-50 rounded-lg">
						<h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trend</h3>
						<div className="h-96">
							<Line
								data={{
									labels: forecastData.map(item => formatMonth(item.month)),
									datasets: [
										{
											label: 'Depreciation',
											data: forecastData.map(item => item.totalDepreciation),
											borderColor: 'rgb(239, 68, 68)',
											backgroundColor: 'rgba(239, 68, 68, 0.1)',
											fill: false,
											tension: 0.1,
										},
										{
											label: 'OPEX',
											data: forecastData.map(item => item.totalOpex),
											borderColor: 'rgb(59, 130, 246)',
											backgroundColor: 'rgba(59, 130, 246, 0.1)',
											fill: false,
											tension: 0.1,
										},
										{
											label: 'Total Cost',
											data: forecastData.map(item => item.totalCost),
											borderColor: 'rgb(107, 114, 128)',
											backgroundColor: 'rgba(107, 114, 128, 0.1)',
											fill: '+1',
											tension: 0.1,
										},
									],
								}}
								options={{
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										legend: {
											position: 'top',
										},
										title: {
											display: true,
											text: 'Financial Forecast Over Time',
										},
										tooltip: {
											mode: 'index',
											intersect: false,
											callbacks: {
												label: function(context) {
													return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
												}
											}
										},
									},
									scales: {
										x: {
											display: true,
											title: {
												display: true,
												text: 'Month',
											},
										},
										y: {
											display: true,
											title: {
												display: true,
												text: 'Amount (USD)',
											},
											ticks: {
												callback: function(value) {
													return formatCurrency(Number(value))
												}
											}
										},
									},
									interaction: {
										mode: 'nearest',
										axis: 'x',
										intersect: false,
									},
								}}
							/>
						</div>
					</div>
				</>
			)}
		</div>
	)
}