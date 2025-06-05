'use client'

import ReportDashboard from '@/components/reports/ReportDashboard'

export default function ReportsPage() {
	return (
		<div className="p-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
				<p className="text-gray-600">
					Analyze depreciation, operational expenses, and financial forecasts for your IT assets
				</p>
			</div>

			<ReportDashboard />
		</div>
	)
}